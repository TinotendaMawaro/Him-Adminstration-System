<?php

namespace App\Filament\Resources;

use App\Enums\RegistrationStatus;
use App\Filament\Resources\EventRegistrationResource\Pages;
use App\Filament\Support\Money;
use App\Models\Event;
use App\Models\EventRegistration;
use App\Models\Zone;
use App\Services\AuditTrail;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;

/**
 * Every registration across every event, for the events department:
 * confirm, check people in on the day, cancel, and export attendee lists.
 */
class EventRegistrationResource extends Resource
{
    protected static ?string $model = EventRegistration::class;

    protected static ?string $navigationIcon = 'heroicon-o-ticket';
    protected static ?string $navigationGroup = 'Events';
    protected static ?int $navigationSort = 1;
    protected static ?string $modelLabel = 'registration';
    protected static ?string $slug = 'registrations';

    public static function canAccess(): bool
    {
        return auth()->user()?->hasAnyRole(['master', 'event']) ?? false;
    }

    public static function canCreate(): bool { return false; }
    public static function canEdit($record): bool { return false; }
    public static function canDelete($record): bool { return false; }

    public static function getNavigationBadge(): ?string
    {
        $n = EventRegistration::where('status', RegistrationStatus::Pending->value)->count();

        return $n ? (string) $n : null;
    }

    public static function getNavigationBadgeColor(): ?string
    {
        return 'warning';
    }

    public static function table(Table $table): Table
    {
        return $table
            ->modifyQueryUsing(fn (Builder $query) => $query->with(['event', 'user.zone']))
            ->columns([
                Tables\Columns\TextColumn::make('reference_number')->label('Reference')->searchable()->copyable()->weight('bold'),
                Tables\Columns\TextColumn::make('event.title')->label('Event')->searchable()->limit(30)->sortable(),
                Tables\Columns\TextColumn::make('event.starts_at')->label('Event date')->date('d M Y')->sortable(),
                Tables\Columns\TextColumn::make('user.name')->label('Attendee')->searchable(),
                Tables\Columns\TextColumn::make('user.phone')->label('Phone')->toggleable()->placeholder('—'),
                Tables\Columns\TextColumn::make('user.zone.name')->label('Zone')->toggleable()->placeholder('—'),
                Tables\Columns\TextColumn::make('status')->badge()->sortable(),
                Tables\Columns\TextColumn::make('amount_due')->label('Due')->formatStateUsing(fn ($state) => Money::fmt($state))->toggleable(),
                Tables\Columns\TextColumn::make('amount_paid')->label('Paid')->formatStateUsing(fn ($state) => Money::fmt($state))
                    ->color(fn (EventRegistration $r) => $r->amount_due > 0 && $r->amount_paid < $r->amount_due ? 'danger' : 'success')
                    ->summarize(Tables\Columns\Summarizers\Sum::make()->formatStateUsing(fn ($state) => Money::fmt($state))),
                Tables\Columns\TextColumn::make('created_at')->label('Registered')->since()->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('event_id')->label('Event')->searchable()
                    ->options(fn () => Event::orderByDesc('starts_at')->limit(200)->pluck('title', 'id')->all()),
                Tables\Filters\SelectFilter::make('status')->options(RegistrationStatus::class)->multiple(),
                Tables\Filters\TernaryFilter::make('unpaid')->label('Payment')->queries(
                    true: fn (Builder $query) => $query->whereColumn('amount_paid', '<', 'amount_due'),
                    false: fn (Builder $query) => $query->whereColumn('amount_paid', '>=', 'amount_due'),
                    blank: fn (Builder $query) => $query)->trueLabel('Balance owing')->falseLabel('Fully paid'),
                Tables\Filters\SelectFilter::make('zone')->label('Attendee zone')->searchable()
                    ->options(fn () => Zone::orderBy('code')->get()->mapWithKeys(fn ($z) => [$z->id => "{$z->code} · {$z->name}"])->all())
                    ->query(fn (Builder $query, array $data) => $query->when($data['value'] ?? null, fn ($query, $v) => $query->whereHas('user', fn ($u) => $u->where('zone_id', $v)))),
            ], layout: Tables\Enums\FiltersLayout::AboveContentCollapsible)
            ->actions([
                Tables\Actions\Action::make('confirm')->label('Confirm')->icon('heroicon-o-check')->color('success')
                    ->visible(fn (EventRegistration $r) => $r->status === RegistrationStatus::Pending)
                    ->action(fn (EventRegistration $r) => self::setStatus($r, RegistrationStatus::Confirmed)),
                Tables\Actions\Action::make('checkin')->label('Check in')->icon('heroicon-o-qr-code')->color('info')
                    ->visible(fn (EventRegistration $r) => $r->status === RegistrationStatus::Confirmed)
                    ->action(fn (EventRegistration $r) => self::setStatus($r, RegistrationStatus::Attended)),
                Tables\Actions\Action::make('cancel')->label('Cancel')->icon('heroicon-o-x-mark')->color('danger')
                    ->visible(fn (EventRegistration $r) => in_array($r->status, [RegistrationStatus::Pending, RegistrationStatus::Confirmed], true))
                    ->requiresConfirmation()
                    ->action(fn (EventRegistration $r) => self::setStatus($r, RegistrationStatus::Cancelled)),
            ])
            ->bulkActions([
                Tables\Actions\BulkAction::make('confirm_selected')->label('Confirm selected')->icon('heroicon-o-check')->color('success')
                    ->requiresConfirmation()->deselectRecordsAfterCompletion()
                    ->action(fn (Collection $records) => $records->each(fn ($r) => $r->status === RegistrationStatus::Pending && self::setStatus($r, RegistrationStatus::Confirmed, false))),
                Tables\Actions\BulkAction::make('checkin_selected')->label('Check in selected')->icon('heroicon-o-qr-code')->color('info')
                    ->requiresConfirmation()->deselectRecordsAfterCompletion()
                    ->action(fn (Collection $records) => $records->each(fn ($r) => $r->status === RegistrationStatus::Confirmed && self::setStatus($r, RegistrationStatus::Attended, false))),
            ])
            ->headerActions([
                Tables\Actions\Action::make('export')->label('Export attendee list')->icon('heroicon-o-arrow-down-tray')->color('gray')
                    ->url(fn () => route('exports.download', ['report' => 'registrations'])),
            ]);
    }

    private static function setStatus(EventRegistration $r, RegistrationStatus $to, bool $notify = true): void
    {
        $from = $r->status?->value;
        $r->update(['status' => $to]);
        AuditTrail::record('event_registration.' . $to->value, auth()->user(), $r, ['from' => $from, 'event_id' => $r->event_id], $r->user_id);

        if ($notify) {
            Notification::make()->title("Registration {$to->getLabel()}")->success()->send();
        }
    }

    public static function getPages(): array
    {
        return ['index' => Pages\ListRegistrations::route('/')];
    }
}
