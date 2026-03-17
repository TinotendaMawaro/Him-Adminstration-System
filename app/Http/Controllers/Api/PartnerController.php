<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
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
            'data'    => new \App\Http\Resources\PartnerResource($partner),
        ]);
    }

    /** GET /api/partners/me/payments  — partner's giving history */
    public function myPayments(Request $request): JsonResponse
    {
        $payments = \App\Models\Payment::with(['eventRegistration.event'])
            ->where('user_id', $request->user()->id)
            ->whereIn('type', ['partnership', 'tithe', 'offering', 'family_altar'])
            ->orderByDesc('paid_at')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data'    => \App\Http\Resources\PaymentResource::collection($payments),
        ]);
    }

    /** GET /api/partners/me/summary — giving summary for partner dashboard */
    public function mySummary(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        $base   = \App\Models\Payment::completed()->where('user_id', $userId);

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
}
