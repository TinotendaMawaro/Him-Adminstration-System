<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HomeGroup;
use App\Models\HomeGroupInvitation;
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
        $validated = $request->validate([
            'reason' => 'required|string|max:500',
        ]);

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

        // Notify pastors about the member leaving
        $pastors = User::where('role', 'pastor')
            ->where('zone_id', $user->zone_id)
            ->get();

        foreach ($pastors as $pastor) {
            $pastor->notifications()->create([
                'title' => 'Member Left Home Group',
                'message' => "{$user->name} left {$homeGroup->name}. Reason: {$validated['reason']}",
                'type' => 'home_group',
                'category' => 'member_left',
            ]);
        }

        Log::info('User left home group', [
            'user_id' => $user->id,
            'home_group_id' => $homeGroup->id,
            'reason' => $validated['reason'],
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

         // Verify the member belongs to this zone
         $member = User::where('id', $validated['member_id'])
             ->where('zone_id', $user->zone_id)
             ->first();

         if (!$member) {
             return response()->json([
                 'success' => false,
                 'message' => 'The selected member does not belong to your zone.',
             ], 400);
         }

         // Demote current leader if exists (they remain as regular member)
         // No special action needed; leader_id will be overwritten

         // Assign new leader and ensure they belong to this homegroup
         $homeGroup->update([
             'leader_id' => $validated['member_id'],
         ]);

         // Add member to homegroup if not already a member
         if ($member->home_group_id !== $id) {
             $member->update([
                 'home_group_id' => $id,
             ]);
         }

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

    /**
     * Request to join a home group
     */
    public function requestJoin(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'home_group_id' => 'required|exists:home_groups,id',
            'notes' => 'nullable|string|max:500',
        ]);

        $user = $request->user();

        // Check if user already belongs to a home group
        if ($user->home_group_id) {
            return response()->json([
                'success' => false,
                'message' => 'You already belong to a home group. Please contact your pastor to change.',
            ], 400);
        }

        // Check if there's already a pending request
        $existingRequest = HomeGroupInvitation::where('user_id', $user->id)
            ->where('status', 'pending')
            ->first();

        if ($existingRequest) {
            return response()->json([
                'success' => false,
                'message' => 'You already have a pending home group invitation.',
            ], 400);
        }

        // Check if there's a rejected invitation for this home group
        $rejectedRequest = HomeGroupInvitation::where('user_id', $user->id)
            ->where('home_group_id', $validated['home_group_id'])
            ->where('status', 'rejected')
            ->first();

        if ($rejectedRequest) {
            // Allow re-application after 30 days
            if ($rejectedRequest->approved_at &&
                $rejectedRequest->approved_at->diffInDays(now()) < 30) {
                return response()->json([
                    'success' => false,
                    'message' => 'You cannot reapply to this home group within 30 days of rejection.',
                ], 400);
            }
        }

        // Verify home group is in user's zone
        $homeGroup = HomeGroup::find($validated['home_group_id']);

        if ($homeGroup->zone_id !== $user->zone_id) {
            return response()->json([
                'success' => false,
                'message' => 'You can only join home groups in your zone.',
            ], 403);
        }

        // Create the request
        $homeGroupRequest = HomeGroupInvitation::create([
            'user_id' => $user->id,
            'home_group_id' => $validated['home_group_id'],
            'requested_by' => $user->id,
            'status' => 'pending',
            'notes' => $validated['notes'] ?? null,
        ]);

        // Notify the pastor and home group leader about the new request
        $leader = $homeGroup->leader;

        // Notify leader if exists
        if ($leader) {
            $leader->notifications()->create([
                'title' => 'New Home Group Join Request',
                'message' => "{$user->name} has requested to join {$homeGroup->name}. Please review the request.",
                'type' => 'home_group',
                'category' => 'join_request',
            ]);
        }

        // Also notify pastors in the zone
        $pastors = User::where('role', 'pastor')
            ->where('zone_id', $user->zone_id)
            ->get();
        foreach ($pastors as $pastor) {
            $pastor->notifications()->create([
                'title' => 'New Home Group Join Request',
                'message' => "{$user->name} has requested to join {$homeGroup->name}.",
                'type' => 'home_group',
                'category' => 'join_request',
            ]);
        }

        Log::info('Home group join request created', [
            'user_id' => $user->id,
            'home_group_id' => $validated['home_group_id'],
            'request_id' => $homeGroupRequest->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Home group join request submitted successfully. Please wait for approval.',
            'request' => $homeGroupRequest->load('homeGroup'),
        ]);
    }

    /**
     * Get user's home group request status
     */
    public function myRequest(Request $request): JsonResponse
    {
        $user = $request->user();

        // Get current home group
        if ($user->home_group_id) {
            $homeGroup = HomeGroup::find($user->home_group_id);
            return response()->json([
                'success' => true,
                'member' => [
                    'home_group' => $homeGroup,
                    'member_since' => $user->updated_at,
                ],
            ]);
        }

        // Get pending request
        $pendingRequest = HomeGroupInvitation::where('user_id', $user->id)
            ->where('status', 'pending')
            ->with('homeGroup')
            ->first();

        if ($pendingRequest) {
            return response()->json([
                'success' => true,
                'pending' => $pendingRequest,
            ]);
        }

        // Get rejected invitation
        $rejectedRequest = HomeGroupInvitation::where('user_id', $user->id)
            ->where('status', 'rejected')
            ->orderBy('updated_at', 'desc')
            ->with('homeGroup')
            ->first();

        return response()->json([
            'success' => true,
            'available' => true,
            'rejected' => $rejectedRequest,
        ]);
    }

    /**
     * Cancel pending request
     */
    public function cancelRequest(Request $request): JsonResponse
    {
        $user = $request->user();

        $pendingRequest = HomeGroupInvitation::where('user_id', $user->id)
            ->where('status', 'pending')
            ->first();

        if (!$pendingRequest) {
            return response()->json([
                'success' => false,
                'message' => 'No pending request found.',
            ], 404);
        }

        $pendingRequest->delete();

        return response()->json([
            'success' => true,
            'message' => 'Home group request cancelled.',
        ]);
    }

    /**
     * Get pending requests for pastor/leader approval
     */
    public function pendingApprovals(Request $request): JsonResponse
    {
        $user = $request->user();

        // Only pastors and home group leaders can view approval requests
        $isPastor = $user->isPastor() && $user->zone_id;
        $isLeader = $user->home_group_id && HomeGroup::where('id', $user->home_group_id)->where('leader_id', $user->id)->exists();

        if (!$isPastor && !$isLeader) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only pastors and home group leaders can view approval requests.',
            ], 403);
        }

        $query = HomeGroupInvitation::with(['user', 'homeGroup'])
            ->where('status', 'pending');

        // For leaders, only show requests for their home group
        if ($isLeader && !$isPastor) {
            $query->where('home_group_id', $user->home_group_id);
        }

        // For pastors, show requests from their zone's members
        if ($isPastor) {
            $zoneMemberIds = User::where('zone_id', $user->zone_id)
                ->where('role', 'member')
                ->pluck('id');
            $query->whereIn('user_id', $zoneMemberIds);
        }

        $requests = $query->orderBy('requested_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'requests' => $requests,
        ]);
    }

    /**
     * Approve home group request
     */
    public function approveRequest(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'notes' => 'nullable|string|max:500',
        ]);

        $user = $request->user();

        $isPastor = $user->isPastor() && $user->zone_id;
        $isLeader = $user->home_group_id && HomeGroup::where('id', $user->home_group_id)->where('leader_id', $user->id)->exists();

        if (!$isPastor && !$isLeader) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only pastors and home group leaders can approve requests.',
            ], 403);
        }

        $homeGroupRequest = HomeGroupInvitation::with(['user', 'homeGroup'])->find($id);

        if (!$homeGroupRequest) {
            return response()->json([
                'success' => false,
                'message' => 'Home group invitation not found.',
            ], 404);
        }

        if ($homeGroupRequest->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'This invitation has already been processed.',
            ], 400);
        }

        // Authorization check
        if ($isLeader && !$isPastor && $user->home_group_id !== $homeGroupRequest->home_group_id) {
            return response()->json([
                'success' => false,
                'message' => 'You can only approve invitations for your home group.',
            ], 403);
        }

        if ($isPastor && $user->zone_id) {
            $isZoneMember = User::where('id', $homeGroupRequest->user_id)
                ->where('zone_id', $user->zone_id)
                ->exists();

            if (!$isZoneMember) {
                return response()->json([
                    'success' => false,
                    'message' => 'You can only approve invitations from your zone.',
                ], 403);
            }
        }

        // Approve the invitation
        $homeGroupRequest->approve($user, $validated['notes'] ?? null);

        // Notify the member about approval
        $member = $homeGroupRequest->user;
        $homeGroup = $homeGroupRequest->homeGroup;

        $member->notifications()->create([
            'title' => 'Home Group Request Approved',
            'message' => "Congratulations! Your request to join {$homeGroup->name} has been approved.",
            'type' => 'home_group',
            'category' => 'join_approved',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Home group request approved successfully.',
            'request' => $homeGroupRequest->fresh(['user', 'homeGroup']),
        ]);
    }

    /**
     * Reject home group request
     */
    public function rejectRequest(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'notes' => 'nullable|string|max:500',
        ]);

        $user = $request->user();

        $isPastor = $user->isPastor() && $user->zone_id;
        $isLeader = $user->home_group_id && HomeGroup::where('id', $user->home_group_id)->where('leader_id', $user->id)->exists();

        if (!$isPastor && !$isLeader) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only pastors and home group leaders can reject requests.',
            ], 403);
        }

        $homeGroupRequest = HomeGroupInvitation::with(['user', 'homeGroup'])->find($id);

        if (!$homeGroupRequest) {
            return response()->json([
                'success' => false,
                'message' => 'Home group invitation not found.',
            ], 404);
        }

        if ($homeGroupRequest->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'This invitation has already been processed.',
            ], 400);
        }

        // Authorization check (same as approve)
        if ($isLeader && !$isPastor && $user->home_group_id !== $homeGroupRequest->home_group_id) {
            return response()->json([
                'success' => false,
                'message' => 'You can only reject invitations for your home group.',
            ], 403);
        }

        // Reject the invitation
        $homeGroupRequest->reject($user, $validated['notes'] ?? null);

        // Notify the member about rejection
        $member = $homeGroupRequest->user;
        $homeGroup = $homeGroupRequest->homeGroup;

        $notesMessage = $validated['notes'] ?? 'Please contact your pastor for more information.';
        $member->notifications()->create([
            'title' => 'Home Group Request Rejected',
            'message' => "Your request to join {$homeGroup->name} has been rejected. {$notesMessage}",
            'type' => 'home_group',
            'category' => 'join_rejected',
        ]);

        Log::info('Home group request rejected', [
            'request_id' => $id,
            'rejected_by' => $user->id,
            'user_id' => $homeGroupRequest->user_id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Home group request rejected.',
            'request' => $homeGroupRequest->fresh(['user', 'homeGroup']),
        ]);
    }
}
