<?php

namespace App\Filament\Resources;

use App\Filament\Resources\CommunityChannelResource\Pages;
use App\Models\Community\Channel;
use App\Services\AuditTrail;
use App\Services\Community\ModerationService;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

/** Every channel members have created: suspend, mark as official, or delete. */
class CommunityChannelResource extends Resource
{
    protected static ?string $model = Channel::class;

    protected static ?string $navigationIcon = 'heroicon-o-user-group';
    protected static ?string $navigationGroup = 'Community';
    protected static ?int $navigationSort = 3;
    protected static ?string $modelLabel = 'channel';
    protected static ?string $pluralModelLabel = 'Channels';
    protected static ?string $slug = 'community-channels';

    public static function canAccess(): bool { return auth()->user()?->isMaster() ?? false; }
    public static function canCreate(): bool { return false; }
    public static function canEdit($record): bool { return false; }

    public static function table(Table $table): Table
    {
        return $table
            ->modifyQueryUsing(fn ($query) => $query->with('owner:id,name')->withCount(['goals', 'meetings']))
            ->defaultSort('id', 'desc')
            ->columns([
                Tables\Columns\TextColumn::make('name')->searchable()->weight('semibold')->limit(36),
                Tables\Columns\TextColumn::make('owner.name')->label('Owner')->searchable(),
                Tables\Columns\TextColumn::make('category')->badge()->toggleable(),
                Tables\Columns\TextColumn::make('members_count')->label('Members')->numeric()->sortable(),
                Tables\Columns\TextColumn::make('goals_count')->label('Goals')->numeric()->toggleable(),
                Tables\Columns\TextColumn::make('meetings_count')->label('Meetings')->numeric()->toggleable(),
                Tables\Columns\IconColumn::make('is_private')->label('Private')->boolean(),
                Tables\Columns\IconColumn::make('is_official')->label('Official')->boolean(),
                Tables\Columns\TextColumn::make('status')->badge()->color(fn ($state) => $state === 'active' ? 'success' : 'danger'),
                Tables\Columns\TextColumn::make('created_at')->label('Created')->date('d M Y')->sortable()->toggleable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')->options(['active' => 'Active', 'suspended' => 'Suspended']),
                Tables\Filters\TernaryFilter::make('is_official')->label('Official'),
                Tables\Filters\TernaryFilter::make('is_private')->label('Private'),
            ])
            ->actions([
                Tables\Actions\Action::make('suspend')->label('Suspend')->icon('heroicon-o-no-symbol')->color('danger')->requiresConfirmation()
                    ->visible(fn (Channel $record) => $record->status === 'active')
                    ->action(function (Channel $record) {
                        app(ModerationService::class)->setChannelStatus($record, 'suspended', auth()->user());
                        Notification::make()->title('Channel suspended')->success()->send();
                    }),
                Tables\Actions\Action::make('activate')->label('Reactivate')->icon('heroicon-o-check-circle')->color('success')
                    ->visible(fn (Channel $record) => $record->status === 'suspended')
                    ->action(function (Channel $record) {
                        app(ModerationService::class)->setChannelStatus($record, 'active', auth()->user());
                        Notification::make()->title('Channel active again')->success()->send();
                    }),
                Tables\Actions\Action::make('official')->label(fn (Channel $record) => $record->is_official ? 'Remove official badge' : 'Mark official')->icon('heroicon-o-check-badge')->color('warning')
                    ->action(function (Channel $record) {
                        $record->update(['is_official' => !$record->is_official]);
                        AuditTrail::record('community.channel_official_' . ($record->is_official ? 'on' : 'off'), auth()->user(), $record, [], $record->owner_id);
                    }),
                Tables\Actions\DeleteAction::make()->modalDescription('The channel, its chat, goals and meetings are removed for everyone.'),
            ]);
    }

    public static function getPages(): array
    {
        return ['index' => Pages\ListCommunityChannels::route('/')];
    }
}
