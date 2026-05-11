<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HomeGroup;
use App\Models\HomeGroupReport;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class HomeGroupReportController extends Controller
{
    /**
     * Get reports for a home group (Leader/Pastor only)
     */
    public function index(int $homeGroupId): JsonResponse
    {
        $user = request()->user();
        $homeGroup = HomeGroup::find($homeGroupId);

        if (!$homeGroup) {
            return response()->json([
                'success' => false,
                'message' => 'Home group not found.',
            ], 404);
        }

        // Check permissions: leader of this group or pastor of the zone
        $isLeader = $homeGroup->leader_id === $user->id;
        $isPastor = $user->isPastor() && $user->zone_id === $homeGroup->zone_id;

        if (!$isLeader && !$isPastor) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to view these reports.',
            ], 403);
        }

        $reports = HomeGroupReport::where('home_group_id', $homeGroupId)
            ->with(['leader:id,name', 'approver:id,name'])
            ->orderBy('report_date', 'desc')
            ->get()
            ->map(function ($report) {
                return [
                    'id' => $report->id,
                    'title' => $report->title,
                    'content' => $report->content,
                    'report_date' => $report->report_date,
                    'attendance_count' => $report->attendance_count,
                    'challenges' => $report->challenges,
                    'prayer_requests' => $report->prayer_requests,
                    'testimonies' => $report->testimonies,
                    'status' => $report->status,
                    'submitted_at' => $report->submitted_at,
                    'approved_at' => $report->approved_at,
                    'review_notes' => $report->review_notes,
                    'leader' => $report->leader ? [
                        'id' => $report->leader->id,
                        'name' => $report->leader->name,
                    ] : null,
                    'approver' => $report->approver ? [
                        'id' => $report->approver->id,
                        'name' => $report->approver->name,
                    ] : null,
                ];
            });

        return response()->json([
            'success' => true,
            'reports' => $reports,
        ]);
    }

    /**
     * Create a new report (Leader only)
     */
    public function store(Request $request, int $homeGroupId): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string|max:2000',
            'report_date' => 'required|date',
            'attendance_count' => 'required|integer|min:0',
            'challenges' => 'nullable|string|max:1000',
            'prayer_requests' => 'nullable|string|max:1000',
            'testimonies' => 'nullable|string|max:1000',
        ]);

        $user = $request->user();
        $homeGroup = HomeGroup::find($homeGroupId);

        if (!$homeGroup) {
            return response()->json([
                'success' => false,
                'message' => 'Home group not found.',
            ], 404);
        }

        // Only leader can create reports
        if ($homeGroup->leader_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Only the home group leader can submit reports.',
            ], 403);
        }

        // Check if report already exists for this date
        $existingReport = HomeGroupReport::where('home_group_id', $homeGroupId)
            ->where('report_date', $validated['report_date'])
            ->first();

        if ($existingReport) {
            return response()->json([
                'success' => false,
                'message' => 'A report already exists for this date.',
            ], 400);
        }

        $report = HomeGroupReport::create([
            'home_group_id' => $homeGroupId,
            'leader_id' => $user->id,
            'title' => $validated['title'],
            'content' => $validated['content'],
            'report_date' => $validated['report_date'],
            'attendance_count' => $validated['attendance_count'],
            'challenges' => $validated['challenges'],
            'prayer_requests' => $validated['prayer_requests'],
            'testimonies' => $validated['testimonies'],
            'status' => 'draft',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Report created successfully.',
            'report' => [
                'id' => $report->id,
                'title' => $report->title,
                'status' => $report->status,
                'report_date' => $report->report_date,
            ],
        ], 201);
    }

    /**
     * Update a draft report (Leader only)
     */
    public function update(Request $request, int $homeGroupId, int $reportId): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'content' => 'sometimes|string|max:2000',
            'report_date' => 'sometimes|date',
            'attendance_count' => 'sometimes|integer|min:0',
            'challenges' => 'nullable|string|max:1000',
            'prayer_requests' => 'nullable|string|max:1000',
            'testimonies' => 'nullable|string|max:1000',
        ]);

        $user = $request->user();
        $homeGroup = HomeGroup::find($homeGroupId);

        if (!$homeGroup) {
            return response()->json([
                'success' => false,
                'message' => 'Home group not found.',
            ], 404);
        }

        // Only leader can update
        if ($homeGroup->leader_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Only the home group leader can update reports.',
            ], 403);
        }

        $report = HomeGroupReport::where('home_group_id', $homeGroupId)
            ->where('id', $reportId)
            ->first();

        if (!$report) {
            return response()->json([
                'success' => false,
                'message' => 'Report not found.',
            ], 404);
        }

        // Can only update draft reports
        if ($report->status !== 'draft') {
            return response()->json([
                'success' => false,
                'message' => 'Only draft reports can be updated.',
            ], 400);
        }

        $report->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Report updated successfully.',
            'report' => $report->fresh(),
        ]);
    }

    /**
     * Submit a draft report (Leader only)
     */
    public function submit(Request $request, int $homeGroupId, int $reportId): JsonResponse
    {
        $user = $request->user();
        $homeGroup = HomeGroup::find($homeGroupId);

        if (!$homeGroup) {
            return response()->json([
                'success' => false,
                'message' => 'Home group not found.',
            ], 404);
        }

        // Only leader can submit
        if ($homeGroup->leader_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Only the home group leader can submit reports.',
            ], 403);
        }

        $report = HomeGroupReport::where('home_group_id', $homeGroupId)
            ->where('id', $reportId)
            ->first();

        if (!$report) {
            return response()->json([
                'success' => false,
                'message' => 'Report not found.',
            ], 404);
        }

        if ($report->status !== 'draft') {
            return response()->json([
                'success' => false,
                'message' => 'Report has already been submitted.',
            ], 400);
        }

        $report->submit();

        // Notify pastors about the submitted report
        $pastors = User::where('role', 'pastor')
            ->where('zone_id', $homeGroup->zone_id)
            ->get();

        foreach ($pastors as $pastor) {
            $pastor->notifications()->create([
                'title' => 'Home Group Report Submitted',
                'message' => "{$user->name} submitted a report for {$homeGroup->name}: {$report->title}",
                'type' => 'report',
                'category' => 'home_group_report',
            ]);
        }

        Log::info('Home group report submitted', [
            'report_id' => $reportId,
            'home_group_id' => $homeGroupId,
            'submitted_by' => $user->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Report submitted successfully.',
            'report' => $report->fresh(),
        ]);
    }

    /**
     * Approve/reject report (Pastor only)
     */
    public function review(Request $request, int $homeGroupId, int $reportId): JsonResponse
    {
        $validated = $request->validate([
            'action' => 'required|in:approve,reject',
            'notes' => 'nullable|string|max:500',
        ]);

        $user = $request->user();
        $homeGroup = HomeGroup::find($homeGroupId);

        if (!$homeGroup) {
            return response()->json([
                'success' => false,
                'message' => 'Home group not found.',
            ], 404);
        }

        // Only pastors can review
        if (!$user->isPastor() || $user->zone_id !== $homeGroup->zone_id) {
            return response()->json([
                'success' => false,
                'message' => 'Only pastors in this zone can review reports.',
            ], 403);
        }

        $report = HomeGroupReport::where('home_group_id', $homeGroupId)
            ->where('id', $reportId)
            ->first();

        if (!$report) {
            return response()->json([
                'success' => false,
                'message' => 'Report not found.',
            ], 404);
        }

        if ($report->status !== 'submitted') {
            return response()->json([
                'success' => false,
                'message' => 'Report is not in submitted status.',
            ], 400);
        }

        if ($validated['action'] === 'approve') {
            $report->approve($user, $validated['notes'] ?? null);

            // Notify the leader about approval
            $report->leader->notifications()->create([
                'title' => 'Report Approved',
                'message' => "Your report '{$report->title}' has been approved by {$user->name}.",
                'type' => 'report',
                'category' => 'report_approved',
            ]);
        } else {
            $report->reject($user, $validated['notes'] ?? null);

            // Notify the leader about rejection
            $report->leader->notifications()->create([
                'title' => 'Report Rejected',
                'message' => "Your report '{$report->title}' has been rejected by {$user->name}." .
                    ($validated['notes'] ? " Notes: {$validated['notes']}" : ''),
                'type' => 'report',
                'category' => 'report_rejected',
            ]);
        }

        Log::info('Home group report reviewed', [
            'report_id' => $reportId,
            'action' => $validated['action'],
            'reviewed_by' => $user->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => "Report {$validated['action']}d successfully.",
            'report' => $report->fresh(['leader', 'approver']),
        ]);
    }

    /**
     * Delete a draft report (Leader only)
     */
    public function destroy(Request $request, int $homeGroupId, int $reportId): JsonResponse
    {
        $user = $request->user();
        $homeGroup = HomeGroup::find($homeGroupId);

        if (!$homeGroup) {
            return response()->json([
                'success' => false,
                'message' => 'Home group not found.',
            ], 404);
        }

        // Only leader can delete
        if ($homeGroup->leader_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Only the home group leader can delete reports.',
            ], 403);
        }

        $report = HomeGroupReport::where('home_group_id', $homeGroupId)
            ->where('id', $reportId)
            ->first();

        if (!$report) {
            return response()->json([
                'success' => false,
                'message' => 'Report not found.',
            ], 404);
        }

        // Can only delete draft reports
        if ($report->status !== 'draft') {
            return response()->json([
                'success' => false,
                'message' => 'Only draft reports can be deleted.',
            ], 400);
        }

        $report->delete();

        return response()->json([
            'success' => true,
            'message' => 'Report deleted successfully.',
        ]);
    }
}
