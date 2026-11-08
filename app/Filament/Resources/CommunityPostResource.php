<?php

namespace App\Filament\Resources;

use App\Filament\Resources\CommunityPostResource\Pages;
use App\Models\Community\Post;
use App\Services\Community\ModerationService;
use Filament\Forms;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

/** Head office's view of everything members post: read it, hide it, pin it, remove it, act on the author. */
class CommunityPostResource extends Resource
{
    protected static ?string $model = Post::class;

    protected static ?string $navigationIcon = 'heroicon-o-chat-bubble-left-right';
    protected static ?string $navigationGroup = 'Community';
    protected static ?int $navigationSort = 1;
    protected static ?string $modelLabel = 'post';
    protected static ?string $pluralModelLabel = 'Posts';
    protected static ?string $slug = 'community-posts';

    public static function canAccess(): bool { return auth()->user()?->isMaster() ?? false; }
    public static function canCreate(): bool { return false; }
    public static function canEdit($record): bool { return false; }
    public static function canDelete($record): bool { return false; }

    public static function getNavigationBadge(): ?string
    {
        $n = Post::where('status', 'hidden')->count();

        return $n ? (string) $n : null;
    }
    public static function getNavigationBadgeColor(): ?string { return 'warning'; }

    public static function table(Table $table): Table
    {
        return $table
            ->modifyQueryUsing(fn (Builder $query) => $query->with(['author', 'channel:id,name'])->withCount(['comments as comments_total']))
            ->defaultSort('id', 'desc')
            ->columns([
                Tables\Columns\TextColumn::make('created_at')->label('Posted')->dateTime('d M H:i')->sortable(),
                Tables\Columns\TextColumn::make('author.name')->label('Author')->searchable()->limit(24),
                Tables\Columns\TextColumn::make('kind')->badge()->color(fn ($state) => match ($state) { 'announcement' => 'warning', 'short', 'video' => 'danger', 'poll' => 'info', default => 'gray' }),
                Tables\Columns\TextColumn::make('body')->label('Post')->limit(70)->wrap()->searchable()->placeholder('(media only)'),
                Tables\Columns\TextColumn::make('channel.name')->label('Channel')->placeholder('—')->toggleable(),
                Tables\Columns\TextColumn::make('likes_count')->label('❤')->numeric()->sortable()->alignEnd(),
                Tables\Columns\TextColumn::make('comments_count')->label('💬')->numeric()->sortable()->alignEnd(),
                Tables\Columns\TextColumn::make('status')->badge()->color(fn ($state) => match ($state) { 'published' => 'success', 'hidden' => 'warning', default => 'danger' }),
                Tables\Columns\IconColumn::make('is_pinned')->label('Pinned')->boolean()->toggleable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')->options(['published' => 'Published', 'hidden' => 'Hidden (awaiting review)'])->default(null),
                Tables\Filters\SelectFilter::make('kind')->options(['text' => 'Text', 'image' => 'Photos', 'video' => 'Video', 'short' => 'Short', 'poll' => 'Poll', 'announcement' => 'Announcement'])->multiple(),
                Tables\Filters\TernaryFilter::make('has_channel')->label('In a channel')->queries(true: fn (Builder $q) => $q->whereNotNull('channel_id'), false: fn (Builder $q) => $q->whereNull('channel_id'), blank: fn (Builder $q) => $q),
            ])
            ->actions([
                Tables\Actions\Action::make('read')->label('Read')->icon('heroicon-o-eye')->color('gray')->modalSubmitAction(false)->modalCancelActionLabel('Close')
                    ->modalHeading(fn (Post $record) => "Post by {$record->author?->name}")
                    ->modalContent(fn (Post $record) => view('filament.partials.community-post', ['post' => $record])),
                Tables\Actions\Action::make('hide')->label('Hide')->icon('heroicon-o-eye-slash')->color('warning')
                    ->visible(fn (Post $record) => $record->status === 'published')
                    ->form([Forms\Components\Textarea::make('reason')->label('Reason (the author is told)')->rows(2)->maxLength(190)])
                    ->action(function (Post $record, array $data) {
                        app(ModerationService::class)->setPostStatus($record, 'hidden', auth()->user(), $data['reason'] ?? null);
                        Notification::make()->title('Post hidden')->success()->send();
                    }),
                Tables\Actions\Action::make('restore')->label('Restore')->icon('heroicon-o-arrow-uturn-left')->color('success')
                    ->visible(fn (Post $record) => $record->status === 'hidden')
                    ->action(function (Post $record) {
                        app(ModerationService::class)->setPostStatus($record, 'published', auth()->user());
                        Notification::make()->title('Post restored')->success()->send();
                    }),
                Tables\Actions\Action::make('pin')->label(fn (Post $record) => $record->is_pinned ? 'Unpin' : 'Pin')->icon('heroicon-o-map-pin')->color('gray')
                    ->action(fn (Post $record) => $record->update(['is_pinned' => !$record->is_pinned])),
                Tables\Actions\Action::make('remove')->label('Remove')->icon('heroicon-o-trash')->color('danger')->requiresConfirmation()
                    ->modalDescription('The post is deleted for everyone and the author is told.')
                    ->form([Forms\Components\Textarea::make('reason')->label('Reason (the author is told)')->rows(2)->maxLength(190)])
                    ->action(function (Post $record, array $data) {
                        app(ModerationService::class)->removePost($record, auth()->user(), $data['reason'] ?? null);
                        Notification::make()->title('Post removed')->success()->send();
                    }),
                Tables\Actions\Action::make('mute')->label('Mute author 24h')->icon('heroicon-o-speaker-x-mark')->color('warning')->requiresConfirmation()
                    ->action(function (Post $record) {
                        app(ModerationService::class)->mute($record->author, 24, auth()->user(), 'Muted after a post review');
                        Notification::make()->title('Author muted for 24 hours')->success()->send();
                    }),
            ])
            ->emptyStateHeading('No posts yet');
    }

    public static function getPages(): array
    {
        return ['index' => Pages\ListCommunityPosts::route('/')];
    }
}
