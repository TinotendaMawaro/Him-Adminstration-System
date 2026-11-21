<?php

namespace App\Services\Community;

use App\Models\Community\Channel;
use App\Models\Community\ChannelGoal;
use App\Models\Community\ChannelMeeting;
use App\Models\Community\ChannelMember;
use App\Models\Community\ChannelMessage;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * Channels are small communities any member can start: a place to talk, set shared goals, schedule meetings and go live.
 * Roles: owner (creator) > moderator > member. Private channels are invite/approval only. Head office (master) can
 * moderate every channel.
 */
class ChannelService
{
    public const CATEGORIES = ['Prayer', 'Bible study', 'Youth', 'Women', 'Men', 'Business', 'Marriage & family', 'Music & worship', 'Outreach', 'Zone', 'Education', 'Health', 'General'];
    public const MAX_OWNED = 5;

    public function __construct(private CommunityService $community) {}

    // ── Access ────────────────────────────────────────────────────────────────────────────────────

    public function membership(Channel $c, User $u): ?ChannelMember
    {
        return ChannelMember::where('channel_id', $c->id)->where('user_id', $u->id)->first();
    }

    public function isMember(Channel $c, User $u): bool
    {
        return $this->membership($c, $u)?->status === 'active';
    }

    public function canModerate(Channel $c, User $u): bool
    {
        return $u->isMaster() || in_array($this->membership($c, $u)?->role, ['owner', 'moderator'], true) && $this->isMember($c, $u);
    }

    /** Everyone sees public channels; private ones only members (and head office). */
    public function assertCanView(Channel $c, User $u): void
    {
        abort_if($c->status !== 'active' && !$u->isMaster(), 404);
        abort_if($c->is_private && !$this->isMember($c, $u) && !$u->isMaster(), 403, 'This is a private channel.');
    }

    public function assertMember(Channel $c, User $u): ChannelMember
    {
        $m = $this->membership($c, $u);
        abort_unless($m && $m->status === 'active' || $u->isMaster(), 403, 'Join this channel first.');

        return $m ?? new ChannelMember(['channel_id' => $c->id, 'user_id' => $u->id, 'role' => 'moderator', 'status' => 'active']);
    }

    // ── Presenting ────────────────────────────────────────────────────────────────────────────────

    public function present(Channel $c, User $viewer, bool $detail = false): array
    {
        $m = $this->membership($c, $viewer);
        $row = [
            'id' => $c->id, 'name' => $c->name, 'slug' => $c->slug, 'description' => $c->description, 'category' => $c->category,
            'avatar' => $c->avatar_url, 'cover' => $c->cover_url, 'private' => $c->is_private, 'official' => $c->is_official,
            'members' => $c->members_count, 'status' => $c->status,
            'my_role' => $m?->status === 'active' ? $m->role : null, 'my_status' => $m?->status,
            'can_moderate' => $this->canModerate($c, $viewer),
        ];

        if ($detail) {
            $owner = $c->owner ?? User::find($c->owner_id);
            $row['owner'] = $owner ? $this->community->userMini($owner) : null;
            $row['open_goals'] = ChannelGoal::where('channel_id', $c->id)->where('status', 'open')->count();
            $row['upcoming_meetings'] = ChannelMeeting::where('channel_id', $c->id)->where('status', 'scheduled')->where('starts_at', '>=', now())->count();
            $row['live_now'] = DB::table('community_live_sessions')->where('channel_id', $c->id)->where('status', '!=', 'cancelled')->where('status', '!=', 'ended')
                ->where('scheduled_at', '<=', now())->where('scheduled_at', '>=', now()->subHours(4))->exists();
        }

        return $row;
    }

    // ── Lifecycle ─────────────────────────────────────────────────────────────────────────────────

