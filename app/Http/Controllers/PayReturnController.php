<?php

namespace App\Http\Controllers;

use App\Enums\PaymentStatus;
use App\Models\Payment;
use App\Services\Payments\OnlinePaymentService;
use Illuminate\Http\Request;

/**
 * Where PayMe sends the customer after they pay (the order's returnUrl).
 *
 * This page is public — the customer may come back in a different browser or without a session —
 * so the unguessable payment reference is the only key. It never trusts anything in the query
 * string: it asks the gateway server-to-server and shows what the gateway says.
 */
class PayReturnController extends Controller
{
    public function __invoke(Request $request, string $reference, OnlinePaymentService $online)
    {
        $payment = Payment::online()->where('client_reference', $reference)->first();
        abort_unless($payment, 404);

        $payment = $online->verify($payment);

        $state = match ($payment->status) {
            PaymentStatus::Completed => 'success',
            PaymentStatus::Failed    => 'failed',
            default                  => 'pending',
        };

        // While the gateway is still confirming, re-check a few times, then stop (the background job keeps going).
        $attempt = max(1, min(20, (int) $request->query('n', 1)));

        return response()
            ->view('payments.return', [
                'payment'    => $payment,
                'state'      => $state,
                'refreshUrl' => $state === 'pending' && $attempt < 20 ? route('pay.return', ['reference' => $reference, 'n' => $attempt + 1]) : null,
                'portalUrl'  => config('payme.portal_url') ?: url('/'),
            ])
            ->header('Cache-Control', 'no-store, private')
            ->header('Referrer-Policy', 'no-referrer')
            ->header('X-Frame-Options', 'DENY')
            ->header('X-Robots-Tag', 'noindex');
    }
}
