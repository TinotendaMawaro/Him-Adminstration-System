<?php

namespace App\Filament\Resources;

use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Enums\PaymentType;
use App\Filament\Resources\PaymentResource\Pages;
use App\Filament\Support\Money;
use App\Models\Payment;
use App\Models\Region;
use App\Models\User;
use App\Models\Zone;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Infolists;
use Filament\Infolists\Infolist;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class PaymentResource extends Resource
{
    protected static ?string $model = Payment::class;

    protected static ?string $navigationIcon = 'heroicon-o-banknotes';
    protected static ?string $navigationGroup = 'Finance';
    protected static ?int $navigationSort = 1;
    protected static ?string $recordTitleAttribute = 'receipt_number';
    protected static ?string $modelLabel = 'payment';

    public static function canAccess(): bool
    {
        return auth()->user()?->hasAnyRole(['master', 'finance']) ?? false;
    }

    public static function getNavigationBadge(): ?string
    {
        $n = Payment::where('status', PaymentStatus::Pending->value)->count();

        return $n ? (string) $n : null;
    }

    public static function getNavigationBadgeColor(): ?string
    {
        return 'warning';
    }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Receive a payment')
                ->description('Record money you have received. A numbered receipt is issued immediately unless you save it as pending.')
                ->columns(2)
                ->schema([
                    Forms\Components\Select::make('user_id')
                        ->label('Received from')
                        ->searchable()
                        ->getSearchResultsUsing(fn (string $search) => User::query()
                            ->where('is_active', true)
                            ->whereIn('role', ['member', 'partner', 'pastor', 'hod'])
                            ->where(fn ($query) => $query->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%"))
                            ->limit(40)->get()->mapWithKeys(fn ($u) => [$u->id => "{$u->name} · {$u->email}"])->all())
                        ->getOptionLabelUsing(fn ($value) => User::find($value)?->name)
                        ->required()
                        ->live()
                        ->columnSpanFull(),
                    Forms\Components\Select::make('type')
                        ->label('Contribution')
                        ->options(PaymentType::class)
                        ->required()
                        ->live(),
                    Forms\Components\TextInput::make('amount')
                        ->numeric()->required()->minValue(0.01)->maxValue(1000000)->prefix('$')->step(0.01),
                    Forms\Components\Select::make('method')
                        ->options(PaymentMethod::class)
                        ->required()
                        ->live(),
                    Forms\Components\TextInput::make('transaction_id')
                        ->label('Transaction / bank reference')
                        ->maxLength(120)
                        ->required(fn (Forms\Get $get) => filled($get('method')) && $get('method') !== PaymentMethod::Cash->value)
                        ->helperText('Required for anything other than cash so it can be reconciled.'),
                    Forms\Components\Select::make('event_registration_id')
                        ->label('Event registration')
                        ->visible(fn (Forms\Get $get) => $get('type') === PaymentType::EventRegistration->value)
                        ->required(fn (Forms\Get $get) => $get('type') === PaymentType::EventRegistration->value)
                        ->options(fn (Forms\Get $get) => \App\Models\EventRegistration::with('event')
                            ->where('user_id', $get('user_id'))->where('status', '!=', 'cancelled')->get()
                            ->mapWithKeys(fn ($r) => [$r->id => "{$r->event?->title} · {$r->reference_number}"])->all()),
                    Forms\Components\DateTimePicker::make('paid_at')
                        ->label('Date received')->default(now())->maxDate(now()->addMinute())->seconds(false),
                    Forms\Components\Toggle::make('issue_receipt')
                        ->label('Mark as received and issue receipt now')
                        ->default(true)->dehydrated(false)
                        ->helperText('Turn off to save as pending (e.g. awaiting bank confirmation).'),
                    Forms\Components\Textarea::make('notes')->rows(2)->maxLength(1000)->columnSpanFull(),
                ]),
        ]);
    }

    public static function infolist(Infolist $infolist): Infolist
    {
        return $infolist->schema([
            Infolists\Components\Section::make('Payment')->columns(3)->schema([
                Infolists\Components\TextEntry::make('receipt_number')->label('Receipt no.')->placeholder('Not issued')->copyable()->weight('bold'),
                Infolists\Components\TextEntry::make('reference')->copyable(),
                Infolists\Components\TextEntry::make('status')->badge(),
                Infolists\Components\TextEntry::make('user.name')->label('Received from'),
                Infolists\Components\TextEntry::make('type')->badge(),
                Infolists\Components\TextEntry::make('amount')->formatStateUsing(fn ($state, Payment $r) => "{$r->currency} " . number_format((float) $state, 2))->size('lg')->weight('bold'),
                Infolists\Components\TextEntry::make('method')->badge()->color('gray'),
                Infolists\Components\TextEntry::make('transaction_id')->placeholder('—')->copyable(),
                Infolists\Components\TextEntry::make('paid_at')->dateTime('d M Y, H:i')->placeholder('—'),
                Infolists\Components\TextEntry::make('zone.name')->label('Zone')->placeholder('—'),
                Infolists\Components\TextEntry::make('zone.region.name')->label('Region')->placeholder('—'),
                Infolists\Components\TextEntry::make('notes')->placeholder('—')->columnSpanFull(),
            ]),
            Infolists\Components\Section::make('Audit trail')->columns(3)->collapsed()->schema([
                Infolists\Components\TextEntry::make('recordedBy.name')->label('Recorded by')->placeholder('Self-submitted'),
                Infolists\Components\TextEntry::make('confirmedBy.name')->label('Confirmed by')->placeholder('—'),
                Infolists\Components\TextEntry::make('confirmed_at')->dateTime('d M Y, H:i')->placeholder('—'),
                Infolists\Components\TextEntry::make('voidedBy.name')->label('Voided by')->placeholder('—')->visible(fn (Payment $r) => (bool) $r->voided_at),
                Infolists\Components\TextEntry::make('voided_at')->dateTime('d M Y, H:i')->visible(fn (Payment $r) => (bool) $r->voided_at),
                Infolists\Components\TextEntry::make('void_reason')->visible(fn (Payment $r) => (bool) $r->voided_at),
            ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->modifyQueryUsing(fn (Builder $query) => $query->with(['user', 'zone.region']))
            ->columns([
                Tables\Columns\TextColumn::make('receipt_number')->label('Receipt')->placeholder('—')->searchable()->copyable()->weight('bold'),
                Tables\Columns\TextColumn::make('paid_at')->label('Date')->dateTime('d M Y')->sortable()->placeholder('—')
                    ->description(fn (Payment $r) => $r->paid_at ? null : 'submitted ' . $r->created_at->diffForHumans()),
                Tables\Columns\TextColumn::make('user.name')->label('Payer')->searchable(),
                Tables\Columns\TextColumn::make('zone.name')->label('Zone')->placeholder('—')->toggleable(),
                Tables\Columns\TextColumn::make('zone.region.name')->label('Region')->placeholder('—')->toggleable(),
                Tables\Columns\TextColumn::make('type')->badge()->sortable(),
                Tables\Columns\TextColumn::make('method')->badge()->color('gray')->toggleable(),
                Tables\Columns\TextColumn::make('amount')
                    ->formatStateUsing(fn ($state) => Money::fmt($state))->sortable()->alignEnd()
                    ->summarize(Tables\Columns\Summarizers\Sum::make()->label('Total (filtered)')->formatStateUsing(fn ($state) => Money::fmt($state))),
                Tables\Columns\TextColumn::make('status')->badge()->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('status')->options(PaymentStatus::class)->multiple(),
                Tables\Filters\SelectFilter::make('type')->label('Contribution')->options(PaymentType::class)->multiple(),
                Tables\Filters\SelectFilter::make('method')->options(PaymentMethod::class),
                Tables\Filters\SelectFilter::make('region')->label('Region')
                    ->options(fn () => Region::orderBy('name')->pluck('name', 'id')->all())
                    ->query(fn (Builder $query, array $data) => $query->when($data['value'] ?? null, fn ($query, $v) => $query->whereHas('zone', fn ($z) => $z->where('region_id', $v)))),
                Tables\Filters\SelectFilter::make('zone_id')->label('Zone')->searchable()
                    ->options(fn () => Zone::orderBy('code')->get()->mapWithKeys(fn ($z) => [$z->id => "{$z->code} · {$z->name}"])->all()),
                Tables\Filters\Filter::make('date')->form([
                    Forms\Components\DatePicker::make('from'), Forms\Components\DatePicker::make('until'),
                ])->columns(2)->query(fn (Builder $query, array $data) => $query
                    ->when($data['from'] ?? null, fn ($query, $v) => $query->whereDate('payments.created_at', '>=', $v))
                    ->when($data['until'] ?? null, fn ($query, $v) => $query->whereDate('payments.created_at', '<=', $v))),
            ], layout: Tables\Enums\FiltersLayout::AboveContentCollapsible)
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\Action::make('confirm')
                    ->label('Confirm')->icon('heroicon-o-check-badge')->color('success')
                    ->visible(fn (Payment $r) => auth()->user()?->can('confirm', $r) ?? false)
                    ->requiresConfirmation()
                    ->modalHeading('Confirm payment received')
                    ->modalDescription('Only confirm once you have verified the money. A receipt number is issued and the payment becomes permanent.')
                    ->action(function (Payment $r) {
                        $r->confirm(auth()->user());
                        Notification::make()->title("Receipt {$r->receipt_number} issued")->success()->send();
                    }),
                Tables\Actions\Action::make('receipt')
                    ->label('Receipt')->icon('heroicon-o-printer')->color('gray')
                    ->visible(fn (Payment $r) => $r->status === PaymentStatus::Completed && $r->receipt_number)
                    ->url(fn (Payment $r) => route('receipts.show', $r), shouldOpenInNewTab: true),
                Tables\Actions\Action::make('void')
                    ->label('Void')->icon('heroicon-o-no-symbol')->color('danger')
                    ->visible(fn (Payment $r) => auth()->user()?->can('void', $r) ?? false)
                    ->form([Forms\Components\Textarea::make('reason')->required()->minLength(5)->maxLength(500)
                        ->helperText('Recorded permanently in the audit trail. Payments are never deleted.')])
                    ->modalHeading('Void this payment')
                    ->requiresConfirmation()
                    ->action(function (Payment $r, array $data) {
                        $r->void(auth()->user(), $data['reason']);
                        Notification::make()->title('Payment voided')->warning()->send();
                    }),
            ])
            ->headerActions([
                Tables\Actions\Action::make('export')->label('Export CSV')->icon('heroicon-o-arrow-down-tray')
                    ->url(fn () => route('exports.download', ['report' => 'payments', 'period' => 'this_year']))->color('gray'),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListPayments::route('/'),
            'create' => Pages\CreatePayment::route('/create'),
            'view'   => Pages\ViewPayment::route('/{record}'),
        ];
    }
}
