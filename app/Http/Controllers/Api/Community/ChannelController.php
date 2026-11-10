<?php

namespace App\Http\Controllers\Api\Community;

use App\Http\Controllers\Controller;
use App\Models\Community\Channel;
use App\Models\Community\ChannelGoal;
use App\Models\Community\ChannelMeeting;
use App\Models\Community\LiveSession;
use App\Models\Community\Teaching;
use App\Services\Community\ChannelService;
use App\Services\Community\CommunityService;
use App\Services\Community\WatchService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

/** Channels (discussion, goals, meetings, chat) and the Watch tab (teachings + live sessions). */
class ChannelController extends Controller
{
    public function __construct(private ChannelService $channels, private CommunityService $community, private WatchService $watch) {}

    // ── Channels ──────────────────────────────────────────────────────────────────────────────────

    /** GET /channels?scope=mine|discover&q=&category= */
    public function index(Request $r): JsonResponse
    {
        $u = $r->user();
        $scope = $r->query('scope') === 'mine' ? 'mine' : 'discover';
        $q = Channel::query()->where('status', 'active');

        if ($scope === 'mine') {
            $q->whereIn('id', DB::table('channel_members')->where('user_id', $u->id)->whereIn('status', ['active', 'pending'])->select('channel_id'));
        } else {
            $q->where('is_private', false);
        }
        if (($term = trim((string) $r->query('q', ''))) !== '') {
            $like = '%' . addcslashes($term, '%_\\') . '%';
            $q->where(fn ($w) => $w->where('name', 'like', $like)->orWhere('description', 'like', $like));
        }
        if (in_array($r->query('category'), ChannelService::CATEGORIES, true)) {
            $q->where('category', $r->query('category'));
        }

        $rows = $q->orderByDesc('is_official')->orderByDesc('members_count')->limit(60)->get();

        return response()->json(['success' => true, 'data' => $rows->map(fn ($c) => $this->channels->present($c, $u))->values()]);
    }

    public function store(Request $r): JsonResponse
    {
        $d = $r->validate([
            'name' => ['required', 'string', 'max:80'], 'description' => ['nullable', 'string', 'max:600'], 'category' => ['nullable', 'string', 'max:40'],
            'is_private' => ['nullable', 'boolean'], 'is_official' => ['nullable', 'boolean'], 'avatar_url' => ['nullable', 'string', 'max:500'], 'cover_url' => ['nullable', 'string', 'max:500'],
        ]);
        $c = $this->channels->create($r->user(), $d);

        return response()->json(['success' => true, 'data' => $this->channels->present($c, $r->user(), true)], 201);
    }

    public function show(Request $r, int $id): JsonResponse
    {
        $c = Channel::with('owner')->findOrFail($id);
        $private = $c->is_private && !$this->channels->isMember($c, $r->user()) && !$r->user()->isMaster();

        if ($private) {   // a private channel shows only its card, so people can ask to join
            return response()->json(['success' => true, 'data' => $this->channels->present($c, $r->user())]);
        }
        $this->channels->assertCanView($c, $r->user());

        return response()->json(['success' => true, 'data' => $this->channels->present($c, $r->user(), true)]);
    }

    public function update(Request $r, int $id): JsonResponse
    {
        $d = $r->validate(['description' => ['nullable', 'string', 'max:600'], 'category' => ['nullable', 'string', 'max:40'], 'is_private' => ['nullable', 'boolean'], 'avatar_url' => ['nullable', 'string', 'max:500'], 'cover_url' => ['nullable', 'string', 'max:500']]);

        return response()->json(['success' => true, 'data' => $this->channels->present($this->channels->update(Channel::findOrFail($id), $r->user(), $d), $r->user(), true)]);
    }

    public function destroy(Request $r, int $id): JsonResponse
    {
        $this->channels->delete(Channel::findOrFail($id), $r->user());

        return response()->json(['success' => true]);
    }

    public function join(Request $r, int $id): JsonResponse
    {
        $m = $this->channels->join(Channel::findOrFail($id), $r->user());

        return response()->json(['success' => true, 'status' => $m->status, 'message' => $m->status === 'pending' ? 'Request sent. The owner will review it.' : 'Welcome to the channel!']);
    }

    public function leave(Request $r, int $id): JsonResponse
    {
        $this->channels->leave(Channel::findOrFail($id), $r->user());

        return response()->json(['success' => true]);
    }

    public function members(Request $r, int $id): JsonResponse
    {
        $status = in_array($r->query('status'), ['active', 'pending', 'banned'], true) ? $r->query('status') : 'active';

        return response()->json(['success' => true, 'data' => $this->channels->members(Channel::findOrFail($id), $r->user(), $status)]);
    }

    public function decide(Request $r, int $id, int $userId): JsonResponse
    {
        $v = $r->validate(['action' => ['required', Rule::in(['approve', 'reject', 'remove', 'ban', 'moderator', 'member'])]]);
        $this->channels->decide(Channel::findOrFail($id), $r->user(), $userId, $v['action']);

        return response()->json(['success' => true]);
    }

    // ── Channel posts (discussion board) ──────────────────────────────────────────────────────────

    public function posts(Request $r, int $id): JsonResponse
    {
        $c = Channel::findOrFail($id);
        $this->channels->assertCanView($c, $r->user());
        abort_unless(!$c->is_private || $this->channels->isMember($c, $r->user()) || $r->user()->isMaster(), 403);

        return response()->json(['success' => true] + $this->community->feed($r->user(), 'channel', max(1, (int) $r->query('page', 1)), ['channel_id' => $c->id]));
    }

