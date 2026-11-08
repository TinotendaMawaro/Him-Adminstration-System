<?php

namespace App\Filament\Resources;

use App\Filament\Resources\CommunityMemberResource\Pages;
use App\Models\Community\Profile;
use App\Services\Community\ModerationService;
use Filament\Forms;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

/** People in the community: verify, mute, suspend or restore their community access. (Their church record is under Members / Pastors.) */
class CommunityMemberResource extends Resource
{
    protected static ?string $model = Profile::class;

    protected static ?string $navigationIcon = 'heroicon-o-identification';
    protected static ?string $navigationGroup = 'Community';
    protected static ?int $navigationSort = 2;
    protected static ?string $modelLabel = 'person';
    protected static ?string $pluralModelLabel = 'People & access';
    protected static ?string $slug = 'community-people';

    public static function canAccess(): bool { return auth()->user()?->isMaster() ?? false; }
    public static function canCreate(): bool { return false; }
    public static function canEdit($record): bool { return false; }
    public static function canDelete($record): bool { return false; }

    public static function table(Table $table): Table
    {
        return $table
            ->modifyQueryUsing(fn (Builder $query) => $query->with('user:id,name,role,zone_id,is_active', 'user.zone:id,name'))
            ->defaultSort('posts_count', 'desc')
            ->columns([
                Tables\Columns\TextColumn::make('user.name')->label('Person')->searchable()->weight('semibold'),
                Tables\Columns\TextColumn::make('handle')->searchable()->prefix('@'),
                Tables\Columns\TextColumn::make('user.role')->label('Role')->badge(),
                Tables\Columns\TextColumn::make('user.zone.name')->label('Zone')->toggleable(),
                Tables\Columns\TextColumn::make('posts_count')->label('Posts')->numeric()->sortable(),
                Tables\Columns\TextColumn::make('followers_count')->label('Followers')->numeric()->sortable(),
                Tables\Columns\IconColumn::make('is_verified')->label('Verified')->boolean(),
                Tables\Columns\TextColumn::make('access')->label('Access')->badge()
                    ->state(fn (Profile $record) => $record->isBanned() ? 'Suspended' : ($record->isMuted() ? 'Muted' : 'Active'))
                    ->color(fn ($state) => match ($state) { 'Suspended' => 'danger', 'Muted' => 'warning', default => 'success' }),
                Tables\Columns\TextColumn::make('banned_until')->label('Until')->dateTime('d M Y')->placeholder('—')->toggleable(),
            ])
            ->filters([
                Tables\Filters\Filter::make('restricted')->label('Muted or suspended')->query(fn (Builder $q) => $q->where(fn ($w) => $w->where('banned_until', '>', now())->orWhere('muted_until', '>', now()))),
                Tables\Filters\TernaryFilter::make('is_verified')->label('Verified'),
            ])
            ->actions([
                Tables\Actions\Action::make('verify')->label(fn (Profile $record) => $record->is_verified ? 'Remove check' : 'Verify')->icon('heroicon-o-check-badge')->color('info')
                    ->action(function (Profile $record) {
                        app(ModerationService::class)->setVerified($record->user, !$record->is_verified, auth()->user());
                        Notification::make()->title('Updated')->success()->send();
                    }),
                Tables\Actions\Action::make('mute')->label('Mute')->icon('heroicon-o-speaker-x-mark')->color('warning')
                    ->form([Forms\Components\Select::make('hours')->options([1 => '1 hour', 24 => '24 hours', 72 => '3 days', 168 => '7 days'])->default(24)->required()->native(false), Forms\Components\Textarea::make('reason')->rows(2)->maxLength(190)])
                    ->action(function (Profile $record, array $data) {
                        app(ModerationService::class)->mute($record->user, (int) $data['hours'], auth()->user(), $data['reason'] ?? null);
                        Notification::make()->title('Muted')->success()->send();
                    }),
                Tables\Actions\Action::make('ban')->label('Suspend')->icon('heroicon-o-no-symbol')->color('danger')
                    ->form([Forms\Components\Select::make('days')->options([1 => '1 day', 7 => '7 days', 30 => '30 days', 0 => 'Indefinitely'])->default(7)->required()->native(false), Forms\Components\Textarea::make('reason')->rows(2)->maxLength(190)->helperText('The person is told this reason.')])
                    ->action(function (Profile $record, array $data) {
                        app(ModerationService::class)->ban($record->user, (int) $data['days'] ?: null, auth()->user(), $data['reason'] ?? null);
                        Notification::make()->title('Community access suspended')->success()->send();
                    }),
                Tables\Actions\Action::make('restore')->label('Restore access')->icon('heroicon-o-arrow-uturn-left')->color('success')
                    ->visible(fn (Profile $record) => $record->isBanned() || $record->isMuted())
                    ->action(function (Profile $record) {
                        app(ModerationService::class)->restore($record->user, auth()->user());
                        Notification::make()->title('Access restored')->success()->send();
                    }),
            ]);
    }

    public static function getPages(): array
    {
        return ['index' => Pages\ListCommunityMembers::route('/')];
    }
}
