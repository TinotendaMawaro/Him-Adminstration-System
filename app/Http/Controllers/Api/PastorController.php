<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Member;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PastorController extends Controller
{
    /** GET /api/pastors/me */
    public function me(Request $request): JsonResponse
    {
        $pastor = $request->user()->pastor()
            ->with(['zone.region.country'])
            ->first();

        if (!$pastor) {
            return response()->json(['success' => false, 'message' => 'Pastor profile not found.'], 404);
        }

        return response()->json([
            'success' => true,
            'data'    => new \App\Http\Resources\PastorResource($pastor),
        ]);
    }

    /** GET /api/pastors/zone-summary  — zone stats for pastor dashboard */
    public function zoneSummary(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->isPastor() || !$user->zone_id) {
            return response()->json(['success' => false, 'message' => 'Forbidden.'], 403);
        }

        $zoneId = $user->zone_id;

        return response()->json([
            'success' => true,
            'data'    => [
                'total_members'      => Member::where('zone_id', $zoneId)->active()->count(),
                'total_home_groups'  => \App\Models\HomeGroup::where('zone_id', $zoneId)->count(),
                'total_departments'  => \App\Models\Department::where('zone_id', $zoneId)->count(),
                'new_members_month'  => Member::where('zone_id', $zoneId)
                    ->whereMonth('membership_date', now()->month)
                    ->whereYear('membership_date', now()->year)
                    ->count(),
            ],
        ]);
    }
}
