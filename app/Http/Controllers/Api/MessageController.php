<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\HomeGroup;
use App\Models\Message;
use App\Models\Notification;
use App\Models\Pastor;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

/**
 * Person-to-person messages and department announcements.
 *
 * Who may talk to whom (enforced here, never by the browser):
 *   - direct messages: between two active people in the SAME ZONE (a zone is the unit of pastoral care);
 *   - announcements / notices: from the department's HOD, a pastor of the department's zone, or master;
 *   - member lists of a department: the same three, plus the department's own members.
 */
class MessageController extends Controller
{
    private const MAX_LENGTH = 2000;

    // ─── Conversations ────────────────────────────────────────────────────────

    /** GET /api/messages/conversations */
    public function conversations(Request $request): JsonResponse
    {
        $me = $request->user();

        $threads = Message::where('recipient_type', 'user')
            ->where(fn ($q) => $q->where('sender_id', $me->id)->orWhere('receiver_id', $me->id))
            ->latest()->limit(1000)->get()
            ->groupBy(fn (Message $m) => $m->sender_id === $me->id ? $m->receiver_id : $m->sender_id);

        $contacts = User::whereIn('id', $threads->keys())->get()->keyBy('id');
        $leaders  = HomeGroup::whereIn('leader_id', $threads->keys())->pluck('leader_id')->flip();

        $rows = $threads->map(function (Collection $messages, int $contactId) use ($me, $contacts, $leaders) {
            $contact = $contacts->get($contactId);
            if (!$contact) {
                return null;
            }

            $last = $messages->first();

            return [
                'id'              => $contact->id,
                'name'            => $contact->name,
                'role'            => $this->roleLabel($contact, $leaders->has($contact->id)),
                'avatar'          => $this->initials($contact->name),
                'color'           => $contact->isPastor() ? 'from-amber-400 to-amber-600' : 'from-sky-400 to-sky-600',
                'unread'          => $messages->where('receiver_id', $me->id)->where('is_read', false)->count(),
                'lastMessage'     => $last->content,
                'lastMessageTime' => $last->created_at->diffForHumans(),
                '_at'             => $last->created_at->timestamp,
            ];
        })->filter()->sortByDesc('_at')->map(fn ($r) => collect($r)->except('_at')->all())->values();

        return response()->json(['success' => true, 'conversations' => $rows]);
    }

    /** GET /api/messages/conversation/{contactId} — the thread with one person; marks theirs as read. */
    public function conversation(Request $request, int $contactId): JsonResponse
    {
        $me = $request->user();

        $messages = Message::with('sender:id,name')
            ->where('recipient_type', 'user')
            ->where(fn ($q) => $q->where(fn ($a) => $a->where('sender_id', $me->id)->where('receiver_id', $contactId))
                ->orWhere(fn ($b) => $b->where('sender_id', $contactId)->where('receiver_id', $me->id)))
            ->orderBy('created_at')->limit(500)->get();

        Message::where('sender_id', $contactId)->where('receiver_id', $me->id)->where('is_read', false)->update(['is_read' => true]);

        return response()->json(['success' => true, 'messages' => $messages->map(fn (Message $m) => $this->present($m, $me))->values()]);
    }

    // ─── Sending ──────────────────────────────────────────────────────────────

    /** POST /api/messages/direct */
    public function sendDirect(Request $request): JsonResponse
    {
        $data = $request->validate([
            'receiver_id' => ['required', 'integer', 'exists:users,id'],
            'content'     => ['required', 'string', 'max:' . self::MAX_LENGTH],
        ]);

        return $this->deliver($request->user(), (int) $data['receiver_id'], $data['content']);
    }

