<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\HomeGroup;
use App\Models\HomeGroupInvitation;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class HomeGroupInvitationController extends Controller
{
    /**
      * Pastor Flow: Invite a member to a homegroup (Administrative)
      * POST /api/homegroups/{id}/invite
      */
    public function invite(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'member_id' => 'required|exists:users,id',
            'message' => 'nullable|string|max:500',
        ]);

        $pastor = $request->user();

        // Only pastors can invite
        if (!$pastor->isPastor()) {
            Log::warning('Unauthorized invitation attempt', [
                'user_id' => $pastor->id,
                'homegroup_id' => $id,
                'member_id' => $validated['member_id'],
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only pastors can send invitations.',
            ], 403);
        }

        try {
            // Use database transaction for atomicity
            $result = DB::transaction(function () use ($id, $validated, $pastor) {
                // Lock the homegroup record to prevent concurrent modifications
                $homeGroup = HomeGroup::where('zone_id', $pastor->zone_id)
                    ->lockForUpdate()
                    ->find($id);

                if (!$homeGroup) {
                    throw new \Exception('Home group not found in your zone.');
                }

                // Verify member exists and belongs to same zone
                $member = User::where('id', $validated['member_id'])
                    ->where('zone_id', $pastor->zone_id)
                    ->where('role', 'member')
                    ->lockForUpdate()
                    ->first();

                if (!$member) {
                    throw new \Exception('Member not found in your zone.');
                }

                // Check for existing pending invitations with row-level locking
                $existingInvitation = HomeGroupInvitation::where('homegroup_id', $homeGroup->id)
                    ->where('member_id', $member->id)
                    ->where('status', 'pending')
                    ->lockForUpdate()
                    ->first();

                if ($existingInvitation) {
                    throw new \Exception('A pending invitation already exists for this member.');
                }

                // Create invitation with explicit column mapping
                $invitation = HomeGroupInvitation::create([
                    'homegroup_id' => $homeGroup->id,
                    'member_id' => $member->id, // This should reference users.id
                    'pastor_id' => $pastor->id,
                    'status' => 'pending',
                    'message' => $validated['message'] ?? null,
                    'invited_at' => now(),
                ]);

                Log::info('Homegroup invitation created successfully', [
                    'invitation_id' => $invitation->id,
                    'homegroup_id' => $homeGroup->id,
                    'member_id' => $member->id,
                    'pastor_id' => $pastor->id,
                ]);

                return [
                    'invitation' => $invitation,
                    'homeGroup' => $homeGroup,
                    'member' => $member,
                    'pastor' => $pastor,
                ];
            }, 3); // Retry up to 3 times on deadlock

            // Send notification outside transaction for performance
            NotificationService::createHomeGroupInvitation(
                $result['member'],
                $result['homeGroup'],
                $result['pastor']
            );

            return response()->json([
                'success' => true,
                'message' => 'Invitation sent successfully.',
                'invitation' => $result['invitation']->load(['homeGroup', 'member', 'requester']),
            ], 201);

        } catch (\Illuminate\Database\QueryException $e) {
            $errorCode = $e->getCode();
            $errorMessage = $e->getMessage();

            Log::error('Database constraint violation in invitation creation', [
                'error_code' => $errorCode,
                'sql_state' => $e->errorInfo[0] ?? 'Unknown',
                'driver_code' => $e->errorInfo[1] ?? 'Unknown',
                'driver_message' => $e->errorInfo[2] ?? 'Unknown',
                'homegroup_id' => $id,
                'member_id' => $validated['member_id'],
                'pastor_id' => $pastor->id,
                'full_message' => $errorMessage,
            ]);

            // Handle specific constraint violations
            if (str_contains($errorMessage, 'home_group_id_user_id_unique')) {
                return response()->json([
                    'success' => false,
                    'message' => 'A pending invitation already exists for this member and home group.',
                ], 409);
            }

            if (str_contains($errorMessage, 'foreign key constraint')) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid reference: member or home group may not exist.',
                ], 400);
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to create invitation due to a database constraint error.',
            ], 500);

        } catch (\Exception $e) {
            Log::error('Unexpected error in invitation creation', [
                'error_type' => get_class($e),
                'error_message' => $e->getMessage(),
                'homegroup_id' => $id,
                'member_id' => $validated['member_id'],
                'pastor_id' => $pastor->id,
                'stack_trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'An unexpected error occurred while creating the invitation.',
            ], 500);
        }
    }

    /**
      * Member: List my homegroup invitations
      * GET /api/homegroup-invitations
      */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $invitations = HomeGroupInvitation::with(['homeGroup.zone', 'requester'])
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

        $invitation = HomeGroupInvitation::with(['homeGroup.zone', 'requester'])
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
      * Member Flow: Request to join a home group (Self-Service)
      * POST /api/homegroups/{id}/request
      */
    public function requestJoin(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $message = $request->input('message', null);

        // Only members can request to join
        if (!$user->isMember()) {
            return response()->json([
                'success' => false,
                'message' => 'Only members can request to join home groups.',
            ], 403);
        }

        // Find home group in user's zone
        $homeGroup = HomeGroup::where('zone_id', $user->zone_id)->find($id);
        if (!$homeGroup) {
            return response()->json([
                'success' => false,
                'message' => 'Home group not found in your zone.',
            ], 404);
        }

        // Check if user is already a member of this home group
        if ($user->home_group_id === $homeGroup->id) {
            return response()->json([
                'success' => false,
                'message' => 'You are already a member of this home group.',
            ], 400);
        }

        // Check for existing pending request
        $existingRequest = HomeGroupInvitation::where('homegroup_id', $homeGroup->id)
            ->where('member_id', $user->id)
            ->where('status', 'pending')
            ->first();

        if ($existingRequest) {
            return response()->json([
                'success' => false,
                'message' => 'You already have a pending request for this home group.',
            ], 409);
        }

        try {
            $request = DB::transaction(function () use ($homeGroup, $user, $message) {
                return HomeGroupInvitation::firstOrCreate(
                    [
                        'homegroup_id' => $homeGroup->id,
                        'member_id' => $user->id,
                        'status' => 'pending',
                    ],
                    [
                        'requested_by' => $user->id, // Self-requested
                        'message' => $message,
                        'invited_at' => now(),
                        'is_request' => true, // Flag to distinguish from pastor invitations
                    ]
                );
            });

            if ($request->wasRecentlyCreated) {
                // Notify home group leader (if exists)
                if ($homeGroup->leader) {
                    $this->notifyLeaderOfJoinRequest($homeGroup->leader, $homeGroup, $user, $request);
                }

                // Log activity
                AuditLog::create([
                    'user_id' => $user->id,
                    'action' => 'homegroup_join_requested',
                    'actor_id' => $user->id,
                    'subject_type' => User::class,
                    'subject_id' => $user->id,
                    'target_type' => HomeGroup::class,
                    'target_id' => $homeGroup->id,
                    'details' => [
                        'request_id' => $request->id,
                        'message' => $message,
                    ],
                    'occurred_at' => now(),
                ]);

                Log::info('Homegroup join request created (Member Flow)', [
                    'homegroup_id' => $homeGroup->id,
                    'member_id' => $user->id,
                    'request_id' => $request->id,
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Join request sent successfully. You will be notified once it\'s reviewed.',
                    'request' => $request->load(['homeGroup', 'member']),
                ], 201);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'You already have a pending request for this home group.',
                ], 409);
            }

        } catch (\Illuminate\Database\QueryException $e) {
            if ($e->getCode() === '23000') {
                return response()->json([
                    'success' => false,
                    'message' => 'A request already exists for this home group.',
                ], 409);
            }

            Log::error('Database error during join request', [
                'error' => $e->getMessage(),
                'homegroup_id' => $id,
                'user_id' => $user->id,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create join request.',
            ], 500);
        }
    }

    /**
      * Member: Accept invitation (Atomic operation)
      * POST /api/homegroup-invitations/{id}/accept
      */
    public function accept(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        $invitation = HomeGroupInvitation::where('id', $id)
            ->where('member_id', $user->id)
            ->lockForUpdate() // Prevent concurrent modifications
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

        try {
            DB::transaction(function () use ($invitation, $user) {
                // Update invitation status
                $invitation->update([
                    'status' => 'accepted',
                    'responded_at' => now(),
                ]);

                // Add member to home group (FIXED: home_group_id not homegroup_id)
                $user->update(['home_group_id' => $invitation->homegroup_id]);

                // Notify requester (pastor or system)
                if ($invitation->requester && $invitation->requester->id !== $user->id) {
                    $this->notifyRequesterOfAcceptance($invitation->requester, $invitation->homeGroup, $user);
                }

                // Log activity
                AuditLog::create([
                    'user_id' => $user->id,
                    'action' => 'homegroup_invitation_accepted',
                    'actor_id' => $user->id,
                    'subject_type' => HomeGroupInvitation::class,
                    'subject_id' => $invitation->id,
                    'target_type' => HomeGroup::class,
                    'target_id' => $invitation->homegroup_id,
                    'details' => ['invitation_id' => $invitation->id],
                    'occurred_at' => now(),
                ]);
            });

            Log::info('Homegroup invitation accepted', [
                'invitation_id' => $id,
                'user_id' => $user->id,
                'homegroup_id' => $invitation->homegroup_id,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Invitation accepted. You are now a member of ' . $invitation->homeGroup->name,
                'invitation' => $invitation->fresh(['homeGroup']),
            ]);

        } catch (\Exception $e) {
            Log::error('Error accepting invitation', [
                'invitation_id' => $id,
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to accept invitation. Please try again.',
            ], 500);
        }
    }

    /**
      * Member: Decline invitation (Atomic operation)
      * POST /api/homegroup-invitations/{id}/decline
      */
    public function decline(Request $request, int $id): JsonResponse
    {
        $user = $request->user();
        $note = $request->input('note', null);

        $invitation = HomeGroupInvitation::where('id', $id)
            ->where('member_id', $user->id)
            ->lockForUpdate()
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

        try {
            DB::transaction(function () use ($invitation, $user, $note) {
                // Update invitation status
                $invitation->update([
                    'status' => 'declined',
                    'responded_at' => now(),
                    'response_note' => $note,
                ]);

                // Notify requester if different from user
                if ($invitation->requester && $invitation->requester->id !== $user->id) {
                    $this->notifyRequesterOfDecline($invitation->requester, $invitation->homeGroup, $user, $note);
                }

                // Log activity
                AuditLog::create([
                    'user_id' => $user->id,
                    'action' => 'homegroup_invitation_declined',
                    'actor_id' => $user->id,
                    'subject_type' => HomeGroupInvitation::class,
                    'subject_id' => $invitation->id,
                    'target_type' => HomeGroup::class,
                    'target_id' => $invitation->homegroup_id,
                    'details' => [
                        'invitation_id' => $invitation->id,
                        'decline_note' => $note
                    ],
                    'occurred_at' => now(),
                ]);
            });

            Log::info('Homegroup invitation declined', [
                'invitation_id' => $id,
                'user_id' => $user->id,
                'homegroup_id' => $invitation->homegroup_id,
                'note' => $note,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Invitation declined.',
                'invitation' => $invitation->fresh(),
            ]);

        } catch (\Exception $e) {
            Log::error('Error declining invitation', [
                'invitation_id' => $id,
                'user_id' => $user->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to decline invitation. Please try again.',
            ], 500);
        }
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
            ->where('requested_by', $pastor->id)
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
            'requested_by' => $pastor->id,
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

        $invitations = HomeGroupInvitation::with(['user', 'homeGroup'])
            ->where('requested_by', $pastor->id)
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

        $count = HomeGroupInvitation::where('requested_by', $pastor->id)
            ->where('status', 'pending')
            ->count();

        return response()->json([
            'success' => true,
            'count' => $count,
        ]);
    }

    // ============================================================================
    // PRIVATE HELPER METHODS
    // ============================================================================

    /**
      * Send notification to member about invitation
      */
    private function notifyMemberOfInvitation(User $member, HomeGroup $homeGroup, User $pastor, HomeGroupInvitation $invitation): void
    {
        $member->notifications()->create([
            'title' => 'Home Group Invitation',
            'message' => "Pastor {$pastor->name} has invited you to join {$homeGroup->name} home group.",
            'category' => 'homegroup',
            'type' => 'invitation',
        ]);
    }

    /**
      * Send notification to home group leader about join request
      */
    private function notifyLeaderOfJoinRequest(User $leader, HomeGroup $homeGroup, User $member, HomeGroupInvitation $request): void
    {
        $leader->notifications()->create([
            'title' => 'Home Group Join Request',
            'message' => "{$member->name} has requested to join {$homeGroup->name} home group.",
            'category' => 'homegroup',
            'type' => 'join_request',
        ]);
    }

    /**
      * Send notification to requester about acceptance
      */
    private function notifyRequesterOfAcceptance(User $requester, HomeGroup $homeGroup, User $member): void
    {
        $requester->notifications()->create([
            'title' => 'Home Group Invitation Accepted',
            'message' => "{$member->name} has accepted the invitation to join {$homeGroup->name}.",
            'category' => 'homegroup',
            'type' => 'invitation_accepted',
        ]);
    }

    /**
      * Send notification to requester about decline
      */
    private function notifyRequesterOfDecline(User $requester, HomeGroup $homeGroup, User $member, ?string $note): void
    {
        $message = "{$member->name} has declined the invitation to join {$homeGroup->name}.";
        if ($note) {
            $message .= " Note: {$note}";
        }

        $requester->notifications()->create([
            'title' => 'Home Group Invitation Declined',
            'message' => $message,
            'category' => 'homegroup',
            'type' => 'invitation_declined',
        ]);
    }
}