<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PaymentResource;
use App\Models\EventRegistration;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    /**
     * GET /api/payments
     *
     * - master / finance: all payments
     * - event role: only payments linked to event registrations
     * - pastor / member / partner: own payments only
     */
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Payment::class);

        $user  = $request->user();
        $query = Payment::with(['user', 'eventRegistration.event', 'recordedBy'])
            ->orderByDesc('created_at');

        if ($user->isMaster() || $user->isFinance()) {
            // Full access — optional filters
            if ($request->has('type'))   $query->byType($request->type);
            if ($request->has('status')) $query->where('status', $request->status);
            if ($request->has('user_id'))$query->where('user_id', $request->user_id);
        } elseif ($user->isEventRole()) {
            $query->forEvent();
        } else {
            // Portal users see only their own
            $query->where('user_id', $user->id);
        }

        $payments = $query->paginate(25);

        return response()->json([
            'success' => true,
            'data'    => PaymentResource::collection($payments),
            'meta'    => [
                'current_page' => $payments->currentPage(),
                'last_page'    => $payments->lastPage(),
                'total'        => $payments->total(),
                'total_amount' => $query->clone()->completed()->sum('amount'),
            ],
        ]);
    }

    /**
     * GET /api/payments/{id}
     */
    public function show(int $id): JsonResponse
    {
        $payment = Payment::with(['user', 'eventRegistration.event', 'recordedBy'])->findOrFail($id);
        $this->authorize('view', $payment);

        return response()->json(['success' => true, 'data' => new PaymentResource($payment)]);
    }

    /**
     * POST /api/payments
     * Finance or Master records a payment manually.
     */
    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', Payment::class);

        $validated = $request->validate([
            'user_id'                => 'required|exists:users,id',
            'event_registration_id'  => 'nullable|exists:event_registrations,id',
            'type'                   => 'required|in:tithe,offering,family_altar,partnership,event_registration,other',
            'amount'                 => 'required|numeric|min:0.01',
            'currency'               => 'string|size:3',
            'method'                 => 'required|in:cash,bank_transfer,card,mobile_money,online',
            'transaction_id'         => 'nullable|string|max:255',
            'notes'                  => 'nullable|string',
            'paid_at'                => 'nullable|date',
        ]);

        $payment = Payment::create([
            ...$validated,
            'status'      => 'completed',
            'paid_at'     => $validated['paid_at'] ?? now(),
            'recorded_by' => $request->user()->id,
        ]);

        // Auto-update registration if linked
        if ($payment->event_registration_id) {
            $reg = EventRegistration::find($payment->event_registration_id);
            if ($reg) {
                $totalPaid = $reg->payments()->where('status', 'completed')->sum('amount');
                $reg->update([
                    'amount_paid' => $totalPaid,
                    'status'      => $totalPaid >= $reg->amount_due ? 'confirmed' : $reg->status,
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'data'    => new PaymentResource($payment->load(['user', 'eventRegistration', 'recordedBy'])),
        ], 201);
    }

    /**
     * GET /api/payments/summary
     * Finance / Master summary dashboard data.
     */
    public function summary(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Payment::class);

        $base = Payment::completed();

        $summary = [
            'total'           => $base->clone()->sum('amount'),
            'tithes'          => $base->clone()->byType('tithe')->sum('amount'),
            'offerings'       => $base->clone()->byType('offering')->sum('amount'),
            'family_altars'   => $base->clone()->byType('family_altar')->sum('amount'),
            'partnerships'    => $base->clone()->byType('partnership')->sum('amount'),
            'event_payments'  => $base->clone()->byType('event_registration')->sum('amount'),
            'this_month'      => $base->clone()->whereMonth('paid_at', now()->month)
                ->whereYear('paid_at', now()->year)->sum('amount'),
            'this_year'       => $base->clone()->whereYear('paid_at', now()->year)->sum('amount'),
        ];

        return response()->json(['success' => true, 'data' => $summary]);
    }

    /**
     * GET /api/payments/my
     * Portal user's own payment history.
     */
    public function myPayments(Request $request): JsonResponse
    {
        $payments = Payment::with(['eventRegistration.event'])
            ->where('user_id', $request->user()->id)
            ->orderByDesc('paid_at')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data'    => PaymentResource::collection($payments),
        ]);
    }
}
