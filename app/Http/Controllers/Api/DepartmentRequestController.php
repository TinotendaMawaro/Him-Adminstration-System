<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\DepartmentRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class DepartmentRequestController extends Controller
{
    /**
     * Get all available departments
     */
    public function departments(): JsonResponse
    {
        $departments = Department::orderBy('name')->get();
        
        return response()->json([
            'success' => true,
            'departments' => $departments,
        ]);
    }

    /**
     * Request to join a department
     */
    public function requestJoin(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'department_id' => 'required|exists:departments,id',
            'notes' => 'nullable|string|max:500',
        ]);

        $user = $request->user();

        // Check if user already belongs to a department
        if ($user->department_id) {
            return response()->json([
                'success' => false,
                'message' => 'You already belong to a department. Please contact your pastor to change departments.',
            ], 400);
        }

        // Check if there's already a pending request
        $existingRequest = DepartmentRequest::where('user_id', $user->id)
            ->where('status', 'pending')
            ->first();

        if ($existingRequest) {
            return response()->json([
                'success' => false,
                'message' => 'You already have a pending department request.',
            ], 400);
        }

        // Check if there's a rejected request for this department
        $rejectedRequest = DepartmentRequest::where('user_id', $user->id)
            ->where('department_id', $validated['department_id'])
            ->where('status', 'rejected')
            ->first();

        if ($rejectedRequest) {
            // Allow re-application after 30 days
            if ($rejectedRequest->approved_at && 
                $rejectedRequest->approved_at->diffInDays(now()) < 30) {
                return response()->json([
                    'success' => false,
                    'message' => 'You cannot reapply to this department within 30 days of rejection.',
                ], 400);
            }
        }

        // Create the request
        $departmentRequest = DepartmentRequest::create([
            'user_id' => $user->id,
            'department_id' => $validated['department_id'],
            'requested_by' => $user->id,
            'status' => 'pending',
            'notes' => $validated['notes'] ?? null,
        ]);

        // Notify the pastor and HOD about the new request
        $department = Department::find($validated['department_id']);
        $hod = $department ? $department->hodUser : null;

        // Notify HOD if exists
        if ($hod) {
            $hod->notifications()->create([
                'title' => 'New Department Join Request',
                'message' => "{$user->name} has requested to join {$department->name}. Please review the request.",
                'type' => 'department',
                'category' => 'join_request',
            ]);
        }

        // Also notify pastors in the zone
        $pastors = User::where('role', 'pastor')
            ->where('zone_id', $user->zone_id)
            ->get();
        foreach ($pastors as $pastor) {
            $pastor->notifications()->create([
                'title' => 'New Department Join Request',
                'message' => "{$user->name} has requested to join {$department->name}.",
                'type' => 'department',
                'category' => 'join_request',
            ]);
        }

        Log::info('Department join request created', [
            'user_id' => $user->id,
            'department_id' => $validated['department_id'],
            'request_id' => $departmentRequest->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Department join request submitted successfully. Please wait for pastoral approval.',
            'request' => $departmentRequest->load('department'),
        ]);
    }

    /**
     * Get user's department request status
     */
    public function myRequest(Request $request): JsonResponse
    {
        $user = $request->user();

        // Get current department
        if ($user->department_id) {
            return response()->json([
                'success' => true,
                'member' => [
                    'department' => $user->department,
                    'member_since' => $user->department ? $user->updated_at : null,
                ],
            ]);
        }

        // Get pending request
        $pendingRequest = DepartmentRequest::where('user_id', $user->id)
            ->where('status', 'pending')
            ->with('department')
            ->first();

        if ($pendingRequest) {
            return response()->json([
                'success' => true,
                'pending' => $pendingRequest,
            ]);
        }

        // Get rejected request
        $rejectedRequest = DepartmentRequest::where('user_id', $user->id)
            ->where('status', 'rejected')
            ->orderBy('updated_at', 'desc')
            ->with('department')
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

        $pendingRequest = DepartmentRequest::where('user_id', $user->id)
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
            'message' => 'Department request cancelled.',
        ]);
    }

    /**
     * Leave current department with reason
     */
    public function leaveDepartment(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        $user = $request->user();

        if (!$user->department_id) {
            return response()->json([
                'success' => false,
                'message' => 'You do not belong to a department.',
            ], 400);
        }

        // Check if user is HOD - HODs cannot leave without pastor approval
        $department = Department::find($user->department_id);

        if ($department->hod_id === $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'As a department HOD, please contact your pastor to transfer leadership before leaving.',
            ], 400);
        }

        // Remove from department_members pivot table
        $department->members()->detach($user->id);

        // Update user
        $user->update([
            'department_id' => null,
        ]);

        // Notify pastors and HOD about the member leaving
        $pastors = User::where('role', 'pastor')
            ->where('zone_id', $user->zone_id)
            ->get();

        $hod = $department->hodUser;

        foreach ($pastors as $pastor) {
            $pastor->notifications()->create([
                'title' => 'Member Left Department',
                'message' => "{$user->name} left {$department->name}. Reason: {$validated['reason']}",
                'type' => 'department',
                'category' => 'member_left',
            ]);
        }

        if ($hod && $hod->id !== $user->id) {
            $hod->notifications()->create([
                'title' => 'Member Left Department',
                'message' => "{$user->name} left your department. Reason: {$validated['reason']}",
                'type' => 'department',
                'category' => 'member_left',
            ]);
        }

        Log::info('User left department', [
            'user_id' => $user->id,
            'department_id' => $department->id,
            'reason' => $validated['reason'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'You have left the department.',
        ]);
    }

    /**
     * Get pending requests for pastor approval (Pastors & HODs only)
     */
    public function pendingApprovals(Request $request): JsonResponse
    {
        $user = $request->user();

        // Only pastors and HODs can view approval requests
        if (!$user->isPastor() && !$user->isHOD()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only pastors and HODs can view approval requests.',
            ], 403);
        }

        $query = DepartmentRequest::with(['user', 'department'])
            ->where('status', 'pending');

        // For HODs, only show requests for their department
        if ($user->isHOD() && $user->department_id) {
            $query->where('department_id', $user->department_id);
        }

        // For pastors, show requests from their zone's members
        if ($user->isPastor() && $user->zone_id) {
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
     * Approve department request (Pastors & HODs only)
     */
    public function approveRequest(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'notes' => 'nullable|string|max:500',
        ]);

        $user = $request->user();

        if (!$user->isPastor() && !$user->isHOD()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only pastors and HODs can approve requests.',
            ], 403);
        }

        $departmentRequest = DepartmentRequest::with(['user', 'department'])->find($id);

        if (!$departmentRequest) {
            return response()->json([
                'success' => false,
                'message' => 'Department request not found.',
            ], 404);
        }

        if ($departmentRequest->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'This request has already been processed.',
            ], 400);
        }

        // Authorization check
        if ($user->isHOD() && $user->department_id !== $departmentRequest->department_id) {
            return response()->json([
                'success' => false,
                'message' => 'You can only approve requests for your department.',
            ], 403);
        }

        if ($user->isPastor() && $user->zone_id) {
            $isZoneMember = User::where('id', $departmentRequest->user_id)
                ->where('zone_id', $user->zone_id)
                ->exists();

            if (!$isZoneMember) {
                return response()->json([
                    'success' => false,
                    'message' => 'You can only approve requests from your zone.',
                ], 403);
            }
        }

        // Approve the request
        $departmentRequest->approve($user, $validated['notes'] ?? null);

        // Notify the member about approval
        $member = $departmentRequest->user;
        $department = $departmentRequest->department;

        $member->notifications()->create([
            'title' => 'Department Request Approved',
            'message' => "Congratulations! Your request to join {$department->name} has been approved.",
            'type' => 'department',
            'category' => 'join_approved',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Department request approved successfully.',
            'request' => $departmentRequest->fresh(['user', 'department']),
        ]);
    }

    /**
     * Reject department request (Pastors & HODs only)
     */
    public function rejectRequest(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'notes' => 'nullable|string|max:500',
        ]);

        $user = $request->user();

        if (!$user->isPastor() && !$user->isHOD()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only pastors and HODs can reject requests.',
            ], 403);
        }

        $departmentRequest = DepartmentRequest::with(['user', 'department'])->find($id);

        if (!$departmentRequest) {
            return response()->json([
                'success' => false,
                'message' => 'Department request not found.',
            ], 404);
        }

        if ($departmentRequest->status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'This request has already been processed.',
            ], 400);
        }

        // Authorization check (same as approve)
        if ($user->isHOD() && $user->department_id !== $departmentRequest->department_id) {
            return response()->json([
                'success' => false,
                'message' => 'You can only reject requests for your department.',
            ], 403);
        }

        // Reject the request
        $departmentRequest->reject($user, $validated['notes'] ?? null);

        // Notify the member about rejection
        $member = $departmentRequest->user;
        $department = $departmentRequest->department;

        $notesMessage = $validated['notes'] ?? 'Please contact your pastor for more information.';
        $member->notifications()->create([
            'title' => 'Department Request Rejected',
            'message' => "Your request to join {$department->name} has been rejected. {$notesMessage}",
            'type' => 'department',
            'category' => 'join_rejected',
        ]);

        Log::info('Department request rejected', [
            'request_id' => $id,
            'rejected_by' => $user->id,
            'user_id' => $departmentRequest->user_id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Department request rejected.',
            'request' => $departmentRequest->fresh(['user', 'department']),
        ]);
    }
}
