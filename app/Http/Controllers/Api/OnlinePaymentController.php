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

        // What this person owes for events: shown so they can pick one; the amount is always computed server-side.
        $registrations = collect($this->online->optionsFor($request->user()))->has('event_registration')
            ? $this->online->payableRegistrations($request->user())->map(fn ($r) => [
                'id'          => $r->id,
                'event_title' => $r->event->title,
                'starts_at'   => $r->event->starts_at?->toIso8601String(),
                'balance'     => OnlinePaymentService::balanceOf($r),
                'amount_due'  => (float) $r->amount_due,
                'amount_paid' => (float) $r->amount_paid,
            ])->values()
            : [];

        return response()->json(['success' => true, 'data' => [
            'types'         => $options,
            'registrations' => $registrations,
            'currency'      => config('payme.currency'),
            'min'           => (float) config('payme.min_amount'),
            'max'           => (float) config('payme.max_amount'),
        ]]);
    }

    public function store(Request $request): JsonResponse
    {
        $allowed = array_keys($this->online->optionsFor($request->user()));

        // `type` is required and has no default: the giver must say what the gift is for.
        $validated = $request->validate([
            'type'            => ['required', 'string', Rule::in($allowed)],
            // Event fees are always the registration's balance, so no amount is accepted for them.
            'amount'          => ['required_unless:type,event_registration', 'nullable', 'numeric', 'decimal:0,2'],
            'registration_id' => ['required_if:type,event_registration', 'nullable', 'integer'],
            'note'            => ['nullable', 'string', 'max:500'],
        ], ['type.required' => 'Please choose what you are giving: tithe, offering or seed.', 'type.in' => 'Please choose a valid contribution type.']);

        try {
            $payment = $this->online->start($request->user(), $validated['type'], isset($validated['amount']) ? (float) $validated['amount'] : null, $validated['note'] ?? null,
                fn (string $reference) => route('pay.return', ['reference' => $reference]), isset($validated['registration_id']) ? (int) $validated['registration_id'] : null);
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