    public function create(User $owner, array $d): Channel
    {
        $this->community->assertCanContribute($owner);

        $name = $this->community->clean($d['name'] ?? '', 60);
        if (mb_strlen($name) < 3) {
            throw ValidationException::withMessages(['name' => 'Give the channel a name (at least 3 characters).']);
        }
        if (Channel::where('owner_id', $owner->id)->count() >= self::MAX_OWNED && !$owner->isMaster()) {
            throw ValidationException::withMessages(['name' => 'You can run up to ' . self::MAX_OWNED . ' channels.']);
        }
        if (Channel::whereRaw('lower(name) = ?', [Str::lower($name)])->exists()) {
            throw ValidationException::withMessages(['name' => 'A channel with that name already exists.']);
        }

        $category = in_array($d['category'] ?? '', self::CATEGORIES, true) ? $d['category'] : 'General';

        return DB::transaction(function () use ($owner, $d, $name, $category) {
            $c = Channel::create([
                'owner_id' => $owner->id, 'name' => $name, 'slug' => $this->slug($name),
                'description' => $this->community->clean($d['description'] ?? '', 500) ?: null, 'category' => $category,
                'is_private' => (bool) ($d['is_private'] ?? false),
                'is_official' => $owner->isMaster() && (bool) ($d['is_official'] ?? false),
                'avatar_url' => ($i = \App\Support\MediaLinks::image((string) ($d['avatar_url'] ?? ''))) ? $i['url'] : null,
                'cover_url' => ($i = \App\Support\MediaLinks::image((string) ($d['cover_url'] ?? ''))) ? $i['url'] : null,
                'members_count' => 1,
            ]);
            ChannelMember::create(['channel_id' => $c->id, 'user_id' => $owner->id, 'role' => 'owner', 'status' => 'active', 'joined_at' => now()]);

            return $c->refresh();      // a fresh model does not carry the database defaults (status...) until it is reloaded
        });
    }

    private function slug(string $name): string
    {
        $base = Str::slug($name) ?: 'channel';
        $slug = $base;
        for ($i = 2; Channel::withTrashed()->where('slug', $slug)->exists(); $i++) {
            $slug = "{$base}-{$i}";
        }

        return $slug;
    }

    public function update(Channel $c, User $actor, array $d): Channel
    {
        abort_unless($this->canModerate($c, $actor), 403, 'Only moderators can change the channel.');

        $c->update(array_filter([
            'description' => array_key_exists('description', $d) ? ($this->community->clean($d['description'], 500) ?: null) : $c->description,
            'category' => in_array($d['category'] ?? '', self::CATEGORIES, true) ? $d['category'] : $c->category,
            'is_private' => array_key_exists('is_private', $d) ? (bool) $d['is_private'] : $c->is_private,
            'avatar_url' => isset($d['avatar_url']) ? (\App\Support\MediaLinks::image($d['avatar_url'])['url'] ?? $c->avatar_url) : $c->avatar_url,
            'cover_url' => isset($d['cover_url']) ? (\App\Support\MediaLinks::image($d['cover_url'])['url'] ?? $c->cover_url) : $c->cover_url,
        ], fn ($v) => $v !== null));

        return $c->refresh();
    }

    public function delete(Channel $c, User $actor): void
    {
        abort_unless($c->owner_id === $actor->id || $actor->isMaster(), 403, 'Only the owner can delete the channel.');
        $c->delete();
    }

    // ── Membership ────────────────────────────────────────────────────────────────────────────────

    public function join(Channel $c, User $u): ChannelMember
    {
        $this->community->assertCanContribute($u);
        abort_unless($c->status === 'active', 404);

        $m = $this->membership($c, $u);
        abort_if($m?->status === 'banned', 403, 'You cannot join this channel.');
        if ($m) {
            return $m;
        }

        $status = $c->is_private ? 'pending' : 'active';
        $m = ChannelMember::create(['channel_id' => $c->id, 'user_id' => $u->id, 'role' => 'member', 'status' => $status, 'joined_at' => $status === 'active' ? now() : null]);

        if ($status === 'active') {
            $c->increment('members_count');
        }
        $this->community->notify($c->owner_id, $u, 'channel', $status === 'active' ? "{$u->name} joined {$c->name}" : "{$u->name} asked to join {$c->name}", null, null, dedupe: true);

        return $m;
    }

    public function leave(Channel $c, User $u): void
    {
        $m = $this->membership($c, $u);
        if (!$m) {
            return;
        }
        abort_if($m->role === 'owner', 422, 'You own this channel. Delete it or hand it over before leaving.');

        DB::transaction(function () use ($c, $m) {
            $wasActive = $m->status === 'active';
            $m->delete();
            if ($wasActive) {
                $c->where('id', $c->id)->where('members_count', '>', 0)->decrement('members_count');
            }
        });
    }

    public function members(Channel $c, User $viewer, string $status = 'active'): array
    {
        $this->assertCanView($c, $viewer);
        abort_if($status !== 'active' && !$this->canModerate($c, $viewer), 403);

        $rows = ChannelMember::with('user.zone:id,name')->where('channel_id', $c->id)->where('status', $status)->orderByRaw("field(role, 'owner', 'moderator', 'member')")->limit(200)->get();

        return $rows->map(fn ($m) => $this->community->userMini($m->user) + ['role' => $m->role, 'status' => $m->status])->all();
    }

