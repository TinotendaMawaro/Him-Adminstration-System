<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HomeGroup;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class HomeGroupApiController extends Controller
{
    /**
     * Get all homegroups for the authenticated user's zone
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        
        // Get homegroups for the user's zone
        $homegroups = HomeGroup::with(['leader', 'zone'])
            ->where('zone_id', $user->zone_id)
            ->get()
            ->map(function ($homegroup) {
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
                    'leader_since' => $homegroup->leader ? $homegroup->created_at->format('M Y') : null,
                    'members' => $homegroup->users()->count(),
                    'zone_id' => $homegroup->zone_id,
                ];
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

        $homegroup = HomeGroup::create([
            'name' => $validated['name'],
            'zone_id' => $user->zone_id,
            'location' => $validated['location'] ?? null,
            'meeting_day' => $validated['meeting_day'] ?? null,
            'meeting_time' => $validated['meeting_time'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Homegroup created successfully',
            'homegroup' => $homegroup->load('leader'),
        ], 201);
    }

    /**
     * Get a specific homegroup with its members
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $homegroup = HomeGroup::with(['leader', 'users', 'zone'])
            ->where('zone_id', $request->user()->zone_id)
            ->findOrFail($id);

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
        $homegroup = HomeGroup::where('zone_id', $request->user()->zone_id)
            ->findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'location' => 'nullable|string|max:500',
            'meeting_day' => 'nullable|string|max:50',
            'meeting_time' => 'nullable',
        ]);

        $homegroup->update($validated);

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
        $homegroup = HomeGroup::where('zone_id', $request->user()->zone_id)
            ->findOrFail($id);

        // Remove leader assignment before deleting
        $homegroup->update(['leader_id' => null]);
        
        $homegroup->delete();

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
         $homegroup = HomeGroup::where('zone_id', $request->user()->zone_id)
             ->findOrFail($id);

         $validated = $request->validate([
             'leader_id' => 'required|exists:users,id',
         ]);

         // Verify the user belongs to the same zone as the pastor
         $leader = User::where('id', $validated['leader_id'])
             ->where('zone_id', $request->user()->zone_id)
             ->firstOrFail();

         // Auto-add leader to the homegroup if not already a member
         if ($leader->homegroup_id !== $homegroup->id) {
             $leader->update(['homegroup_id' => $homegroup->id]);
         }

         $homegroup->update(['leader_id' => $validated['leader_id']]);

         return response()->json([
             'success' => true,
             'message' => 'Leader assigned successfully',
             'homegroup' => $homegroup->fresh('leader'),
         ]);
     }

    /**
     * Demote (remove) a leader from a homegroup
     */
    public function demoteLeader(Request $request, int $id): JsonResponse
    {
        $homegroup = HomeGroup::where('zone_id', $request->user()->zone_id)
            ->findOrFail($id);

        if (!$homegroup->leader_id) {
            return response()->json([
                'success' => false,
                'message' => 'This homegroup does not have a leader',
            ], 400);
        }

        $homegroup->update(['leader_id' => null]);

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
         $homegroup = HomeGroup::where('zone_id', $request->user()->zone_id)
             ->findOrFail($id);

          // Get all active users in the pastor's zone who are not leaders of other homegroups
          // Available: users with no homegroup OR already in this homegroup (potential co-leader scenario)
          $members = User::where('zone_id', $request->user()->zone_id)
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
}

