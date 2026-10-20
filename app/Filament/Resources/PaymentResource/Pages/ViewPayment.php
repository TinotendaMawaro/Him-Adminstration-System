<?php

namespace App\Filament\Resources\PaymentResource\Pages;

use App\Enums\PaymentStatus;
use App\Filament\Resources\PaymentResource;
use App\Models\Payment;
use Filament\Actions;
use Filament\Forms;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ViewRecord;

class ViewPayment extends ViewRecord
{
    protected static string $resource = PaymentResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\Action::make('confirm')->label('Confirm & issue receipt')->icon('heroicon-o-check-badge')->color('success')
                ->visible(fn (Payment $r) => auth()->user()?->can('confirm', $r) ?? false)
                ->requiresConfirmation()
                ->action(function (Payment $r) {
                    $r->confirm(auth()->user());
                    $this->refreshFormData(['status', 'receipt_number']);
                    Notification::make()->title("Receipt {$r->receipt_number} issued")->success()->send();
                }),
            Actions\Action::make('receipt')->label('Print receipt')->icon('heroicon-o-printer')
                ->visible(fn (Payment $r) => $r->status === PaymentStatus::Completed && $r->receipt_number)
                ->url(fn (Payment $r) => route('receipts.show', $r), shouldOpenInNewTab: true),
            Actions\Action::make('void')->label('Void')->icon('heroicon-o-no-symbol')->color('danger')
                ->visible(fn (Payment $r) => auth()->user()?->can('void', $r) ?? false)
                ->form([Forms\Components\Textarea::make('reason')->required()->minLength(5)->maxLength(500)])
                ->requiresConfirmation()
                ->action(function (Payment $r, array $data) {
                    $r->void(auth()->user(), $data['reason']);
                    Notification::make()->title('Payment voided')->warning()->send();
                    $this->redirect(PaymentResource::getUrl('view', ['record' => $r]));
                }),
        ];
    }
}