    public function decide(Channel $c, User $actor, int $userId, string $action): void
    {
        abort_unless($this->canModerate($c, $actor), 403, 'Only moderators can do this.');
        $m = ChannelMember::where('channel_id', $c->id)->where('user_id', $userId)->firstOrFail();
        abort_if($m->role === 'owner', 422, 'The owner cannot be changed.');

        DB::transaction(function () use ($c, $m, $action, $actor) {
            match ($action) {
                'approve' => $this->activate($c, $m),
                'reject', 'remove' => $this->drop($c, $m),
                'ban' => $this->drop($c, $m, ban: true),
                'moderator', 'member' => $this->setRole($c, $m, $actor, $action),
                default => abort(422, 'Unknown action.'),
            };
        });
    }

    private function activate(Channel $c, ChannelMember $m): void
    {
        if ($m->status !== 'active') {
            $m->update(['status' => 'active', 'joined_at' => now()]);
            $c->increment('members_count');
            Notification::create(['user_id' => $m->user_id, 'title' => "You're in: {$c->name}", 'message' => 'Your request to join was approved.', 'type' => 'success', 'category' => 'community', 'is_read' => false]);
        }
    }

    private function drop(Channel $c, ChannelMember $m, bool $ban = false): void
    {
        $wasActive = $m->status === 'active';
        $ban ? $m->update(['status' => 'banned']) : $m->delete();
        if ($wasActive) {
            Channel::where('id', $c->id)->where('members_count', '>', 0)->decrement('members_count');
        }
    }

    private function setRole(Channel $c, ChannelMember $m, User $actor, string $role): void
    {
        abort_unless($c->owner_id === $actor->id || $actor->isMaster(), 403, 'Only the owner can change roles.');
        $m->update(['role' => $role]);
    }

    // ── Chat ──────────────────────────────────────────────────────────────────────────────────────

    public function messages(Channel $c, User $viewer, int $sinceId = 0, int $limit = 50): array
    {
        $this->assertCanView($c, $viewer);
        abort_unless($this->isMember($c, $viewer) || $viewer->isMaster() || !$c->is_private, 403);

        $q = ChannelMessage::with('author.zone:id,name')->where('channel_id', $c->id);
        $rows = $sinceId > 0
            ? $q->where('id', '>', $sinceId)->orderBy('id')->limit($limit)->get()
            : $q->orderByDesc('id')->limit($limit)->get()->reverse()->values();

        $hidden = $this->community->hiddenAuthorIds($viewer);

        return $rows->reject(fn ($m) => in_array($m->user_id, $hidden, true))->map(fn ($m) => [
            'id' => $m->id, 'body' => $m->body, 'author' => $this->community->userMini($m->author), 'mine' => $m->user_id === $viewer->id,
            'created_at' => $m->created_at->toIso8601String(),
        ])->values()->all();
    }

    public function say(Channel $c, User $u, string $body): ChannelMessage
    {
        $this->community->assertCanContribute($u);
        abort_unless($this->isMember($c, $u), 403, 'Join this channel to chat.');
        $body = $this->community->clean($body, 1000);
        if ($body === '') {
            throw ValidationException::withMessages(['body' => 'Type a message first.']);
        }

        return ChannelMessage::create(['channel_id' => $c->id, 'user_id' => $u->id, 'body' => $body, 'created_at' => now()]);
    }

    // ── Goals ─────────────────────────────────────────────────────────────────────────────────────

    public function goals(Channel $c, User $viewer): array
    {
        $this->assertCanView($c, $viewer);

        return ChannelGoal::with('creator')->where('channel_id', $c->id)
            ->orderByRaw("field(status, 'open', 'achieved', 'dropped')")->orderBy('target_date')->limit(100)->get()
            ->map(fn ($g) => $this->goal($g))->all();
    }

