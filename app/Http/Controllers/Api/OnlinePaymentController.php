<?php

namespace App\Http\Controllers\Api;

use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Services\Payments\OnlinePaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use RuntimeException;

/**
 * Online giving for every portal user (member, partner, pastor, HOD).
 *
 *   GET  /api/online-payments/options     what this person may give online
 *   POST /api/online-payments             start a payment -> pay_url to redirect the browser to
 *   GET  /api/online-payments/{reference} status of one of your payments (verified with the gateway)
 */
class OnlinePaymentController extends Controller
{
    public function __construct(private readonly OnlinePaymentService $online) {}

    public function options(Request $request): JsonResponse
    {
        $options = collect($this->online->optionsFor($request->user()))
            ->map(fn ($o, $type) => ['value' => $type, 'label' => $o['label']])->values();

        return response()->json(['success' => true, 'data' => [
            'types'    => $options,
            'currency' => config('payme.currency'),
            'min'      => (float) config('payme.min_amount'),
            'max'      => (float) config('payme.max_amount'),
        ]]);
    }

    public function store(Request $request): JsonResponse
    {
        $allowed = array_keys($this->online->optionsFor($request->user()));

        // `type` is required and has no default: the giver must say what the gift is for.
        $validated = $request->validate([
            'type'   => ['required', 'string', Rule::in($allowed)],
            'amount' => ['required', 'numeric', 'decimal:0,2'],
            'note'   => ['nullable', 'string', 'max:500'],
        ], ['type.required' => 'Please choose what you are giving: tithe, offering or seed.', 'type.in' => 'Please choose a valid contribution type.']);

        try {
            $payment = $this->online->start($request->user(), $validated['type'], (float) $validated['amount'], $validated['note'] ?? null,
                fn (string $reference) => route('pay.return', ['reference' => $reference]));
        } catch (RuntimeException) {
            return response()->json(['success' => false, 'message' => 'We could not start the payment right now. Please try again in a moment.'], 502);
        }

        return response()->json(['success' => true, 'data' => $this->present($payment)], 201);
    }

    public function show(Request $request, string $reference): JsonResponse
    {
        $payment = Payment::online()->where('client_reference', $reference)->firstOrFail();

        // Own payments only. Finance and master review payments in their portals, not through this API.
        abort_unless($payment->user_id === $request->user()->id, 404);

        return response()->json(['success' => true, 'data' => $this->present($this->online->verify($payment))]);
    }

    private function present(Payment $payment): array
    {
        return [
            'reference'      => $payment->client_reference,
            'status'         => $payment->status->value,
            'type'           => $payment->type->value,
            'type_label'     => $payment->type->getLabel(),
            'amount'         => (float) $payment->amount,
            'currency'       => $payment->currency,
            'pay_url'        => $payment->status === PaymentStatus::Pending ? $payment->gateway_url : null,
            'receipt_number' => $payment->receipt_number,
            'receipt_url'    => $payment->receipt_number ? route('receipts.show', $payment) : null,
        ];
    }
}
