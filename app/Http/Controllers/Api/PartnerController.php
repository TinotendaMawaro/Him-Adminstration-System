<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PartnerBenefitResource;
use App\Http\Resources\PartnerPointResource;
use App\Http\Resources\PartnerRedemptionResource;
use App\Http\Resources\PartnerResource;
use App\Http\Resources\PartnerRewardResource;
use App\Http\Resources\PartnershipPackageResource;
use App\Models\Partner;
use App\Models\PartnerBenefit;
use App\Models\PartnerPoint;
use App\Models\PartnerRedemption;
use App\Models\PartnerReward;
use App\Models\PartnerStatement;
use App\Models\PartnershipPackage;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;

use App\Services\PartnerBenefitService;

class PartnerController extends Controller
{
    /** GET /api/partners/me */
    public function me(Request $request): JsonResponse
    {
        $partner = $request->user()->partner()
            ->with(['zone', 'member', 'package'])
            ->first();

        if (!$partner) {
            return response()->json(['success' => false, 'message' => 'Partner profile not found.'], 404);
        }

        return response()->json([
            'success' => true,
            'data'    => new PartnerResource($partner),
        ]);
    }

    /** POST /api/partners/enroll */
    public function enroll(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->partner()->exists()) {
            return response()->json(['success' => false, 'message' => 'Partner profile already exists.'], 422);
        }

        $zone = $user->zone;
        if (!$zone) {
            return response()->json(['success' => false, 'message' => 'No zone assigned to account.'], 422);
        }

        $validated = $request->validate([
            'package_id'       => ['required', 'integer', 'exists:partnership_packages,id'],
            'contribution_type'=> ['required', 'in:monthly,quarterly,annually,one_time'],
            'payment_method'   => ['required', 'in:ecocash,onemoney,innbucks,paynow,visa,mastercard,paypal,bank_transfer'],
            'payment_reference'=> ['nullable', 'string', 'max:255'],
            'payment_notes'    => ['nullable', 'string', 'max:2000'],
            'renewal_terms'    => ['nullable', 'string', 'max:1000'],
            'payment_proof'    => ['nullable', 'file', 'max:5120'],
        ]);

        /** @var PartnershipPackage $package */
        $package = PartnershipPackage::findOrFail($validated['package_id']);

        $autoActivate = in_array($validated['payment_method'], ['visa', 'mastercard', 'paypal']);

        $partner = DB::transaction(function () use ($user, $zone, $validated, $package, $autoActivate) {
            $partner = Partner::create([
                'user_id'           => $user->id,
'member_id' => $user->member ? $user->member->id : null,
                'name'              => $user->name,
                'surname'           => '',
                'partner_number'    => Partner::generatePartnerNumber($zone->code),
                'tier'              => \App\Enums\PartnerTier::Gold, // default tier, can be upgraded later
                'pledge_amount'     => $package->monthly_amount,
                'pledge_frequency'  => match($validated['contribution_type']) {
                    'monthly'   => \App\Enums\PledgeFrequency::Monthly,
                    'quarterly' => \App\Enums\PledgeFrequency::Quarterly,
                    'annually'  => \App\Enums\PledgeFrequency::Annually,
                    'one_time'  => null,
                },
                'contribution_type' => $validated['contribution_type'],
                'partnership_date'  => now(),
                'status'            => $autoActivate ? \App\Enums\PartnerStatus::Active : \App\Enums\PartnerStatus::Pending,
                'zone_id'           => $zone->id,
                'package_id'        => $package->id,
                'payment_method'    => $validated['payment_method'],
                'payment_reference' => $validated['payment_reference'],
                'payment_notes'     => $validated['payment_notes'],
                'renewal_terms'     => $validated['renewal_terms'],
                'points_earned'     => 0,
            ]);

            $paymentNotes = isset($validated['payment_notes']) ? $validated['payment_notes'] : '';
            if ($request->hasFile('payment_proof')) {
                $path = $request->file('payment_proof')->store('payment-proofs', 'public');
                $partner->payment_proof_path = "/storage/{$path}";
                $partner->save();
                $paymentNotes = $paymentNotes . "\nProof: /storage/{$path}";
            }

            Payment::create([
                'user_id'           => $user->id,
                'type'              => \App\Enums\PaymentType::Partnership,
                'amount'            => $package->monthly_amount,
                'currency'          => 'USD',
                'status'            => $autoActivate ? \App\Enums\PaymentStatus::Completed : \App\Enums\PaymentStatus::Pending,
                'method'            => $validated['payment_method'],
                'transaction_id'    => $validated['payment_reference'],
                'notes'             => $paymentNotes,
                'paid_at'           => $autoActivate ? now() : null,
                'recorded_by'       => $user->id,
            ]);

            $partnerPayment = Payment::where('user_id', $user->id)
                ->where('type', \App\Enums\PaymentType::Partnership)
                ->orderByDesc('id')
                ->first();

            app(PartnerBenefitService::class)->assignBenefits($partner, $partnerPayment);

            return $partner;
        });