    private function goal(ChannelGoal $g): array
    {
        return [
            'id' => $g->id, 'channel_id' => $g->channel_id, 'title' => $g->title, 'description' => $g->description, 'progress' => $g->progress, 'status' => $g->status,
            'target_date' => $g->target_date?->toDateString(), 'overdue' => $g->status === 'open' && $g->target_date && $g->target_date->isPast(),
            'creator' => $g->creator ? ['id' => $g->creator->id, 'name' => $g->creator->name] : null,
            'updates' => $g->relationLoaded('updates') ? $g->updates->map(fn ($u) => ['id' => $u->id, 'note' => $u->note, 'progress' => $u->progress, 'by' => $u->user?->name, 'at' => $u->created_at?->toIso8601String()])->all() : null,
        ];
    }

    public function createGoal(Channel $c, User $u, array $d): array
    {
        $this->community->assertCanContribute($u);
        abort_unless($this->isMember($c, $u), 403, 'Join this channel to set goals.');
        $title = $this->community->clean($d['title'] ?? '', 140);
        if (mb_strlen($title) < 3) {
            throw ValidationException::withMessages(['title' => 'Describe the goal (at least 3 characters).']);
        }

        $g = ChannelGoal::create([
            'channel_id' => $c->id, 'created_by' => $u->id, 'title' => $title,
            'description' => $this->community->clean($d['description'] ?? '', 600) ?: null,
            'target_date' => !empty($d['target_date']) ? \Illuminate\Support\Carbon::parse($d['target_date'])->toDateString() : null,
        ]);
        $this->tellMembers($c, $u, "New goal in {$c->name}", $title);

        return $this->goal($g->load('creator'));
    }

    /** Creators and moderators move the progress / status; any member can add an encouraging note. */
    public function updateGoal(ChannelGoal $g, User $u, array $d): array
    {
        $c = Channel::findOrFail($g->channel_id);
        abort_unless($this->isMember($c, $u), 403);
        $steward = $g->created_by === $u->id || $this->canModerate($c, $u);

        if (isset($d['progress']) || isset($d['status'])) {
            abort_unless($steward, 403, 'Only the goal creator or a moderator can change progress.');
        }
        $progress = isset($d['progress']) ? max(0, min(100, (int) $d['progress'])) : $g->progress;
        $status = isset($d['status']) && in_array($d['status'], ['open', 'achieved', 'dropped'], true) ? $d['status'] : $g->status;
        if ($status === 'achieved') {
            $progress = 100;
        }

        DB::transaction(function () use ($g, $u, $d, $progress, $status, $c) {
            $g->update(['progress' => $progress, 'status' => $status]);
            $note = $this->community->clean($d['note'] ?? '', 280);
            if ($note !== '' || isset($d['progress'])) {
                DB::table('channel_goal_updates')->insert(['goal_id' => $g->id, 'user_id' => $u->id, 'note' => $note ?: null, 'progress' => $progress, 'created_at' => now()]);
            }
            if ($status === 'achieved' && $g->wasChanged('status')) {
                $this->tellMembers($c, $u, "Goal achieved in {$c->name}", $g->title);
            }
        });

        return $this->goal($g->fresh()->load(['creator', 'updates.user']));
    }

    // ── Meetings ──────────────────────────────────────────────────────────────────────────────────

    public function meetings(Channel $c, User $viewer): array
    {
        $this->assertCanView($c, $viewer);
        $mine = DB::table('channel_meeting_rsvps')->where('user_id', $viewer->id)->pluck('status', 'meeting_id');
        $counts = DB::table('channel_meeting_rsvps')->where('status', 'going')->groupBy('meeting_id')->selectRaw('meeting_id, count(*) n')->pluck('n', 'meeting_id');

        return ChannelMeeting::with('creator')->where('channel_id', $c->id)->where('starts_at', '>=', now()->subDays(7))
            ->orderBy('starts_at')->limit(60)->get()->map(fn ($m) => $this->meeting($m, $mine[$m->id] ?? null, (int) ($counts[$m->id] ?? 0)))->all();
    }

    private function meeting(ChannelMeeting $m, ?string $my, int $going): array
    {
        return [
            'id' => $m->id, 'channel_id' => $m->channel_id, 'title' => $m->title, 'description' => $m->description,
            'starts_at' => $m->starts_at->toIso8601String(), 'ends_at' => $m->ends_at?->toIso8601String(), 'mode' => $m->mode,
            'link_url' => $m->link_url, 'location' => $m->location, 'status' => $m->status, 'going' => $going, 'my_rsvp' => $my,
            'creator' => $m->creator ? ['id' => $m->creator->id, 'name' => $m->creator->name] : null,
            'past' => $m->starts_at->isPast(),
        ];
    }

