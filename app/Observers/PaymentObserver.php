<?php

namespace App\Observers;

use App\Enums\PaymentStatus;
use App\Mail\PaymentIssueMail;
use App\Mail\PaymentReceiptMail;
use App\Models\Payment;
use App\Support\Mailing;

/** Emails the payer when their payment is received, voided or fails online. */
class PaymentObserver
{
    public function saved(Payment $payment): void
    {
        if (!$payment->wasRecentlyCreated && !$payment->wasChanged('status')) {
            return;
        }

        $user = $payment->user;
        if (!$user) {
            return;
        }

        match ($payment->status) {
            PaymentStatus::Completed => $payment->receipt_number ? Mailing::to($user, new PaymentReceiptMail($payment)) : null,
            PaymentStatus::Voided    => $payment->receipt_number ? Mailing::to($user, new PaymentIssueMail($payment, 'voided')) : null,
            // Only a failure the customer would not otherwise know about: the gateway said it failed.
            // (CREATE_FAILED is shown on screen; ABANDONED is a quiet clean-up.)
            PaymentStatus::Failed    => $payment->isOnline() && !in_array($payment->gateway_status, ['CREATE_FAILED', 'ABANDONED'], true)
                ? Mailing::to($user, new PaymentIssueMail($payment, 'failed')) : null,
            default                  => null,
        };
    }
}