        return response()->json([
            'success' => true,
            'data'    => new PartnerResource($partner->load(['zone', 'package'])),
        ], 201);
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

        $benefits = app(PartnerBenefitService::class)->getPartnerBenefits($partner);

        return response()->json([
            'success' => true,
            'data'    => \App\Http\Resources\PartnerBenefitCatalogResource::collection($benefits),
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
            'package_id' => ['required', 'integer', 'exists:partnership_packages,id'],
        ]);

        $package = PartnershipPackage::findOrFail($request->package_id);

        $partner->update([
            'package_id'     => $package->id,
            'pledge_amount'  => $package->monthly_amount,
            'tier'           => \App\Enums\PartnerTier::Gold, // temporarily keep default; map from package in future
            'tier_updated_at' => now()->toDateString(),
        ]);

        app(PartnerBenefitService::class)->assignBenefits($partner->fresh());

        return response()->json([
            'success' => true,
            'data'    => new PartnerResource($partner->fresh()->load(['zone', 'package'])),
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
            'type'           => ['required', \Illuminate\Validation\Rule::in(\App\Enums\PaymentType::values())],
            'amount'         => ['required', 'numeric', 'min:0.01'],
            'method'         => ['required', \Illuminate\Validation\Rule::in(\App\Enums\PaymentMethod::values())],
            'transaction_id' => ['nullable', 'string', 'max:255'],
            'notes'          => ['nullable', 'string', 'max:2000'],
            'receipt'        => ['nullable', 'file', 'max:5120'],
        ]);

        // Self-submitted payments are never auto-completed: finance must verify and confirm
        // them (which also issues the receipt). A member cannot mark their own cash as received.
        $status = 'pending';

        $data = [
            'user_id'     => $request->user()->id,
            'type'        => $request->type,
            'amount'      => $request->amount,
            'currency'    => isset($request->currency) ? $request->currency : 'USD',
            'status'      => $status,
            'method'      => $request->method,
            'transaction_id' => $request->transaction_id,
            'notes'       => $request->notes,
            'paid_at'     => null,
        ];

        if ($request->hasFile('receipt')) {
            $path = $request->file('receipt')->store('receipts', 'public');
            $notes = isset($data['notes']) ? $data['notes'] : '';
            $data['notes'] = $notes . "\nReceipt: /storage/{$path}";
        }

        $payment = Payment::create($data);

