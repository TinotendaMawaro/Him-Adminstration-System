<?php

namespace App\Services\Community;

use App\Models\Community\Channel;
use App\Models\Community\LiveSession;
use App\Models\Community\Teaching;
use App\Models\Notification;
use App\Models\User;
use App\Support\MediaLinks;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * The "Watch" side of the app: the official teachings library (curated by head office, e.g. Apostle Tavonga Vutabwashe's
 * messages as YouTube videos) and live sessions that anyone running a channel can schedule.
 */
class WatchService
{
    public const LIVE_WINDOW_HOURS = 4;     // a session counts as "live" for this long after its start time

    public function __construct(private CommunityService $community, private ChannelService $channels) {}

    // ── Teachings ─────────────────────────────────────────────────────────────────────────────────

    public function teaching(Teaching $t): array
    {
        $v = MediaLinks::video($t->youtube_url);

        return [
            'id' => $t->id, 'title' => $t->title, 'description' => $t->description, 'series' => $t->series, 'speaker' => $t->speaker,
            'video_id' => $t->video_id, 'url' => $t->youtube_url, 'embed' => $v['embed'] ?? "https://www.youtube-nocookie.com/embed/{$t->video_id}",
            'thumb' => $t->thumbnail_url ?: "https://i.ytimg.com/vi/{$t->video_id}/hqdefault.jpg",
            'featured' => $t->is_featured, 'views' => $t->views_count, 'published_at' => $t->published_at?->toIso8601String(),
        ];
    }

    public function teachings(?string $series = null, int $limit = 40): array
    {
        $q = Teaching::where('status', 'published')->where(fn ($w) => $w->whereNull('published_at')->orWhere('published_at', '<=', now()));
        if ($series) {
            $q->where('series', $series);
        }

        return [
            'featured' => ($f = (clone $q)->where('is_featured', true)->latest('published_at')->first()) ? $this->teaching($f) : null,
            'series'   => Teaching::where('status', 'published')->whereNotNull('series')->distinct()->orderBy('series')->pluck('series')->all(),
            'items'    => $q->orderByDesc('published_at')->orderByDesc('id')->limit($limit)->get()->map(fn ($t) => $this->teaching($t))->all(),
        ];
    }

    public function viewTeaching(Teaching $t): void
    {
        $t->increment('views_count');
    }

    // ── Live sessions ─────────────────────────────────────────────────────────────────────────────

    public function effectiveStatus(LiveSession $s): string
    {
        if (in_array($s->status, ['cancelled', 'ended'], true)) {
            return $s->status;
        }
        if ($s->status === 'live') {
            return 'live';
        }
        if ($s->scheduled_at->isFuture()) {
            return 'scheduled';
        }

        return $s->scheduled_at->gt(now()->subHours(self::LIVE_WINDOW_HOURS)) ? 'live' : 'ended';
    }

    public function live(LiveSession $s, ?User $viewer = null, ?array $reminded = null): array
    {
        $v = MediaLinks::video($s->url);
        $status = $this->effectiveStatus($s);

        return [
            'id' => $s->id, 'title' => $s->title, 'description' => $s->description, 'status' => $status, 'official' => $s->is_official,
            'scheduled_at' => $s->scheduled_at->toIso8601String(), 'url' => $s->url, 'video_id' => $s->video_id, 'embed' => $v['embed'] ?? null,
            'thumb' => "https://i.ytimg.com/vi/{$s->video_id}/hqdefault.jpg", 'reminders' => $s->reminders_count,
            'host' => $s->host ? ['id' => $s->host->id, 'name' => $s->host->name] : null,
            'channel' => $s->channel ? ['id' => $s->channel->id, 'name' => $s->channel->name] : null,
            'reminded' => $viewer ? in_array($s->id, $reminded ?? [], true) : false,
        ];
    }

    /** Live now, coming up (14 days) and the last two that ended: official ones + public channels + channels I belong to. */
    public function lives(User $viewer): array
    {
        $mine = DB::table('channel_members')->where('user_id', $viewer->id)->where('status', 'active')->pluck('channel_id');
        $publicChannels = Channel::where('is_private', false)->where('status', 'active')->pluck('id');

        $rows = LiveSession::with(['host:id,name', 'channel:id,name'])->where('status', '!=', 'cancelled')
            ->where('scheduled_at', '>=', now()->subDays(2))->where('scheduled_at', '<=', now()->addDays(14))
            ->where(fn ($w) => $w->where('is_official', true)->orWhereNull('channel_id')->orWhereIn('channel_id', $mine->merge($publicChannels)))
            ->orderBy('scheduled_at')->get();

        $reminded = DB::table('community_live_reminders')->where('user_id', $viewer->id)->pluck('session_id')->all();
        $all = $rows->map(fn ($s) => $this->live($s, $viewer, $reminded));

        return [
            'live_now' => $all->where('status', 'live')->values()->all(),
            'upcoming' => $all->where('status', 'scheduled')->values()->all(),
            'ended'    => $all->where('status', 'ended')->sortByDesc('scheduled_at')->take(2)->values()->all(),
        ];
    }

