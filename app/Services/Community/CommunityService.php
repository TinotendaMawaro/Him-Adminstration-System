<?php

namespace App\Services\Community;

use App\Models\Community\Channel;
use App\Models\Community\Comment;
use App\Models\Community\Post;
use App\Models\Community\Profile;
use App\Models\Notification;
use App\Models\User;
use App\Services\AuditTrail;
use App\Support\MediaLinks;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * Every rule of the community lives here (profiles, posts, feed, reactions, stories, follows, blocks, reports), so the
 * API controllers stay thin and the same rules apply to the mobile app, the master console and any future client.
 */
class CommunityService
{
    public const FEED_PAGE = 15;
    public const REPORT_AUTOHIDE_AT = 3;       // this many open reports hide a post until a moderator looks at it
    public const POST_LIMIT = 2000;

    // ── Profiles ──────────────────────────────────────────────────────────────────────────────────

    public function profile(User $user): Profile
    {
        return Profile::find($user->id) ?? Profile::create([
            'user_id' => $user->id,
            'handle'  => $this->uniqueHandle($user->name),
            'is_verified' => in_array($user->role->value, ['master', 'pastor'], true),
        ]);
    }

    public function uniqueHandle(string $name): string
    {
        $base = Str::of(Str::ascii($name))->lower()->replaceMatches('/[^a-z0-9]+/', '')->limit(18, '')->toString() ?: 'member';
        $handle = $base;
        for ($i = 0; Profile::where('handle', $handle)->exists(); $i++) {
            $handle = $base . random_int(10, 9999);
            if ($i > 20) {
                $handle = $base . Str::lower(Str::random(6));
            }
        }

        return $handle;
    }

    /** Muted or banned people cannot post, comment or chat; they can still read. */
    public function assertCanContribute(User $user): Profile
    {
        $profile = $this->profile($user);

        if ($profile->isBanned()) {
            abort(403, 'Your community access is suspended' . ($profile->banned_until->year > now()->year + 5 ? '.' : ' until ' . $profile->banned_until->format('d M Y') . '.'));
        }
        if ($profile->isMuted()) {
            abort(403, 'You are muted until ' . $profile->muted_until->format('d M H:i') . '.');
        }

        return $profile;
    }

    // ── Presenting (the shapes the apps receive) ──────────────────────────────────────────────────

    public function userMini(User $u, ?Profile $p = null): array
    {
        $p ??= $this->profile($u);
        $role = $u->role->value;

        return [
            'id'       => $u->id,
            'name'     => $u->name,
            'handle'   => $p->handle,
            'avatar'   => $u->profile_photo,
            'verified' => (bool) $p->is_verified || in_array($role, ['master', 'pastor'], true),
            'badge'    => ['master' => 'HIM Admin', 'pastor' => 'Pastor', 'hod' => 'Dept Head', 'partner' => 'Partner'][$role] ?? null,
            'zone'     => $u->relationLoaded('zone') ? $u->zone?->name : null,
        ];
    }

