<?php

namespace App\Filament\Resources;

use App\Filament\Resources\BroadcastResource\Pages;
use App\Models\Broadcast;
use App\Models\Pastor;
use App\Models\Region;
use App\Models\Zone;
use App\Services\BroadcastService;
use Filament\Forms;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

/** The messages the master console has sent to pastors (everyone, a region, some zones, or individuals). */
class BroadcastResource extends Resource
{
    protected static ?string $model = Broadcast::class;

    protected static ?string $navigationIcon = 'heroicon-o-megaphone';
    protected static ?string $navigationGroup = 'Church Management';
    protected static ?int $navigationSort = 5;
    protected static ?string $modelLabel = 'broadcast';
    protected static ?string $pluralModelLabel = 'Message to pastors';
    protected static ?string $navigationLabel = 'Message pastors';
    protected static ?string $slug = 'broadcasts';

    public static function canAccess(): bool
    {
        return auth()->user()?->isMaster() ?? false;
    }

    public static function canCreate(): bool { return false; }   // composed from the list page's "New message" action
    public static function canEdit($record): bool { return false; }
    public static function canDelete($record): bool { return false; }

    /** The compose form, shared by the list page's action. */
    public static function composeForm(): array
    {
        return [
            Forms\Components\Select::make('audience_type')->label('Send to')->options(BroadcastService::AUDIENCES)->default('all')->required()->live()->native(false)->selectablePlaceholder(false),
            Forms\Components\Select::make('regions')->label('Regions')->multiple()->searchable()->preload()->required()
                ->options(fn () => Region::orderBy('name')->pluck('name', 'id')->all())
                ->visible(fn (Forms\Get $get) => $get('audience_type') === 'regions'),
            Forms\Components\Select::make('zones')->label('Zones')->multiple()->searchable()->required()
                ->options(fn () => Zone::orderBy('code')->get()->mapWithKeys(fn ($z) => [$z->id => "{$z->code} · {$z->name}"])->all())
                ->visible(fn (Forms\Get $get) => $get('audience_type') === 'zones'),
            Forms\Components\Select::make('pastors')->label('Pastors')->multiple()->searchable()->required()
                ->options(fn () => Pastor::with('zone:id,code')->whereNotNull('user_id')->orderBy('name')->get()
                    ->mapWithKeys(fn ($p) => [$p->user_id => trim("{$p->name} {$p->surname}") . ($p->zone ? " · {$p->zone->code}" : '')])->all())
                ->visible(fn (Forms\Get $get) => $get('audience_type') === 'pastors'),
            Forms\Components\Placeholder::make('reach')->label('Reaches')->content(function (Forms\Get $get) {
                $type = $get('audience_type') ?? 'all';
                $ids  = (array) ($get($type === 'all' ? 'audience_type' : $type) ?? []);
                $n    = $type === 'all' || $ids ? app(BroadcastService::class)->recipients($type, $type === 'all' ? [] : $ids)->count() : 0;

                return $n . ' active pastor' . ($n === 1 ? '' : 's');
            }),
            Forms\Components\TextInput::make('subject')->required()->maxLength(150),
            Forms\Components\Textarea::make('body')->label('Message')->required()->rows(6)->minLength(3)->maxLength(3000),
            Forms\Components\Toggle::make('email_copy')->label('Also send a copy by email')->default(true),
        ];
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('created_at', 'desc')
            ->columns([
                Tables\Columns\TextColumn::make('created_at')->label('Sent')->dateTime('d M Y H:i')->sortable(),
                Tables\Columns\TextColumn::make('subject')->searchable()->limit(60)->weight('semibold'),
                Tables\Columns\TextColumn::make('audience_type')->label('Audience')->badge()->formatStateUsing(fn ($state) => BroadcastService::AUDIENCES[$state] ?? $state),
                Tables\Columns\TextColumn::make('recipients_count')->label('Pastors')->numeric()->alignEnd(),
                Tables\Columns\IconColumn::make('email_copy')->label('Email')->boolean(),
                Tables\Columns\TextColumn::make('sender.name')->label('Sent by')->toggleable(),
            ])
            ->actions([
                Tables\Actions\ViewAction::make()->modalHeading(fn (Broadcast $r) => $r->subject)->infolist(null)
                    ->form([
                        Forms\Components\Textarea::make('body')->label('Message')->rows(8)->disabled(),
                    ]),
            ])
            ->emptyStateHeading('No messages sent yet')
            ->emptyStateDescription('Use “New message” to write to all pastors, a region, some zones or individual pastors.');
    }

    public static function getPages(): array
    {
        return ['index' => Pages\ListBroadcasts::route('/')];
    }
}
