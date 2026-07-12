<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PrayerCenterCategoryResource;
use App\Http\Resources\PrayerCenterMessageResource;
use App\Http\Resources\PrayerCenterReplyResource;
use App\Models\PrayerCenterCategory;
use App\Models\PrayerCenterMessage;
use App\Models\PrayerCenterReply;
use App\Models\User;
use App\Services\ContentModerator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class PrayerCenterController extends Controller
{
    public function __construct(private ContentModerator $moderator) {}

    public function categories(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data'    => PrayerCenterCategoryResource::collection(PrayerCenterCategory::orderBy('sort_order')->get()),
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        try {
            $user   = $request->user();
            $query  = PrayerCenterMessage::with(['category', 'replies.user', 'user'])->latest();

            if ($user->isPastor()) {
                $zoneId = $user->zone_id ?? 0;
                if ($zoneId > 0) {
                    $query->whereHas('user', function ($q) use ($zoneId) {
                        $q->where('zone_id', $zoneId);
                    });
                } else {
                    $query->where('id', 0);
                }
            } else {
                $query->where('user_id', $user->id);
            }

            if ($status = $request->query('status')) {
                $query->where('status', $status);
            }
            if ($categoryId = $request->query('category_id')) {
                $query->where('category_id', $categoryId);
            }
            if ($search = $request->query('search')) {
                $query->where(function ($q) use ($search) {
                    $q->where('subject', 'like', "%{$search}%")
                      ->orWhere('message', 'like', "%{$search}%");
                });
            }

            $messages = $query->paginate(20);

            return response()->json([
                'success' => true,
                'data'    => PrayerCenterMessageResource::collection($messages),
                'meta'    => [
                    'total'  => $messages->total(),
                    'unread' => PrayerCenterMessage::where('user_id', $user->id)
                        ->whereNull('read_at')
                        ->count(),
                ],
            ]);
        } catch (\Throwable $e) {
            \Log::error('PrayerCenter index error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'user_id' => $request->user()?->id,
                'user_role' => $request->user()?->role?->value ?? $request->user()?->role,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to load prayer center messages.',
                'debug' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'category_id' => ['required', 'exists:prayer_center_categories,id'],
            'subject'     => ['required', 'string', 'max:255'],
            'message'     => ['required', 'string', 'max:5000'],
            'priority'    => ['nullable', Rule::in(['low', 'normal', 'high', 'urgent'])],
        ]);

        $recentCount = PrayerCenterMessage::where('user_id', $user->id)
            ->where('created_at', '>=', now()->subHour())
            ->count();

        if ($recentCount >= 5) {
            return response()->json([
                'success' => false,
                'message' => 'You have reached the submission limit. Please try again later.',
            ], 429);
        }

        $moderationResult = $this->moderator->moderate(
            $validated['subject'],
            $validated['message']
        );

        $priority = $validated['priority'] ?? 'normal';
        if ($moderationResult['score'] >= 3) {
            $priority = 'high';
        }

        $message = PrayerCenterMessage::create([
            'user_id'          => $user->id,
            'category_id'      => $validated['category_id'],
            'subject'          => $validated['subject'],
            'message'          => $moderationResult['status'] !== \App\Enums\PrayerMessageStatus::Rejected
                ? $validated['message']
                : '[Content removed by moderation]',
            'message_original' => $validated['message'],
            'status'           => $moderationResult['status'],
            'priority'         => $priority,
            'metadata'         => [
                'moderation_score'      => $moderationResult['score'],
                'moderation_violations' => $moderationResult['violations'],
            ],
        ]);

        if ($moderationResult['status'] !== \App\Enums\PrayerMessageStatus::Rejected) {
            $this->notifyPastors($message, $user);
        }

        return response()->json([
            'success' => true,
            'data'    => new PrayerCenterMessageResource($message->load('category')),
            'message' => $moderationResult['status'] === \App\Enums\PrayerMessageStatus::Rejected
                ? 'Your message could not be processed. Please review our community guidelines.'
                : 'Your message has been submitted successfully.',
        ], $moderationResult['status'] === \App\Enums\PrayerMessageStatus::Rejected ? 422 : 201);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $user   = $request->user();
        $message = PrayerCenterMessage::with(['category', 'replies.user'])->findOrFail($id);

        if (!$user->isPastor() && $message->user_id !== $user->id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        if ($message->user_id === $user->id && is_null($message->read_at)) {
            $message->update(['read_at' => now()]);
        }

        // Mark replies from other users as read when viewing the message
        $message->replies()
            ->where('user_id', '!=', $user->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json([
            'success' => true,
            'data'    => new PrayerCenterMessageResource($message),
        ]);
    }

    public function reply(Request $request, int $id): JsonResponse
    {
        $user    = $request->user();
        $message = PrayerCenterMessage::with('category')->findOrFail($id);

        if (!$user->isPastor() && $message->user_id !== $user->id) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'reply'      => ['required', 'string', 'max:5000'],
            'type'       => ['nullable', Rule::in(['pastor_reply', 'member_followup', 'system_note'])],
            'is_internal'=> ['nullable', 'boolean'],
        ]);

        $type = $validated['type'] ?? ($user->isPastor() ? 'pastor_reply' : 'member_followup');

        $reply = PrayerCenterReply::create([
            'message_id'  => $message->id,
            'user_id'     => $user->id,
            'reply'       => $validated['reply'],
            'type'        => $type,
            'is_internal' => $validated['is_internal'] ?? false,
            'read_at'     => $type === 'system_note' ? now() : null,
        ]);

        $message->update([
            'status'       => $type === 'pastor_reply' ? \App\Enums\PrayerMessageStatus::InProgress : $message->status,
            'responded_at' => $type === 'pastor_reply' ? now() : $message->responded_at,
        ]);

        if ($type === 'pastor_reply') {
            \App\Models\Notification::create([
                'user_id'     => $message->user_id,
                'title'       => 'New reply to your ' . $message->category->label,
                'message'     => $validated['reply'],
                'type'        => 'prayer_reply',
                'category'    => 'prayer_center',
                'is_read'     => false,
            ]);
        } elseif ($type === 'member_followup') {
            $lastPastorReply = $message->replies()
                ->where('type', 'pastor_reply')
                ->latest()
                ->first();

            if ($lastPastorReply) {
                \App\Models\Notification::create([
                    'user_id'     => $lastPastorReply->user_id,
                    'title'       => 'Follow-up from ' . $user->name,
                    'message'     => $validated['reply'],
                    'type'        => 'prayer_followup',
                    'category'    => 'prayer_center',
                    'is_read'     => false,
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'data'    => new PrayerCenterReplyResource($reply->load('user')),
        ]);
    }

    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        if (!$user->isPastor()) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'status'   => ['required', Rule::in([
                \App\Enums\PrayerMessageStatus::Pending->value,
                \App\Enums\PrayerMessageStatus::Approved->value,
                \App\Enums\PrayerMessageStatus::Flagged->value,
                \App\Enums\PrayerMessageStatus::InProgress->value,
                \App\Enums\PrayerMessageStatus::Resolved->value,
                \App\Enums\PrayerMessageStatus::TestimonyApproved->value,
            ])],
            'priority' => ['nullable', Rule::In(['low', 'normal', 'high', 'urgent'])],
        ]);

        $message = PrayerCenterMessage::findOrFail($id);
        $message->update($validated);

        \App\Models\Notification::create([
            'user_id'     => $message->user_id,
            'title'       => 'Your ' . $message->category->label . ' has been updated',
            'message'     => 'Status changed to: ' . $validated['status'],
            'type'        => 'prayer_status',
            'category'    => 'prayer_center',
            'is_read'     => false,
        ]);

        return response()->json([
            'success' => true,
            'data'    => new PrayerCenterMessageResource($message->load('category')),
        ]);
    }

    public function notifications(Request $request): JsonResponse
    {
        $notifications = \App\Models\Notification::where('user_id', $request->user()->id)
            ->where('category', 'prayer_center')
            ->latest()
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data'    => $notifications,
        ]);
    }

    public function flagged(Request $request): JsonResponse
    {
        $messages = PrayerCenterMessage::with(['category', 'user'])
            ->where('status', \App\Enums\PrayerMessageStatus::Flagged)
            ->latest()
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data'    => PrayerCenterMessageResource::collection($messages),
        ]);
    }

    public function stats(Request $request): JsonResponse
    {
        try {
            $user   = $request->user();
            $zoneId = $user->zone_id;

            if (empty($zoneId)) {
                return response()->json([
                    'success' => true,
                    'data'    => [
                        'total_messages' => 0,
                        'pending'        => 0,
                        'flagged'        => 0,
                        'in_progress'    => 0,
                        'resolved'       => 0,
                        'by_category'    => [],
                    ],
                ]);
            }

            $byCategory = PrayerCenterMessage::whereHas('user', fn ($q) => $q->where('zone_id', $zoneId))
                ->selectRaw('category_id, count(*) as count')
                ->groupBy('category_id')
                ->get()
                ->map(fn ($item) => [
                    'category_id' => $item->category_id,
                    'count'       => $item->count,
                    'category'    => \App\Models\PrayerCenterCategory::find($item->category_id)?->only(['id', 'name', 'label', 'color']),
                ])
                ->filter(fn ($item) => $item['category'] !== null)
                ->values();

            $stats = [
                'total_messages' => PrayerCenterMessage::whereHas('user', fn ($q) => $q->where('zone_id', $zoneId))->count(),
                'pending'        => PrayerCenterMessage::where('status', \App\Enums\PrayerMessageStatus::Pending)->whereHas('user', fn ($q) => $q->where('zone_id', $zoneId))->count(),
                'flagged'        => PrayerCenterMessage::where('status', \App\Enums\PrayerMessageStatus::Flagged)->whereHas('user', fn ($q) => $q->where('zone_id', $zoneId))->count(),
                'in_progress'    => PrayerCenterMessage::where('status', \App\Enums\PrayerMessageStatus::InProgress)->whereHas('user', fn ($q) => $q->where('zone_id', $zoneId))->count(),
                'resolved'       => PrayerCenterMessage::where('status', \App\Enums\PrayerMessageStatus::Resolved)->whereHas('user', fn ($q) => $q->where('zone_id', $zoneId))->count(),
                'by_category'    => $byCategory,
            ];

            return response()->json(['success' => true, 'data' => $stats]);
        } catch (\Throwable $e) {
            \Log::error('PrayerCenter stats error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'user_id' => $request->user()?->id,
                'zone_id' => $request->user()?->zone_id,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to load prayer center stats.',
                'debug'   => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    private function notifyPastors(PrayerCenterMessage $message, User $submitter): void
    {
        $pastors = User::where('role', \App\Enums\UserRole::Pastor)
            ->where('zone_id', $submitter->zone_id)
            ->get();

        foreach ($pastors as $pastor) {
            \App\Models\Notification::create([
                'user_id'     => $pastor->id,
                'title'       => 'New ' . $message->category->label,
                'message'     => $message->subject,
                'type'        => 'prayer_new_message',
                'category'    => 'prayer_center',
                'is_read'     => false,
            ]);
        }
    }
}