    /** @param Collection<int, Post> $posts */
    public function present(Collection $posts, User $viewer): array
    {
        if ($posts->isEmpty()) {
            return [];
        }

        // Callers pass either a query result or collect([$post]); relations can only be loaded on an Eloquent collection.
        $posts = $posts instanceof \Illuminate\Database\Eloquent\Collection ? $posts : new \Illuminate\Database\Eloquent\Collection($posts->all());
        $posts->load(['original']);
        $all = $posts->concat($posts->pluck('original')->filter())->unique('id');
        $ids = $all->pluck('id')->all();

        $users = User::with('zone:id,name')->whereIn('id', $all->pluck('user_id')->unique())->get()->keyBy('id');
        $profiles = Profile::whereIn('user_id', $users->keys())->get()->keyBy('user_id');
        $channels = Channel::whereIn('id', $all->pluck('channel_id')->filter()->unique())->get(['id', 'name', 'slug', 'is_private'])->keyBy('id');

        $liked = DB::table('community_likes')->where('user_id', $viewer->id)->where('likeable_type', 'post')->whereIn('likeable_id', $ids)->pluck('likeable_id')->flip();
        $saved = DB::table('community_bookmarks')->where('user_id', $viewer->id)->whereIn('post_id', $ids)->pluck('post_id')->flip();
        $reposted = Post::where('user_id', $viewer->id)->whereIn('repost_of_id', $ids)->pluck('repost_of_id')->flip();
        $tags = DB::table('community_post_hashtag as ph')->join('community_hashtags as h', 'h.id', '=', 'ph.hashtag_id')->whereIn('ph.post_id', $ids)->get(['ph.post_id', 'h.tag'])->groupBy('post_id');

        $pollIds = $all->where('kind', 'poll')->pluck('id');
        $votes = $pollIds->isEmpty() ? collect() : DB::table('community_poll_votes')->whereIn('post_id', $pollIds)->selectRaw('post_id, option_index, count(*) as n')->groupBy('post_id', 'option_index')->get()->groupBy('post_id');
        $mine = $pollIds->isEmpty() ? collect() : DB::table('community_poll_votes')->where('user_id', $viewer->id)->whereIn('post_id', $pollIds)->pluck('option_index', 'post_id');

        $card = function (Post $p) use ($viewer, $users, $profiles, $channels, $liked, $saved, $reposted, $tags, $votes, $mine) {
            $u = $users[$p->user_id] ?? null;
            $poll = null;
            if ($p->kind === 'poll' && $p->poll) {
                $counts = ($votes[$p->id] ?? collect())->pluck('n', 'option_index');
                $total = (int) $counts->sum();
                $poll = [
                    'options'   => collect($p->poll['options'] ?? [])->map(fn ($label, $i) => ['label' => $label, 'votes' => (int) ($counts[$i] ?? 0), 'percent' => $total ? round(100 * ($counts[$i] ?? 0) / $total) : 0])->values(),
                    'total'     => $total,
                    'my_vote'   => $mine[$p->id] ?? null,
                    'closes_at' => $p->poll['closes_at'] ?? null,
                    'closed'    => !empty($p->poll['closes_at']) && now()->gt($p->poll['closes_at']),
                ];
            }

            return [
                'id' => $p->id,
                'kind' => $p->kind,
                'author' => $u ? $this->userMini($u, $profiles[$p->user_id] ?? null) : null,
                'body' => $p->body,
                'media' => $p->media ?? [],
                'poll' => $poll,
                'hashtags' => ($tags[$p->id] ?? collect())->pluck('tag')->values(),
                'channel' => $p->channel_id && isset($channels[$p->channel_id]) ? ['id' => $p->channel_id, 'name' => $channels[$p->channel_id]->name, 'slug' => $channels[$p->channel_id]->slug] : null,
                'likes' => $p->likes_count, 'comments' => $p->comments_count, 'reposts' => $p->reposts_count, 'views' => $p->views_count,
                'liked' => isset($liked[$p->id]), 'saved' => isset($saved[$p->id]), 'reposted' => isset($reposted[$p->id]),
                'pinned' => (bool) $p->is_pinned,
                'status' => $p->status,
                'mine' => $p->user_id === $viewer->id,
                'created_at' => $p->created_at?->toIso8601String(),
            ];
        };

        return $posts->map(function (Post $p) use ($card) {
            $row = $card($p);
            $row['repost_of'] = $p->original && $p->original->status === 'published' ? $card($p->original) : null;

            return $row;
        })->values()->all();
    }

    // ── Posting ───────────────────────────────────────────────────────────────────────────────────

    public function clean(?string $text, int $limit = self::POST_LIMIT): string
    {
        $text = strip_tags((string) $text);
        $text = str_replace(["\r\n", "\r"], "\n", $text);
        $text = preg_replace("/\n{4,}/", "\n\n\n", $text);
        $text = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $text);

