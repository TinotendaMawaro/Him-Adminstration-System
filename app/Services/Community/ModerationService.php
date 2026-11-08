<?php

namespace App\Services\Community;

use App\Models\Community\Channel;
use App\Models\Community\Comment;
use App\Models\Community\Post;
use App\Models\Community\Report;
use App\Models\Market\Listing;
use App\Models\Notification;
use App\Models\User;
use App\Services\AuditTrail;
use Illuminate\Support\Facades\DB;

/**
 * What the master console can do to the community: hide or remove content, close reports, mute/ban/verify people,
 * suspend channels and marketplace listings. Every action is audited (who, what, why) and, where a person is affected,
 * they are told in-app. Only the master role may use this.
 */
class ModerationService
{
    public function __construct(private CommunityService $community) {}

    private function master(User $actor): void
    {
        abort_unless($actor->isMaster(), 403, 'Only the master console can moderate the community.');
    }

    // ── Content ───────────────────────────────────────────────────────────────────────────────────

    public function setPostStatus(Post $post, string $status, User $actor, ?string $reason = null): void
    {
        $this->master($actor);
        abort_unless(in_array($status, ['published', 'hidden'], true), 422);
        $post->update(['status' => $status]);
        AuditTrail::record("community.post_{$status}", $actor, $post, ['reason' => $reason, 'author' => $post->user_id], $post->user_id);

        if ($status === 'hidden') {
            $this->tell($post->user_id, 'One of your posts was hidden', $reason ?: 'It was reviewed by head office and does not meet our community guidelines.');
        }
    }

    public function removePost(Post $post, User $actor, ?string $reason = null): void
    {
        $this->master($actor);
        $this->community->deletePost($post, $actor);
        $this->tell($post->user_id, 'One of your posts was removed', $reason ?: 'It did not meet our community guidelines.');
    }

    public function setCommentStatus(Comment $c, string $status, User $actor): void
    {
        $this->master($actor);
        $c->update(['status' => $status]);
        AuditTrail::record("community.comment_{$status}", $actor, $c, ['author' => $c->user_id], $c->user_id);
    }

    // ── People ────────────────────────────────────────────────────────────────────────────────────

    public function ban(User $target, ?int $days, User $actor, ?string $reason = null): void
    {
        $this->master($actor);
        abort_if($target->isMaster(), 422, 'Head office accounts cannot be banned.');
        $until = $days ? now()->addDays($days) : now()->addYears(50);
        $this->community->profile($target)->update(['banned_until' => $until, 'moderation_note' => $reason ? mb_substr($reason, 0, 190) : null]);
        AuditTrail::record('community.user_banned', $actor, $target, ['days' => $days, 'reason' => $reason], $target->id);
        $this->tell($target->id, 'Your community access was suspended', ($days ? "For {$days} day(s). " : '') . ($reason ?: 'Please review our community guidelines.'));
    }

    public function mute(User $target, int $hours, User $actor, ?string $reason = null): void
    {
        $this->master($actor);
        abort_if($target->isMaster(), 422, 'Head office accounts cannot be muted.');
        $this->community->profile($target)->update(['muted_until' => now()->addHours(max(1, $hours)), 'moderation_note' => $reason ? mb_substr($reason, 0, 190) : null]);
        AuditTrail::record('community.user_muted', $actor, $target, ['hours' => $hours, 'reason' => $reason], $target->id);
        $this->tell($target->id, 'You have been muted for a while', "You can read, but not post or comment, for {$hours} hour(s).");
    }

    public function restore(User $target, User $actor): void
    {
        $this->master($actor);
        $this->community->profile($target)->update(['banned_until' => null, 'muted_until' => null, 'moderation_note' => null]);
        AuditTrail::record('community.user_restored', $actor, $target, [], $target->id);
        $this->tell($target->id, 'Your community access is back', 'You can post and comment again.');
    }

    public function setVerified(User $target, bool $verified, User $actor): void
    {
        $this->master($actor);
        $this->community->profile($target)->update(['is_verified' => $verified]);
        AuditTrail::record($verified ? 'community.user_verified' : 'community.user_unverified', $actor, $target, [], $target->id);
    }

    // ── Channels & marketplace ────────────────────────────────────────────────────────────────────

    public function setChannelStatus(Channel $c, string $status, User $actor): void
    {
        $this->master($actor);
        abort_unless(in_array($status, ['active', 'suspended'], true), 422);
        $c->update(['status' => $status]);
        AuditTrail::record("community.channel_{$status}", $actor, $c, ['name' => $c->name], $c->owner_id);
        $this->tell($c->owner_id, $status === 'suspended' ? "Your channel “{$c->name}” was suspended" : "Your channel “{$c->name}” is active again", $status === 'suspended' ? 'It was reviewed by head office. Contact us if you think this is a mistake.' : 'It is visible to the community again.');
    }