    // ── Chat ──────────────────────────────────────────────────────────────────────────────────────

    public function messages(Request $r, int $id): JsonResponse
    {
        return response()->json(['success' => true, 'data' => $this->channels->messages(Channel::findOrFail($id), $r->user(), (int) $r->query('since', 0))]);
    }

    public function say(Request $r, int $id): JsonResponse
    {
        $v = $r->validate(['body' => ['required', 'string', 'max:2000']]);
        $m = $this->channels->say(Channel::findOrFail($id), $r->user(), $v['body']);

        return response()->json(['success' => true, 'data' => ['id' => $m->id, 'body' => $m->body, 'author' => $this->community->userMini($r->user()), 'mine' => true, 'created_at' => $m->created_at->toIso8601String()]], 201);
    }

    // ── Goals ─────────────────────────────────────────────────────────────────────────────────────

    public function goals(Request $r, int $id): JsonResponse
    {
        return response()->json(['success' => true, 'data' => $this->channels->goals(Channel::findOrFail($id), $r->user())]);
    }

    public function createGoal(Request $r, int $id): JsonResponse
    {
        $d = $r->validate(['title' => ['required', 'string', 'max:200'], 'description' => ['nullable', 'string', 'max:800'], 'target_date' => ['nullable', 'date', 'after_or_equal:today']]);

        return response()->json(['success' => true, 'data' => $this->channels->createGoal(Channel::findOrFail($id), $r->user(), $d)], 201);
    }

    public function updateGoal(Request $r, int $goalId): JsonResponse
    {
        $d = $r->validate(['progress' => ['nullable', 'integer', 'min:0', 'max:100'], 'status' => ['nullable', Rule::in(['open', 'achieved', 'dropped'])], 'note' => ['nullable', 'string', 'max:400']]);

        return response()->json(['success' => true, 'data' => $this->channels->updateGoal(ChannelGoal::findOrFail($goalId), $r->user(), $d)]);
    }

    // ── Meetings ──────────────────────────────────────────────────────────────────────────────────

    public function meetings(Request $r, int $id): JsonResponse
    {
        return response()->json(['success' => true, 'data' => $this->channels->meetings(Channel::findOrFail($id), $r->user())]);
    }

    public function createMeeting(Request $r, int $id): JsonResponse
    {
        $d = $r->validate([
            'title' => ['required', 'string', 'max:200'], 'description' => ['nullable', 'string', 'max:800'], 'starts_at' => ['required', 'date'], 'ends_at' => ['nullable', 'date', 'after:starts_at'],
            'mode' => ['nullable', Rule::in(['online', 'in_person'])], 'link_url' => ['nullable', 'string', 'max:500'], 'location' => ['nullable', 'string', 'max:190'],
        ]);

        return response()->json(['success' => true, 'data' => $this->channels->createMeeting(Channel::findOrFail($id), $r->user(), $d)], 201);
    }

    public function rsvp(Request $r, int $meetingId): JsonResponse
    {
        $v = $r->validate(['status' => ['required', Rule::in(['going', 'maybe', 'declined'])]]);

        return response()->json(['success' => true, 'data' => $this->channels->rsvp(ChannelMeeting::findOrFail($meetingId), $r->user(), $v['status'])]);
    }

    public function cancelMeeting(Request $r, int $meetingId): JsonResponse
    {
        $this->channels->cancelMeeting(ChannelMeeting::findOrFail($meetingId), $r->user());

        return response()->json(['success' => true]);
    }

    // ── Watch ─────────────────────────────────────────────────────────────────────────────────────

    public function teachings(Request $r): JsonResponse
    {
        return response()->json(['success' => true, 'data' => $this->watch->teachings($r->query('series') ?: null, 40, $r->user())]);
    }

    public function viewTeaching(Request $r, int $id): JsonResponse
    {
        $this->watch->viewTeaching(Teaching::where('status', 'published')->findOrFail($id));

        return response()->json(['success' => true]);
    }

    public function lives(Request $r): JsonResponse
    {
        return response()->json(['success' => true, 'data' => $this->watch->lives($r->user())]);
    }

    public function scheduleLive(Request $r): JsonResponse
    {
        $d = $r->validate(['title' => ['required', 'string', 'max:200'], 'description' => ['nullable', 'string', 'max:600'], 'url' => ['required', 'string', 'max:300'], 'scheduled_at' => ['required', 'date'], 'channel_id' => ['nullable', 'integer', 'exists:channels,id'], 'is_official' => ['nullable', 'boolean']]);
        $s = $this->watch->schedule($r->user(), $d)->load(['host:id,name', 'channel:id,name']);

        return response()->json(['success' => true, 'data' => $this->watch->live($s, $r->user())], 201);
    }

    public function remindLive(Request $r, int $id): JsonResponse
    {
        return response()->json(['success' => true, 'reminded' => $this->watch->toggleReminder($r->user(), LiveSession::findOrFail($id))]);
    }

    public function liveStatus(Request $r, int $id): JsonResponse
    {
        $v = $r->validate(['status' => ['required', Rule::in(['live', 'ended', 'cancelled'])]]);
        $this->watch->setStatus(LiveSession::findOrFail($id), $r->user(), $v['status']);

        return response()->json(['success' => true]);
    }
}
