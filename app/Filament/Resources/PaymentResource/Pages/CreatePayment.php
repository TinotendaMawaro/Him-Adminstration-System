<?php

namespace App\Filament\Resources\PaymentResource\Pages;

use App\Enums\PaymentStatus;
use App\Filament\Resources\PaymentResource;
use App\Models\Payment;
use App\Services\AuditTrail;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class CreatePayment extends CreateRecord
{
    protected static string $resource = PaymentResource::class;

    protected static bool $canCreateAnother = false;

    protected function handleRecordCreation(array $data): Model
    {
        $user    = auth()->user();
        $receive = (bool) ($this->data['issue_receipt'] ?? true);

        return DB::transaction(function () use ($data, $user, $receive) {
            $payment = Payment::create([
                ...$data,
                'status'       => $receive ? PaymentStatus::Completed : PaymentStatus::Pending,
                'paid_at'      => $receive ? ($data['paid_at'] ?? now()) : null,
                'recorded_by'  => $user->id,
                'confirmed_by' => $receive ? $user->id : null,
                'confirmed_at' => $receive ? now() : null,
            ]);

            if ($receive) {
                $payment->syncEventRegistration();
            }

            AuditTrail::record('payment.recorded', $user, $payment, [
                'amount' => (string) $payment->amount, 'type' => $payment->type?->value,
                'status' => $payment->status->value, 'receipt' => $payment->receipt_number,
            ], $payment->user_id);

            return $payment;
        });
    }

    protected function getRedirectUrl(): string
    {
        return $this->getResource()::getUrl('view', ['record' => $this->getRecord()]);
    }
}
