<?php

namespace App\Filament\Widgets\Finance;

use App\Enums\PaymentStatus;
use App\Filament\Support\GatedByRole;
use App\Filament\Support\Money;
use App\Models\Payment;
use Filament\Notifications\Notification;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget;

class PendingPaymentsTable extends TableWidget
{
    use GatedByRole;

    protected static array $roles = ['master', 'finance'];
    protected static ?string $heading = 'Payments awaiting verification';
    protected static ?int $sort = 6;
    protected int|string|array $columnSpan = 'full';

    public function table(Table $table): Table
    {
        return $table
            ->query(Payment::query()->with(['user', 'zone'])->needsManualVerification())
            ->columns([
                Tables\Columns\TextColumn::make('created_at')->label('Submitted')->since()->sortable(),
                Tables\Columns\TextColumn::make('user.name')->label('Payer')->searchable(),
                Tables\Columns\TextColumn::make('zone.name')->label('Zone')->placeholder('—'),
                Tables\Columns\TextColumn::make('type')->badge(),
                Tables\Columns\TextColumn::make('method')->badge()->color('gray'),
                Tables\Columns\TextColumn::make('transaction_id')->label('Txn ID')->placeholder('—')->copyable(),
                Tables\Columns\TextColumn::make('amount')->formatStateUsing(fn ($state) => Money::fmt($state))->sortable(),
            ])
            ->defaultSort('created_at')
            ->actions([
                Tables\Actions\Action::make('confirm')
                    ->label('Confirm & receipt')
                    ->icon('heroicon-o-check-badge')->color('success')
                    ->requiresConfirmation()
                    ->modalDescription('Confirm that this money has been received. A receipt number will be issued and the payment can no longer be edited.')
                    ->authorize(fn (Payment $record) => auth()->user()?->can('confirm', $record) ?? false)
                    ->action(function (Payment $record) {
                        $record->confirm(auth()->user());
                        Notification::make()->title("Receipt {$record->receipt_number} issued")->success()->send();
                    }),
            ])
            ->emptyStateHeading('Nothing waiting — all payments are verified')
            ->emptyStateIcon('heroicon-o-check-circle')
            ->paginated([5, 10])
            ->defaultPaginationPageOption(5);
    }
}
