<?php

namespace App\Filament\Resources;

use App\Filament\Resources\LiveSessionResource\Pages;
use App\Models\Community\Channel;
use App\Models\Community\LiveSession;
use App\Services\Community\WatchService;
use App\Support\MediaLinks;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

/** Official live services and events (and an overview of channel sessions). Start your YouTube live, paste its link, set the time. */
class LiveSessionResource extends Resource
{
    protected static ?string $model = LiveSession::class;

    protected static ?string $navigationIcon = 'heroicon-o-signal';
    protected static ?string $navigationGroup = 'Community';
    protected static ?int $navigationSort = 5;
    protected static ?string $modelLabel = 'live session';
    protected static ?string $pluralModelLabel = 'Live sessions';
    protected static ?string $slug = 'live-sessions';

    public static function canAccess(): bool { return auth()->user()?->isMaster() ?? false; }

    public static function prepare(array $data): array
    {
        $id = MediaLinks::youtubeId((string) ($data['url'] ?? ''));
        $data['video_id'] = $id;
        $data['url'] = "https://www.youtube.com/watch?v={$id}";
        $data['host_id'] ??= auth()->id();
        $data['reminder_sent'] = false;

        return $data;
    }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make()->columns(2)->schema([
                Forms\Components\TextInput::make('title')->required()->maxLength(160)->columnSpanFull(),
                Forms\Components\TextInput::make('url')->label('YouTube live / premiere link')->required()->maxLength(300)->columnSpanFull()
                    ->rules([fn () => function (string $attribute, $value, \Closure $fail) {
                        if (!MediaLinks::youtubeId((string) $value)) {
                            $fail('That is not a valid YouTube link.');
                        }
                    }]),
                Forms\Components\DateTimePicker::make('scheduled_at')->label('Starts')->required()->native(false),
                Forms\Components\Select::make('status')->options(['scheduled' => 'Scheduled', 'live' => 'Live now', 'ended' => 'Ended', 'cancelled' => 'Cancelled'])->default('scheduled')->required()->native(false)
                    ->helperText('Normally automatic: it goes live at the start time and ends 4 hours later. Set it by hand to override.'),
                Forms\Components\Toggle::make('is_official')->label('Official (everyone sees it)')->default(true),
                Forms\Components\Select::make('channel_id')->label('Channel (optional)')->searchable()->native(false)->options(fn () => Channel::orderBy('name')->limit(200)->pluck('name', 'id')->all()),
                Forms\Components\Textarea::make('description')->rows(3)->maxLength(500)->columnSpanFull(),
            ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->modifyQueryUsing(fn ($query) => $query->with(['host:id,name', 'channel:id,name']))
            ->defaultSort('scheduled_at', 'desc')
            ->columns([
                Tables\Columns\TextColumn::make('title')->searchable()->weight('semibold')->limit(44),
                Tables\Columns\TextColumn::make('scheduled_at')->label('Starts')->dateTime('d M Y H:i')->sortable(),
                Tables\Columns\TextColumn::make('state')->label('State')->badge()->state(fn (LiveSession $record) => app(WatchService::class)->effectiveStatus($record))
                    ->color(fn ($state) => match ($state) { 'live' => 'danger', 'scheduled' => 'info', 'ended' => 'gray', default => 'warning' }),
                Tables\Columns\IconColumn::make('is_official')->label('Official')->boolean(),
                Tables\Columns\TextColumn::make('channel.name')->label('Channel')->placeholder('—')->toggleable(),
                Tables\Columns\TextColumn::make('host.name')->label('Host')->toggleable(),
                Tables\Columns\TextColumn::make('reminders_count')->label('Reminders')->numeric()->toggleable(),
            ])
            ->actions([Tables\Actions\EditAction::make(), Tables\Actions\DeleteAction::make()])
            ->emptyStateHeading('No live sessions');
    }

    public static function getPages(): array
    {
        return ['index' => Pages\ListLiveSessions::route('/'), 'create' => Pages\CreateLiveSession::route('/create'), 'edit' => Pages\EditLiveSession::route('/{record}/edit')];
    }
}
