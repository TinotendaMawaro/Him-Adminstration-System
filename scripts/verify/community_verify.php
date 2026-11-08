<?php
// Community, channels, watch and marketplace: end-to-end API checks (rules, permissions, counters, privacy).
require __DIR__ . '/../../vendor/autoload.php';
$app = require __DIR__ . '/../../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
$http = $app->make(Illuminate\Contracts\Http\Kernel::class);

use App\Models\User; use App\Models\Zone; use App\Models\Notification;
use App\Models\Community\{Profile, Post, Channel, LiveSession};
use App\Models\Market\Listing;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\{Cache, DB};

$pass = 0; $fail = 0; $cleanup = ['users' => [], 'listings' => []];
$t = function (string $label, callable $fn) use (&$pass, &$fail) {
    try { $r = $fn(); if ($r === false) throw new Exception('assertion false'); echo "PASS  $label\n"; $pass++; }
    catch (Throwable $e) { echo "FAIL  $label :: " . get_class($e) . ': ' . substr(preg_replace('/\s+/', ' ', $e->getMessage()), 0, 280) . "\n"; $fail++; }
};
$call = function (string $method, string $uri, array $data = [], ?string $token = null) use ($http) {
    $server = ['HTTP_ACCEPT' => 'application/json', 'CONTENT_TYPE' => 'application/json', 'REMOTE_ADDR' => '10.30.' . random_int(1, 250) . '.' . random_int(1, 250)];
    if ($token) $server['HTTP_AUTHORIZATION'] = "Bearer $token";
    Cache::flush(); auth()->forgetGuards(); app('auth')->forgetGuards();
    $r = $http->handle(Request::create("/api/$uri", $method, $method === 'GET' ? $data : [], [], [], $server, $method === 'GET' ? null : ($data ? json_encode($data) : null)));
    return [$r->getStatusCode(), json_decode($r->getContent(), true) ?? [], $r->getContent()];
};
$tag = bin2hex(random_bytes(3));
$zoneA = Zone::orderBy('id')->first(); $zoneB = Zone::where('id', '!=', $zoneA->id)->first();
$mk = function (string $role, ?Zone $z = null, string $name = null) use ($tag, &$cleanup, $zoneA) {
    static $n = 0; $n++;
    $u = User::create(['name' => ($name ?? "Cm {$role}") . " {$n} {$tag}", 'email' => "cm{$tag}{$n}@demo.heartfelt.test", 'password' => 'Passw0rd1', 'role' => $role, 'zone_id' => ($z ?? $zoneA)->id, 'is_active' => true, 'terms_accepted' => true, 'completed_tour' => true]);
    $cleanup['users'][] = $u->id; return $u;
};
$tok = fn (User $u) => $u->createToken('t')->plainTextToken;

$A = $mk('member', $zoneA, 'Alice'); $B = $mk('member', $zoneA, 'Bob'); $C = $mk('member', $zoneB, 'Carol'); $M = User::where('role', 'master')->where('is_active', true)->first();
$P = User::where('role', 'partner')->where('is_active', true)->first(); $ta = $tok($A); $tb = $tok($B); $tc = $tok($C); $tm = $tok($M); $tp = $tok($P);
$posts = []; $channelId = null;

echo "=== 1. Profiles & access ===\n";
$t('every request needs a signed-in account', fn () => $call('GET', 'community/feed')[0] === 401 && $call('GET', 'market/listings')[0] === 401 && $call('GET', 'channels')[0] === 401);
$t('each person gets a community profile with a unique handle automatically', function () use ($call, $ta, $A, $B) { [$c, $j] = $call('GET', 'community/me', [], $ta); return $c === 200 && preg_match('/^[a-z0-9]{3,30}$/', $j['data']['handle']) && Profile::find($A->id) && Profile::find($B->id); });
$t('handle can be changed (a-z 0-9) but never to someone else\'s or an invalid one', function () use ($call, $ta, $tb, $tag) {
    $ok = $call('PUT', 'community/me', ['handle' => "alice{$tag}"], $ta)[0] === 200; $dup = $call('PUT', 'community/me', ['handle' => "alice{$tag}"], $tb)[0]; $bad = $call('PUT', 'community/me', ['handle' => 'Bad Handle!'], $ta)[0];
    return $ok && $dup === 422 && $bad === 422; });
$t('the profile response never leaks email or phone', function () use ($call, $ta, $A) { [, , $raw] = $call('GET', 'community/me', [], $ta); return !str_contains($raw, $A->email) && !str_contains($raw, 'phone') && !str_contains($raw, 'password'); });

echo "\n=== 2. Posts ===\n";
$t('text post: html is stripped, hashtags and mentions are picked up', function () use ($call, $ta, $tag, &$posts, $B) {
    $handleB = Profile::where('user_id', $B->id)->value('handle') ?? app(App\Services\Community\CommunityService::class)->profile($B)->handle;
    [$c, $j] = $call('POST', 'community/posts', ['body' => "<script>alert(1)</script>Hello #Blessed{$tag} church family @{$handleB}"], $ta); $posts['text'] = $j['data']['id'] ?? null;
    return $c === 201 && !str_contains($j['data']['body'], '<script') && in_array("blessed{$tag}", $j['data']['hashtags']) && Notification::where('user_id', $B->id)->where('category', 'community')->where('title', 'like', '%mentioned you%')->exists(); });
$t('empty post, same post twice in a row, and over-long text are refused/cut', function () use ($call, $ta) {
    $e = $call('POST', 'community/posts', ['body' => '  '], $ta)[0]; $d1 = $call('POST', 'community/posts', ['body' => 'unique message one ' . uniqid()], $ta); $d = $d1[1]['data']['body'];
    $dup = $call('POST', 'community/posts', ['body' => $d], $ta)[0]; $long = $call('POST', 'community/posts', ['body' => str_repeat('a', 4900)], $ta);
    return $e === 422 && $dup === 422 && strlen($long[1]['data']['body'] ?? '') <= 2000; });
