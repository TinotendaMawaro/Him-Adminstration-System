<?php

namespace App\Http\Controllers;

use App\Enums\PaymentStatus;
use App\Models\Payment;
use Illuminate\Http\Request;

/**
 * Printable receipt for a completed payment.
 *
 *  - /receipts/{payment}        signed-in master/finance, or the payer
 *  - /receipts/{payment}/view   a tamper-proof signed link (the one in the receipt email), no sign-in needed
 */
class ReceiptController extends Controller
{
    public function __invoke(Request $request, Payment $payment)
    {
        // The `signed` middleware has already rejected a forged or expired link on the signed route.
        if (!$request->routeIs('receipts.signed')) {
            $user = $request->user();
            abort_unless($user, 401);
            abort_unless($this->canView($user, $payment), 403);
        }

        abort_unless($payment->status === PaymentStatus::Completed && $payment->receipt_number, 404, 'No receipt has been issued for this payment.');

        $payment->load(['user', 'zone.region', 'recordedBy', 'confirmedBy']);

        return response()
            ->view('receipts.show', ['payment' => $payment])
            ->header('Cache-Control', 'private, no-store')
            ->header('Referrer-Policy', 'no-referrer')
            ->header('X-Robots-Tag', 'noindex')
            ->header('X-Frame-Options', 'SAMEORIGIN');
    }

    private function canView($user, Payment $payment): bool
    {
        return $user->hasAnyRole(['master', 'finance']) || $payment->user_id === $user->id;
    }
}