    /** POST /api/messages — the HOD portal's quick message to their zone pastor (recipient defaults to the lead pastor). */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'recipient_id' => ['nullable', 'integer', 'exists:users,id'],
            'receiver_id'  => ['nullable', 'integer', 'exists:users,id'],
            'content'      => ['required', 'string', 'max:' . self::MAX_LENGTH],
        ]);

        $to = $data['recipient_id'] ?? $data['receiver_id'] ?? $this->leadPastorId($request->user());
        if (!$to) {
            return response()->json(['success' => false, 'message' => 'There is no pastor assigned to your zone yet.'], 422);
        }

        return $this->deliver($request->user(), (int) $to, $data['content'], legacy: true);
    }

    /** GET /api/messages — your thread with your zone's lead pastor (HOD portal). */
    public function index(Request $request): JsonResponse
    {
        $me    = $request->user();
        $pastor = $this->leadPastorId($me);

        $messages = $pastor
            ? Message::with('sender:id,name')->where('recipient_type', 'user')
                ->where(fn ($q) => $q->where(fn ($a) => $a->where('sender_id', $me->id)->where('receiver_id', $pastor))
                    ->orWhere(fn ($b) => $b->where('sender_id', $pastor)->where('receiver_id', $me->id)))
                ->orderBy('created_at')->limit(200)->get()
            : collect();

        return response()->json([
            'success'  => true,
            'messages' => $messages->map(fn (Message $m) => $this->present($m, $me) + ['sender_id' => $m->sender_id])->values(),
        ]);
    }

    /** POST /api/messages/announcement */
    public function sendAnnouncement(Request $request): JsonResponse
    {
        return $this->broadcast($request, 'announcement');
    }

    /** POST /api/messages/notice */
    public function sendNotice(Request $request): JsonResponse
    {
        return $this->broadcast($request, 'notice');
    }

    // ─── Small reads ──────────────────────────────────────────────────────────

    /** GET /api/messages/unread-count */
    public function unreadCount(Request $request): JsonResponse
    {
        return response()->json([
            'success'      => true,
            'unread_count' => Message::where('receiver_id', $request->user()->id)->where('is_read', false)->count(),
        ]);
    }

    /** PUT /api/messages/{id}/read — only the recipient can mark their own message. */
    public function markAsRead(Request $request, int $id): JsonResponse
    {
        Message::where('id', $id)->where('receiver_id', $request->user()->id)->update(['is_read' => true]);

        return response()->json(['success' => true, 'message' => 'Message marked as read']);
    }

    /** GET /api/messages/announcements — announcements and notices sent to you through a department; marks them read. */
    public function announcements(Request $request): JsonResponse
    {
        $me = $request->user();

        $rows = Message::with(['sender:id,name', 'department:id,name'])
            ->where('receiver_id', $me->id)->where('recipient_type', 'department')
            ->latest()->limit(100)->get();

        Message::where('receiver_id', $me->id)->where('recipient_type', 'department')->where('is_read', false)->update(['is_read' => true]);

        return response()->json(['success' => true, 'announcements' => $rows->map(fn (Message $m) => [
            'id'         => $m->id,
            'type'       => $m->type,
            'senderId'   => $m->sender_id,
            'senderName' => $m->sender?->name,
            'department' => $m->department?->name,
            'content'    => $m->content,
            'created_at' => $m->created_at->toISOString(),
        ])->values()]);
    }

    /** GET /api/messages/pastor — unread messages from pastors. */
    public function pastorMessages(Request $request): JsonResponse
    {
        $me = $request->user();

        $messages = Message::with('sender:id,name')
            ->whereHas('sender', fn ($q) => $q->where('role', 'pastor'))
            ->where('receiver_id', $me->id)->where('is_read', false)
            ->latest()->limit(10)->get()
            ->map(fn (Message $m) => [
                'id'         => $m->id,
                'senderId'   => $m->sender_id,
                'senderName' => $m->sender?->name,
                'content'    => $m->content,
                'time'       => $m->created_at->diffForHumans(),
                'created_at' => $m->created_at->toISOString(),
            ])->values();

        return response()->json(['success' => true, 'messages' => $messages, 'count' => $messages->count()]);
    }

    /** GET /api/messages/department-members?department_id= */
    public function departmentMembers(Request $request): JsonResponse
    {
        $me = $request->user();
        $request->validate(['department_id' => ['required', 'integer', 'exists:departments,id']]);

        $department = Department::findOrFail($request->integer('department_id'));
        abort_unless($this->canManageDepartment($me, $department) || (int) $me->department_id === $department->id, 403, 'You cannot view this department.');

        $members = $this->audience($me, $department)->orderBy('name')->get()
            ->map(fn (User $u) => ['id' => $u->id, 'name' => $u->name, 'role' => $this->roleLabel($u, false), 'avatar' => $this->initials($u->name)])->values();

        return response()->json(['success' => true, 'members' => $members]);
    }

    // ─── Rules & helpers ──────────────────────────────────────────────────────

    private function deliver(User $from, int $toId, string $content, bool $legacy = false): JsonResponse
    {
        $to = User::find($toId);

        if (!$to || !$to->is_active || $to->id === $from->id) {
            return response()->json(['success' => false, 'message' => 'You cannot message this person.'], 422);
        }
        if (!$this->canMessage($from, $to)) {
            return response()->json(['success' => false, 'message' => 'You can only message people in your own zone.'], 403);
        }

        $message = Message::create([
            'sender_id' => $from->id, 'receiver_id' => $to->id, 'content' => trim($content),
            'type' => 'direct', 'recipient_type' => 'user', 'is_read' => false,
        ]);

        Notification::create([
            'user_id' => $to->id, 'title' => "New message from {$from->name}", 'message' => Str::limit(strip_tags($message->content), 120),
            'type' => 'info', 'category' => 'message', 'is_read' => false,
        ] + (Notification::hasRelated() ? ['related_id' => $from->id] : []));

        $body = $this->present($message, $from) + ['sender_id' => $from->id];

        return response()->json(
            $legacy ? ['success' => true, 'message' => $body] : ['success' => true, 'message' => 'Message sent successfully', 'data' => $body],
            201,
        );
    }

    private function broadcast(Request $request, string $type): JsonResponse
    {
        $me   = $request->user();
        $data = $request->validate([
            'department_id' => ['required', 'integer', 'exists:departments,id'],
            'content'       => ['required', 'string', 'max:' . self::MAX_LENGTH],
        ]);

        $department = Department::findOrFail($data['department_id']);
        abort_unless($this->canManageDepartment($me, $department), 403, 'Only the department head or the zone pastor can send this.');

        $recipients = $this->audience($me, $department)->get();
        $content    = trim($data['content']);
        $label      = $type === 'notice' ? 'Notice' : 'Announcement';

        foreach ($recipients as $r) {
            Message::create([
                'sender_id' => $me->id, 'receiver_id' => $r->id, 'department_id' => $department->id, 'content' => $content,
                'type' => $type, 'recipient_type' => 'department', 'is_read' => false,
            ]);
            Notification::create([
                'user_id' => $r->id, 'title' => "{$label} for {$department->name}", 'message' => Str::limit(strip_tags($content), 120),
                'type' => 'info', 'category' => 'message', 'is_read' => false,
            ] + (Notification::hasRelated() ? ['related_id' => $me->id] : []));
        }

        return response()->json([
            'success'          => true,
            'message'          => "{$label} sent to {$recipients->count()} members",
            'recipients_count' => $recipients->count(),
        ], 201);
    }

    private function canMessage(User $from, User $to): bool
    {
        if ($from->isMaster()) {
            return true;
        }

        return $from->zone_id && $to->zone_id && (int) $from->zone_id === (int) $to->zone_id;
    }

    private function canManageDepartment(User $user, Department $department): bool
    {
        return $user->isMaster()
            || ((int) $department->hod_id === $user->id && $department->hod_status === 'accepted')
            // Departments are shared across zones (no zone of their own), so a pastor may address the department but
            // only reaches the members who sit in the pastor's own zone (see audience()).
            || ($user->isPastor() && $user->zone_id && (!$department->zone_id || (int) $department->zone_id === (int) $user->zone_id));
    }

    /** Who a department message reaches: its active members, and for a pastor only those in their own zone. */
    private function audience(User $me, Department $department)
    {
        return User::where('department_id', $department->id)->where('is_active', true)->where('id', '!=', $me->id)
            ->when($me->isPastor(), fn ($q) => $q->where('zone_id', $me->zone_id));
    }

    /** The user id of the zone's lead pastor (falls back to any pastor login in that zone). */
    private function leadPastorId(User $user): ?int
    {
        if (!$user->zone_id) {
            return null;
        }

        return Pastor::where('zone_id', $user->zone_id)->where('is_zone_pastor', true)->value('user_id')
            ?? User::where('role', 'pastor')->where('zone_id', $user->zone_id)->value('id');
    }

    private function roleLabel(User $user, bool $isHomeGroupLeader): string
    {
        return match (true) {
            $user->isPastor()  => 'Zone Pastor',
            $user->isHOD()     => 'Department HOD',
            $isHomeGroupLeader => 'Home Group Leader',
            $user->isPartner() => 'Partner',
            default            => 'Member',
        };
    }

    private function initials(?string $name): string
    {
        $parts = preg_split('/\s+/', trim((string) $name)) ?: [];

        return strtoupper(mb_substr($parts[0] ?? 'U', 0, 1) . mb_substr($parts[1] ?? ($parts[0] ?? 'U'), 0, 1));
    }

    private function present(Message $m, User $viewer): array
    {
        return [
            'id'         => $m->id,
            'senderId'   => $m->sender_id,
            'senderName' => $m->sender?->name ?? User::whereKey($m->sender_id)->value('name'),
            'content'    => $m->content,
            'time'       => $m->created_at->format('h:i A'),
            'isOwn'      => $m->sender_id === $viewer->id,
            'created_at' => $m->created_at->toISOString(),
        ];
    }
}
