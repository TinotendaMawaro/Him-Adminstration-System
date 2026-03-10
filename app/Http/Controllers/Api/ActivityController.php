<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Activity;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ActivityController extends Controller
{
    /**
     * Get all activities for a department.
     */
    public function index(Request $request)
    {
        $departmentId = $request->get('department_id');

        $activities = Activity::when($departmentId, function ($query) use ($departmentId) {
            return $query->where('department_id', $departmentId);
        })
        ->orderBy('date', 'asc')
        ->orderBy('time', 'asc')
        ->get();

        return response()->json([
            'activities' => $activities,
        ]);
    }

    /**
     * Get a single activity.
     */
    public function show($id)
    {
        $activity = Activity::findOrFail($id);

        return response()->json([
            'activity' => $activity,
        ]);
    }

    /**
     * Create a new activity.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'department_id' => 'required|exists:departments,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'date' => 'required|date',
            'time' => 'nullable',
            'location' => 'required|string|max:255',
            'type' => 'required|in:activity,event,meeting',
            'status' => 'nullable|in:draft,upcoming,in_progress,completed,cancelled',
        ]);

        $validated['created_by'] = Auth::id();
        $validated['status'] = $validated['status'] ?? 'draft';

        $activity = Activity::create($validated);

        return response()->json([
            'message' => 'Activity created successfully',
            'activity' => $activity,
        ], 201);
    }

    /**
     * Update an existing activity.
     */
    public function update(Request $request, $id)
    {
        $activity = Activity::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'date' => 'sometimes|date',
            'time' => 'nullable',
            'location' => 'sometimes|string|max:255',
            'type' => 'sometimes|in:activity,event,meeting',
            'status' => 'sometimes|in:draft,upcoming,in_progress,completed,cancelled',
        ]);

        $activity->update($validated);

        return response()->json([
            'message' => 'Activity updated successfully',
            'activity' => $activity,
        ]);
    }

    /**
     * Delete an activity.
     */
    public function destroy($id)
    {
        $activity = Activity::findOrFail($id);
        $activity->delete();

        return response()->json([
            'message' => 'Activity deleted successfully',
        ]);
    }

    /**
     * Update activity status.
     */
    public function updateStatus(Request $request, $id)
    {
        $activity = Activity::findOrFail($id);

        $validated = $request->validate([
            'status' => 'required|in:draft,upcoming,in_progress,completed,cancelled',
        ]);

        $activity->update(['status' => $validated['status']]);

        return response()->json([
            'message' => 'Activity status updated successfully',
            'activity' => $activity,
        ]);
    }

    /**
     * Get upcoming activities.
     */
    public function upcoming(Request $request)
    {
        $departmentId = $request->get('department_id');

        $activities = Activity::when($departmentId, function ($query) use ($departmentId) {
            return $query->where('department_id', $departmentId);
        })
        ->whereIn('status', ['upcoming', 'in_progress'])
        ->whereDate('date', '>=', now()->toDateString())
        ->orderBy('date', 'asc')
        ->orderBy('time', 'asc')
        ->limit(10)
        ->get();

        return response()->json([
            'activities' => $activities,
        ]);
    }
}
