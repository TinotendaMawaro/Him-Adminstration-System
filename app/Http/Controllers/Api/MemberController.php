<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\MemberResource;
use App\Models\Department;
use App\Models\HomeGroup;
use App\Models\Member;
use App\Models\SpiritualMilestone;
use App\Models\UserBadge;
use App\Models\Zone;
use App\Models\ZoneHistory;
use App\Services\ProfileCompletenessService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

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
            'user:id,name,email,phone,role,unique_code',
            'zone:id,name,code',
            'homeGroup:id,name',
            'department:id,name',
            'gender:id,name',
            'demography:id,name',
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

    /** GET /api/members/zone-summary — zone stats for member portal */
    public function zoneSummary(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->isMember() || !$user->zone_id) {
            return response()->json(['success' => false, 'message' => 'Forbidden.'], 403);
        }

        $zoneId = $user->zone_id;
        $cacheKey = "member_zone_summary_{$zoneId}";

        return response()->json(Cache::remember($cacheKey, 300, function () use ($zoneId) {
            $totalMembers = Member::where('zone_id', $zoneId)->active()->count();
            $totalHomeGroups = HomeGroup::where('zone_id', $zoneId)->count();
            $totalDepartments = Department::where('zone_id', $zoneId)->count();

            return [
                'success' => true,
                'data'    => [
                    'total_members'     => $totalMembers,
                    'total_home_groups' => $totalHomeGroups,
                    'total_departments' => $totalDepartments,
                ],
            ];
        }));
    }

    /** GET /api/members/zone-history — Zone history timeline for members */
    public function zoneHistory(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->isMember() || !$user->zone_id) {
            return response()->json(['success' => false, 'message' => 'Forbidden.'], 403);
        }

        $zoneId = $user->zone_id;
        $now = now();

        $historyRecords = ZoneHistory::where('zone_id', $zoneId)
            ->with(['pastor:id,name,unique_code'])
            ->orderBy('start_date', 'desc')
            ->get();

        $timeline = [];
        foreach ($historyRecords as $record) {
            $pastor = $record->pastor;
            $isCurrent = is_null($record->end_date);

            $type = 'pastor_change';
            if ($record->notes) {
                $lowerNotes = strtolower($record->notes);
                if (str_contains($lowerNotes, 'achievement') || str_contains($lowerNotes, 'milestone')) {
                    $type = 'achievement';
                } elseif (str_contains($lowerNotes, 'event') || str_contains($lowerNotes, 'conference')) {
                    $type = 'event';
                } elseif (str_contains($lowerNotes, 'growth') || str_contains($lowerNotes, 'expansion')) {
                    $type = 'growth';
                } elseif (str_contains($lowerNotes, 'established') || str_contains($lowerNotes, 'created')) {
                    $type = 'zone_created';
                }
            }

            $description = $record->notes ?: "Pastoral assignment for " . ($pastor?->name ?? 'Unknown');

            $timeline[] = [
                'id' => $record->id,
                'type' => $type,
                'title' => $isCurrent ? 'Current Zone Pastor' : 'Zone Pastor',
                'description' => $description,
                'date' => $record->start_date->format('Y-m-d'),
                'pastor' => [
                    'name' => $pastor?->name ?? 'Unknown',
                    'isCurrent' => $isCurrent,
                ],
                'start_date' => $record->start_date->format('Y-m-d'),
                'end_date' => $record->end_date?->format('Y-m-d'),
            ];
        }

        if ($historyRecords->isEmpty()) {
            $zone = Zone::find($zoneId);
            if ($zone) {
                $timeline[] = [
                    'id' => 0,
                    'type' => 'zone_created',
                    'title' => 'Zone Established',
                    'description' => $zone->name . ' was established',
                    'date' => $zone->created_at?->format('Y-m-d') ?? $now->format('Y-m-d'),
                    'pastor' => null,
                ];
            }
        }

        return response()->json([
            'success' => true,
            'data' => $timeline,
        ]);
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

    /** PUT /api/members/me/profile — unified profile update */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();
        $member = $user->member;

        if (!$member) {
            return response()->json(['success' => false, 'message' => 'Member profile not found.'], 404);
        }

        $validated = $request->validate([
            'user.name'           => 'sometimes|string|max:255',
            'user.email'          => 'sometimes|email|max:255',
            'user.phone'          => 'sometimes|string|max:50|nullable',
            'member.surname'      => 'sometimes|string|max:255|nullable',
            'member.date_of_birth'=> 'sometimes|date|nullable',
            'member.gender_id'    => 'sometimes|integer|exists:genders,id|nullable',
            'member.demography_id'=> 'sometimes|integer|exists:demographies,id|nullable',
            'user.address_line_1' => 'sometimes|string|max:255|nullable',
            'user.address_line_2' => 'sometimes|string|max:255|nullable',
            'user.city'           => 'sometimes|string|max:100|nullable',
            'user.province'       => 'sometimes|string|max:100|nullable',
            'user.country'        => 'sometimes|string|max:100|nullable',
            'user.postal_code'    => 'sometimes|string|max:20|nullable',
        ]);

        $userData = $validated['user'] ?? [];
        $memberData = $validated['member'] ?? [];

        DB::transaction(function () use ($user, $member, $userData, $memberData) {
            if (!empty($userData)) {
                $user->update($userData);
            }
            if (!empty($memberData)) {
                $member->update($memberData);
            }
        });

        $user->refresh();
        $member->refresh();

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully.',
            'data'    => new MemberResource($member->load(['user', 'zone', 'homeGroup', 'department', 'gender', 'demography', 'partner'])),
        ]);
    }

    /** PUT /api/members/me/location */
    public function updateMeLocation(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'address_line_1' => 'required|string|max:255',
            'address_line_2' => 'nullable|string|max:255',
            'city'           => 'required|string|max:100',
            'province'       => 'nullable|string|max:100',
            'country'        => 'required|string|max:100',
            'postal_code'    => 'nullable|string|max:20',
            'latitude'       => 'nullable|numeric|between:-90,90',
            'longitude'      => 'nullable|numeric|between:-180,180',
        ]);

        $user = $request->user();
        $user->update(array_merge($validated, [
            'location_captured'    => true,
            'location_captured_at' => now(),
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Location saved successfully.',
            'data'    => $user->only([
                'address_line_1', 'address_line_2', 'city', 'province',
                'country', 'postal_code', 'latitude', 'longitude',
                'location_captured', 'location_captured_at',
            ]),
        ]);
    }

    /** GET /api/profile/completeness */
    public function completeness(Request $request, ProfileCompletenessService $service): JsonResponse
    {
        $score = $service->calculate($request->user());

        return response()->json(['success' => true, 'data' => $score]);
    }

    /** GET /api/spiritual-milestones */
    public function milestones(Request $request): JsonResponse
    {
        $milestones = SpiritualMilestone::where('user_id', $request->user()->id)
            ->orderByDesc('achieved_at')
            ->get();

        return response()->json(['success' => true, 'data' => $milestones]);
    }

    /** GET /api/badges */
    public function badges(Request $request): JsonResponse
    {
        $badges = UserBadge::where('user_id', $request->user()->id)
            ->with('badgeCatalog')
            ->orderByDesc('earned_at')
            ->get();

        return response()->json(['success' => true, 'data' => $badges]);
    }
}