    public function setListingStatus(Listing $l, string $status, User $actor, ?string $reason = null): void
    {
        $this->master($actor);
        abort_unless(in_array($status, ['active', 'suspended'], true), 422);
        $l->update(['status' => $status]);
        AuditTrail::record("market.listing_{$status}", $actor, $l, ['title' => $l->title, 'reason' => $reason], $l->seller_id);
        $this->tell($l->seller_id, $status === 'suspended' ? "Your listing “{$l->title}” was suspended" : "Your listing “{$l->title}” is live again", $reason ?: ($status === 'suspended' ? 'It was reviewed by head office.' : 'It is visible in the marketplace again.'), 'market');
    }

    // ── Reports ───────────────────────────────────────────────────────────────────────────────────

    /** @param 'dismiss'|'hide'|'remove'|'ban' $action */
    public function resolveReport(Report $report, string $action, User $actor, ?string $reason = null): void
    {
        $this->master($actor);

        DB::transaction(function () use ($report, $action, $actor, $reason) {
            $subject = match ($report->subject_type) {
                'post' => Post::withTrashed()->find($report->subject_id), 'comment' => Comment::withTrashed()->find($report->subject_id), 'channel' => Channel::withTrashed()->find($report->subject_id),
                'user' => User::find($report->subject_id), 'listing' => Listing::withTrashed()->find($report->subject_id), default => null,
            };

            if ($subject && $action !== 'dismiss') {
                match ($report->subject_type) {
                    'post' => match ($action) { 'remove' => $this->removePost($subject, $actor, $reason), 'ban' => $this->banThen($subject->user_id, $actor, $reason, fn () => $this->setPostStatus($subject, 'hidden', $actor, $reason)), default => $this->setPostStatus($subject, 'hidden', $actor, $reason) },
                    'comment' => match ($action) { 'ban' => $this->banThen($subject->user_id, $actor, $reason, fn () => $this->setCommentStatus($subject, 'hidden', $actor)), default => $this->setCommentStatus($subject, 'hidden', $actor) },
                    'channel' => $this->setChannelStatus($subject, 'suspended', $actor),
                    'listing' => $this->setListingStatus($subject, 'suspended', $actor, $reason),
                    'user' => $this->ban($subject, 7, $actor, $reason),
                };
            }

            // Close every open report about the same thing, so the queue stays clean.
            Report::where('subject_type', $report->subject_type)->where('subject_id', $report->subject_id)->where('status', 'open')
                ->update(['status' => $action === 'dismiss' ? 'dismissed' : 'actioned', 'handled_by' => $actor->id, 'handled_at' => now()]);

            // A dismissed report on auto-hidden content means the content was fine: put it back.
            if ($action === 'dismiss' && in_array($report->subject_type, ['post', 'comment'], true) && $subject && $subject->status === 'hidden') {
                $subject->update(['status' => 'published']);
            }

            AuditTrail::record('community.report_' . ($action === 'dismiss' ? 'dismissed' : 'actioned'), $actor, $report, ['subject' => "{$report->subject_type}#{$report->subject_id}", 'action' => $action]);
        });
    }

    private function banThen(int $userId, User $actor, ?string $reason, callable $then): void
    {
        $then();
        if ($user = User::find($userId)) {
            $this->ban($user, 7, $actor, $reason);
        }
    }

    private function tell(int $userId, string $title, string $text, string $category = 'community'): void
    {
        Notification::create(['user_id' => $userId, 'title' => $title, 'message' => $text, 'type' => 'warning', 'category' => $category, 'is_read' => false]);
    }

    // ── Numbers for the master dashboard ──────────────────────────────────────────────────────────

    public function stats(): array
    {
        $since = now()->subDays(7);

        return [
            'posts_today'    => Post::where('created_at', '>=', now()->startOfDay())->count(),
            'posts_week'     => Post::where('created_at', '>=', $since)->count(),
            'active_people'  => DB::table('community_posts')->where('created_at', '>=', $since)->distinct()->count('user_id'),
            'open_reports'   => Report::where('status', 'open')->count(),
            'channels'       => Channel::where('status', 'active')->count(),
            'live_now'       => DB::table('community_live_sessions')->whereNotIn('status', ['cancelled', 'ended'])->where('scheduled_at', '<=', now())->where('scheduled_at', '>=', now()->subHours(WatchService::LIVE_WINDOW_HOURS))->count(),
            'listings'       => Listing::where('status', 'active')->count(),
            'orders_week'    => DB::table('market_orders')->where('created_at', '>=', $since)->count(),
            'banned'         => DB::table('community_profiles')->where('banned_until', '>', now())->count(),
            'profiles'       => DB::table('community_profiles')->count(),
        ];
    }
}
