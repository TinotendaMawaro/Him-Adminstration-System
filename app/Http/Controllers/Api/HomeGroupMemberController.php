<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HomeGroup;
use App\Models\HomeGroupInvitation;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class HomeGroupMemberController extends Controller
{
    /**
     * Get all available home groups for the user's zone
     */
    public function availableHomeGroups(Request $request): JsonResponse
    {
        $user = $request->user();

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
    /** GET /api/home-group/channel — the channel of the home group I belong to (created on first use). */
    public function myChannel(Request $request): JsonResponse
    {
        $user = $request->user();
        $group = $user->home_group_id ? HomeGroup::find($user->home_group_id) : null;
        if (!$group) {
            return response()->json(['success' => true, 'data' => null]);
        }
        $svc = app(\App\Services\Community\HomeGroupChannelService::class);
        $svc->add($group, $user);

        return response()->json(['success' => true, 'data' => ['channel_id' => $svc->channelFor($group)->id, 'is_leader' => (int) $group->leader_id === (int) $user->id]]);
    }

    /** GET /api/department/channel — the channel of my department (created on first use). */
    public function myDepartmentChannel(Request $request): JsonResponse
    {
        $user = $request->user();
        $dept = $user->department_id ? \App\Models\Department::find($user->department_id) : null;
        if (!$dept) {
            return response()->json(['success' => true, 'data' => null]);
        }
        $svc = app(\App\Services\Community\DepartmentChannelService::class);
        $svc->add($dept, $user);

        return response()->json(['success' => true, 'data' => [
            'channel_id' => $svc->channelFor($dept)->id,
            'is_head' => (int) $dept->hod_id === (int) $user->id && $dept->hod_status === 'accepted',
        ]]);
    }

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

        if ($user->home_group_id) {
            return response()->json([
                'success' => false,
                'message' => 'You already belong to a home group. Please contact your pastor to change.',
            ], 400);
        }

        $homeGroup = HomeGroup::find($validated['home_group_id']);

        if ($homeGroup->zone_id !== $user->zone_id) {
            return response()->json([
                'success' => false,
                'message' => 'You can only join home groups in your zone.',
            ], 403);
        }

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

        $user = $request->user()->load('member');

        if (!$user->home_group_id) {
            return response()->json([
                'success' => false,
                'message' => 'You do not belong to a home group.',
            ], 400);
        }

        $homeGroup = HomeGroup::with('leader')->find($user->home_group_id);

        if (!$homeGroup) {
            return response()->json([
                'success' => false,
                'message' => 'Home group not found.',
            ], 404);
        }

        if ($homeGroup->leader_id === $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'As a home group leader, please contact your pastor to transfer leadership before leaving.',
            ], 400);
        }

        try {
            DB::beginTransaction();

            $user->update(['home_group_id' => null]);

            if ($user->member) {
                $user->member->update(['home_group_id' => null]);
            }

            if ($homeGroup->leader && $homeGroup->leader->id !== $user->id) {
                NotificationService::createMemberLeftNotification(
                    $homeGroup->leader,
                    $homeGroup,
                    $user,
                    $validated['reason']
                );
            }

            $pastors = User::where('role', 'pastor')
                ->where('zone_id', $user->zone_id)
                ->get();

            foreach ($pastors as $pastor) {
                NotificationService::createMemberLeftNotification(
                    $pastor,
                    $homeGroup,
                    $user,
                    $validated['reason']
                );
            }

            DB::commit();

            Log::info('User left home group', [
                'user_id' => $user->id,
                'home_group_id' => $homeGroup->id,
                'reason' => $validated['reason'],
            ]);

            return response()->json([
                'success' => true,
                'message' => 'You have left the home group.',
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            Log::error('Error leaving home group', [
                'user_id' => $user->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to leave home group. Please try again.',
            ], 500);
        }
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

        if ($homeGroup->zone_id !== $user->zone_id) {
            return response()->json([
                'success' => false,
                'message' => 'You can only assign leaders for home groups in your zone.',
            ], 403);
        }

        $member = User::where('id', $validated['member_id'])
            ->where('zone_id', $user->zone_id)
            ->first();

        if (!$member) {
            return response()->json([
                'success' => false,
                'message' => 'The selected member does not belong to your zone.',
            ], 400);
        }

        $homeGroup->update([
            'leader_id' => $validated['member_id'],
        ]);

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

        $isPastor = $user->isPastor() && $user->zone_id === $homeGroup->zone_id;
        $isLeader = $homeGroup->leader_id === $user->id;

        if (!$isPastor && !$isLeader) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized to remove members.',
            ], 403);
        }

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
     * Update member status within home group (Leader/Pastor only)
     */
    public function updateMemberStatus(Request $request, int $homeGroupId, int $memberId): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:active,inactive',
        ]);

        $user = $request->user();
        $homeGroup = HomeGroup::find($homeGroupId);

        if (!$homeGroup) {
            return response()->json([
                'success' => false,
                'message' => 'Home group not found.',
            ], 404);
        }

        $isPastor = $user->isPastor() && $user->zone_id === $homeGroup->zone_id;
        $isLeader = $homeGroup->leader_id === $user->id;

        if (!$isPastor && !$isLeader) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only pastors and home group leaders can update member status.',
            ], 403);
        }

        if ($homeGroup->leader_id === $memberId) {
            return response()->json([
                'success' => false,
                'message' => 'Leader status cannot be changed this way.',
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
            'is_active' => $validated['status'] === 'active',
        ]);

        Log::info('Home group member status updated', [
            'member_id' => $memberId,
            'home_group_id' => $homeGroupId,
            'new_status' => $validated['status'],
            'updated_by' => $user->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Member status updated successfully.',
            'member' => [
                'id' => $member->id,
                'name' => $member->name,
                'status' => $member->is_active ? 'active' : 'inactive',
            ],
        ]);
    }

    /**
     * Send broadcast message to all home group members (Leader only)
     */
    public function sendBroadcast(Request $request, int $homeGroupId): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'message' => 'required|string|max:2000',
        ]);

        $user = $request->user();
        $homeGroup = HomeGroup::find($homeGroupId);

        if (!$homeGroup) {
            return response()->json([
                'success' => false,
                'message' => 'Home group not found.',
            ], 404);
        }

        if ($homeGroup->leader_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Only the home group leader can send broadcast messages.',
            ], 403);
        }

        $members = User::where('home_group_id', $homeGroupId)
            ->where('is_active', true)
            ->where('id', '!=', $user->id)
            ->get();

        foreach ($members as $member) {
            $member->notifications()->create([
                'title' => "Broadcast: {$validated['title']}",
                'message' => $validated['message'],
                'type' => 'home_group',
                'category' => 'broadcast',
            ]);
        }

        $pastors = User::where('role', 'pastor')
            ->where('zone_id', $homeGroup->zone_id)
            ->get();

        foreach ($pastors as $pastor) {
            $pastor->notifications()->create([
                'title' => 'Home Group Broadcast Sent',
                'message' => "Leader {$user->name} of {$homeGroup->name} sent a broadcast: {$validated['title']}",
                'type' => 'home_group',
                'category' => 'broadcast_sent',
            ]);
        }

        Log::info('Home group broadcast sent', [
            'home_group_id' => $homeGroupId,
            'sender_id' => $user->id,
            'recipient_count' => $members->count(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Broadcast sent to ' . $members->count() . ' member(s).',
        ]);
    }

