<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\MemberResource;
use App\Models\Member;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MemberController extends Controller
{
    /** GET /api/members */
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Member::class);
        $user = $request->user();

        $query = Member::with(['zone', 'homeGroup', 'department', 'gender']);

        // HOD sees only their department members
        if ($user->isHOD()) {
            $query->where('department_id', $user->department_id);
        }
        // Pastor sees only their zone members
        elseif ($user->isPastor()) {
            $query->where('zone_id', $user->zone_id);
        }

        if ($request->has('status')) $query->where('status', $request->status);
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(fn ($q) =>
            $q->where('name', 'like', "%{$search}%")
                ->orWhere('surname', 'like', "%{$search}%")
                ->orWhere('member_number', 'like', "%{$search}%")
            );
        }

        $members = $query->orderBy('surname')->paginate(25);

        return response()->json([
            'success' => true,
            'data'    => MemberResource::collection($members),
            'meta'    => ['total' => $members->total(), 'last_page' => $members->lastPage()],
        ]);
    }

    /** GET /api/members/{id} */
    public function show(int $id): JsonResponse
    {
        $member = Member::with(['zone', 'homeGroup', 'department', 'gender', 'demography', 'user.contact', 'partner'])->findOrFail($id);
        $this->authorize('view', $member);

        return response()->json(['success' => true, 'data' => new MemberResource($member)]);
    }

    /** GET /api/members/me  — logged-in member's own profile */
    public function me(Request $request): JsonResponse
    {
        $member = $request->user()->member()
            ->with(['zone', 'homeGroup', 'department', 'gender', 'partner'])
            ->first();

        if (!$member) {
            return response()->json(['success' => false, 'message' => 'Member profile not found.'], 404);
        }

        return response()->json(['success' => true, 'data' => new MemberResource($member)]);
    }

    /** PUT /api/members/me */
    public function updateMe(Request $request): JsonResponse
    {
        $member = $request->user()->member;

        if (!$member) {
            return response()->json(['success' => false, 'message' => 'Member profile not found.'], 404);
        }

        $validated = $request->validate([
            'name'          => 'sometimes|string|max:255',
            'surname'       => 'sometimes|string|max:255',
            'date_of_birth' => 'sometimes|date',
        ]);

        $member->update($validated);

        return response()->json(['success' => true, 'data' => new MemberResource($member->fresh())]);
    }
}
