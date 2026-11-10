<?php

namespace App\Filament\Resources;

use App\Filament\Resources\TeachingResource\Pages;
use App\Models\Community\Teaching;
use App\Support\MediaLinks;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

/**
 * The official teachings library shown in the app's Watch tab: Apostle Tavonga Vutabwashe's messages as YouTube videos.
 * Paste a YouTube link, choose a series, publish. Members watch it inside the app.
 */
class TeachingResource extends Resource
{
    protected static ?string $model = Teaching::class;

    protected static ?string $navigationIcon = 'heroicon-o-play-circle';
    protected static ?string $navigationGroup = 'Community';
    protected static ?int $navigationSort = 4;
    protected static ?string $modelLabel = 'teaching';
    protected static ?string $pluralModelLabel = 'Teachings (Watch)';
    protected static ?string $slug = 'teachings';

    public static function canAccess(): bool { return auth()->user()?->isMaster() ?? false; }

    /** Turn the pasted link into the fields the app uses. */
    public static function prepare(array $data): array
    {
        $id = MediaLinks::youtubeId((string) ($data['youtube_url'] ?? ''));
        $data['video_id'] = $id;
        $data['youtube_url'] = "https://www.youtube.com/watch?v={$id}";
        $data['thumbnail_url'] = "https://i.ytimg.com/vi/{$id}/hqdefault.jpg";
        $data['created_by'] ??= auth()->id();
        if (($data['status'] ?? 'published') === 'published' && empty($data['published_at'])) {
            $data['published_at'] = now();
        }

        return $data;
    }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Video')->columns(2)->schema([
                Forms\Components\TextInput::make('youtube_url')->label('YouTube link')->required()->maxLength(300)->columnSpanFull()
                    ->helperText('Paste the video link, e.g. https://www.youtube.com/watch?v=… or https://youtu.be/…')
                    ->rules([fn () => function (string $attribute, $value, \Closure $fail) {
                        if (!MediaLinks::youtubeId((string) $value)) {
                            $fail('That is not a valid YouTube link.');
                        }
                    }]),
                Forms\Components\TextInput::make('title')->required()->maxLength(160)->columnSpanFull(),
                Forms\Components\Textarea::make('description')->rows(4)->maxLength(2000)->columnSpanFull(),
            ]),
            Forms\Components\Section::make('Details')->columns(2)->schema([
                Forms\Components\TextInput::make('speaker')->default('Apostle Tavonga Vutabwashe')->required()->maxLength(80),
                Forms\Components\TextInput::make('series')->maxLength(80)->helperText('Messages with the same series are grouped in the app.')->datalist(fn () => Teaching::whereNotNull('series')->distinct()->pluck('series')->all()),
                Forms\Components\Select::make('status')->options(['published' => 'Published', 'draft' => 'Draft (hidden)'])->default('published')->required()->native(false),
                Forms\Components\DateTimePicker::make('published_at')->label('Publish at')->helperText('Leave empty to publish now. A future time schedules it.')->native(false),
                Forms\Components\Toggle::make('partners_only')->label('Partners only')->visible(fn () => \Illuminate\Support\Facades\Schema::hasColumn('community_teachings', 'partners_only'))->helperText('Only partners in good standing can watch it; everyone else sees a lock.'),
                Forms\Components\Toggle::make('is_featured')->label('Feature at the top of Watch')->helperText('The latest featured teaching is shown in the big banner.'),
            ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('published_at', 'desc')
            ->columns([
                Tables\Columns\ImageColumn::make('thumbnail_url')->label('')->width(96)->height(54),
                Tables\Columns\TextColumn::make('title')->searchable()->weight('semibold')->limit(50)->description(fn (Teaching $record) => $record->series),
                Tables\Columns\TextColumn::make('speaker')->toggleable(),
                Tables\Columns\IconColumn::make('is_featured')->label('Featured')->boolean(),
                Tables\Columns\TextColumn::make('status')->badge()->color(fn ($state) => $state === 'published' ? 'success' : 'gray'),
                Tables\Columns\TextColumn::make('views_count')->label('Views')->numeric()->sortable(),
                Tables\Columns\TextColumn::make('published_at')->label('Published')->dateTime('d M Y H:i')->sortable(),
            ])
            ->filters([Tables\Filters\SelectFilter::make('status')->options(['published' => 'Published', 'draft' => 'Draft']), Tables\Filters\TernaryFilter::make('is_featured')->label('Featured')])
            ->actions([Tables\Actions\EditAction::make(), Tables\Actions\DeleteAction::make()])
            ->emptyStateHeading('No teachings yet')
            ->emptyStateDescription('Add the first message: paste a YouTube link and it appears in everyone\'s Watch tab.');
    }

    public static function getPages(): array
    {
        return ['index' => Pages\ListTeachings::route('/'), 'create' => Pages\CreateTeaching::route('/create'), 'edit' => Pages\EditTeaching::route('/{record}/edit')];
    }
}
