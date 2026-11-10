<?php

namespace App\Http\Controllers\Api\Community;

use App\Http\Controllers\Controller;
use App\Models\Community\Comment;
use App\Models\Community\Post;
use App\Models\Community\Profile;
use App\Models\Community\Story;
use App\Models\User;
use App\Services\Community\CommunityService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class CommunityController extends Controller
{
    public function __construct(private CommunityService $svc) {}

    // ── Feed & posts ──────────────────────────────────────────────────────────────────────────────

    /** GET /community/feed?tab=for_you|following|zone|channels&page= */
    public function feed(Request $r): JsonResponse
    {
        $v = $r->validate(['tab' => ['nullable', Rule::in(['for_you', 'following', 'zone', 'channels'])], 'page' => ['nullable', 'integer', 'min:1', 'max:200'], 'hashtag' => ['nullable', 'string', 'max:40'], 'user_id' => ['nullable', 'integer'], 'channel_id' => ['nullable', 'integer']]);

        return response()->json(['success' => true] + $this->svc->feed($r->user(), $v['tab'] ?? 'for_you', (int) ($v['page'] ?? 1), array_filter(['hashtag' => $v['hashtag'] ?? null, 'user_id' => $v['user_id'] ?? null, 'channel_id' => $v['channel_id'] ?? null])));
    }

    /** GET /community/shorts — the vertical video feed */
    public function shorts(Request $r): JsonResponse
    {
        $page = max(1, min(100, (int) $r->query('page', 1)));

        return response()->json(['success' => true] + $this->svc->feed($r->user(), 'shorts', $page, ['kinds' => ['short', 'video']]));
    }

    public function bookmarks(Request $r): JsonResponse
    {
        return response()->json(['success' => true] + $this->svc->feed($r->user(), 'saved', max(1, (int) $r->query('page', 1)), ['saved' => true]));
    }

    public function store(Request $r): JsonResponse
    {
        $d = $r->validate([
            'body' => ['nullable', 'string', 'max:5000'], 'kind' => ['nullable', Rule::in(['text', 'short', 'announcement'])],
            'media_urls' => ['nullable', 'array', 'max:5'], 'media_urls.*' => ['string', 'max:500'],
            'poll' => ['nullable', 'array'], 'poll.options' => ['nullable', 'array', 'max:6'], 'poll.options.*' => ['string', 'max:100'], 'poll.hours' => ['nullable', 'integer'],
            'channel_id' => ['nullable', 'integer', 'exists:channels,id'],
        ]);

        $post = $this->svc->createPost($r->user(), $d);

        return response()->json(['success' => true, 'data' => $this->svc->present(collect([$post]), $r->user())[0]], 201);
    }

    public function show(Request $r, int $id): JsonResponse
    {
        $post = Post::published()->findOrFail($id);
        $this->authoriseVisible($post, $r->user());

        return response()->json(['success' => true, 'data' => $this->svc->present(collect([$post]), $r->user())[0]]);
    }

    public function destroy(Request $r, int $id): JsonResponse
    {
        $this->svc->deletePost(Post::findOrFail($id), $r->user());

        return response()->json(['success' => true]);
    }

    public function view(Request $r, int $id): JsonResponse
    {
        Post::published()->where('id', $id)->increment('views_count');

        return response()->json(['success' => true]);
    }

    public function like(Request $r, int $id): JsonResponse
    {
        return response()->json(['success' => true] + $this->svc->toggleLike($r->user(), 'post', $id));
    }

    public function bookmark(Request $r, int $id): JsonResponse
    {
        return response()->json(['success' => true, 'saved' => $this->svc->toggleBookmark($r->user(), Post::published()->findOrFail($id))]);
    }

    public function repost(Request $r, int $id): JsonResponse
    {
        return response()->json(['success' => true] + $this->svc->toggleRepost($r->user(), Post::published()->findOrFail($id)));
    }

    public function vote(Request $r, int $id): JsonResponse
    {
        $v = $r->validate(['option' => ['required', 'integer', 'min:0', 'max:5']]);

        return response()->json(['success' => true, 'poll' => $this->svc->vote($r->user(), Post::published()->findOrFail($id), (int) $v['option'])]);
    }

    /** Moderators (head office) pin a post to the top of profiles/channels. */
    public function pin(Request $r, int $id): JsonResponse
    {
        abort_unless($this->svc->isModerator($r->user()), 403);
        $post = Post::findOrFail($id);
        $post->update(['is_pinned' => !$post->is_pinned]);

        return response()->json(['success' => true, 'pinned' => $post->is_pinned]);
    }

    // ── Comments ──────────────────────────────────────────────────────────────────────────────────

    public function comments(Request $r, int $id): JsonResponse
    {
        $post = Post::published()->findOrFail($id);
        $this->authoriseVisible($post, $r->user());
        $hidden = $this->svc->hiddenAuthorIds($r->user());

        $rows = Comment::with('author.zone:id,name')->where('post_id', $post->id)->where('status', 'published')
            ->when($hidden, fn ($q) => $q->whereNotIn('user_id', $hidden))->orderBy('id')->limit(300)->get();
        $liked = DB::table('community_likes')->where('user_id', $r->user()->id)->where('likeable_type', 'comment')->whereIn('likeable_id', $rows->pluck('id'))->pluck('likeable_id')->flip();
        $profiles = Profile::whereIn('user_id', $rows->pluck('user_id')->unique())->get()->keyBy('user_id');

        $shape = fn (Comment $c) => [
            'id' => $c->id, 'body' => $c->body, 'likes' => $c->likes_count, 'liked' => isset($liked[$c->id]), 'mine' => $c->user_id === $r->user()->id,
            'author' => $this->svc->userMini($c->author, $profiles[$c->user_id] ?? null), 'created_at' => $c->created_at->toIso8601String(), 'parent_id' => $c->parent_id,
        ];

        $top = $rows->whereNull('parent_id')->map(function ($c) use ($rows, $shape) {
            return $shape($c) + ['replies' => $rows->where('parent_id', $c->id)->map($shape)->values()->all()];
        })->values();

        return response()->json(['success' => true, 'data' => $top, 'total' => $post->comments_count]);
    }

    public function addComment(Request $r, int $id): JsonResponse
    {
        $v = $r->validate(['body' => ['required', 'string', 'max:2000'], 'parent_id' => ['nullable', 'integer']]);
        $post = Post::published()->findOrFail($id);
        $this->authoriseVisible($post, $r->user());
        $c = $this->svc->addComment($r->user(), $post, $v['body'], $v['parent_id'] ?? null);

        return response()->json(['success' => true, 'data' => ['id' => $c->id, 'body' => $c->body, 'likes' => 0, 'liked' => false, 'mine' => true, 'author' => $this->svc->userMini($r->user()), 'created_at' => $c->created_at->toIso8601String(), 'parent_id' => $c->parent_id, 'replies' => []]], 201);
    }

    public function deleteComment(Request $r, int $id): JsonResponse
    {
        $this->svc->deleteComment(Comment::findOrFail($id), $r->user());

        return response()->json(['success' => true]);
    }

    public function likeComment(Request $r, int $id): JsonResponse
    {
        return response()->json(['success' => true] + $this->svc->toggleLike($r->user(), 'comment', $id));
    }

    // ── Stories ───────────────────────────────────────────────────────────────────────────────────

    public function stories(Request $r): JsonResponse
    {
        return response()->json(['success' => true, 'data' => $this->svc->storyRings($r->user())]);
    }

    public function createStory(Request $r): JsonResponse
    {
        $d = $r->validate(['kind' => ['nullable', Rule::in(['image', 'video', 'text'])], 'media_url' => ['nullable', 'string', 'max:500'], 'caption' => ['nullable', 'string', 'max:500'], 'background' => ['nullable', 'string', 'max:20']]);
        $s = $this->svc->createStory($r->user(), $d);

        return response()->json(['success' => true, 'id' => $s->id], 201);
    }

    public function viewStory(Request $r, int $id): JsonResponse
    {
        $story = Story::findOrFail($id);
        abort_if(in_array($story->user_id, $this->svc->hiddenAuthorIds($r->user()), true), 404);
        $this->svc->viewStory($r->user(), $story);

        return response()->json(['success' => true]);
    }

    public function deleteStory(Request $r, int $id): JsonResponse
    {
        $story = Story::findOrFail($id);
        abort_unless($story->user_id === $r->user()->id || $r->user()->isMaster(), 403);
        $story->delete();

        return response()->json(['success' => true]);
    }

    // ── People ────────────────────────────────────────────────────────────────────────────────────

    public function me(Request $r): JsonResponse
    {
        $u = $r->user()->loadMissing('zone:id,name');

        return response()->json(['success' => true, 'data' => $this->profileData($u, $u)]);
    }

    public function profile(Request $r, int $id): JsonResponse
    {
        $target = User::with('zone:id,name')->where('is_active', true)->findOrFail($id);
        abort_if(in_array($target->id, $this->svc->hiddenAuthorIds($r->user()), true), 404);

        return response()->json(['success' => true, 'data' => $this->profileData($target, $r->user())]);
    }

    private function profileData(User $target, User $viewer): array
    {
        $p = $this->svc->profile($target);

        return $this->svc->userMini($target, $p) + [
            'bio' => $p->bio, 'website' => $p->website, 'cover' => $p->cover_url,
            'followers' => $p->followers_count, 'following' => $p->following_count, 'posts' => $p->posts_count,
            'is_me' => $target->id === $viewer->id,
            'following_them' => DB::table('community_follows')->where(['follower_id' => $viewer->id, 'followed_id' => $target->id])->exists(),
            'blocked' => DB::table('community_blocks')->where(['blocker_id' => $viewer->id, 'blocked_id' => $target->id])->exists(),
            'joined' => $target->created_at?->toDateString(),
        ];
    }

    public function updateProfile(Request $r): JsonResponse
    {
        $d = $r->validate([
            'handle' => ['nullable', 'string', 'min:3', 'max:30', 'regex:/^[a-z0-9]+$/'], 'bio' => ['nullable', 'string', 'max:280'],
            'website' => ['nullable', 'url', 'max:190', 'starts_with:https://'], 'cover_url' => ['nullable', 'string', 'max:500'],
        ]);
        $p = $this->svc->profile($r->user());

        if (!empty($d['handle']) && $d['handle'] !== $p->handle) {
            abort_if(Profile::where('handle', $d['handle'])->where('user_id', '!=', $p->user_id)->exists(), 422, 'That handle is taken.');
            $p->handle = $d['handle'];
        }
        if (array_key_exists('bio', $d)) {
            $p->bio = $this->svc->clean($d['bio'], 280) ?: null;
        }
        if (array_key_exists('website', $d)) {
            $p->website = $d['website'];
        }
        if (!empty($d['cover_url'])) {
            $p->cover_url = \App\Support\MediaLinks::image($d['cover_url'])['url'] ?? $p->cover_url;
        }
        $p->save();

        return response()->json(['success' => true, 'data' => $this->profileData($r->user(), $r->user())]);
    }

    public function follow(Request $r, int $id): JsonResponse
    {
        return response()->json(['success' => true, 'following' => $this->svc->toggleFollow($r->user(), User::findOrFail($id))]);
    }

    public function block(Request $r, int $id): JsonResponse
    {
        return response()->json(['success' => true, 'blocked' => $this->svc->toggleBlock($r->user(), User::findOrFail($id))]);
    }

    public function followers(Request $r, int $id): JsonResponse
    {
        $which = $r->query('type') === 'following' ? 'following' : 'followers';
        $ids = $which === 'followers'
            ? DB::table('community_follows')->where('followed_id', $id)->limit(200)->pluck('follower_id')
            : DB::table('community_follows')->where('follower_id', $id)->limit(200)->pluck('followed_id');
        $users = User::with('zone:id,name')->where('is_active', true)->whereIn('id', $ids)->get();

        return response()->json(['success' => true, 'data' => $users->map(fn ($u) => $this->svc->userMini($u))->values()]);
    }

    // ── Discovery ─────────────────────────────────────────────────────────────────────────────────

    public function explore(Request $r): JsonResponse
    {
        $channels = \App\Models\Community\Channel::where('status', 'active')->where('is_private', false)->orderByDesc('is_official')->orderByDesc('members_count')->limit(8)->get();
        $cs = app(\App\Services\Community\ChannelService::class);

        return response()->json(['success' => true, 'data' => [
            'trending' => $this->svc->trending(),
            'people' => $this->svc->suggestedPeople($r->user()),
            'channels' => $channels->map(fn ($c) => $cs->present($c, $r->user()))->values(),
        ]]);
    }

    public function search(Request $r): JsonResponse
    {
        $v = $r->validate(['q' => ['required', 'string', 'max:60']]);

        return response()->json(['success' => true, 'data' => $this->svc->search($r->user(), $v['q'])]);
    }

    /** POST /community/media — upload one photo (the app has already shrunk it); returns its public URL. */
    public function upload(Request $r, \App\Services\Community\MediaStore $store): JsonResponse
    {
        $this->svc->assertCanContribute($r->user());
        $r->validate(['image' => ['required', 'file', 'max:5000']]);

        return response()->json(['success' => true] + $store->storeImage($r->file('image')), 201);
    }

    public function report(Request $r): JsonResponse
    {
        $d = $r->validate([
            'type' => ['required', Rule::in(['post', 'comment', 'channel', 'user', 'listing'])], 'id' => ['required', 'integer'],
            'reason' => ['required', Rule::in(['spam', 'abuse', 'harassment', 'inappropriate', 'false_info', 'scam', 'other'])], 'details' => ['nullable', 'string', 'max:500'],
        ]);
        $this->svc->report($r->user(), $d['type'], (int) $d['id'], $d['reason'], $d['details'] ?? null);

        return response()->json(['success' => true, 'message' => 'Thank you. Our team will review this.']);
    }

    /** One call the app makes on launch: who am I, what is unread, is anything live. */
    public function bootstrap(Request $r): JsonResponse
    {
        $u = $r->user();
        $watch = app(\App\Services\Community\WatchService::class);
        $market = app(\App\Services\Market\MarketService::class);

        return response()->json(['success' => true, 'data' => [
            'me' => $this->profileData($u->loadMissing('zone:id,name'), $u),
            'unread_notifications' => \App\Models\Notification::where('user_id', $u->id)->where('is_read', false)->count(),
            'live_now' => count($watch->lives($u)['live_now']),
            'can_sell' => $market->canSell($u),
            'partnership' => app(\App\Services\PartnershipService::class)->state($u),
            'categories' => ['channels' => \App\Services\Community\ChannelService::CATEGORIES, 'market' => \App\Services\Market\MarketService::CATEGORIES],
        ]]);
    }

    private function authoriseVisible(Post $post, User $viewer): void
    {
        abort_if(in_array($post->user_id, $this->svc->hiddenAuthorIds($viewer), true), 404);
        if ($post->channel_id) {
            $c = \App\Models\Community\Channel::find($post->channel_id);
            abort_if(!$c || ($c->is_private && !app(\App\Services\Community\ChannelService::class)->isMember($c, $viewer) && !$viewer->isMaster()), 403, 'This post is in a private channel.');
        }
    }
}