$t('image post accepts https image links only; other links are rejected', function () use ($call, $ta, &$posts) {
    $ok = $call('POST', 'community/posts', ['body' => 'photo', 'media_urls' => ['https://example.org/pic.jpg']], $ta); $posts['image'] = $ok[1]['data']['id'] ?? null;
    $bad = [$call('POST', 'community/posts', ['body' => 'x1', 'media_urls' => ['http://example.org/pic.jpg']], $ta)[0], $call('POST', 'community/posts', ['body' => 'x2', 'media_urls' => ['https://evil.example/page.html']], $ta)[0], $call('POST', 'community/posts', ['body' => 'x3', 'media_urls' => ['javascript:alert(1)']], $ta)[0]];
    return $ok[0] === 201 && $ok[1]['data']['kind'] === 'image' && $bad === [422, 422, 422]; });
$t('YouTube links become embedded videos; a /shorts link becomes a short; unknown sites are refused', function () use ($call, $ta, &$posts) {
    $v = $call('POST', 'community/posts', ['body' => 'Sunday message', 'media_urls' => ['https://www.youtube.com/watch?v=dQw4w9WgXcQ']], $ta); $posts['video'] = $v[1]['data']['id'] ?? null;
    $s = $call('POST', 'community/posts', ['body' => 'Short', 'media_urls' => ['https://youtube.com/shorts/aqz-KE-bpKQ']], $ta); $posts['short'] = $s[1]['data']['id'] ?? null;
    $bad = $call('POST', 'community/posts', ['body' => 'bad', 'media_urls' => ['https://tiktok.com/@x/video/1']], $ta)[0];
    $m = $v[1]['data']['media'][0] ?? [];
    return $v[1]['data']['kind'] === 'video' && ($m['embed'] ?? '') === 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0&modestbranding=1&playsinline=1' && $s[1]['data']['kind'] === 'short' && $bad === 422; });
$t('poll: 2-4 options, one vote each, live percentages, closed polls refuse votes', function () use ($call, $ta, $tb, &$posts) {
    $p = $call('POST', 'community/posts', ['body' => 'Best day for prayer?', 'poll' => ['options' => ['Tuesday', 'Thursday', 'Friday'], 'hours' => 24]], $ta); $id = $p[1]['data']['id']; $posts['poll'] = $id;
    $one = $call('POST', 'community/posts', ['body' => 'one option', 'poll' => ['options' => ['Only']]], $ta)[0];
    $v1 = $call('POST', "community/posts/$id/vote", ['option' => 1], $tb); $v2 = $call('POST', "community/posts/$id/vote", ['option' => 2], $tb); $bad = $call('POST', "community/posts/$id/vote", ['option' => 9], $ta)[0];
    Post::whereKey($id)->update(['poll' => ['options' => ['Tuesday', 'Thursday', 'Friday'], 'closes_at' => now()->subMinute()->toIso8601String()]]); $closed = $call('POST', "community/posts/$id/vote", ['option' => 0], $ta)[0];
    return $p[0] === 201 && $one === 422 && $v1[1]['poll']['my_vote'] === 1 && $v2[1]['poll']['my_vote'] === 1 && $v2[1]['poll']['total'] === 1 && $v1[1]['poll']['options'][1]['percent'] === 100 && $bad === 422 && $closed === 422; });
$t('announcements: only pastors and head office', function () use ($call, $ta, $tm) { return $call('POST', 'community/posts', ['body' => 'Notice ' . uniqid(), 'kind' => 'announcement'], $ta)[0] === 403 && $call('POST', 'community/posts', ['body' => 'Notice ' . uniqid(), 'kind' => 'announcement'], $tm)[0] === 201; });
$t('you can delete your own post, not someone else\'s; head office can remove any', function () use ($call, $ta, $tb, $tm) {
    $id = $call('POST', 'community/posts', ['body' => 'to delete ' . uniqid()], $ta)[1]['data']['id']; $other = $call('DELETE', "community/posts/$id", [], $tb)[0]; $own = $call('DELETE', "community/posts/$id", [], $ta)[0];
    $id2 = $call('POST', 'community/posts', ['body' => 'mod delete ' . uniqid()], $ta)[1]['data']['id']; $mod = $call('DELETE', "community/posts/$id2", [], $tm)[0];
    return $other === 403 && $own === 200 && $mod === 200 && $call('GET', "community/posts/$id", [], $ta)[0] === 404; });

echo "\n=== 3. Feed ===\n";
$t('for-you feed returns posts with author, counts and viewer flags', function () use ($call, $tb, &$posts) { [$c, $j] = $call('GET', 'community/feed', ['tab' => 'for_you'], $tb); $row = collect($j['items'])->firstWhere('id', $posts['text']); return $c === 200 && $row && $row['author']['handle'] && isset($row['likes'], $row['liked'], $row['saved']); });
$t('following feed shows only people you follow (and you); zone feed only your zone', function () use ($call, $ta, $tb, $tc, $A, $B, &$posts) {
    $before = collect($call('GET', 'community/feed', ['tab' => 'following'], $tb)[1]['items'])->pluck('id');
    $f = $call('POST', "community/users/{$A->id}/follow", [], $tb)[1]['following'];
    $after = collect($call('GET', 'community/feed', ['tab' => 'following'], $tb)[1]['items'])->pluck('id');
    $zone = collect($call('GET', 'community/feed', ['tab' => 'zone'], $tc)[1]['items'])->pluck('id');   // Carol is in another zone
    return $f === true && !$before->contains($posts['text']) && $after->contains($posts['text']) && !$zone->contains($posts['text']); });
$t('pagination: next_page appears when there is more', function () use ($call, $ta, $tb) {
    for ($i = 0; $i < 17; $i++) { $call('POST', 'community/posts', ['body' => "bulk {$i} " . uniqid()], $ta); }
    [, $j] = $call('GET', 'community/feed', ['tab' => 'following'], $tb); [, $j2] = $call('GET', 'community/feed', ['tab' => 'following', 'page' => 2], $tb);
    return count($j['items']) === 15 && $j['next_page'] === 2 && count($j2['items']) > 0; });
$t('shorts feed contains only video/short posts', function () use ($call, $tb, &$posts) { [$c, $j] = $call('GET', 'community/shorts', [], $tb); $kinds = collect($j['items'])->pluck('kind')->unique()->all(); return $c === 200 && collect($kinds)->every(fn ($k) => in_array($k, ['short', 'video'])) && collect($j['items'])->pluck('id')->contains($posts['short']); });
$t('hashtag feed and trending list work', function () use ($call, $tb, $tag, &$posts) { [, $j] = $call('GET', 'community/feed', ['hashtag' => "blessed{$tag}"], $tb); [, $e] = $call('GET', 'community/explore', [], $tb); return collect($j['items'])->pluck('id')->contains($posts['text']) && collect($e['data']['trending'])->pluck('tag')->contains("blessed{$tag}") && count($e['data']['people']) > 0; });
$t('search finds people, tags and channels (min 2 chars)', function () use ($call, $tb, $tag) { [$c, $j] = $call('GET', 'community/search', ['q' => 'Alice'], $tb); return $c === 200 && count($j['data']['people']) >= 1 && $call('GET', 'community/search', ['q' => 'a'], $tb)[0] === 200; });

echo "\n=== 4. Reactions & comments ===\n";
$t('like toggles, counts stay correct, author is notified once (no spam)', function () use ($call, $ta, $tb, $tc, &$posts, $A) {
    $id = $posts['text']; $l1 = $call('POST', "community/posts/$id/like", [], $tb)[1]; $l2 = $call('POST', "community/posts/$id/like", [], $tc)[1]; $u = $call('POST', "community/posts/$id/like", [], $tb)[1]; $l3 = $call('POST', "community/posts/$id/like", [], $tb)[1];
    return $l1['liked'] && $l1['likes'] === 1 && $l2['likes'] === 2 && $u['liked'] === false && $u['likes'] === 1 && $l3['likes'] === 2 && Notification::where('user_id', $A->id)->where('category', 'community')->where('title', 'like', '%liked your post%')->count() <= 2; });
$t('bookmark toggles and shows in saved list', function () use ($call, $tb, &$posts) { $on = $call('POST', "community/posts/{$posts['text']}/bookmark", [], $tb)[1]['saved']; $list = collect($call('GET', 'community/bookmarks', [], $tb)[1]['items'])->pluck('id'); $off = $call('POST', "community/posts/{$posts['text']}/bookmark", [], $tb)[1]['saved']; return $on && $list->contains($posts['text']) && !$off; });
$t('repost shares to followers; again undoes it; counts stay right', function () use ($call, $tb, $tc, &$posts) {
    $r1 = $call('POST', "community/posts/{$posts['text']}/repost", [], $tc)[1]; $feed = collect($call('GET', 'community/feed', ['user_id' => $tc->id ?? 0], $tc)[1]['items'] ?? []);
    $r2 = $call('POST', "community/posts/{$posts['text']}/repost", [], $tc)[1]; return $r1['reposted'] === true && $r1['reposts'] === 1 && $r2['reposted'] === false && $r2['reposts'] === 0; });
$t('comments: add, threaded reply (one level deep), counts, delete own only', function () use ($call, $ta, $tb, $tc, &$posts) {
    $id = $posts['text']; $c1 = $call('POST', "community/posts/$id/comments", ['body' => 'Amen!'], $tb); $cid = $c1[1]['data']['id'];
    $r1 = $call('POST', "community/posts/$id/comments", ['body' => 'Thank you', 'parent_id' => $cid], $ta); $r2 = $call('POST', "community/posts/$id/comments", ['body' => 'nested?', 'parent_id' => $r1[1]['data']['id']], $tb);
    $list = $call('GET', "community/posts/$id/comments", [], $tc)[1]; $top = $list['data'][0]; $other = $call('DELETE', "community/comments/$cid", [], $tc)[0];
    $own = $call('DELETE', "community/comments/{$r2[1]['data']['id']}", [], $tb)[0]; $post = $call('GET', "community/posts/$id", [], $tc)[1]['data'];
    return $c1[0] === 201 && $r1[1]['data']['parent_id'] === $cid && $r2[1]['data']['parent_id'] === $cid && count($top['replies']) === 2 && $other === 403 && $own === 200 && $post['comments'] === 2; });
$t('comment likes work; empty comments refused', function () use ($call, $ta, $tb, &$posts) { $cid = $call('GET', "community/posts/{$posts['text']}/comments", [], $ta)[1]['data'][0]['id']; $l = $call('POST', "community/comments/$cid/like", [], $ta)[1]; return $l['liked'] && $l['likes'] === 1 && $call('POST', "community/posts/{$posts['text']}/comments", ['body' => '   '], $ta)[0] === 422; });

echo "\n=== 5. Follow, block, privacy ===\n";
$t('cannot follow yourself; follow counts update both profiles', function () use ($call, $ta, $tb, $A, $B) { $self = $call('POST', "community/users/{$A->id}/follow", [], $ta)[0]; $p = $call('GET', "community/users/{$A->id}", [], $tb)[1]['data']; return $self === 422 && $p['followers'] === 1 && $p['following_them'] === true; });
$t('blocking hides both people from each other everywhere and removes follows', function () use ($call, $ta, $tb, $A, $B, &$posts) {
    $b = $call('POST', "community/users/{$A->id}/block", [], $tb)[1]['blocked']; $feed = collect($call('GET', 'community/feed', ['tab' => 'for_you'], $tb)[1]['items'])->pluck('author.id'); $prof = $call('GET', "community/users/{$A->id}", [], $tb)[0];
    $theirView = $call('GET', "community/users/{$B->id}", [], $ta)[0]; $postView = $call('GET', "community/posts/{$posts['text']}", [], $tb)[0]; $follow = $call('POST', "community/users/{$A->id}/follow", [], $tb)[0];
    $count = Profile::find($A->id)->followers_count;
    $call('POST', "community/users/{$A->id}/block", [], $tb);    // unblock
    return $b === true && !$feed->contains($A->id) && $prof === 404 && $theirView === 404 && $postView === 404 && $follow === 403 && $count === 0; });
$t('head office cannot be blocked; you cannot block yourself', fn () => $call('POST', "community/users/{$M->id}/block", [], $tb)[0] === 403 && $call('POST', "community/users/{$A->id}/block", [], $ta)[0] === 422);

echo "\n=== 6. Stories ===\n";
$t('story: image, text; visible to followers; views counted once; expired ones vanish', function () use ($call, $ta, $tb, $A) {
    $call('POST', "community/users/{$A->id}/follow", [], $tb);
    $s1 = $call('POST', 'community/stories', ['kind' => 'image', 'media_url' => 'https://example.org/s.png', 'caption' => 'Sunday'], $ta); $s2 = $call('POST', 'community/stories', ['kind' => 'text', 'caption' => 'God is good', 'background' => '#047857'], $ta);
    $bad = $call('POST', 'community/stories', ['kind' => 'image', 'media_url' => 'http://x.y/a.png'], $ta)[0]; $emptyText = $call('POST', 'community/stories', ['kind' => 'text', 'caption' => ''], $ta)[0];
    $rings = $call('GET', 'community/stories', [], $tb)[1]['data']; $ring = collect($rings)->firstWhere('user.id', $A->id); $sid = $ring['stories'][0]['id'];
    $call('POST', "community/stories/$sid/view", [], $tb); $call('POST', "community/stories/$sid/view", [], $tb); $views = DB::table('community_stories')->where('id', $sid)->value('views_count');
    DB::table('community_stories')->where('id', $sid)->update(['expires_at' => now()->subMinute()]); $after = collect($call('GET', 'community/stories', [], $tb)[1]['data'])->firstWhere('user.id', $A->id);
    return $s1[0] === 201 && $s2[0] === 201 && $bad === 422 && $emptyText === 422 && count($ring['stories']) === 2 && $views === 1 && count($after['stories']) === 1; });
$t('only the owner deletes a story', function () use ($call, $ta, $tb) { $sid = collect($call('GET', 'community/stories', [], $ta)[1]['data'])->firstWhere('mine', true)['stories'][0]['id']; return $call('DELETE', "community/stories/$sid", [], $tb)[0] === 403 && $call('DELETE', "community/stories/$sid", [], $ta)[0] === 200; });

echo "\n=== 7. Reports & moderation ===\n";
$t('3 different people reporting a post hides it until a moderator reviews; repeats count once', function () use ($call, $ta, $tb, $tc, $A, $mk, $tok, &$posts) {
    $id = $call('POST', 'community/posts', ['body' => 'questionable ' . uniqid()], $ta)[1]['data']['id']; $D = $mk('member'); $td = $tok($D);
    $r1 = $call('POST', 'community/report', ['type' => 'post', 'id' => $id, 'reason' => 'spam'], $tb)[0]; $dup = $call('POST', 'community/report', ['type' => 'post', 'id' => $id, 'reason' => 'spam'], $tb)[0];
    $call('POST', 'community/report', ['type' => 'post', 'id' => $id, 'reason' => 'abuse'], $tc); $still = $call('GET', "community/posts/$id", [], $tb)[0];
    $call('POST', 'community/report', ['type' => 'post', 'id' => $id, 'reason' => 'abuse'], $td); $hidden = $call('GET', "community/posts/$id", [], $tb)[0];
    return $r1 === 200 && $dup === 200 && $still === 200 && $hidden === 404 && DB::table('community_reports')->where('subject_id', $id)->where('subject_type', 'post')->count() === 3; });
$t('banned people cannot post, comment or like but can still read; muted cannot post', function () use ($call, $tb, $B, &$posts) {
    $p = app(App\Services\Community\CommunityService::class)->profile($B); $p->update(['banned_until' => now()->addDay()]);
    $a = $call('POST', 'community/posts', ['body' => 'banned post ' . uniqid()], $tb)[0]; $l = $call('POST', "community/posts/{$posts['text']}/like", [], $tb)[0]; $r = $call('GET', 'community/feed', [], $tb)[0];
    $p->update(['banned_until' => null, 'muted_until' => now()->addHour()]); $m = $call('POST', 'community/posts', ['body' => 'muted post ' . uniqid()], $tb)[0];
    $p->update(['muted_until' => null]); return $a === 403 && $l === 403 && $r === 200 && $m === 403; });
$t('only head office can pin posts', fn () => $call('POST', "community/posts/{$posts['text']}/pin", [], $ta)[0] === 403 && $call('POST', "community/posts/{$posts['text']}/pin", [], $tm)[0] === 200);

echo "\n=== 8. Channels ===\n";
$t('create a channel: owner joins as owner; duplicate name and 6th channel refused', function () use ($call, $ta, $tag, &$channelId) {
    [$c, $j] = $call('POST', 'channels', ['name' => "Prayer Warriors {$tag}", 'description' => 'Daily prayer', 'category' => 'Prayer'], $ta); $channelId = $j['data']['id'] ?? null;
    $dup = $call('POST', 'channels', ['name' => "prayer warriors {$tag}"], $ta)[0]; $short = $call('POST', 'channels', ['name' => 'ab'], $ta)[0];
    for ($i = 1; $i <= 4; $i++) { $call('POST', 'channels', ['name' => "Extra {$i} {$tag}"], $ta); } $sixth = $call('POST', 'channels', ['name' => "Extra 5 {$tag}"], $ta)[0];
    return $c === 201 && $j['data']['my_role'] === 'owner' && $j['data']['members'] === 1 && $dup === 422 && $short === 422 && $sixth === 422; });
$t('public channel: anyone can join and leave; the owner cannot leave', function () use ($call, $ta, $tb, &$channelId) {
    $j = $call('POST', "channels/$channelId/join", [], $tb); $count = $call('GET', "channels/$channelId", [], $tb)[1]['data']['members']; $own = $call('POST', "channels/$channelId/leave", [], $ta)[0];
    $l = $call('POST', "channels/$channelId/leave", [], $tb)[0]; $after = $call('GET', "channels/$channelId", [], $ta)[1]['data']['members']; $call('POST', "channels/$channelId/join", [], $tb);
    return $j[1]['status'] === 'active' && $count === 2 && $own === 422 && $l === 200 && $after === 1; });
$t('chat: members talk, non-members cannot; "since" returns only new messages', function () use ($call, $ta, $tb, $tc, &$channelId) {
    $m1 = $call('POST', "channels/$channelId/messages", ['body' => 'Good morning team <b>x</b>'], $ta); $m2 = $call('POST', "channels/$channelId/messages", ['body' => 'Amen'], $tb); $out = $call('POST', "channels/$channelId/messages", ['body' => 'hi'], $tc)[0];
    $all = $call('GET', "channels/$channelId/messages", [], $tb)[1]['data']; $new = $call('GET', "channels/$channelId/messages", ['since' => $m1[1]['data']['id']], $tb)[1]['data'];
    return $m1[0] === 201 && !str_contains($m1[1]['data']['body'], '<b>') && $out === 403 && count($all) === 2 && count($new) === 1 && $new[0]['body'] === 'Amen'; });
$t('channel posts (discussion): members post, feed filters by channel, the main feed does not show them', function () use ($call, $ta, $tb, $tc, &$channelId) {
    $p = $call('POST', 'community/posts', ['body' => 'Prayer topic of the week ' . uniqid(), 'channel_id' => $channelId], $tb); $out = $call('POST', 'community/posts', ['body' => 'sneaky ' . uniqid(), 'channel_id' => $channelId], $tc)[0];
    $inChannel = collect($call('GET', "channels/$channelId/posts", [], $ta)[1]['items'])->pluck('id'); $main = collect($call('GET', 'community/feed', ['tab' => 'for_you'], $ta)[1]['items'])->pluck('id');
    return $p[0] === 201 && $out === 403 && $inChannel->contains($p[1]['data']['id']) && !$main->contains($p[1]['data']['id']); });
$t('goals: any member adds; only creator/moderator moves progress; achieving sets 100%', function () use ($call, $ta, $tb, &$channelId) {
    $g = $call('POST', "channels/$channelId/goals", ['title' => 'Pray 30 days in a row', 'target_date' => now()->addDays(30)->toDateString()], $ta); $gid = $g[1]['data']['id'];   // Alice owns the channel and created the goal
    $note = $call('PUT', "goals/$gid", ['note' => 'Keep going!'], $tb)[0];                 // Bob (plain member) may cheer on
    $deny = $call('PUT', "goals/$gid", ['progress' => 50], $tb)[0];                          // ...but not move the progress
    $denyStatus = $call('PUT', "goals/$gid", ['status' => 'achieved'], $tb)[0];
    $prog = $call('PUT', "goals/$gid", ['progress' => 40, 'note' => 'week 2'], $ta)[1]['data'];
    $own = $call('POST', "channels/$channelId/goals", ['title' => 'Bob goal ' . uniqid()], $tb)[1]['data']['id']; $bobMoves = $call('PUT', "goals/$own", ['progress' => 20], $tb)[0];   // the creator moves their own
    $done = $call('PUT', "goals/$gid", ['status' => 'achieved'], $ta)[1]['data']; $list = $call('GET', "channels/$channelId/goals", [], $tb)[1]['data'];
    return $g[0] === 201 && $note === 200 && $deny === 403 && $denyStatus === 403 && $prog['progress'] === 40 && count($prog['updates']) >= 2 && $bobMoves === 200 && $done['progress'] === 100 && $done['status'] === 'achieved' && count($list) === 2; });
$t('meetings: schedule, RSVP, going count, cancel by organiser or moderator only; past times refused', function () use ($call, $ta, $tb, $tc, &$channelId) {
    $past = $call('POST', "channels/$channelId/meetings", ['title' => 'Old', 'starts_at' => now()->subDay()->toIso8601String()], $ta)[0];
    $m = $call('POST', "channels/$channelId/meetings", ['title' => 'Zoom prayer', 'starts_at' => now()->addDay()->toIso8601String(), 'mode' => 'online', 'link_url' => 'https://zoom.us/j/123'], $tb); $mid = $m[1]['data']['id'];
    $bad = $call('POST', "channels/$channelId/meetings", ['title' => 'x link', 'starts_at' => now()->addDay()->toIso8601String(), 'link_url' => 'http://insecure.example'], $tb)[0];
    $r = $call('POST', "meetings/$mid/rsvp", ['status' => 'going'], $ta)[1]['data']; $outsider = $call('POST', "meetings/$mid/rsvp", ['status' => 'going'], $tc)[0]; $nocan = $call('DELETE', "meetings/$mid", [], $tc)[0];
    $c = $call('DELETE', "meetings/$mid", [], $ta)[0]; $listed = collect($call('GET', "channels/$channelId/meetings", [], $ta)[1]['data'])->firstWhere('id', $mid);
    return $past === 422 && $m[0] === 201 && $bad === 422 && $r['going'] === 2 && $outsider === 403 && $nocan === 403 && $c === 200 && $listed['status'] === 'cancelled'; });
$t('private channel: invisible to outsiders, request to join, owner approves, roles, ban', function () use ($call, $ta, $tb, $tc, $C, $B, $tag, &$channelId) {
    $p = $call('POST', 'channels', ['name' => "Elders {$tag}", 'is_private' => true], $tb)[1]['data']['id'];
    $disc = collect($call('GET', 'channels', ['scope' => 'discover'], $tc)[1]['data'])->pluck('id'); $card = $call('GET', "channels/$p", [], $tc); $posts = $call('GET', "channels/$p/posts", [], $tc)[0]; $msg = $call('GET', "channels/$p/messages", [], $tc)[0];
    $j = $call('POST', "channels/$p/join", [], $tc)[1]['status']; $stillOut = $call('GET', "channels/$p/messages", [], $tc)[0];
    $notOwner = $call('POST', "channels/$p/members/{$C->id}", ['action' => 'approve'], $ta)[0]; $ok = $call('POST', "channels/$p/members/{$C->id}", ['action' => 'approve'], $tb)[0]; $in = $call('GET', "channels/$p/messages", [], $tc)[0];
    $role = $call('POST', "channels/$p/members/{$C->id}", ['action' => 'moderator'], $tb)[0]; $ban = $call('POST', "channels/$p/members/{$C->id}", ['action' => 'ban'], $tb)[0]; $rejoin = $call('POST', "channels/$p/join", [], $tc)[0];
    return !$disc->contains($p) && $card[0] === 200 && !isset($card[1]['data']['owner']) && $posts === 403 && $msg === 403 && $j === 'pending' && $stillOut === 403 && $notOwner === 403 && $ok === 200 && $in === 200 && $role === 200 && $ban === 200 && $rejoin === 403; });
$t('posts in a private channel cannot be reposted and are hidden from outsiders', function () use ($call, $tb, $tc, $tag) {
    $cid = Channel::where('name', "Elders {$tag}")->value('id'); $p = $call('POST', 'community/posts', ['body' => 'secret elders talk ' . uniqid(), 'channel_id' => $cid], $tb)[1]['data']['id'];
    return $call('GET', "community/posts/$p", [], $tc)[0] === 403 && $call('POST', "community/posts/$p/repost", [], $tb)[0] === 403; });
$t('only the owner deletes a channel', function () use ($call, $ta, $tb, $tag) { $id = Channel::where('name', "Extra 1 {$tag}")->value('id'); return $call('DELETE', "channels/$id", [], $tb)[0] === 403 && $call('DELETE', "channels/$id", [], $ta)[0] === 200; });

echo "\n=== 9. Watch: teachings and live ===\n";
$t('teachings library lists published videos, featured first, series list, view counter', function () use ($call, $tb, $M) {
    DB::table('community_teachings')->insert(['title' => 'Test teaching ' . uniqid(), 'youtube_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'video_id' => 'dQw4w9WgXcQ', 'series' => 'Faith Series', 'speaker' => 'Apostle Tavonga Vutabwashe', 'is_featured' => true, 'status' => 'published', 'published_at' => now()->subHour(), 'created_by' => $M->id, 'created_at' => now(), 'updated_at' => now()]);
    $draft = DB::table('community_teachings')->insertGetId(['title' => 'Draft hidden', 'youtube_url' => 'https://youtu.be/dQw4w9WgXcQ', 'video_id' => 'dQw4w9WgXcQ', 'status' => 'draft', 'speaker' => 'x', 'created_at' => now(), 'updated_at' => now()]);
    [$c, $j] = $call('GET', 'watch/teachings', [], $tb); $d = $j['data']; $ids = collect($d['items'])->pluck('title');
    $id = $d['items'][0]['id']; $call('POST', "watch/teachings/$id/view", [], $tb); DB::table('community_teachings')->where('id', $draft)->delete();
    return $c === 200 && $d['featured'] !== null && $d['featured']['speaker'] === 'Apostle Tavonga Vutabwashe' && in_array('Faith Series', $d['series']) && !$ids->contains('Draft hidden') && str_contains($d['items'][0]['embed'], 'youtube-nocookie.com'); });
$t('live: channel moderators schedule (YouTube only, not too old); members cannot; head office can go official', function () use ($call, $ta, $tb, $tc, $tm, &$channelId) {
    $at = now()->addHours(3)->toIso8601String();
    $ok = $call('POST', 'watch/live', ['title' => 'Prayer night live', 'url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'scheduled_at' => $at, 'channel_id' => $channelId], $ta);
    $member = $call('POST', 'watch/live', ['title' => 'member live', 'url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'scheduled_at' => $at, 'channel_id' => $channelId], $tb)[0];
    $other = $call('POST', 'watch/live', ['title' => 'bad link', 'url' => 'https://vimeo.com/123456789', 'scheduled_at' => $at, 'channel_id' => $channelId], $ta)[0];
    $old = $call('POST', 'watch/live', ['title' => 'old', 'url' => 'https://youtu.be/dQw4w9WgXcQ', 'scheduled_at' => now()->subDays(2)->toIso8601String(), 'channel_id' => $channelId], $ta)[0];
    $nochan = $call('POST', 'watch/live', ['title' => 'no channel', 'url' => 'https://youtu.be/dQw4w9WgXcQ', 'scheduled_at' => $at], $ta)[0];
    $official = $call('POST', 'watch/live', ['title' => 'Sunday service LIVE', 'url' => 'https://youtu.be/aqz-KE-bpKQ', 'scheduled_at' => now()->addDays(2)->toIso8601String(), 'is_official' => true], $tm);
    return $ok[0] === 201 && $ok[1]['data']['status'] === 'scheduled' && $member === 403 && $other === 422 && $old === 422 && $nochan === 403 && $official[0] === 201 && $official[1]['data']['official'] === true; });
$t('live list: scheduled -> live (when the time comes) -> ended; reminders toggle and are sent', function () use ($call, $tb, $tc, &$channelId) {
    $id = LiveSession::where('title', 'Prayer night live')->value('id'); $listed = collect($call('GET', 'watch/live', [], $tb)[1]['data']['upcoming'])->pluck('id');
    $on = $call('POST', "watch/live/$id/remind", [], $tb)[1]['reminded']; $off = $call('POST', "watch/live/$id/remind", [], $tb)[1]['reminded']; $call('POST', "watch/live/$id/remind", [], $tb);
    LiveSession::whereKey($id)->update(['scheduled_at' => now()->addMinutes(10)]); $sent = app(App\Services\Community\WatchService::class)->sendDueReminders();
    LiveSession::whereKey($id)->update(['scheduled_at' => now()->subMinutes(10)]); $live = collect($call('GET', 'watch/live', [], $tb)[1]['data']['live_now'])->pluck('id');
    LiveSession::whereKey($id)->update(['scheduled_at' => now()->subHours(6)]); $ended = collect($call('GET', 'watch/live', [], $tb)[1]['data']['live_now'])->pluck('id');
    return $listed->contains($id) && $on === true && $off === false && $sent['live'] === 1 && $live->contains($id) && !$ended->contains($id); });

echo "\n=== 10. Marketplace (partners only) ===\n";
$listing = null;
$t('only ACTIVE PARTNERS can create listings; members get a clear 403', function () use ($call, $ta, $tp) {
    $body = ['title' => 'Home-made peanut butter', 'description' => 'Fresh, 500g jars, delivered in Harare', 'category' => 'Food & groceries', 'price' => 4.5, 'currency' => 'USD', 'stock' => 20];
    $member = $call('POST', 'market/listings', $body, $ta); $meta = $call('GET', 'market/meta', [], $ta)[1]['data']; $pmeta = $call('GET', 'market/meta', [], $tp)[1]['data'];
    return $member[0] === 403 && str_contains($member[1]['message'] ?? '', 'partners') && $meta['can_sell'] === false && $pmeta['can_sell'] === true; });
$t('partner creates a listing: validation of price, category, images (https only), stock', function () use ($call, $tp, &$listing, &$cleanup) {
    $base = ['title' => 'Home-made peanut butter', 'description' => 'Fresh, 500g jars, delivered in Harare', 'category' => 'Food & groceries', 'price' => 4.5, 'currency' => 'USD', 'stock' => 3, 'images' => ['https://example.org/jar.jpg']];
    $ok = $call('POST', 'market/listings', $base, $tp); $listing = $ok[1]['data']['id'] ?? null; $cleanup['listings'][] = $listing;
    $bads = [array_merge($base, ['price' => -5]), array_merge($base, ['price' => null]), array_merge($base, ['category' => 'Weapons']), array_merge($base, ['images' => ['http://x.y/a.jpg']]), array_merge($base, ['title' => 'x', 'description' => 'short'])];
    $codes = collect($bads)->map(fn ($b) => $call('POST', 'market/listings', $b, $tp)[0])->all();
    $q = $call('POST', 'market/listings', ['title' => 'Custom wedding cakes', 'description' => 'Designed for your event, ask for a quote', 'category' => 'Events & catering', 'price_type' => 'quote'], $tp); $cleanup['listings'][] = $q[1]['data']['id'] ?? null;
    return $ok[0] === 201 && $ok[1]['data']['seller']['badge'] === 'Partner' && $codes === [422, 422, 422, 422, 422] && $q[0] === 201 && $q[1]['data']['price'] === null; });
$t('browse: search, category, sort, only active listings; no seller contact details leak', function () use ($call, $tb, $P) {
    [$c, $j, $raw] = $call('GET', 'market/listings', ['q' => 'peanut'], $tb); $cat = $call('GET', 'market/listings', ['category' => 'Events & catering'], $tb)[1]['items']; $low = $call('GET', 'market/listings', ['sort' => 'price_low'], $tb)[0];
    return $c === 200 && count($j['items']) >= 1 && count($cat) >= 1 && $low === 200 && !str_contains($raw, $P->email); });
$t('a partner edits own listing, not others\'; suspended listings cannot be edited back to life', function () use ($call, $tp, $ta, &$listing) {
    $edit = $call('PUT', "market/listings/$listing", ['title' => 'Peanut butter 500g', 'description' => 'Fresh, 500g jars, delivered in Harare', 'category' => 'Food & groceries', 'price' => 5, 'stock' => 3], $tp)[0];
    $other = $call('PUT', "market/listings/$listing", ['title' => 'hijack', 'description' => 'hijack hijack', 'category' => 'Other', 'price' => 1], $ta)[0];
    Listing::whereKey($listing)->update(['status' => 'suspended']); $susp = $call('PUT', "market/listings/$listing", ['title' => 'again', 'description' => 'again again again', 'category' => 'Other', 'price' => 1], $tp)[0]; $hidden = $call('GET', "market/listings/$listing", [], $ta)[0];
    Listing::whereKey($listing)->update(['status' => 'active']); return $edit === 200 && $other === 403 && $susp === 403 && $hidden === 404; });
$orderId = null;
$t('order: buyer orders (qty vs stock enforced); cannot order own item; quote-only items cannot be ordered', function () use ($call, $tb, $tp, &$listing, &$orderId, $cleanup) {
    $over = $call('POST', "market/listings/$listing/order", ['quantity' => 99], $tb)[0]; $own = $call('POST', "market/listings/$listing/order", ['quantity' => 1], $tp)[0];
    $quoteOnly = Listing::where('seller_id', User::where('role', 'partner')->value('id'))->where('price_type', 'quote')->latest('id')->value('id'); $qo = $call('POST', "market/listings/$quoteOnly/order", ['quantity' => 1], $tb)[0];
    $ok = $call('POST', "market/listings/$listing/order", ['quantity' => 2, 'note' => 'Please deliver Friday', 'contact_phone' => '+263 77 123 4567', 'delivery_address' => '12 Samora Machel Ave'], $tb); $orderId = $ok[1]['data']['id'] ?? null;
    $chk = ['over' => $over === 422, 'own' => $own === 422, 'quoteOnly' => $qo === 422, 'created' => $ok[0] === 201, 'total' => ($ok[1]['data']['total'] ?? null) == 10, 'pending' => ($ok[1]['data']['status'] ?? '') === 'pending', 'ref' => str_starts_with($ok[1]['data']['reference'] ?? '', 'ORD-')];
    if (in_array(false, $chk, true)) { echo '   ', json_encode($chk), ' ', json_encode([$over, $own, $qo, $ok[0]]), ' ', substr(json_encode($ok[1]), 0, 200), "
"; return false; } return true; });
$t('order flow: seller accepts (stock drops), ships, buyer completes; wrong moves and wrong people are refused', function () use ($call, $ta, $tb, $tp, &$orderId, &$listing) {
    $buyerAccept = $call('PUT', "market/orders/$orderId", ['status' => 'accepted'], $tb)[0]; $stranger = $call('PUT', "market/orders/$orderId", ['status' => 'cancelled'], $ta)[0];
    $acc = $call('PUT', "market/orders/$orderId", ['status' => 'accepted', 'note' => 'Will deliver Friday'], $tp); $stock = Listing::find($listing)->stock; $skip = $call('PUT', "market/orders/$orderId", ['status' => 'completed'], $tp)[0];
    $ship = $call('PUT', "market/orders/$orderId", ['status' => 'shipped'], $tp)[0]; $done = $call('PUT', "market/orders/$orderId", ['status' => 'completed'], $tb)[1]['data']['status'];
    return $buyerAccept === 422 && $stranger === 403 && $acc[1]['data']['status'] === 'accepted' && $stock === 1 && $skip === 422 && $ship === 200 && $done === 'completed' && Notification::where('category', 'market')->where('title', 'like', 'Order ORD-%')->count() >= 3; });
$t('cancelling an accepted order gives the stock back; last item sold marks the listing sold out', function () use ($call, $tb, $tp, &$listing) {
    $o = $call('POST', "market/listings/$listing/order", ['quantity' => 1], $tb)[1]['data']['id']; $call('PUT', "market/orders/$o", ['status' => 'accepted'], $tp); $so = Listing::find($listing); $soldOut = $so->status === 'sold_out' && $so->stock === 0;
    $call('PUT', "market/orders/$o", ['status' => 'cancelled'], $tb); $back = Listing::find($listing); $buy = $call('POST', "market/listings/$listing/order", ['quantity' => 1], $tb)[0];
    return $soldOut && $back->stock === 1 && $back->status === 'active' && $buy === 201; });
$t('order lists: buyer sees theirs, seller sees theirs, nobody else\'s', function () use ($call, $ta, $tb, $tp, $B, $P) {
    $b = $call('GET', 'market/orders', ['as' => 'buyer'], $tb)[1]['data']; $s = $call('GET', 'market/orders', ['as' => 'seller'], $tp)[1]['data']; $a = $call('GET', 'market/orders', ['as' => 'buyer'], $ta)[1]['data']; $noShop = $call('GET', 'market/orders', ['as' => 'seller'], $ta)[0];
    return count($b) >= 2 && count($s) >= 2 && count($a) === 0 && $noShop === 403 && collect($b)->every(fn ($o) => $o['buyer']['id'] === $B->id) && collect($s)->every(fn ($o) => $o['seller']['id'] === $P->id); });
$t('quotes: request -> seller quotes a price -> buyer accepts -> an order is created at that price; expiry and duplicates handled', function () use ($call, $ta, $tb, $tp) {
    $qid = Listing::where('seller_id', User::where('role', 'partner')->value('id'))->where('price_type', 'quote')->latest('id')->value('id');
    $short = $call('POST', "market/listings/$qid/quote", ['message' => 'hi'], $tb)[0]; $r = $call('POST', "market/listings/$qid/quote", ['message' => 'Need a 3-tier wedding cake for 80 guests on 12 Dec', 'quantity' => 1], $tb); $dup = $call('POST', "market/listings/$qid/quote", ['message' => 'another request please'], $tb)[0];
    $id = $r[1]['data']['id']; $buyerQuotes = $call('PUT', "market/quotes/$id", ['action' => 'quote', 'price' => 100], $tb)[0]; $q = $call('PUT', "market/quotes/$id", ['action' => 'quote', 'price' => 180.5, 'reply' => 'Includes delivery', 'valid_days' => 5], $tp);
    $acc = $call('PUT', "market/quotes/$id", ['action' => 'accept'], $tb); $orderPrice = $acc[1]['order']['total'] ?? null; $again = $call('PUT', "market/quotes/$id", ['action' => 'accept'], $tb)[0];
    $r2 = $call('POST', "market/listings/$qid/quote", ['message' => 'Second request, smaller cake'], $tb); $id2 = $r2[1]['data']['id']; $call('PUT', "market/quotes/$id2", ['action' => 'quote', 'price' => 50], $tp);
    DB::table('market_quotes')->where('id', $id2)->update(['valid_until' => now()->subDay()->toDateString()]); $exp = $call('PUT', "market/quotes/$id2", ['action' => 'accept'], $tb)[0];
    return $short === 422 && $r[0] === 201 && $dup === 422 && $buyerQuotes === 422 && $q[1]['quote']['status'] === 'quoted' && $acc[1]['quote']['status'] === 'accepted' && $orderPrice === 180.5 && $again === 422 && $exp === 422; });
$t('market privacy: a blocked seller\'s listings disappear for the blocker', function () use ($call, $tb, $tp, $P, &$listing) {
    $call('POST', "community/users/{$P->id}/block", [], $tb); $items = collect($call('GET', 'market/listings', [], $tb)[1]['items'])->pluck('id'); $direct = $call('POST', "market/listings/$listing/order", ['quantity' => 1], $tb)[0];
    $call('POST', "community/users/{$P->id}/block", [], $tb); return !$items->contains($listing) && $direct === 403; });

echo "\n=== 11. Security ===\n";
$t('deactivated people lose access immediately (token revoked)', function () use ($call, $mk, $tok) { $u = $mk('member'); $tk = $tok($u); $ok = $call('GET', 'community/feed', [], $tk)[0]; $u->update(['is_active' => false]); return $ok === 200 && $call('GET', 'community/feed', [], $tk)[0] === 401; });
$t('IDOR checks: cannot read/modify other people\'s orders, quotes or private data by changing ids', function () use ($call, $ta, $tb, $tp, &$orderId) { return $call('PUT', "market/orders/$orderId", ['status' => 'cancelled'], $ta)[0] === 403 && $call('PUT', 'market/quotes/' . DB::table('market_quotes')->max('id'), ['action' => 'accept'], $ta)[0] === 403; });
$t('responses never contain emails, passwords or tokens', function () use ($call, $ta, $tb) { foreach (['community/feed', 'community/explore', 'channels', 'market/listings', 'watch/live', 'community/stories'] as $p) { [, , $raw] = $call('GET', $p, [], $tb); if (preg_match('/@demo\.heartfelt\.test|"password"|plainTextToken|"email"/', $raw)) return false; } return true; });
$t('a post with a script/iframe/onerror payload is stored as inert text', function () use ($call, $ta) { [, $j, $raw] = $call('POST', 'community/posts', ['body' => '<img src=x onerror=alert(1)><iframe src="https://evil"></iframe> hi ' . uniqid()], $ta); return !preg_match('/<img|<iframe|onerror=/i', $j['data']['body'] ?? '<img'); });
$t('rate limits are configured on every write route', function () { $r = collect(app('router')->getRoutes()->getRoutes())->filter(fn ($x) => str_starts_with($x->uri, 'api/community') || str_starts_with($x->uri, 'api/channels') || str_starts_with($x->uri, 'api/market') || str_starts_with($x->uri, 'api/watch')); $writes = $r->filter(fn ($x) => in_array('POST', $x->methods)); return $writes->every(fn ($x) => collect($x->gatherMiddleware())->contains(fn ($m) => is_string($m) && str_starts_with($m, 'throttle'))); });

// ── cleanup ──
$u = array_values(array_unique($cleanup['users']));
DB::table('notifications')->whereIn('user_id', $u)->orWhere('title', 'like', '%Cm member%')->delete();
Listing::withTrashed()->whereIn('id', array_filter($cleanup['listings']))->forceDelete();
DB::table('market_orders')->whereIn('buyer_id', $u)->delete(); DB::table('market_quotes')->whereIn('buyer_id', $u)->delete();
DB::table('community_live_sessions')->whereIn('host_id', $u)->orWhere('title', 'Sunday service LIVE')->delete();
DB::table('community_teachings')->where('title', 'like', 'Test teaching%')->delete();
Channel::withTrashed()->whereIn('owner_id', $u)->forceDelete();
DB::table('community_posts')->whereIn('user_id', $u)->orWhere('body', 'like', 'Notice %')->delete();
DB::table('audit_logs')->whereIn('user_id', $u)->delete(); DB::table('personal_access_tokens')->whereIn('tokenable_id', $u)->delete(); DB::table('personal_access_tokens')->where('name', 't')->delete();
DB::table('community_hashtags')->where('tag', 'like', "%{$tag}")->delete();
User::whereIn('id', $u)->delete(); Cache::flush();
echo "\ncleaned up " . count($u) . " test users\nRESULT: $pass passed, $fail failed\n";
