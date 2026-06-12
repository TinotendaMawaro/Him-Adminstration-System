<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PartnerBenefitResource;
use App\Http\Resources\PartnerResource;
use App\Models\Partner;
use App\Models\PartnerBenefit;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PartnerController extends Controller
{
    /** GET /api/partners/me */
    public function me(Request $request): JsonResponse
    {
        $partner = $request->user()->partner()
            ->with(['zone', 'member'])
            ->first();

        if (!$partner) {
            return response()->json(['success' => false, 'message' => 'Partner profile not found.'], 404);
        }

        return response()->json([
            'success' => true,
            'data'    => new PartnerResource($partner),
        ]);
    }

    /** GET /api/partners/me/payments */
    public function myPayments(Request $request): JsonResponse
    {
        $payments = Payment::with(['eventRegistration.event'])
            ->where('user_id', $request->user()->id)
            ->whereIn('type', ['partnership', 'tithe', 'offering', 'family_altar'])
            ->orderByDesc('paid_at')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data'    => \App\Http\Resources\PaymentResource::collection($payments),
        ]);
    }

    /** GET /api/partners/me/summary */
    public function mySummary(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        $base   = Payment::completed()->where('user_id', $userId);

        return response()->json([
            'success' => true,
            'data'    => [
                'total_giving'    => $base->clone()->sum('amount'),
                'this_month'      => $base->clone()->whereMonth('paid_at', now()->month)->whereYear('paid_at', now()->year)->sum('amount'),
                'this_year'       => $base->clone()->whereYear('paid_at', now()->year)->sum('amount'),
                'last_payment_at' => $base->clone()->max('paid_at'),
            ],
        ]);
    }

    /** GET /api/partners/me/benefits */
    public function myBenefits(Request $request): JsonResponse
    {
        $partner = $request->user()->partner()->first();
        if (!$partner) {
            return response()->json(['success' => false, 'message' => 'Partner profile not found.'], 404);
        }

        $benefits = PartnerBenefit::where('partner_id', $partner->id)->get();
        return response()->json([
            'success' => true,
            'data'    => PartnerBenefitResource::collection($benefits),
        ]);
    }

    /** POST /api/partners/me/upgrade */
    public function upgrade(Request $request): JsonResponse
    {
        $partner = $request->user()->partner()->first();
        if (!$partner) {
            return response()->json(['success' => false, 'message' => 'Partner profile not found.'], 404);
        }

        $request->validate([
            'tier' => ['required', 'string', Rule::in(\App\Enums\PartnerTier::values())],
        ]);

        $newTier = \App\Enums\PartnerTier::from($request->tier);

        if ($newTier->value === $partner->tier->value) {
            return response()->json(['success' => false, 'message' => 'Already at this tier.'], 422);
        }

        $partner->update([
            'tier' => $newTier->value,
            'tier_updated_at' => now()->toDateString(),
        ]);

        return response()->json([
            'success' => true,
            'data'    => new PartnerResource($partner->fresh()),
        ]);
    }

    /** GET /api/partners/options */
    public function options(): JsonResponse
    {
        $tiers = [];
        foreach (\App\Enums\PartnerTier::cases() as $case) {
            $tiers[] = [
                'key'       => $case->value,
                'label'     => $case->getLabel(),
                'color'     => $case->getColor(),
                'icon'      => $case->getIcon(),
            ];
        }

        return response()->json(['success' => true, 'data' => ['tiers' => $tiers]]);
    }

    /** POST /api/partners/me/payment — allow member/partner to self-submit */
    public function submitPayment(Request $request): JsonResponse
    {
        $request->validate([
            'type'           => ['required', 'in:tithe,offering,family_altar,partnership,event_registration,other'],
            'amount'         => ['required', 'numeric', 'min:0.01'],
            'method'         => ['required', 'in:cash,bank_transfer,card,mobile_money,online'],
            'transaction_id' => ['nullable', 'string', 'max:255'],
            'notes'          => ['nullable', 'string', 'max:2000'],
            'receipt'        => ['nullable', 'file', 'max:5120'],
        ]);

        $status = match ($request->method) {
            'cash' => 'completed',
            default => 'pending',
        };

        $data = [
            'user_id'     => $request->user()->id,
            'type'        => $request->type,
            'amount'      => $request->amount,
            'currency'    => $request->currency ?? 'USD',
            'status'      => $status,
            'method'      => $request->method,
            'transaction_id' => $request->transaction_id,
            'notes'       => $request->notes,
            'paid_at'     => $status === 'completed' ? now() : null,
        ];

        if ($request->hasFile('receipt')) {
            $path = $request->file('receipt')->store('receipts', 'public');
            $data['notes'] = ($data['notes'] ?? '') . "\nReceipt: /storage/{$path}";
        }

        $payment = Payment::create($data);

        return response()->json([
            'success' => true,
            'data'    => new \App\Http\Resources\PaymentResource($payment),
        ], 201);
    }
}
