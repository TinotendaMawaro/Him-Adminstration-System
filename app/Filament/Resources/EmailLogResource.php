<?php

namespace App\Filament\Resources;

use App\Filament\Resources\EmailLogResource\Pages;
use App\Mail\TestMail;
use App\Models\EmailLog;
use Filament\Forms;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\Facades\Mail;

/**
 * Master-only record of every email the system tried to send: what, to whom, whether it was delivered.
 */
class EmailLogResource extends Resource
{
    protected static ?string $model = EmailLog::class;

    protected static ?string $navigationIcon = 'heroicon-o-envelope';
    protected static ?string $navigationGroup = 'Reports';
    protected static ?int $navigationSort = 2;
    protected static ?string $modelLabel = 'email';
    protected static ?string $pluralModelLabel = 'Email log';
    protected static ?string $slug = 'email-log';

    public static function canAccess(): bool
    {
        return auth()->user()?->isMaster() ?? false;
    }

    public static function canCreate(): bool { return false; }
    public static function canEdit($record): bool { return false; }
    public static function canDelete($record): bool { return false; }

    public static function getNavigationBadge(): ?string
    {
        $n = EmailLog::whereIn('status', ['failed', 'bounced', 'complained'])->where('created_at', '>=', now()->subDay())->count();

        return $n ? (string) $n : null;
    }

    public static function getNavigationBadgeColor(): ?string
    {
        return 'danger';
    }

    public static function table(Table $table): Table
    {
        return $table
            ->modifyQueryUsing(fn ($query) => $query->with('user'))
            ->columns([
                Tables\Columns\TextColumn::make('created_at')->label('When')->since()->sortable()->description(fn (EmailLog $r) => $r->created_at->format('j M, H:i')),
                Tables\Columns\TextColumn::make('to_email')->label('To')->searchable()->copyable()->description(fn (EmailLog $r) => $r->user?->name),
                Tables\Columns\TextColumn::make('subject')->searchable()->limit(46)->tooltip(fn (EmailLog $r) => $r->subject),
                Tables\Columns\TextColumn::make('template')->badge()->color('gray')->formatStateUsing(fn ($state) => str($state)->replace('_', ' ')->title()),
                Tables\Columns\TextColumn::make('status')->badge()->sortable()->color(fn ($state) => match ($state) {
                    'delivered' => 'success', 'sent' => 'info', 'queued', 'delayed' => 'warning', 'skipped' => 'gray', default => 'danger',
                }),
                Tables\Columns\TextColumn::make('error')->limit(40)->tooltip(fn (EmailLog $r) => $r->error)->placeholder('—')->toggleable(),
                Tables\Columns\TextColumn::make('provider_id')->label('Resend id')->copyable()->placeholder('—')->toggleable(isToggledHiddenByDefault: true),
            ])
            ->defaultSort('id', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('status')->options(['queued' => 'Queued', 'sent' => 'Sent', 'delivered' => 'Delivered', 'delayed' => 'Delayed', 'bounced' => 'Bounced', 'complained' => 'Spam complaint', 'failed' => 'Failed', 'skipped' => 'Skipped'])->multiple(),
                Tables\Filters\SelectFilter::make('template')->options(fn () => EmailLog::query()->distinct()->orderBy('template')->pluck('template', 'template')->map(fn ($t) => str($t)->replace('_', ' ')->title())->all()),
                Tables\Filters\SelectFilter::make('category')->options(['transactional' => 'Transactional', 'notification' => 'Notification copies']),
            ], layout: Tables\Enums\FiltersLayout::AboveContentCollapsible)
            ->headerActions([
                Tables\Actions\Action::make('test')->label('Send test email')->icon('heroicon-o-paper-airplane')
                    ->form([Forms\Components\TextInput::make('to')->label('Send to')->email()->required()->default(fn () => auth()->user()?->email)
                        ->helperText('Until you verify your own domain in Resend, it only delivers to your Resend account email. Use delivered@resend.dev to test safely.')])
                    ->action(function (array $data) {
                        try {
                            $mail = new TestMail(auth()->user()?->name ?? 'Master');
                            $mail->recipientEmail = $data['to'];
                            Mail::to($data['to'])->sendNow($mail);
                            Notification::make()->title('Test email accepted by the provider')->body("Sent to {$data['to']}.")->success()->send();
                        } catch (\Throwable $e) {
                            Notification::make()->title('The provider rejected the test email')->body($e->getMessage())->danger()->persistent()->send();
                        }
                    }),
            ]);
    }

    public static function getPages(): array
    {
        return ['index' => Pages\ListEmailLogs::route('/')];
    }
}
