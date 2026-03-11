<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HomeGroup;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class HomeGroupMemberController extends Controller
{
    /**
     * Get all available home groups for the user's zone
     */
    public function availableHomeGroups(Request $request): JsonResponse
    {
        $user = $request->user();

        // Get home groups in user's zone
        $homeGroups = HomeGroup::where('zone_id', $user->zone_id)
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'home_groups' => $homeGroups,
        ]);
    }

    /**
     * Get user's current home group
     */
    public function myHomeGroup(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->home_group_id) {
            return response()->json([
                'success' => true,
                'member' => null,
                'available' => true,
            ]);
        }

        $homeGroup = HomeGroup::with('leader')->find($user->home_group_id);

        return response()->json([
            'success' => true,
            'member' => [
                'home_group' => $homeGroup,
                'role' => $homeGroup->leader_id === $user->id ? 'leader' : 'member',
                'joined_at' => $user->updated_at,
            ],
        ]);
    }

    /**
     * Join a home group
     */
    public function joinHomeGroup(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'home_group_id' => 'required|exists:home_groups,id',
        ]);

        $user = $request->user();

        // Check if user already belongs to a home group
        if ($user->home_group_id) {
            return response()->json([
                'success' => false,
                'message' => 'You already belong to a home group. Please contact your pastor to change.',
            ], 400);
        }

        // Verify home group is in user's zone
        $homeGroup = HomeGroup::find($validated['home_group_id']);
        
        if ($homeGroup->zone_id !== $user->zone_id) {
            return response()->json([
                'success' => false,
                'message' => 'You can only join home groups in your zone.',
            ], 403);
        }

        // Update user's home group
        $user->update([
            'home_group_id' => $validated['home_group_id'],
        ]);

        Log::info('User joined home group', [
            'user_id' => $user->id,
            'home_group_id' => $validated['home_group_id'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'You have successfully joined the home group.',
            'home_group' => $homeGroup->fresh('leader'),
        ]);
    }

    /**
     * Leave current home group
     */
    public function leaveHomeGroup(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->home_group_id) {
            return response()->json([
                'success' => false,
                'message' => 'You do not belong to a home group.',
            ], 400);
        }

        // Check if user is a leader - leaders cannot leave without pastor approval
        $homeGroup = HomeGroup::find($user->home_group_id);
        
        if ($homeGroup->leader_id === $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'As a home group leader, please contact your pastor to transfer leadership before leaving.',
            ], 400);
        }

        $user->update([
            'home_group_id' => null,
        ]);

        Log::info('User left home group', [
            'user_id' => $user->id,
            'home_group_id' => $homeGroup->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'You have left the home group.',
        ]);
    }

    /**
     * Get members of a home group (for leaders/pastors)
     */
    public function homeGroupMembers(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        $homeGroup = HomeGroup::with('leader')->find($id);

        if (!$homeGroup) {
            return response()->json([
                'success' => false,
                'message' => 'Home group not found.',
            ], 404);
        }

        // Authorization: pastor of zone or home group leader
        $isPastor = $user->isPastor() && $user->zone_id === $homeGroup->zone_id;
        $isLeader = $homeGroup->leader_id === $user->id;

        if (!$isPastor && !$isLeader) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to view home group members.',
            ], 403);
        }

        $members = User::where('home_group_id', $id)
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'home_group' => $homeGroup,
            'members' => $members,
        ]);
    }

    /**
     * Assign leader to home group (Pastors only)
     */
    public function assignLeader(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'member_id' => 'required|exists:users,id',
        ]);

        $user = $request->user();

        // Only pastors can assign leaders
        if (!$user->isPastor()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only pastors can assign home group leaders.',
            ], 403);
        }

        $homeGroup = HomeGroup::find($id);

        if (!$homeGroup) {
            return response()->json([
                'success' => false,
                'message' => 'Home group not found.',
            ], 404);
        }

        // Verify pastor oversees this zone
        if ($homeGroup->zone_id !== $user->zone_id) {
            return response()->json([
                'success' => false,
                'message' => 'You can only assign leaders for home groups in your zone.',
            ], 403);
        }

        // Verify the member belongs to this home group
        $member = User::find($validated['member_id']);
        
        if ($member->home_group_id !== $id) {
            return response()->json([
                'success' => false,
                'message' => 'The selected member does not belong to this home group.',
            ], 400);
        }

        // Demote current leader if exists
        if ($homeGroup->leader_id) {
            // Current leader becomes a regular member
        }

        // Assign new leader
        $homeGroup->update([
            'leader_id' => $validated['member_id'],
        ]);

        Log::info('Home group leader assigned', [
            'home_group_id' => $id,
            'new_leader_id' => $validated['member_id'],
            'assigned_by' => $user->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Home group leader assigned successfully.',
            'home_group' => $homeGroup->fresh('leader'),
        ]);
    }

    /**
     * Remove member from home group (Leader/Pastor only)
     */
    public function removeMember(Request $request, int $homeGroupId, int $memberId): JsonResponse
    {
        $user = $request->user();
        $homeGroup = HomeGroup::find($homeGroupId);

        if (!$homeGroup) {
            return response()->json([
                'success' => false,
                'message' => 'Home group not found.',
            ], 404);
        }

        // Authorization check
        $isPastor = $user->isPastor() && $user->zone_id === $homeGroup->zone_id;
        $isLeader = $homeGroup->leader_id === $user->id;

        if (!$isPastor && !$isLeader) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to remove members.',
            ], 403);
        }

        // Cannot remove the leader this way
        if ($homeGroup->leader_id === $memberId) {
            return response()->json([
                'success' => false,
                'message' => 'Please reassign leadership before removing the leader.',
            ], 400);
        }

        $member = User::find($memberId);

        if ($member->home_group_id !== $homeGroupId) {
            return response()->json([
                'success' => false,
                'message' => 'Member does not belong to this home group.',
            ], 400);
        }

        $member->update([
            'home_group_id' => null,
        ]);

        Log::info('Member removed from home group', [
            'member_id' => $memberId,
            'home_group_id' => $homeGroupId,
            'removed_by' => $user->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Member removed from home group.',
        ]);
    }
}
