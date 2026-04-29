<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HomeGroup;
use App\Models\HomeGroupInvitation;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class HomeGroupInvitationController extends Controller
{
    /**
     * Pastor: Invite a member to a homegroup
     * POST /api/homegroups/{id}/invite
     */
    public function invite(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'member_id' => 'required|exists:users,id',
        ]);

        $pastor = $request->user();

        // Only pastors can invite
        if (!$pastor->isPastor()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only pastors can send invitations.',
            ], 403);
        }

        // Homegroup must belong to pastor's zone
        $homeGroup = HomeGroup::where('zone_id', $pastor->zone_id)
            ->find($id);

        if (!$homeGroup) {
            return response()->json([
                'success' => false,
                'message' => 'Home group not found.',
            ], 404);
        }

        // Member must belong to same zone
        $member = User::where('id', $validated['member_id'])
            ->where('zone_id', $pastor->zone_id)
            ->first();

        if (!$member) {
            return response()->json([
                'success' => false,
                'message' => 'Member not found in your zone.',
            ], 404);
        }

        // Prevent duplicate pending invitations
        $existing = HomeGroupInvitation::where('homegroup_id', $id)
            ->where('member_id', $validated['member_id'])
            ->where('status', 'pending')
            ->first();

        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'This member already has a pending invitation.',
            ], 400);
        }

        // Create invitation
        $invitation = HomeGroupInvitation::create([
            'homegroup_id' => $id,
            'member_id' => $validated['member_id'],
            'pastor_id' => $pastor->id,
            'status' => 'pending',
            'invited_at' => now(),
        ]);

        // Send notification to member
        NotificationService::createHomeGroupInvitation($member, $homeGroup, $pastor);

        Log::info('Homegroup invitation sent', [
            'homegroup_id' => $id,
            'member_id' => $validated['member_id'],
            'pastor_id' => $pastor->id,
            'invitation_id' => $invitation->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Invitation sent successfully.',
            'invitation' => $invitation->load(['homegroup', 'member', 'pastor']),
        ], 201);
    }

    /**
     * Member: List my homegroup invitations
     * GET /api/homegroup-invitations
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $invitations = HomeGroupInvitation::with(['homegroup.zone', 'pastor'])
            ->where('member_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'invitations' => $invitations,
        ]);
    }

    /**
     * Member: View single invitation
     * GET /api/homegroup-invitations/{id}
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        $invitation = HomeGroupInvitation::with(['homegroup.zone', 'pastor'])
            ->where('id', $id)
            ->where('member_id', $user->id)
            ->first();

        if (!$invitation) {
            return response()->json([
                'success' => false,
                'message' => 'Invitation not found.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'invitation' => $invitation,
        ]);
    }

    /**
     * Member: Accept invitation
     * POST /api/homegroup-invitations/{id}/accept
     */
    public function accept(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        $invitation = HomeGroupInvitation::where('id', $id)
            ->where('member_id', $user->id)
            ->first();

        if (!$invitation) {
            return response()->json([
                'success' => false,
                'message' => 'Invitation not found.',
            ], 404);
        }

        if ($invitation->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'This invitation has already been ' . $invitation->status,
            ], 400);
        }

        // Accept invitation
        $invitation->update([
            'status' => 'accepted',
            'responded_at' => now(),
        ]);

        // Add member to homegroup (if not already)
        $user->update(['homegroup_id' => $invitation->homegroup_id]);

        // Notify pastor
        NotificationService::createInvitationAccepted(
            $invitation->pastor,
            $invitation->homegroup,
            $user
        );

        Log::info('Homegroup invitation accepted', [
            'invitation_id' => $id,
            'member_id' => $user->id,
            'homegroup_id' => $invitation->homegroup_id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Invitation accepted. You are now a member of ' . $invitation->homegroup->name,
            'invitation' => $invitation->fresh(['homegroup']),
        ]);
    }

    /**
     * Member: Decline invitation
     * POST /api/homegroup-invitations/{id}/decline
     */
    public function decline(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $note = $request->input('note', null);

        $invitation = HomeGroupInvitation::where('id', $id)
            ->where('member_id', $user->id)
            ->first();

        if (!$invitation) {
            return response()->json([
                'success' => false,
                'message' => 'Invitation not found.',
            ], 404);
        }

        if ($invitation->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'This invitation has already been ' . $invitation->status,
            ], 400);
        }

        // Decline invitation
        $invitation->update([
            'status' => 'declined',
            'responded_at' => now(),
            'response_note' => $note,
        ]);

        // Notify pastor
        NotificationService::createInvitationDeclined(
            $invitation->pastor,
            $invitation->homegroup,
            $user,
            $note
        );

        Log::info('Homegroup invitation declined', [
            'invitation_id' => $id,
            'member_id' => $user->id,
            'homegroup_id' => $invitation->homegroup_id,
            'note' => $note,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Invitation declined.',
            'invitation' => $invitation->fresh(),
        ]);
    }

    /**
     * Pastor: Cancel pending invitation
     * DELETE /api/homegroup-invitations/{id}
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $pastor = $request->user();

        if (!$pastor->isPastor()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized.',
            ], 403);
        }

        $invitation = HomeGroupInvitation::where('id', $id)
            ->where('pastor_id', $pastor->id)
            ->where('status', 'pending')
            ->first();

        if (!$invitation) {
            return response()->json([
                'success' => false,
                'message' => 'Invitation not found or already processed.',
            ], 404);
        }

        $invitation->delete();

        Log::info('Homegroup invitation cancelled', [
            'invitation_id' => $id,
            'pastor_id' => $pastor->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Invitation cancelled.',
        ]);
    }

    /**
     * Pastor: List invitations sent by me
     * GET /api/pastors/homegroup-invitations
     */
    public function pastorInvitations(Request $request): JsonResponse
    {
        $pastor = $request->user();

        if (!$pastor->isPastor()) {
            return response()->json(['success' => false, 'message' => 'Forbidden'], 403);
        }

        $invitations = HomeGroupInvitation::with(['member', 'homegroup'])
            ->where('pastor_id', $pastor->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'invitations' => $invitations,
        ]);
    }

    /**
     * Pastor: Get pending invitations count for badge
     * GET /api/pastors/homegroup-invitations/pending-count
     */
    public function pendingCount(Request $request): JsonResponse
    {
        $pastor = $request->user();

        if (!$pastor->isPastor()) {
            return response()->json(['success' => false, 'message' => 'Forbidden'], 403);
        }

        $count = HomeGroupInvitation::where('pastor_id', $pastor->id)
            ->where('status', 'pending')
            ->count();

        return response()->json([
            'success' => true,
            'count' => $count,
        ]);
    }
}
