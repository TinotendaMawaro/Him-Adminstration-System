<?php

namespace App\Filament\Resources;

use App\Filament\Resources\CommunityReportResource\Pages;
use App\Models\Community\Comment;
use App\Models\Community\Post;
use App\Models\Community\Report;
use App\Services\Community\ModerationService;
use Filament\Forms;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Str;

/** The moderation queue: what members reported. Act on it or dismiss it; the person who reported is never revealed to the reported person. */
class CommunityReportResource extends Resource
{
    protected static ?string $model = Report::class;

    protected static ?string $navigationIcon = 'heroicon-o-flag';
    protected static ?string $navigationGroup = 'Community';
    protected static ?int $navigationSort = 0;
    protected static ?string $modelLabel = 'report';
    protected static ?string $pluralModelLabel = 'Reports';
    protected static ?string $slug = 'community-reports';

    public static function canAccess(): bool { return auth()->user()?->isMaster() ?? false; }
    public static function canCreate(): bool { return false; }
    public static function canEdit($record): bool { return false; }
    public static function canDelete($record): bool { return false; }

    public static function getNavigationBadge(): ?string
    {
        $n = Report::where('status', 'open')->count();

        return $n ? (string) $n : null;
    }
    public static function getNavigationBadgeColor(): ?string { return 'danger'; }

    /** A short, safe description of what was reported. */
    public static function describe(Report $r): string
    {
        return match ($r->subject_type) {
            'post' => ($p = Post::withTrashed()->with('author:id,name')->find($r->subject_id)) ? '“' . Str::limit((string) ($p->body ?? '(media post)'), 90) . '” — ' . $p->author?->name : 'Post removed',
            'comment' => ($c = Comment::withTrashed()->with('author:id,name')->find($r->subject_id)) ? '“' . Str::limit($c->body, 90) . '” — ' . $c->author?->name : 'Comment removed',
            'channel' => ($c = \App\Models\Community\Channel::withTrashed()->find($r->subject_id)) ? "Channel: {$c->name}" : 'Channel removed',
            'user' => ($u = \App\Models\User::find($r->subject_id)) ? "Member: {$u->name}" : 'Member removed',
            'listing' => ($l = \App\Models\Market\Listing::withTrashed()->find($r->subject_id)) ? "Listing: {$l->title}" : 'Listing removed',
            default => '—',
        };
    }

    public static function table(Table $table): Table
    {
        return $table
            ->modifyQueryUsing(fn ($query) => $query->with('reporter:id,name'))
            ->defaultSort('id', 'desc')
            ->columns([
                Tables\Columns\TextColumn::make('created_at')->label('Reported')->since()->sortable(),
                Tables\Columns\TextColumn::make('subject_type')->label('Type')->badge(),
                Tables\Columns\TextColumn::make('what')->label('What was reported')->state(fn (Report $record) => self::describe($record))->wrap()->limit(110),
                Tables\Columns\TextColumn::make('reason')->badge()->color('warning'),
                Tables\Columns\TextColumn::make('details')->limit(50)->toggleable()->placeholder('—'),
                Tables\Columns\TextColumn::make('reporter.name')->label('Reported by')->toggleable(),
                Tables\Columns\TextColumn::make('status')->badge()->color(fn ($state) => match ($state) { 'open' => 'danger', 'actioned' => 'success', default => 'gray' }),
            ])
            ->filters([Tables\Filters\SelectFilter::make('status')->options(['open' => 'Open', 'actioned' => 'Actioned', 'dismissed' => 'Dismissed'])->default('open')])
            ->actions([
                Tables\Actions\Action::make('act')->label('Take action')->icon('heroicon-o-shield-exclamation')->color('danger')
                    ->visible(fn (Report $record) => $record->status === 'open')
                    ->modalHeading('Take action on this report')->modalSubmitActionLabel('Apply')
                    ->form([
                        Forms\Components\Placeholder::make('what')->label('Reported')->content(fn (Report $record) => self::describe($record)),
                        Forms\Components\Select::make('action')->required()->native(false)->options(fn (Report $record) => array_filter([
                            'hide' => $record->subject_type === 'user' ? 'Suspend the member for 7 days' : 'Hide it (suspend)',
                            in_array($record->subject_type, ['post'], true) ? 'remove' : null => 'Remove the post permanently',
                            in_array($record->subject_type, ['post', 'comment'], true) ? 'ban' : null => 'Hide it AND suspend the author for 7 days',
                        ], fn ($label, $key) => $key !== '', ARRAY_FILTER_USE_BOTH)),
                        Forms\Components\Textarea::make('reason')->label('Message to the person (optional)')->rows(2)->maxLength(190),
                    ])
                    ->action(function (Report $record, array $data) {
                        app(ModerationService::class)->resolveReport($record, $data['action'], auth()->user(), $data['reason'] ?? null);
                        Notification::make()->title('Action applied; related reports closed')->success()->send();
                    }),
                Tables\Actions\Action::make('dismiss')->label('Dismiss')->icon('heroicon-o-check')->color('gray')->requiresConfirmation()
                    ->modalDescription('Nothing wrong was found. If the content had been auto-hidden by multiple reports, it is put back.')
                    ->visible(fn (Report $record) => $record->status === 'open')
                    ->action(function (Report $record) {
                        app(ModerationService::class)->resolveReport($record, 'dismiss', auth()->user());
                        Notification::make()->title('Report dismissed')->success()->send();
                    }),
            ]);
    }

    public static function getPages(): array
    {
        return ['index' => Pages\ListCommunityReports::route('/')];
    }
}