        return Str::limit(trim($text), $limit, '');
    }

    public function createPost(User $author, array $d): Post
    {
        $profile = $this->assertCanContribute($author);

        $body = $this->clean($d['body'] ?? '');
        [$media, $rejected] = MediaLinks::parseMany((array) ($d['media_urls'] ?? []));
        if ($rejected) {
            throw ValidationException::withMessages(['media_urls' => 'Only YouTube/Vimeo links and https image links are allowed.']);
        }

        $poll = null;
        if (!empty($d['poll']['options'])) {
            $options = collect($d['poll']['options'])->map(fn ($o) => Str::limit($this->clean((string) $o, 60), 60, ''))->filter()->unique()->values();
            if ($options->count() < 2 || $options->count() > 4) {
                throw ValidationException::withMessages(['poll' => 'A poll needs 2 to 4 different options.']);
            }
            $hours = max(1, min(168, (int) ($d['poll']['hours'] ?? 24)));
            $poll = ['options' => $options->all(), 'closes_at' => now()->addHours($hours)->toIso8601String()];
            if ($body === '') {
                throw ValidationException::withMessages(['body' => 'Ask a question for your poll.']);
            }
        }

        if ($body === '' && !$media && !$poll) {
            throw ValidationException::withMessages(['body' => 'Write something or add a photo, video or poll.']);
        }

        $video = collect($media)->firstWhere('type', 'video');
        $kind = match (true) {
            $poll !== null => 'poll',
            $video && ($video['short'] || ($d['kind'] ?? '') === 'short') => 'short',
            $video !== null => 'video',
            (bool) $media => 'image',
            default => 'text',
        };

        if (($d['kind'] ?? '') === 'announcement') {
            abort_unless(in_array($author->role->value, ['master', 'pastor'], true), 403, 'Only pastors and head office can post announcements.');
            $kind = 'announcement';
        }

        $channelId = null;
        if (!empty($d['channel_id'])) {
            $channel = Channel::findOrFail($d['channel_id']);
            abort_unless(app(ChannelService::class)->isMember($channel, $author), 403, 'Join this channel to post in it.');
            $channelId = $channel->id;
        }

        // A double tap on "Post" must not publish twice.
        if ($body !== '' && Post::where('user_id', $author->id)->where('body', $body)->where('created_at', '>=', now()->subMinutes(2))->exists()) {
            throw ValidationException::withMessages(['body' => 'You just posted that.']);
        }

        return DB::transaction(function () use ($author, $profile, $body, $media, $poll, $kind, $channelId) {
            $post = Post::create([
                'user_id' => $author->id, 'channel_id' => $channelId, 'kind' => $kind, 'body' => $body ?: null,
                'media' => $media ?: null, 'poll' => $poll,
            ]);

            $this->syncHashtags($post, $body);
            $profile->increment('posts_count');
            $this->notifyMentions($post, $author, $body);

            return $post->refresh();      // load the database defaults (status, counters) so callers see the real row
        });
    }

    private function syncHashtags(Post $post, string $body): void
    {
        preg_match_all('/(?<![\p{L}\p{N}_])#([\p{L}][\p{L}\p{N}_]{1,39})/u', $body, $m);
        $tags = collect($m[1])->map(fn ($t) => Str::lower($t))->unique()->take(10);

        foreach ($tags as $tag) {
            $id = DB::table('community_hashtags')->where('tag', $tag)->value('id');
            if (!$id) {
                $id = DB::table('community_hashtags')->insertGetId(['tag' => $tag, 'uses_count' => 0, 'last_used_at' => now()]);
            }
            DB::table('community_hashtags')->where('id', $id)->update(['uses_count' => DB::raw('uses_count + 1'), 'last_used_at' => now()]);
            DB::table('community_post_hashtag')->insertOrIgnore(['post_id' => $post->id, 'hashtag_id' => $id]);
        }
    }

    private function notifyMentions(Post|Comment $subject, User $author, string $body): void
    {
        preg_match_all('/(?<![\p{L}\p{N}_])@([a-z0-9]{3,30})/i', $body, $m);
        $handles = collect($m[1])->map(fn ($h) => Str::lower($h))->unique()->take(5);
        if ($handles->isEmpty()) {
            return;
        }

        $postId = $subject instanceof Post ? $subject->id : $subject->post_id;
        Profile::whereIn('handle', $handles)->where('user_id', '!=', $author->id)->pluck('user_id')->each(fn ($uid) => $this->notify($uid, $author, 'mention', "{$author->name} mentioned you", Str::limit($body, 100), $postId));
    }

    public function deletePost(Post $post, User $actor): void
    {
        abort_unless($post->user_id === $actor->id || $this->isModerator($actor), 403, 'You can only delete your own posts.');

        DB::transaction(function () use ($post, $actor) {
            $post->delete();
            Profile::where('user_id', $post->user_id)->where('posts_count', '>', 0)->decrement('posts_count');
            if ($post->repost_of_id) {
                Post::where('id', $post->repost_of_id)->where('reposts_count', '>', 0)->decrement('reposts_count');
            }
            if ($post->user_id !== $actor->id) {
                AuditTrail::record('community.post_removed', $actor, $post, ['author' => $post->user_id], $post->user_id);
            }
        });
    }

    // ── Reactions ─────────────────────────────────────────────────────────────────────────────────

    /** @return array{liked: bool, likes: int} */
    public function toggleLike(User $user, string $type, int $id): array
    {
        $this->assertCanContribute($user);
        $model = $type === 'post' ? Post::published()->findOrFail($id) : Comment::where('status', 'published')->findOrFail($id);
        $table = $type === 'post' ? 'community_posts' : 'community_comments';

        return DB::transaction(function () use ($user, $type, $id, $model, $table) {
            $removed = DB::table('community_likes')->where(['user_id' => $user->id, 'likeable_type' => $type, 'likeable_id' => $id])->delete();

            if ($removed) {
                DB::table($table)->where('id', $id)->where('likes_count', '>', 0)->decrement('likes_count');
                $liked = false;
            } else {
                DB::table('community_likes')->insertOrIgnore(['user_id' => $user->id, 'likeable_type' => $type, 'likeable_id' => $id, 'created_at' => now()]);
                DB::table($table)->where('id', $id)->increment('likes_count');
                $liked = true;
                if ($model->user_id !== $user->id) {
                    $postId = $type === 'post' ? $id : $model->post_id;
                    $this->notify($model->user_id, $user, 'like', "{$user->name} liked your " . ($type === 'post' ? 'post' : 'comment'), Str::limit((string) ($model->body ?? ''), 90), $postId, dedupe: true);
                }
            }

            return ['liked' => $liked, 'likes' => (int) DB::table($table)->where('id', $id)->value('likes_count')];
        });
    }

    public function toggleBookmark(User $user, Post $post): bool
    {
        $removed = DB::table('community_bookmarks')->where(['user_id' => $user->id, 'post_id' => $post->id])->delete();
        if (!$removed) {
            DB::table('community_bookmarks')->insertOrIgnore(['user_id' => $user->id, 'post_id' => $post->id, 'created_at' => now()]);
        }

        return !$removed;
    }

    /** Reposting (the X "retweet"): re-share someone's post to your followers; the same action again undoes it. */
    public function toggleRepost(User $user, Post $post): array
    {
        $this->assertCanContribute($user);
        $original = $post->repost_of_id ? Post::published()->findOrFail($post->repost_of_id) : $post;
        abort_if($original->channel_id && Channel::where('id', $original->channel_id)->value('is_private'), 403, 'Posts in private channels cannot be reposted.');

        $existing = Post::where('user_id', $user->id)->where('repost_of_id', $original->id)->first();

        return DB::transaction(function () use ($user, $original, $existing) {
            if ($existing) {
                $existing->delete();
                Post::where('id', $original->id)->where('reposts_count', '>', 0)->decrement('reposts_count');
                $on = false;
            } else {
                Post::create(['user_id' => $user->id, 'kind' => 'text', 'repost_of_id' => $original->id]);
                $original->increment('reposts_count');
                if ($original->user_id !== $user->id) {
                    $this->notify($original->user_id, $user, 'repost', "{$user->name} reposted your post", Str::limit((string) $original->body, 90), $original->id, dedupe: true);
                }
                $on = true;
            }

            return ['reposted' => $on, 'reposts' => (int) Post::where('id', $original->id)->value('reposts_count')];
        });
    }

    public function vote(User $user, Post $post, int $option): array
    {
        $this->assertCanContribute($user);
        abort_unless($post->kind === 'poll' && $post->poll, 422, 'This post has no poll.');
        abort_if(!empty($post->poll['closes_at']) && now()->gt($post->poll['closes_at']), 422, 'This poll is closed.');
        abort_unless($option >= 0 && $option < count($post->poll['options']), 422, 'Choose one of the options.');

        DB::table('community_poll_votes')->insertOrIgnore(['post_id' => $post->id, 'user_id' => $user->id, 'option_index' => $option, 'created_at' => now()]);

        return $this->present(collect([$post->fresh()]), $user)[0]['poll'];
    }

    // ── Comments ──────────────────────────────────────────────────────────────────────────────────

    public function addComment(User $user, Post $post, string $body, ?int $parentId = null): Comment
    {
        $this->assertCanContribute($user);
        abort_unless($post->status === 'published', 404);
        $body = $this->clean($body, 800);
        if ($body === '') {
            throw ValidationException::withMessages(['body' => 'Write a comment first.']);
        }

        if ($parentId) {
            $parent = Comment::where('post_id', $post->id)->where('status', 'published')->findOrFail($parentId);
            $parentId = $parent->parent_id ?: $parent->id;       // replies are one level deep
        }

        return DB::transaction(function () use ($user, $post, $body, $parentId) {
            $c = Comment::create(['post_id' => $post->id, 'user_id' => $user->id, 'parent_id' => $parentId, 'body' => $body]);
            $post->increment('comments_count');
            $this->notifyMentions($c, $user, $body);
            if ($post->user_id !== $user->id) {
                $this->notify($post->user_id, $user, 'comment', "{$user->name} commented on your post", Str::limit($body, 100), $post->id);
            }

            return $c;
        });
    }

    public function deleteComment(Comment $c, User $actor): void
    {
        abort_unless($c->user_id === $actor->id || $this->isModerator($actor), 403, 'You can only delete your own comments.');

        DB::transaction(function () use ($c) {
            $removed = 1 + Comment::where('parent_id', $c->id)->count();
            Comment::where('parent_id', $c->id)->delete();
            $c->delete();
            Post::where('id', $c->post_id)->update(['comments_count' => DB::raw("GREATEST(comments_count - {$removed}, 0)")]);
        });
    }

    // ── Feed ──────────────────────────────────────────────────────────────────────────────────────

    /** @return array{items: array, next_page: ?int} */
    public function feed(User $viewer, string $tab = 'for_you', int $page = 1, array $opts = []): array
    {
        $hidden = $this->hiddenAuthorIds($viewer);
        $q = Post::query()->published()->whereNull('deleted_at');

        if ($hidden) {
            $q->whereNotIn('community_posts.user_id', $hidden);
        }

        // Private channels only for their members; everything else is public.
        $mine = DB::table('channel_members')->where('user_id', $viewer->id)->where('status', 'active')->pluck('channel_id');
        $q->where(function ($w) use ($mine) {
            $w->whereNull('channel_id')
                ->orWhereIn('channel_id', DB::table('channels')->where('is_private', false)->where('status', 'active')->select('id'))
                ->orWhereIn('channel_id', $mine);
        });

        if (!empty($opts['channel_id'])) {
            $q->where('channel_id', (int) $opts['channel_id']);
        } elseif ($tab !== 'channels') {
            $q->whereNull('channel_id');     // the main feed shows people, not channel chatter (channels have their own page)
        }

        if (!empty($opts['user_id'])) {
            $q->where('community_posts.user_id', (int) $opts['user_id']);
        }
        if (!empty($opts['hashtag'])) {
            $q->whereIn('community_posts.id', DB::table('community_post_hashtag as ph')->join('community_hashtags as h', 'h.id', '=', 'ph.hashtag_id')->where('h.tag', Str::lower($opts['hashtag']))->select('ph.post_id'));
        }
        if (!empty($opts['kinds'])) {
            $q->whereIn('kind', (array) $opts['kinds']);
        }
        if (!empty($opts['saved'])) {
            $q->whereIn('community_posts.id', DB::table('community_bookmarks')->where('user_id', $viewer->id)->select('post_id'));
        }

        match ($tab) {
            'following' => $q->where(fn ($w) => $w->whereIn('community_posts.user_id', DB::table('community_follows')->where('follower_id', $viewer->id)->select('followed_id'))->orWhere('community_posts.user_id', $viewer->id)),
            'zone'      => $q->whereIn('community_posts.user_id', User::where('zone_id', $viewer->zone_id)->select('id')),
            'channels'  => $q->whereIn('channel_id', $mine),
            default     => null,
        };

        if ($tab === 'for_you' && empty($opts['user_id']) && empty($opts['hashtag']) && empty($opts['saved']) && empty($opts['channel_id'])) {
            // Engagement-weighted recency: busy posts rise, but nothing stays on top for more than a day or two.
            $q->where('community_posts.created_at', '>=', now()->subDays(30))
                ->orderByRaw('(community_posts.likes_count * 2 + community_posts.comments_count * 3 + community_posts.reposts_count * 4 + 10) / POW(TIMESTAMPDIFF(HOUR, community_posts.created_at, NOW()) + 2, 1.3) DESC')
                ->orderByDesc('community_posts.id');
        } else {
            $q->orderByDesc('is_pinned')->orderByDesc('community_posts.id');
        }

        $page = max(1, $page);
        $rows = $q->select('community_posts.*')->forPage($page, self::FEED_PAGE + 1)->get();
        $more = $rows->count() > self::FEED_PAGE;

        return ['items' => $this->present($rows->take(self::FEED_PAGE), $viewer), 'next_page' => $more ? $page + 1 : null];
    }

    /** People whose posts the viewer must never see: blocked by them or blocking them. */
    public function hiddenAuthorIds(User $viewer): array
    {
        return DB::table('community_blocks')->where('blocker_id', $viewer->id)->pluck('blocked_id')
            ->merge(DB::table('community_blocks')->where('blocked_id', $viewer->id)->pluck('blocker_id'))
            ->unique()->values()->all();
    }

    // ── Follows, blocks ───────────────────────────────────────────────────────────────────────────

    public function toggleFollow(User $user, User $target): bool
    {
        abort_if($user->id === $target->id, 422, 'You cannot follow yourself.');
        abort_if(in_array($target->id, $this->hiddenAuthorIds($user), true), 403, 'You cannot follow this person.');
        abort_unless($target->is_active, 404);

        return DB::transaction(function () use ($user, $target) {
            $removed = DB::table('community_follows')->where(['follower_id' => $user->id, 'followed_id' => $target->id])->delete();
            $a = $this->profile($user);
            $b = $this->profile($target);

            if ($removed) {
                $a->where('user_id', $a->user_id)->where('following_count', '>', 0)->decrement('following_count');
                $b->where('user_id', $b->user_id)->where('followers_count', '>', 0)->decrement('followers_count');

                return false;
            }

            DB::table('community_follows')->insertOrIgnore(['follower_id' => $user->id, 'followed_id' => $target->id, 'created_at' => now()]);
            Profile::where('user_id', $a->user_id)->increment('following_count');
            Profile::where('user_id', $b->user_id)->increment('followers_count');
            $this->notify($target->id, $user, 'follow', "{$user->name} started following you", null, null, dedupe: true);

            return true;
        });
    }

    public function toggleBlock(User $user, User $target): bool
    {
        abort_if($user->id === $target->id, 422, 'You cannot block yourself.');
        abort_if($target->role->value === 'master', 403, 'Head office accounts cannot be blocked.');

        $removed = DB::table('community_blocks')->where(['blocker_id' => $user->id, 'blocked_id' => $target->id])->delete();
        if ($removed) {
            return false;
        }

        DB::table('community_blocks')->insertOrIgnore(['blocker_id' => $user->id, 'blocked_id' => $target->id, 'created_at' => now()]);
        foreach ([[$user->id, $target->id], [$target->id, $user->id]] as [$a, $b]) {
            if (DB::table('community_follows')->where(['follower_id' => $a, 'followed_id' => $b])->delete()) {
                Profile::where('user_id', $a)->where('following_count', '>', 0)->decrement('following_count');
                Profile::where('user_id', $b)->where('followers_count', '>', 0)->decrement('followers_count');
            }
        }

        return true;
    }

    // ── Stories ───────────────────────────────────────────────────────────────────────────────────

    public function createStory(User $user, array $d): \App\Models\Community\Story
    {
        $this->assertCanContribute($user);
        $kind = in_array($d['kind'] ?? 'image', ['image', 'video', 'text'], true) ? ($d['kind'] ?? 'image') : 'image';
        $url = null;

        if ($kind === 'image') {
            $img = MediaLinks::image((string) ($d['media_url'] ?? ''));
            $url = $img['url'] ?? throw ValidationException::withMessages(['media_url' => 'Add an https image link.']);
        } elseif ($kind === 'video') {
            $v = MediaLinks::video((string) ($d['media_url'] ?? ''));
            $url = $v['url'] ?? throw ValidationException::withMessages(['media_url' => 'Add a YouTube or Vimeo link.']);
        }
        $caption = $this->clean($d['caption'] ?? '', 220);
        if ($kind === 'text' && $caption === '') {
            throw ValidationException::withMessages(['caption' => 'Write something for your story.']);
        }
        if (\App\Models\Community\Story::where('user_id', $user->id)->live()->count() >= 15) {
            throw ValidationException::withMessages(['kind' => 'You can have 15 live stories at a time.']);
        }

        return \App\Models\Community\Story::create([
            'user_id' => $user->id, 'kind' => $kind, 'media_url' => $url, 'caption' => $caption ?: null,
            'background' => in_array($d['background'] ?? '', ['#1e3a5f', '#7c3aed', '#be123c', '#047857', '#b45309', '#0f172a'], true) ? $d['background'] : '#1e3a5f',
            'expires_at' => now()->addDay(),
        ]);
    }

    /** One ring per person with a live story: people you follow, you, and the official accounts; unseen first. */
    public function storyRings(User $viewer): array
    {
        $hidden = $this->hiddenAuthorIds($viewer);
        $ids = DB::table('community_follows')->where('follower_id', $viewer->id)->pluck('followed_id')
            ->push($viewer->id)->merge(User::whereIn('role', ['master', 'pastor'])->where('zone_id', $viewer->zone_id)->pluck('id'))
            ->merge(User::where('role', 'master')->pluck('id'))->unique()->diff($hidden);

        $stories = \App\Models\Community\Story::live()->whereIn('user_id', $ids)->orderBy('created_at')->get();
        if ($stories->isEmpty()) {
            return [];
        }

        $seen = DB::table('community_story_views')->where('user_id', $viewer->id)->whereIn('story_id', $stories->pluck('id'))->pluck('story_id')->flip();
        $users = User::with('zone:id,name')->whereIn('id', $stories->pluck('user_id')->unique())->get()->keyBy('id');
        $profiles = Profile::whereIn('user_id', $users->keys())->get()->keyBy('user_id');

        return $stories->groupBy('user_id')->map(function ($list, $uid) use ($users, $profiles, $seen, $viewer) {
            $u = $users[$uid];

            return [
                'user' => $this->userMini($u, $profiles[$uid] ?? null),
                'mine' => $uid === $viewer->id,
                'all_seen' => $list->every(fn ($s) => isset($seen[$s->id])),
                'stories' => $list->map(fn ($s) => [
                    'id' => $s->id, 'kind' => $s->kind, 'media_url' => $s->media_url, 'caption' => $s->caption, 'background' => $s->background,
                    'views' => $s->views_count, 'seen' => isset($seen[$s->id]), 'created_at' => $s->created_at->toIso8601String(), 'expires_at' => $s->expires_at->toIso8601String(),
                ])->values(),
            ];
        })->sortBy([fn ($a, $b) => $b['mine'] <=> $a['mine'], fn ($a, $b) => $a['all_seen'] <=> $b['all_seen']])->values()->all();
    }

    public function viewStory(User $viewer, \App\Models\Community\Story $story): void
    {
        abort_unless($story->expires_at->isFuture(), 404);
        if (DB::table('community_story_views')->insertOrIgnore(['story_id' => $story->id, 'user_id' => $viewer->id, 'created_at' => now()])) {
            $story->increment('views_count');
        }
    }

    // ── Reports & moderation ──────────────────────────────────────────────────────────────────────

    public function report(User $reporter, string $type, int $id, string $reason, ?string $details): void
    {
        $subject = match ($type) {
            'post' => Post::findOrFail($id), 'comment' => Comment::findOrFail($id), 'channel' => Channel::findOrFail($id),
            'user' => User::findOrFail($id), 'listing' => \App\Models\Market\Listing::findOrFail($id), default => abort(422, 'Unknown item.'),
        };
        abort_if($type === 'user' && $subject->id === $reporter->id, 422, 'You cannot report yourself.');

        \App\Models\Community\Report::firstOrCreate(
            ['reporter_id' => $reporter->id, 'subject_type' => $type, 'subject_id' => $id],
            ['reason' => Str::limit($reason, 40, ''), 'details' => $details ? $this->clean($details, 500) : null],
        );

        // Several independent reports hide a post/comment until a moderator has reviewed it.
        if (in_array($type, ['post', 'comment'], true)) {
            $open = \App\Models\Community\Report::where('subject_type', $type)->where('subject_id', $id)->where('status', 'open')->count();
            if ($open >= self::REPORT_AUTOHIDE_AT && $subject->status === 'published') {
                $subject->update(['status' => 'hidden']);
            }
        }
    }

    public function isModerator(User $u): bool
    {
        return $u->isMaster();
    }

    // ── Notifications (in-app; never emailed: see config/mailing.php) ─────────────────────────────

    public function notify(int $userId, User $actor, string $event, string $title, ?string $text, ?int $postId, bool $dedupe = false): void
    {
        if ($userId === $actor->id || !User::where('id', $userId)->where('is_active', true)->exists()) {
            return;
        }
        if (DB::table('community_blocks')->where('blocker_id', $userId)->where('blocked_id', $actor->id)->exists()) {
            return;
        }

        if ($dedupe && Notification::where('user_id', $userId)->where('category', 'community')->where('title', $title)->where('is_read', false)->exists()) {
            return;
        }

        Notification::create([
            'user_id' => $userId, 'title' => $title, 'message' => $text ?: ($postId ? "Open post #{$postId}" : 'Open the community'),
            'type' => 'info', 'category' => 'community', 'is_read' => false,
        ]);
    }

    // ── Discovery ─────────────────────────────────────────────────────────────────────────────────

    public function trending(int $limit = 10): array
    {
        return DB::table('community_post_hashtag as ph')
            ->join('community_hashtags as h', 'h.id', '=', 'ph.hashtag_id')
            ->join('community_posts as p', 'p.id', '=', 'ph.post_id')
            ->where('p.status', 'published')->whereNull('p.deleted_at')->where('p.created_at', '>=', now()->subDays(7))
            ->groupBy('h.tag')->orderByRaw('count(*) desc')->limit($limit)
            ->selectRaw('h.tag, count(*) as posts')->get()->all();
    }

    public function suggestedPeople(User $viewer, int $limit = 8): array
    {
        $hidden = $this->hiddenAuthorIds($viewer);
        $following = DB::table('community_follows')->where('follower_id', $viewer->id)->pluck('followed_id')->push($viewer->id);

        $users = User::with('zone:id,name')->where('is_active', true)->whereIn('role', ['member', 'partner', 'pastor', 'hod'])
            ->whereNotIn('id', $following->merge($hidden))
            ->orderByRaw('(zone_id = ?) desc', [$viewer->zone_id ?? 0])->orderByRaw("(role = 'pastor') desc")->limit($limit)->get();
        $profiles = Profile::whereIn('user_id', $users->pluck('id'))->get()->keyBy('user_id');

        return $users->map(fn (User $u) => $this->userMini($u, $profiles[$u->id] ?? $this->profile($u)) + ['followers' => ($profiles[$u->id] ?? null)?->followers_count ?? 0])->all();
    }

    public function search(User $viewer, string $q): array
    {
        $q = trim($q);
        if (mb_strlen($q) < 2) {
            return ['people' => [], 'tags' => [], 'channels' => []];
        }
        $like = '%' . addcslashes($q, '%_\\') . '%';
        $hidden = $this->hiddenAuthorIds($viewer);

        $users = User::with('zone:id,name')->where('is_active', true)->whereNotIn('id', $hidden)->where(function ($w) use ($like) {
            $w->where('name', 'like', $like)->orWhereIn('id', Profile::where('handle', 'like', $like)->select('user_id'));
        })->limit(10)->get();
        $profiles = Profile::whereIn('user_id', $users->pluck('id'))->get()->keyBy('user_id');

        return [
            'people'   => $users->map(fn ($u) => $this->userMini($u, $profiles[$u->id] ?? null))->all(),
            'tags'     => DB::table('community_hashtags')->where('tag', 'like', Str::lower(ltrim($q, '#')) . '%')->orderByDesc('uses_count')->limit(8)->pluck('tag')->all(),
            'channels' => Channel::where('status', 'active')->where('is_private', false)->where(fn ($w) => $w->where('name', 'like', $like)->orWhere('description', 'like', $like))->limit(8)->get(['id', 'name', 'slug', 'description', 'members_count', 'avatar_url'])->all(),
        ];
    }
}
