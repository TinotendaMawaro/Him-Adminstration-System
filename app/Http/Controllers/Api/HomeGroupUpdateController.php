<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\HomeGroup;
use App\Models\HomeGroupUpdate;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class HomeGroupUpdateController extends Controller
{
    /**
     * Get all updates for a home group
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

        // Check if user is a member of this home group
        if (!$user->home_group_id || $user->home_group_id !== $homeGroupId) {
            return response()->json([
                'success' => false,
                'message' => 'You must be a member of this home group to view updates.',
            ], 403);
        }

        $updates = $homeGroup->updates()
            ->with('user:id,name,profile_photo')
            ->get()
            ->map(function ($update) {
                return [
                    'id' => $update->id,
                    'title' => $update->title,
                    'content' => $update->content,
                    'type' => $update->type,
                    'is_pinned' => $update->is_pinned,
                    'published_at' => $update->published_at,
                    'author' => [
                        'id' => $update->user->id,
                        'name' => $update->user->name,
                        'photo' => $update->user->profile_photo,
                    ],
                ];
            });

        return response()->json([
            'success' => true,
            'updates' => $updates,
        ]);
    }

    /**
     * Create a new update (Leader only)
     */
    public function store(Request $request, int $homeGroupId): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string|max:2000',
            'type' => 'required|in:announcement,prayer_request,event,general',
            'is_pinned' => 'boolean',
        ]);

        $user = $request->user();
        $homeGroup = HomeGroup::find($homeGroupId);

        if (!$homeGroup) {
            return response()->json([
                'success' => false,
                'message' => 'Home group not found.',
            ], 404);
        }

        // Only leader can post updates
        if ($homeGroup->leader_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Only the home group leader can post updates.',
            ], 403);
        }

        $update = HomeGroupUpdate::create([
            'home_group_id' => $homeGroupId,
            'user_id' => $user->id,
            'title' => $validated['title'],
            'content' => $validated['content'],
            'type' => $validated['type'],
            'is_pinned' => $validated['is_pinned'] ?? false,
        ]);

        // Notify all members except the leader
        $members = User::where('home_group_id', $homeGroupId)
            ->where('id', '!=', $user->id)
            ->get();

        foreach ($members as $member) {
            $member->notifications()->create([
                'title' => 'New Home Group Update',
                'message' => "{$user->name} posted a new update: {$validated['title']}",
                'type' => 'home_group',
                'category' => 'update_posted',
            ]);
        }

        Log::info('Home group update created', [
            'home_group_id' => $homeGroupId,
            'update_id' => $update->id,
            'posted_by' => $user->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Update posted successfully.',
            'update' => [
                'id' => $update->id,
                'title' => $update->title,
                'content' => $update->content,
                'type' => $update->type,
                'is_pinned' => $update->is_pinned,
                'published_at' => $update->published_at,
                'author' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'photo' => $user->profile_photo,
                ],
            ],
        ], 201);
    }

    /**
     * Update an existing update (Leader only)
     */
    public function update(Request $request, int $homeGroupId, int $updateId): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'content' => 'sometimes|string|max:2000',
            'type' => 'sometimes|in:announcement,prayer_request,event,general',
            'is_pinned' => 'boolean',
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
                'message' => 'Only the home group leader can update posts.',
            ], 403);
        }

        $update = HomeGroupUpdate::where('home_group_id', $homeGroupId)
            ->where('id', $updateId)
            ->first();

        if (!$update) {
            return response()->json([
                'success' => false,
                'message' => 'Update not found.',
            ], 404);
        }

        $update->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Update updated successfully.',
            'update' => $update->fresh(),
        ]);
    }

    /**
     * Delete an update (Leader only)
     */
    public function destroy(Request $request, int $homeGroupId, int $updateId): JsonResponse
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
                'message' => 'Only the home group leader can delete posts.',
            ], 403);
        }

        $update = HomeGroupUpdate::where('home_group_id', $homeGroupId)
            ->where('id', $updateId)
            ->first();

        if (!$update) {
            return response()->json([
                'success' => false,
                'message' => 'Update not found.',
            ], 404);
        }

        $update->delete();

        return response()->json([
            'success' => true,
            'message' => 'Update deleted successfully.',
        ]);
    }
}
