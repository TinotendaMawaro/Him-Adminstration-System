<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * A person's notifications.
 *
 * Two kinds share the table: a MESSAGE someone sent (it belongs in the inbox) and a NOTIFICATION about something
 * that happened (a member joined, a report is due…), which belongs in the notifications tab. Each row says which it is
 * (`kind`), and for a message which conversation to open (`related_id`).
 *
 * Tabs: unread · read · archived. A person archives what they want out of the way; clearing deletes only read ones.
 */
class NotificationController extends Controller
{
    /** GET /api/notifications?tab=unread|read|archived|all&kind=notification|message&page=&per_page= */
    public function index(Request $request): JsonResponse
    {
        $me = $request->user();

        $query = Notification::where('user_id', $me->id);

        $tab = $request->query('tab', 'all');
        $query = match ($tab) {
            'unread'   => $this->live($query)->where('is_read', false),
            'read'     => $this->live($query)->where('is_read', true),
            'archived' => Notification::hasArchive() ? $query->whereNotNull('archived_at') : $query->whereRaw('1 = 0'),
            default    => $this->live($query),
        };

        match ($request->query('kind')) {
            'message'      => $query->whereIn('category', Notification::MESSAGE_CATEGORIES),
            'notification' => $query->where(fn ($q) => $q->whereNull('category')->orWhereNotIn('category', Notification::MESSAGE_CATEGORIES)),
            default        => null,
        };

        $perPage = max(1, min(100, (int) ($request->query('per_page', $request->query('limit', 50)))));
        $page    = $query->orderByDesc('created_at')->orderByDesc('id')->paginate($perPage);

        $unread = $this->live(Notification::where('user_id', $me->id))->where('is_read', false);

        return response()->json([
            'notifications'        => $page->items(),
            'unread_count'         => (clone $unread)->count(),
            'unread_messages'      => (clone $unread)->whereIn('category', Notification::MESSAGE_CATEGORIES)->count(),
            'unread_notifications' => (clone $unread)->where(fn ($q) => $q->whereNull('category')->orWhereNotIn('category', Notification::MESSAGE_CATEGORIES))->count(),
            'meta' => [
                'page'      => $page->currentPage(),
                'last_page' => $page->lastPage(),
                'per_page'  => $page->perPage(),
                'total'     => $page->total(),
            ],
        ]);
    }

    /** GET /api/notifications/unread-count */
    public function unreadCount(Request $request): JsonResponse
    {
        $count = $this->live(Notification::where('user_id', $request->user()->id))->where('is_read', false)->count();

        return response()->json(['unread_count' => $count]);
    }

    /** PATCH|PUT /api/notifications/{id}/read */
    public function markAsRead(Request $request, int $id): JsonResponse
    {
        $notification = $this->mine($request, $id);
        if (!$notification) {
            return response()->json(['message' => 'Notification not found'], 404);
        }

        $notification->markAsRead();

        return response()->json(['message' => 'Notification marked as read', 'notification' => $notification->fresh()]);
    }

    /** PATCH|PUT /api/notifications/read-all  (optional ?kind=message|notification) */
    public function markAllRead(Request $request): JsonResponse
    {
        $query = $this->live(Notification::where('user_id', $request->user()->id))->where('is_read', false);

        match ($request->query('kind')) {
            'message'      => $query->whereIn('category', Notification::MESSAGE_CATEGORIES),
            'notification' => $query->where(fn ($q) => $q->whereNull('category')->orWhereNotIn('category', Notification::MESSAGE_CATEGORIES)),
            default        => null,
        };

        $query->update(['is_read' => true, 'read_at' => now()]);

        return response()->json(['message' => 'All notifications marked as read']);
    }

    /** POST /api/notifications/{id}/archive — out of the way, but kept (and counted as read). */
    public function archive(Request $request, int $id): JsonResponse
    {
        if (!Notification::hasArchive()) {
            return response()->json(['message' => 'Archiving is not available yet.'], 409);
        }

        $notification = $this->mine($request, $id);
        if (!$notification) {
            return response()->json(['message' => 'Notification not found'], 404);
        }

        $notification->forceFill(['archived_at' => now(), 'is_read' => true, 'read_at' => $notification->read_at ?? now()])->save();

        return response()->json(['message' => 'Notification archived', 'notification' => $notification->fresh()]);
    }

    /** DELETE /api/notifications/{id}/archive */
    public function unarchive(Request $request, int $id): JsonResponse
    {
        if (!Notification::hasArchive()) {
            return response()->json(['message' => 'Archiving is not available yet.'], 409);
        }

        $notification = $this->mine($request, $id);
        if (!$notification) {
            return response()->json(['message' => 'Notification not found'], 404);
        }

        $notification->forceFill(['archived_at' => null])->save();

        return response()->json(['message' => 'Notification restored', 'notification' => $notification->fresh()]);
    }

    /** DELETE /api/notifications/{id} */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $notification = $this->mine($request, $id);
        if (!$notification) {
            return response()->json(['message' => 'Notification not found'], 404);
        }

        $notification->delete();

        return response()->json(['message' => 'Notification deleted']);
    }

    /** DELETE /api/notifications/clear-read — deletes read notifications that are not archived. */
    public function clearRead(Request $request): JsonResponse
    {
        $this->live(Notification::where('user_id', $request->user()->id))->where('is_read', true)->delete();

        return response()->json(['message' => 'Read notifications cleared']);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    /** Not archived (when archiving exists). */
    private function live(Builder $query): Builder
    {
        return Notification::hasArchive() ? $query->whereNull('archived_at') : $query;
    }

    private function mine(Request $request, int $id): ?Notification
    {
        return Notification::where('id', $id)->where('user_id', $request->user()->id)->first();
    }
}
