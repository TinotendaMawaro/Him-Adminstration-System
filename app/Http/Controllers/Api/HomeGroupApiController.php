<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HomeGroup;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class HomeGroupApiController extends Controller
{
    /**
     * Get all homegroups for the authenticated user's zone with lead pastor info
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $zoneId = $user->zone_id;

        // Cache for 60 seconds to optimize performance
        $cacheKey = "homegroups_zone_{$zoneId}";
        
        $homegroups = Cache::remember($cacheKey, 60, function () use ($zoneId) {
            return HomeGroup::with(['leader.zone', 'zone'])
                ->where('zone_id', $zoneId)
                ->orderBy('name')
                ->get()
                ->map(function ($homegroup) {
                    // Get lead pastor (pastors in this zone)
                    $leadPastor = User::where('role', 'pastor')
                        ->where('zone_id', $homegroup->zone_id)
                        ->first(['id', 'name', 'unique_code']);

                    return [
                        'id' => $homegroup->id,
                        'name' => $homegroup->name,
                        'location' => $homegroup->location,
                        'meeting_day' => $homegroup->meeting_day,
                        'meeting_time' => $homegroup->meeting_time ? $homegroup->meeting_time->format('H:i') : null,
                        'leader' => $homegroup->leader ? [
                            'id' => $homegroup->leader->id,
                            'name' => $homegroup->leader->name,
                        ] : null,
                        'lead_pastor' => $leadPastor ? [
                            'id' => $leadPastor->id,
                            'name' => $leadPastor->name,
                            'title' => $leadPastor->pastor ? $leadPastor->pastor->title : 'Pastor',
                        ] : null,
                        'members' => $homegroup->users()->count(),
                        'zone_id' => $homegroup->zone_id,
                    ];
                });
        });

        return response()->json([
            'success' => true,
            'homegroups' => $homegroups,
        ]);
    }

    /**
     * Create a new homegroup
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'location' => 'nullable|string|max:500',
            'meeting_day' => 'nullable|string|max:50',
            'meeting_time' => 'nullable',
        ]);

        $user = $request->user();
        $zoneId = $user->zone_id;

        $homegroup = HomeGroup::create([
            'name' => $validated['name'],
            'zone_id' => $zoneId,
            'location' => isset($validated['location']) ? $validated['location'] : null,
            'meeting_day' => isset($validated['meeting_day']) ? $validated['meeting_day'] : null,
            'meeting_time' => isset($validated['meeting_time']) ? $validated['meeting_time'] : null,
        ]);

        // Clear cache
        Cache::forget("homegroups_zone_{$zoneId}");

        return response()->json([
            'success' => true,
            'message' => 'Homegroup created successfully',
            'homegroup' => $homegroup->load('leader'),
        ], 201);
    }

    /**
     * Get a specific homegroup with its members and lead pastor
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $zoneId = $user->zone_id;

        $homegroup = HomeGroup::with(['leader', 'users', 'zone'])
            ->where('zone_id', $zoneId)
            ->findOrFail($id);

        // Get lead pastor
        $leadPastor = User::where('role', 'pastor')
            ->where('zone_id', $zoneId)
            ->first(['id', 'name', 'unique_code']);

        $members = $homegroup->users()->get()->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'role' => $user->role,
                'status' => $user->is_active ? 'Active' : 'Inactive',
            ];
        });

        return response()->json([
            'success' => true,
            'homegroup' => [
                'id' => $homegroup->id,
                'name' => $homegroup->name,
                'location' => $homegroup->location,
                'meeting_day' => $homegroup->meeting_day,
                'meeting_time' => $homegroup->meeting_time ? $homegroup->meeting_time->format('H:i') : null,
                'leader' => $homegroup->leader ? [
                    'id' => $homegroup->leader->id,
                    'name' => $homegroup->leader->name,
                ] : null,
                'lead_pastor' => $leadPastor ? [
                    'id' => $leadPastor->id,
                    'name' => $leadPastor->name,
                    'title' => $leadPastor->pastor ? $leadPastor->pastor->title : 'Pastor',
                ] : null,
                'members' => $members,
                'zone_id' => $homegroup->zone_id,
            ],
        ]);
    }

    /**
     * Update a homegroup
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $zoneId = $user->zone_id;
        
        $homegroup = HomeGroup::where('zone_id', $zoneId)
            ->findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'location' => 'nullable|string|max:500',
            'meeting_day' => 'nullable|string|max:50',
            'meeting_time' => 'nullable',
        ]);

        $homegroup->update($validated);

        // Clear cache
        Cache::forget("homegroups_zone_{$zoneId}");

        return response()->json([
            'success' => true,
            'message' => 'Homegroup updated successfully',
            'homegroup' => $homegroup->fresh('leader'),
        ]);
    }

    /**
     * Delete a homegroup
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $zoneId = $user->zone_id;
        
        $homegroup = HomeGroup::where('zone_id', $zoneId)
            ->findOrFail($id);

        // Remove leader assignment before deleting
        $homegroup->update(['leader_id' => null]);
        
        $homegroup->delete();

        // Clear cache
        Cache::forget("homegroups_zone_{$zoneId}");

        return response()->json([
            'success' => true,
            'message' => 'Homegroup deleted successfully',
        ]);
    }

    /**
     * Assign a leader to a homegroup
     */
    public function assignLeader(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $zoneId = $user->zone_id;
        
        $homegroup = HomeGroup::where('zone_id', $zoneId)
            ->findOrFail($id);

        $validated = $request->validate([
            'leader_id' => 'required|exists:users,id',
        ]);

        // The person must be in the pastor's zone, and they must accept before they lead: this sends them the appointment.
        User::where('id', $validated['leader_id'])->where('zone_id', $zoneId)->firstOrFail();

        $request->merge(['user_id' => $validated['leader_id']]);

        return app(HomeGroupMemberController::class)->promoteLeader($request, $homegroup->id);
    }

    /**
     * Demote (remove) a leader from a homegroup
     */
    public function demoteLeader(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $zoneId = $user->zone_id;
        
        $homegroup = HomeGroup::where('zone_id', $zoneId)
            ->findOrFail($id);

        if (!$homegroup->leader_id) {
            return response()->json([
                'success' => false,
                'message' => 'This homegroup does not have a leader',
            ], 400);
        }

        $homegroup->update(['leader_id' => null]);

        // Clear cache
        Cache::forget("homegroups_zone_{$zoneId}");

        return response()->json([
            'success' => true,
            'message' => 'Leader demoted successfully',
            'homegroup' => $homegroup->fresh('leader'),
        ]);
    }

    /**
     * Get available members that can be assigned as leaders
     */
    public function availableMembers(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $zoneId = $user->zone_id;
        
        $homegroup = HomeGroup::where('zone_id', $zoneId)
            ->findOrFail($id);

        // Get all active users in the pastor's zone who are not leaders of other homegroups
        // Available: users with no homegroup OR already in this homegroup (potential co-leader scenario)
        $members = User::where('zone_id', $zoneId)
            ->where('is_active', true)
            ->where(function ($query) use ($homegroup) {
                $query->whereNull('home_group_id')
                    ->orWhere('home_group_id', $homegroup->id);
            })
            ->whereNotIn('id', function ($query) {
                $query->select('leader_id')
                    ->from('home_groups')
                    ->whereNotNull('leader_id');
            })
            ->orderBy('name')
            ->get(['id', 'name', 'role', 'is_active', 'home_group_id']);

        return response()->json([
            'success' => true,
            'members' => $members->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'role' => $user->role,
                    'status' => $user->is_active ? 'Active' : 'Inactive',
                    'home_group_id' => $user->home_group_id,
                ];
            }),
        ]);
    }

    /**
     * Get available members that can be invited to join this homegroup
     */
    public function availableMembersForInvite(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $zoneId = $user->zone_id;

        $homegroup = HomeGroup::where('zone_id', $zoneId)
            ->findOrFail($id);

        // Get active members in the pastor's zone who:
        // 1. Are not already in this homegroup
        // 2. Don't have pending invitations to this homegroup
        // 3. Have role 'member'
        $members = User::where('zone_id', $zoneId)
            ->where('is_active', true)
            ->where('role', 'member')
            ->where(function ($query) use ($homegroup) {
                $query->whereNull('home_group_id')
                    ->orWhere('home_group_id', '!=', $homegroup->id);
            }) // Not already in this homegroup
            ->whereNotIn('id', function ($query) use ($homegroup) {
                $query->select('member_id')
                    ->from('homegroup_invitations')
                    ->where('homegroup_id', $homegroup->id)
                    ->where('status', 'pending');
            })
            ->orderBy('name')
            ->get(['id', 'name', 'role', 'is_active', 'home_group_id']);

        return response()->json([
            'success' => true,
            'members' => $members->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'role' => $user->role,
                    'status' => $user->is_active ? 'Active' : 'Inactive',
                    'home_group_id' => $user->home_group_id,
                ];
            }),
        ]);
    }
}