        return response()->json([
            'success' => true,
            'data'    => new \App\Http\Resources\PaymentResource($payment),
        ], 201);
    }

    /** GET /api/partners/me/points */
    public function myPoints(Request $request): JsonResponse
    {
        $partner = $request->user()->partner()->first();
        if (!$partner) {
            return response()->json(['success' => false, 'message' => 'Partner profile not found.'], 404);
        }

        return response()->json([
            'success' => true,
            'data'    => ['total_points' => (int) $partner->points_earned],
        ]);
    }

    /** GET /api/partners/me/points/history */
    public function myPointsHistory(Request $request): JsonResponse
    {
        $partner = $request->user()->partner()->first();
        if (!$partner) {
            return response()->json(['success' => false, 'message' => 'Partner profile not found.'], 404);
        }

        $points = PartnerPoint::where('partner_id', $partner->id)
            ->orderByDesc('created_at')
            ->paginate(50);

        return response()->json([
            'success' => true,
            'data'    => PartnerPointResource::collection($points),
        ]);
    }

    /** GET /api/partners/me/statements */
    public function myStatements(Request $request): JsonResponse
    {
        $partner = $request->user()->partner()->first();
        if (!$partner) {
            return response()->json(['success' => false, 'message' => 'Partner profile not found.'], 404);
        }

        $statements = PartnerStatement::where('partner_id', $partner->id)
            ->orderByDesc('period_end')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data'    => \App\Http\Resources\PartnerStatementResource::collection($statements),
        ]);
    }

    /** POST /api/partners/me/statements/generate */
    public function generateStatement(Request $request): JsonResponse
    {
        $request->validate([
            'period_start' => ['required', 'date'],
            'period_end'   => ['required', 'date', 'after:period_start'],
        ]);

        $partner = $request->user()->partner()->first();
        if (!$partner) {
            return response()->json(['success' => false, 'message' => 'Partner profile not found.'], 404);
        }

        $summary = $partner->payments()
            ->where('status', \App\Enums\PaymentStatus::Completed)
            ->whereBetween('paid_at', [$request->period_start, $request->period_end])
            ->select(
                DB::raw('SUM(amount) as total'),
                DB::raw('COUNT(*) as count')
            )->first();

        $total = (float) ($summary->total !== null ? $summary->total : 0);
        $statementNumber = 'STM-' . strtoupper(Str::random(8));

        $statement = PartnerStatement::create([
            'partner_id'          => $partner->id,
            'statement_number'    => $statementNumber,
            'period_start'        => $request->period_start,
            'period_end'          => $request->period_end,
            'total_contributions' => $total,
            'format'              => 'pdf',
            'generated_by'        => $request->user()->id,
        ]);

        return response()->json([
            'success' => true,
            'data'    => new \App\Http\Resources\PartnerStatementResource($statement),
        ], 201);
    }

    /** GET /api/partners/me/rewards */
    public function availableRewards(Request $request): JsonResponse
    {
        $rewards = PartnerReward::active()->ordered()->get();
        return response()->json([
            'success' => true,
            'data'    => PartnerRewardResource::collection($rewards),
        ]);
    }

    /** POST /api/partners/me/rewards/redeem */
    public function redeemReward(Request $request): JsonResponse
    {
        $request->validate([
            'reward_id' => ['required', 'integer', 'exists:partner_rewards,id'],
        ]);

        $partner = $request->user()->partner()->first();
        if (!$partner) {
            return response()->json(['success' => false, 'message' => 'Partner profile not found.'], 404);
        }

        $reward = PartnerReward::findOrFail($request->reward_id);
        if (!$reward->is_active) {
            return response()->json(['success' => false, 'message' => 'Reward not available.'], 422);
        }
        if ($partner->points_earned < $reward->points_required) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient points.',
                'required' => $reward->points_required,
                'current'  => (int) $partner->points_earned,
            ], 422);
        }

        DB::transaction(function () use ($partner, $reward, $request) {
            $partner->decrement('points_earned', $reward->points_required);

            $partnerPoint = PartnerPoint::create([
                'partner_id'   => $partner->id,
                'points'       => -$reward->points_required,
                'source'       => 'redemption',
                'description'  => "Redeemed: {$reward->name}",
                'balance_after' => $partner->fresh()->points_earned,
            ]);

            PartnerRedemption::create([
                'partner_id'              => $partner->id,
                'reward_id'               => $reward->id,
                'points_transaction_id'   => $partnerPoint->id,
                'points_used'             => $reward->points_required,
                'status'                  => 'pending',
            ]);
        });

        return response()->json(['success' => true, 'message' => 'Redemption request submitted.']);
    }
}