/**
     * Request to join a home group
     */
    public function requestJoin(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'home_group_id' => 'required|exists:home_groups,id',
                'notes' => 'nullable|string|max:500',
            ]);

            $user = $request->user();

            if ($user->home_group_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'You already belong to a home group. Please contact your pastor to change.',
                ], 400);
            }

            $existingRequest = HomeGroupInvitation::where('member_id', $user->id)
                ->where('status', 'pending')
                ->first();

            if ($existingRequest) {
                return response()->json([
                    'success' => false,
                    'message' => 'You already have a pending home group invitation.',
                ], 400);
            }

            $rejectedRequest = HomeGroupInvitation::where('member_id', $user->id)
                ->where('homegroup_id', $validated['home_group_id'])
                ->where('status', 'declined')
                ->first();

            if ($rejectedRequest && $rejectedRequest->responded_at) {
                if ($rejectedRequest->responded_at->diffInDays(now()) < 30) {
                    return response()->json([
                        'success' => false,
                        'message' => 'You cannot reapply to this home group within 30 days of rejection.',
                    ], 400);
                }
            }

            $homeGroup = HomeGroup::find($validated['home_group_id']);

            if (!$homeGroup) {
                return response()->json([
                    'success' => false,
                    'message' => 'Home group not found.',
                ], 404);
            }

            if ($homeGroup->zone_id !== $user->zone_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'You can only join home groups in your zone.',
                ], 403);
            }

            $leadPastor = User::where('role', 'pastor')
                ->where('zone_id', $user->zone_id)
                ->first();

            $homeGroupRequest = HomeGroupInvitation::create([
                'member_id' => $user->id,
                'homegroup_id' => $validated['home_group_id'],
                'requested_by' => $user->id,
                'pastor_id' => $leadPastor ? $leadPastor->id : null,
                'status' => 'pending',
                'message' => isset($validated['notes']) ? $validated['notes'] : null,
            ]);

            $leader = $homeGroup->leader;
            $homeGroupName = $homeGroup->name;

            if ($leader) {
                $leader->notifications()->create([
                    'title' => 'New Home Group Join Request',
                    'message' => "{$user->name} has requested to join {$homeGroupName}. Please review the request.",
                    'type' => 'home_group',
                    'category' => 'join_request',
                ]);
            }

            $pastors = User::where('role', 'pastor')
                ->where('zone_id', $user->zone_id)
                ->get();

            foreach ($pastors as $pastor) {
                $pastor->notifications()->create([
                    'title' => 'New Home Group Join Request',
                    'message' => "{$user->name} has requested to join {$homeGroupName}.",
                    'type' => 'home_group',
                    'category' => 'join_request',
                ]);
            }

            Log::info('Home group join request created', [
                'user_id' => $user->id,
                'homegroup_id' => $validated['home_group_id'],
                'request_id' => $homeGroupRequest->id,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Home group join request submitted successfully. Please wait for pastoral approval.',
                'request' => $homeGroupRequest->load('homeGroup'),
            ]);
        } catch (\Exception $e) {
            Log::error('Home group join request failed', [
                'user_id' => $request->user()->id ?? null,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to submit home group join request. Please try again.',
            ], 500);
        }
    }

    /**
     * Get user's home group request status
     */
    public function myRequest(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->home_group_id) {
            $homeGroup = HomeGroup::with(['leader', 'zone'])->find($user->home_group_id);
            
            // Get lead pastor
            $leadPastor = null;
            if ($homeGroup && $homeGroup->zone_id) {
                $pastor = User::where('role', 'pastor')
                    ->where('zone_id', $homeGroup->zone_id)
                    ->first(['id', 'name', 'unique_code']);
                if ($pastor) {
                    $leadPastor = [
                        'id' => $pastor->id,
                        'name' => $pastor->name,
                        'title' => $pastor->pastor ? $pastor->pastor->title : 'Pastor',
                    ];
                }
            }
            
            return response()->json([
                'success' => true,
                'member' => [
                    'home_group' => $homeGroup,
                    'lead_pastor' => $leadPastor,
                    'member_since' => $user->updated_at,
                ],
            ]);
        }

        $pendingRequest = HomeGroupInvitation::where('member_id', $user->id)
            ->where('status', 'pending')
            ->with('homeGroup')
            ->first();

        if ($pendingRequest) {
            return response()->json([
                'success' => true,
                'pending' => $pendingRequest,
            ]);
        }

        $rejectedRequest = HomeGroupInvitation::where('member_id', $user->id)
            ->where('status', 'declined')
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

        $pendingRequest = HomeGroupInvitation::where('member_id', $user->id)
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

        $isPastor = $user->isPastor() && $user->zone_id;
        $isLeader = $user->home_group_id && HomeGroup::where('id', $user->home_group_id)->where('leader_id', $user->id)->exists();

        if (!$isPastor && !$isLeader) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only pastors and home group leaders can view approval requests.',
            ], 403);
        }

        $query = HomeGroupInvitation::with(['member', 'homeGroup'])
            ->where('status', 'pending');

        if ($isLeader && !$isPastor) {
            $query->where('homegroup_id', $user->home_group_id);
        }

        if ($isPastor) {
            $zoneMemberIds = User::where('zone_id', $user->zone_id)
                ->where('role', 'member')
                ->pluck('id');
            $query->whereIn('member_id', $zoneMemberIds);
        }

        $requests = $query->orderBy('created_at', 'desc')->get();

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

        if ($isLeader && !$isPastor && $user->home_group_id !== $homeGroupRequest->homegroup_id) {
            return response()->json([
                'success' => false,
                'message' => 'You can only approve invitations for your home group.',
            ], 403);
        }

        if ($isPastor) {
            $isZoneMember = User::where('id', $homeGroupRequest->member_id)
                ->where('zone_id', $user->zone_id)
                ->exists();

            if (!$isZoneMember) {
                return response()->json([
                    'success' => false,
                    'message' => 'You can only approve invitations from your zone.',
                ], 403);
            }
        }

        $homeGroupRequest->approve($user, isset($validated['notes']) ? $validated['notes'] : null);

        $member = $homeGroupRequest->member;
        $homeGroup = $homeGroupRequest->homeGroup;
        $homeGroupName = $homeGroup ? $homeGroup->name : 'Unknown Home Group';

        $member->notifications()->create([
            'title' => 'Home Group Request Approved',
            'message' => "Congratulations! Your request to join {$homeGroupName} has been approved.",
            'type' => 'home_group',
            'category' => 'join_approved',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Home group request approved successfully.',
            'request' => $homeGroupRequest->fresh(['member', 'homeGroup']),
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

        $homeGroupRequest = HomeGroupInvitation::with(['member', 'homeGroup'])->find($id);

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

        if ($isLeader && !$isPastor && $user->home_group_id !== $homeGroupRequest->homegroup_id) {
            return response()->json([
                'success' => false,
                'message' => 'You can only reject invitations for your home group.',
            ], 403);
        }

        $homeGroupRequest->reject($user, isset($validated['notes']) ? $validated['notes'] : null);

        $member = $homeGroupRequest->member;
        $homeGroup = $homeGroupRequest->homeGroup;
        $homeGroupName = $homeGroup ? $homeGroup->name : 'Unknown Home Group';

        $notesMessage = isset($validated['notes']) ? $validated['notes'] : 'Please contact your pastor for more information.';
        $member->notifications()->create([
            'title' => 'Home Group Request Rejected',
            'message' => "Your request to join {$homeGroupName} has been rejected. {$notesMessage}",
            'type' => 'home_group',
            'category' => 'join_rejected',
        ]);

        Log::info('Home group request rejected', [
            'request_id' => $id,
            'rejected_by' => $user->id,
            'member_id' => $homeGroupRequest->member_id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Home group request rejected.',
            'request' => $homeGroupRequest->fresh(['member', 'homeGroup']),
        ]);
    }

    // ============================================================================
    // LEADER PROMOTION WORKFLOW
    // ============================================================================

    /**
     * Promote a member to homegroup leader (pastor only)
     * Creates a promotion request that the member must accept/decline
     */
    public function promoteLeader(Request $request, $homeGroupId): JsonResponse
    {
        $user = $request->user();

        if (!$user->isPastor()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only pastors can promote home group leaders.',
            ], 403);
        }

        $zoneId = $user->zone_id;

        $homeGroup = HomeGroup::where('zone_id', $zoneId)
            ->findOrFail($homeGroupId);

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $member = User::where('id', $validated['user_id'])
            ->where('zone_id', $zoneId)
            ->firstOrFail();

        // Check if already a leader of this or another homegroup
        $existingLeader = HomeGroup::where('leader_id', $member->id)->first();
        if ($existingLeader) {
            return response()->json([
                'success' => false,
                'message' => 'This member is already a leader of ' . $existingLeader->name,
            ], 400);
        }

        // Check for existing pending promotion
        $pendingPromotion = \App\Models\LeaderPromotionRequest::where('user_id', $member->id)
            ->where('status', 'pending')
            ->first();

        if ($pendingPromotion) {
            return response()->json([
                'success' => false,
                'message' => 'This member already has a pending promotion request.',
            ], 400);
        }

        // Nothing changes until they accept: only then do they lead the group (and join its channel).
        $promotion = \App\Models\LeaderPromotionRequest::create([
            'user_id'     => $member->id,
            'home_group_id' => $homeGroup->id,
            'pastor_id'   => $user->id,
            'status'      => 'pending',
            'message'     => $request->input('message', ''),
        ]);

        // Send notification to member
        NotificationService::createLeaderPromotionRequested($member, $homeGroup, $user);

        Log::info('Leader promotion requested', [
            'promotion_id' => $promotion->id,
            'member_id'    => $member->id,
            'home_group_id'=> $homeGroup->id,
            'pastor_id'    => $user->id,
        ]);

        return response()->json([
            'success'  => true,
            'message'  => 'Leader promotion request sent to member.',
            'promotion'=> $promotion->load(['member', 'homeGroup', 'pastor']),
        ]);
    }

    /**
     * Member accepts or declines a leader promotion
     */
    public function respondToPromotion(Request $request, $promotionId): JsonResponse
    {
        $user = $request->user();

        $promotion = \App\Models\LeaderPromotionRequest::where('id', $promotionId)
            ->where('user_id', $user->id)
            ->where('status', 'pending')
            ->firstOrFail();

        $action = $request->input('action'); // 'accept' | 'decline'

        if (!in_array($action, ['accept', 'decline'])) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid action. Use "accept" or "decline".',
            ], 422);
        }

        $homeGroup = $promotion->homeGroup;
        $pastor = $promotion->pastor;

        if ($action === 'accept') {
            // A home group leader stays a member (the app is where they lead): they run the group's channel, post and schedule meetings.
            // Set as homegroup leader
            $homeGroup->update(['leader_id' => $user->id]);

            // Ensure member belongs to this homegroup
            if ($user->home_group_id !== $homeGroup->id) {
                $user->update(['home_group_id' => $homeGroup->id]);
            }

            $promotion->update([
                'status'       => 'accepted',
                'responded_at' => now(),
                'responded_by' => $user->id,
            ]);

            // Notify pastor
            NotificationService::createLeaderPromotionAccepted($pastor, $homeGroup, $user);

            Log::info('Leader promotion accepted', [
                'promotion_id' => $promotion->id,
                'user_id'      => $user->id,
                'home_group_id'=> $homeGroup->id,
            ]);

            return response()->json([
                'success'    => true,
                'message'    => 'You are now a Homegroup Leader.',
                'new_role'   => $user->role->value,
                'home_group' => $homeGroup->fresh('leader'),
                'user'       => $user->fresh(['zone', 'homeGroup']),
            ]);
        }

        // Decline
        $promotion->update([
            'status'       => 'declined',
            'responded_at' => now(),
            'responded_by' => $user->id,
        ]);

        NotificationService::createLeaderPromotionDeclined($pastor, $homeGroup, $user);

        Log::info('Leader promotion declined', [
            'promotion_id' => $promotion->id,
            'user_id'      => $user->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Promotion request declined.',
            'promotion' => $promotion->fresh(['member', 'homeGroup', 'pastor']),
        ]);
    }

    /**
     * Get current user's pending leader promotion (if any)
     */
    public function myPromotion(Request $request): JsonResponse
    {
        $user = $request->user();

        $promotion = \App\Models\LeaderPromotionRequest::where('user_id', $user->id)
            ->where('status', 'pending')
            ->with(['homeGroup', 'pastor'])
            ->first();

        return response()->json([
            'success'   => true,
            'promotion' => $promotion,
        ]);
    }
}