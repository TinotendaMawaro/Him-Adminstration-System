<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\MemberResource;
use App\Models\Member;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MemberController extends Controller
{
    use AuthorizesRequests;
    /** GET /api/members
     *  SECURE ENDPOINT - Role-based data isolation
     */
    public function index(Request $request): JsonResponse
    {
        // Manual authorization check (since authorize() method isn't available)
        $user = $request->user();
        
        // Check if user has permission to view members
        if (!$user->hasAnyRole(['master', 'hod', 'pastor', 'member'])) {
            \Log::warning('Unauthorized members list attempt', [
                'user_id' => $user->id,
                'role' => $user->role,
                'ip' => $request->ip(),
            ]);
            return response()->json(['success' => false, 'message' => 'Forbidden'], 403);
        }

        // Input validation & sanitization
        $perPage = (int) $request->query('per_page', 25);
        $perPage = in_array($perPage, [10, 20, 25, 50]) ? $perPage : 25;

        $search = $request->query('search');
        if ($search && strlen($search) > 100) {
            return response()->json([
                'success' => false,
                'message' => 'Search term exceeds maximum length'
            ], 422);
        }

        $query = Member::with([
            'zone:id,name',
            'homeGroup:id,name',
            'department:id,name',
            'gender:id,name'
        ]);

        // Role-based data isolation - prevents cross-zone access
        if ($user->isHOD()) {
            if (!$user->department_id) {
                \Log::warning('HOD missing department', ['user_id' => $user->id]);
                return response()->json(['success' => false, 'message' => 'Forbidden'], 403);
            }
            $query->where('department_id', $user->department_id);
        } elseif ($user->isPastor()) {
            if (!$user->zone_id) {
                \Log::warning('Pastor missing zone', ['user_id' => $user->id]);
                return response()->json(['success' => false, 'message' => 'Forbidden'], 403);
            }
            $query->where('zone_id', $user->zone_id);
        }
        // Members can see all members in their zone if assigned, otherwise just themselves
        elseif ($user->isMember()) {
            if ($user->zone_id) {
                $query->where('zone_id', $user->zone_id);
            } else {
                $query->where('user_id', $user->id);
            }
        }

        // Status filter - boolean only
        if ($request->has('status')) {
            $status = filter_var($request->status, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
            if ($status !== null) {
                $query->where('is_active', $status);
            }
        }

        // Search with explicit column whitelist
        if (!empty($search)) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'LIKE', '%' . $search . '%')
                  ->orWhere('member_number', 'LIKE', '%' . $search . '%')
                  ->orWhere('email', 'LIKE', '%' . $search . '%');
            });
        }

        // Sort column whitelist
        $sort = $request->query('sort', 'surname');
        $allowedSorts = ['surname', 'name', 'member_number', 'created_at', 'email'];
        if (!in_array($sort, $allowedSorts)) {
            $sort = 'surname';
        }

        $members = $query->orderBy($sort, 'asc')
            ->paginate($perPage)
            ->withQueryString();

        // Audit logging (no PII in logs)
        \Log::info('Members list accessed', [
            'user_id' => $user->id,
            'role' => $user->role,
            'filters' => [
                'status' => $request->status,
                'has_search' => !empty($search),
                'department_id' => $user->isHOD() ? $user->department_id : null,
                'zone_id' => $user->isPastor() ? $user->zone_id : null,
            ],
            'result_count' => $members->total(),
        ]);

        return response()->json([
            'success' => true,
            'data' => MemberResource::collection($members),
            'meta' => [
                'total' => $members->total(),
                'last_page' => $members->lastPage(),
                'per_page' => $members->perPage(),
                'current_page' => $members->currentPage(),
            ],
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