    public function schedule(User $host, array $d): LiveSession
    {
        $this->community->assertCanContribute($host);
        $title = $this->community->clean($d['title'] ?? '', 160);
        if (mb_strlen($title) < 3) {
            throw ValidationException::withMessages(['title' => 'Give your live session a title.']);
        }
        $id = MediaLinks::youtubeId((string) ($d['url'] ?? '')) ?? throw ValidationException::withMessages(['url' => 'Paste the YouTube live / premiere link.']);
        $at = Carbon::parse($d['scheduled_at'] ?? null);
        if ($at->lt(now()->subHour())) {
            throw ValidationException::withMessages(['scheduled_at' => 'Choose a time that has not long passed.']);
        }

        $channel = null;
        if (!empty($d['channel_id'])) {
            $channel = Channel::findOrFail($d['channel_id']);
            abort_unless($this->channels->canModerate($channel, $host), 403, 'Only the channel owner or a moderator can schedule live sessions.');
        } else {
            abort_unless($host->isMaster(), 403, 'Pick a channel to go live in.');
        }

        $session = LiveSession::create([
            'channel_id' => $channel?->id, 'host_id' => $host->id, 'title' => $title, 'description' => $this->community->clean($d['description'] ?? '', 500) ?: null,
            'url' => "https://www.youtube.com/watch?v={$id}", 'video_id' => $id, 'scheduled_at' => $at,
            'is_official' => $host->isMaster() && (bool) ($d['is_official'] ?? !$channel),
        ]);

        $session->refresh();

        if ($channel) {
            $this->channels->tellMembers($channel, $host, "Live: {$title}", $at->format('D d M, H:i') . " · {$channel->name}");
        }

        return $session;
    }

    public function toggleReminder(User $u, LiveSession $s): bool
    {
        abort_if($this->effectiveStatus($s) === 'ended', 422, 'This session has ended.');
        $removed = DB::table('community_live_reminders')->where(['session_id' => $s->id, 'user_id' => $u->id])->delete();

        if ($removed) {
            LiveSession::where('id', $s->id)->where('reminders_count', '>', 0)->decrement('reminders_count');

            return false;
        }

        DB::table('community_live_reminders')->insertOrIgnore(['session_id' => $s->id, 'user_id' => $u->id, 'created_at' => now()]);
        $s->increment('reminders_count');

        return true;
    }

    public function setStatus(LiveSession $s, User $actor, string $status): void
    {
        $canManage = $actor->isMaster() || $s->host_id === $actor->id || ($s->channel_id && $this->channels->canModerate(Channel::findOrFail($s->channel_id), $actor));
        abort_unless($canManage, 403, 'You cannot change this session.');
        abort_unless(in_array($status, ['live', 'ended', 'cancelled'], true), 422);
        $s->update(['status' => $status]);
    }

    /** Called every few minutes by the scheduler: tell people who asked for a reminder that a session / meeting is about to start. */
    public function sendDueReminders(): array
    {
        $sent = ['live' => 0, 'meetings' => 0];

        LiveSession::where('reminder_sent', false)->whereIn('status', ['scheduled', 'live'])->whereBetween('scheduled_at', [now()->subMinutes(5), now()->addMinutes(15)])->get()->each(function ($s) use (&$sent) {
            $ids = DB::table('community_live_reminders')->where('session_id', $s->id)->pluck('user_id');
            foreach ($ids as $uid) {
                Notification::create(['user_id' => $uid, 'title' => "Starting soon: {$s->title}", 'message' => 'Tap to watch live.', 'type' => 'info', 'category' => 'community', 'is_read' => false]);
            }
            $s->update(['reminder_sent' => true]);
            $sent['live'] += $ids->count();
        });

        \App\Models\Community\ChannelMeeting::with('channel:id,name')->where('reminder_sent', false)->where('status', 'scheduled')->whereBetween('starts_at', [now(), now()->addMinutes(30)])->get()->each(function ($m) use (&$sent) {
            $ids = DB::table('channel_meeting_rsvps')->where('meeting_id', $m->id)->whereIn('status', ['going', 'maybe'])->pluck('user_id');
            foreach ($ids as $uid) {
                Notification::create(['user_id' => $uid, 'title' => "Meeting soon: {$m->title}", 'message' => $m->starts_at->format('H:i') . ' · ' . ($m->channel->name ?? ''), 'type' => 'info', 'category' => 'community', 'is_read' => false]);
            }
            $m->update(['reminder_sent' => true]);
            $sent['meetings'] += $ids->count();
        });

        return $sent;
    }
}