    public function createMeeting(Channel $c, User $u, array $d): array
    {
        $this->community->assertCanContribute($u);
        abort_unless($this->isMember($c, $u), 403, 'Join this channel to schedule meetings.');
        $links = DB::table('channels')->where('id', $c->id)->first();
        $homeGroupId = $links->home_group_id ?? null;
        abort_if(($homeGroupId || ($links->department_id ?? null)) && !$this->canModerate($c, $u), 403, 'Only the leader can schedule meetings here.');
        $title = $this->community->clean($d['title'] ?? '', 140);
        if (mb_strlen($title) < 3) {
            throw ValidationException::withMessages(['title' => 'Give the meeting a title.']);
        }
        $starts = \Illuminate\Support\Carbon::parse($d['starts_at'] ?? null);
        if ($starts->lt(now()->subMinutes(5))) {
            throw ValidationException::withMessages(['starts_at' => 'Choose a time in the future.']);
        }
        $mode = ($d['mode'] ?? 'online') === 'in_person' ? 'in_person' : 'online';
        $link = null;
        if ($mode === 'online' && !empty($d['link_url'])) {
            $link = filter_var($d['link_url'], FILTER_VALIDATE_URL) && str_starts_with(strtolower($d['link_url']), 'https://') ? Str::limit($d['link_url'], 500, '') : throw ValidationException::withMessages(['link_url' => 'The meeting link must start with https://']);
        }

        $m = ChannelMeeting::create([
            'channel_id' => $c->id, 'created_by' => $u->id, 'title' => $title, 'description' => $this->community->clean($d['description'] ?? '', 600) ?: null,
            'starts_at' => $starts, 'ends_at' => !empty($d['ends_at']) ? \Illuminate\Support\Carbon::parse($d['ends_at']) : null,
            'mode' => $mode, 'link_url' => $link, 'location' => $mode === 'in_person' ? ($this->community->clean($d['location'] ?? '', 190) ?: null) : null,
        ]);
        DB::table('channel_meeting_rsvps')->insert(['meeting_id' => $m->id, 'user_id' => $u->id, 'status' => 'going', 'created_at' => now(), 'updated_at' => now()]);
        // Until a meeting is scheduled the home group reads "to be announced by the leader"; once the leader announces, the day, time and place appear.
        if ($homeGroupId && ($hg = \App\Models\HomeGroup::find($homeGroupId))) {
            $hg->update(array_filter(['meeting_day' => $starts->format('l'), 'meeting_time' => $starts->format('H:i'), 'location' => $m->location ?: $hg->location]));
        }
        $this->tellMembers($c, $u, "Meeting: {$title}", $starts->format('D d M, H:i') . " · {$c->name}");

        return $this->meeting($m->load('creator'), 'going', 1);
    }

    public function rsvp(ChannelMeeting $m, User $u, string $status): array
    {
        $c = Channel::findOrFail($m->channel_id);
        abort_unless($this->isMember($c, $u), 403, 'Join this channel to reply.');
        abort_unless(in_array($status, ['going', 'maybe', 'declined'], true), 422);
        abort_if($m->status !== 'scheduled', 422, 'This meeting is no longer on.');

        DB::table('channel_meeting_rsvps')->updateOrInsert(['meeting_id' => $m->id, 'user_id' => $u->id], ['status' => $status, 'updated_at' => now(), 'created_at' => now()]);

        return $this->meeting($m->load('creator'), $status, (int) DB::table('channel_meeting_rsvps')->where('meeting_id', $m->id)->where('status', 'going')->count());
    }

    public function cancelMeeting(ChannelMeeting $m, User $u): void
    {
        $c = Channel::findOrFail($m->channel_id);
        abort_unless($m->created_by === $u->id || $this->canModerate($c, $u), 403, 'Only the organiser or a moderator can cancel.');
        $m->update(['status' => 'cancelled']);
        $this->tellMembers($c, $u, "Meeting cancelled: {$m->title}", $c->name);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────────────────────────

    /** In-app notice to the channel's active members (capped; never emailed). */
    public function tellMembers(Channel $c, User $actor, string $title, ?string $text): void
    {
        ChannelMember::where('channel_id', $c->id)->where('status', 'active')->where('user_id', '!=', $actor->id)->limit(300)->pluck('user_id')->each(function ($uid) use ($title, $text) {
            Notification::create(['user_id' => $uid, 'title' => $title, 'message' => $text ?: $title, 'type' => 'info', 'category' => 'community', 'is_read' => false]);
        });
    }
}
