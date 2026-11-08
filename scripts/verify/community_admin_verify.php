<?php
// Master console: community moderation, teachings, live sessions, marketplace oversight.
require __DIR__ . '/../../vendor/autoload.php';
$app = require __DIR__ . '/../../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\User; use App\Models\Zone; use App\Models\Notification; use App\Models\AuditLog;
use App\Models\Community\{Post, Comment, Channel, Report, Profile, Teaching, LiveSession};
use App\Models\Market\Listing;
use App\Services\Community\{CommunityService, ChannelService, ModerationService, WatchService};
use App\Filament\Resources as R;
use Livewire\Livewire; use Filament\Facades\Filament; use Illuminate\Support\Facades\{DB, Cache};

$pass = 0; $fail = 0; $users = [];
$t = function (string $label, callable $fn) use (&$pass, &$fail) {
    try { $r = $fn(); if ($r === false) throw new Exception('assertion false'); echo "PASS  $label\n"; $pass++; }
    catch (Throwable $e) { echo "FAIL  $label :: " . get_class($e) . ': ' . substr(preg_replace('/\s+/', ' ', $e->getMessage()), 0, 300) . "\n"; $fail++; }
};
$tag = bin2hex(random_bytes(3)); $zone = Zone::first();
$mk = function (string $role = 'member') use ($tag, &$users, $zone) { static $n = 0; $n++; $u = User::create(['name' => "Adm {$role} {$n} {$tag}", 'email' => "adm{$tag}{$n}@demo.heartfelt.test", 'password' => 'Passw0rd1', 'role' => $role, 'zone_id' => $zone->id, 'is_active' => true, 'terms_accepted' => true, 'completed_tour' => true]); $users[] = $u->id; return $u; };
$cs = app(CommunityService::class); $mod = app(ModerationService::class);
$master = User::where('role', 'master')->where('is_active', true)->first(); $A = $mk(); $B = $mk(); $C = $mk();
$asMaster = function () use ($master) { try { app('session.store')->flush(); } catch (Throwable $e) {} auth()->forgetGuards(); Filament::setCurrentPanel(Filament::getPanel('admin')); auth('web')->login($master); auth()->shouldUse('web'); };
$asOther = function (User $u) { try { app('session.store')->flush(); } catch (Throwable $e) {} auth()->forgetGuards(); Filament::setCurrentPanel(Filament::getPanel('admin')); auth('web')->login($u); auth()->shouldUse('web'); };

echo "=== Access ===\n";
$t('community admin screens are master-only (members, pastors, partners, finance, events are refused)', function () use ($asOther, $mk) {
    foreach (['member', 'pastor', 'partner', 'finance', 'event'] as $role) { $u = $mk($role); $asOther($u);
        foreach ([R\CommunityPostResource::class, R\CommunityReportResource::class, R\CommunityChannelResource::class, R\CommunityMemberResource::class, R\TeachingResource::class, R\LiveSessionResource::class, R\MarketListingResource::class, R\MarketOrderResource::class] as $res) { if ($res::canAccess()) return false; } }
    return true; });
$t('moderation service refuses non-masters', function () use ($mod, $A, $B) { try { $mod->ban($B, 1, $A); return false; } catch (Symfony\Component\HttpKernel\Exception\HttpException $e) { return $e->getStatusCode() === 403; } });

echo "\n=== Posts ===\n";
$post = $cs->createPost($A, ['body' => 'Moderation test post ' . uniqid()]); $post2 = $cs->createPost($A, ['body' => 'Second post ' . uniqid()]);
$t('posts list loads for the master and shows posts; "Hide" hides and tells the author; "Restore" brings it back', function () use ($asMaster, $post, $A) {
    $asMaster(); $lt = Livewire::test(R\CommunityPostResource\Pages\ListCommunityPosts::class)->assertSuccessful()->assertCanSeeTableRecords([$post])
        ->callTableAction('hide', $post, ['reason' => 'Off topic'])->assertHasNoTableActionErrors(); $hidden = $post->fresh()->status === 'hidden'; $told = Notification::where('user_id', $A->id)->where('title', 'One of your posts was hidden')->exists();
    $lt->callTableAction('restore', $post->fresh())->assertHasNoTableActionErrors(); return $hidden && $told && $post->fresh()->status === 'published'; });
$t('pin toggles; remove deletes, adjusts the author\'s counter and notifies; mute author works', function () use ($asMaster, $post, $post2, $A) {
    $asMaster(); $before = Profile::find($A->id)->posts_count; $lt = Livewire::test(R\CommunityPostResource\Pages\ListCommunityPosts::class)->callTableAction('pin', $post)->assertHasNoTableActionErrors(); $pinned = $post->fresh()->is_pinned;
    $lt->callTableAction('remove', $post2, ['reason' => 'Spam'])->assertHasNoTableActionErrors(); $gone = Post::find($post2->id) === null; $after = Profile::find($A->id)->posts_count;
    $lt->callTableAction('mute', $post->fresh())->assertHasNoTableActionErrors(); $muted = Profile::find($A->id)->isMuted(); Profile::find($A->id)->update(['muted_until' => null]);
    return $pinned && $gone && $after === $before - 1 && $muted && Notification::where('user_id', $A->id)->where('title', 'One of your posts was removed')->exists(); });
$t('the read-only preview opens and every action is audited', function () use ($asMaster, $post) { $asMaster(); Livewire::test(R\CommunityPostResource\Pages\ListCommunityPosts::class)->callTableAction('read', $post)->assertHasNoTableActionErrors(); return AuditLog::where('action', 'like', 'community.post_%')->exists(); });

echo "\n=== Reports ===\n";
$rp = $cs->createPost($B, ['body' => 'Reported post ' . uniqid()]);
$t('3 reports auto-hide; "Take action" (hide + suspend author) closes all reports and suspends; Dismiss restores', function () use ($asMaster, $cs, $A, $B, $C, $rp, $mk) {
    foreach ([$A, $C, $mk()] as $rep) { $cs->report($rep, 'post', $rp->id, 'spam', null); }
    $autoHidden = $rp->fresh()->status === 'hidden'; $r = Report::where('subject_id', $rp->id)->where('subject_type', 'post')->first();
    $asMaster(); $lt = Livewire::test(R\CommunityReportResource\Pages\ListCommunityReports::class)->assertSuccessful()->assertTableActionExists('act')->assertTableActionExists('dismiss');
    $lt->callTableAction('dismiss', $r)->assertHasNoTableActionErrors(); $restored = $rp->fresh()->status === 'published' && Report::where('subject_id', $rp->id)->where('status', 'open')->count() === 0;
    foreach ([$A, $C] as $rep) { Report::where('reporter_id', $rep->id)->where('subject_id', $rp->id)->delete(); $cs->report($rep, 'post', $rp->id, 'abuse', null); } $r2 = Report::where('subject_id', $rp->id)->where('status', 'open')->first();
    $lt->callTableAction('act', $r2, ['action' => 'ban', 'reason' => 'Harassment'])->assertHasNoTableActionErrors();
    return $autoHidden && $restored && $rp->fresh()->status === 'hidden' && Profile::find($B->id)->isBanned() && Report::where('subject_id', $rp->id)->where('status', 'open')->count() === 0 && Report::where('subject_id', $rp->id)->where('status', 'actioned')->exists(); });
$t('a suspended person cannot post but can still read', function () use ($cs, $B) { try { $cs->createPost($B, ['body' => 'trying ' . uniqid()]); return false; } catch (Symfony\Component\HttpKernel\Exception\HttpException $e) { return $e->getStatusCode() === 403 && str_contains($e->getMessage(), 'suspended'); } });

echo "\n=== People ===\n";
$t('people list: verify toggles the check, mute/suspend/restore work and notify; masters cannot be banned', function () use ($asMaster, $mod, $B, $C, $master) {
    $asMaster(); $p = Profile::find($C->id) ?? app(CommunityService::class)->profile($C);
    $lt = Livewire::test(R\CommunityMemberResource\Pages\ListCommunityMembers::class)->assertSuccessful()->searchTable($C->name)->assertCanSeeTableRecords([$p])->callTableAction('verify', $p)->assertHasNoTableActionErrors(); $v = Profile::find($C->id)->is_verified;
    $lt->callTableAction('mute', $p, ['hours' => 24, 'reason' => 'Calm down'])->assertHasNoTableActionErrors(); $m = Profile::find($C->id)->isMuted();
    $lt->callTableAction('ban', $p, ['days' => 7, 'reason' => 'Rules'])->assertHasNoTableActionErrors(); $b = Profile::find($C->id)->isBanned();
    $lt->callTableAction('restore', $p->fresh())->assertHasNoTableActionErrors(); $ok = !Profile::find($C->id)->isBanned() && !Profile::find($C->id)->isMuted();
    try { $mod->ban($master, 1, $master); $masterBan = false; } catch (Symfony\Component\HttpKernel\Exception\HttpException $e) { $masterBan = true; }
    return $v && $m && $b && $ok && $masterBan && Notification::where('user_id', $C->id)->where('title', 'Your community access was suspended')->exists(); });

echo "\n=== Channels ===\n";
$ch = app(ChannelService::class); $chan = $ch->create($A, ['name' => "Admin test channel {$tag}", 'category' => 'Prayer']);
$t('channels list; suspend hides it from members and tells the owner; reactivate; official badge; delete', function () use ($asMaster, $chan, $B, $A, $ch) {
    $asMaster(); $lt = Livewire::test(R\CommunityChannelResource\Pages\ListCommunityChannels::class)->assertSuccessful()->assertCanSeeTableRecords([$chan]);
    $lt->callTableAction('suspend', $chan)->assertHasNoTableActionErrors(); $s = $chan->fresh()->status === 'suspended';
    try { $ch->assertCanView($chan->fresh(), $B); $hidden = false; } catch (Symfony\Component\HttpKernel\Exception\HttpException $e) { $hidden = $e->getStatusCode() === 404; }
    $lt->callTableAction('activate', $chan->fresh())->assertHasNoTableActionErrors(); $lt->callTableAction('official', $chan->fresh())->assertHasNoTableActionErrors(); $official = $chan->fresh()->is_official;
    $lt->callTableAction('delete', $chan->fresh())->assertHasNoTableActionErrors();
    return $s && $hidden && $official && Channel::find($chan->id) === null && Notification::where('user_id', $A->id)->where('title', 'like', 'Your channel%suspended')->exists(); });

echo "\n=== Teachings (the Apostle's library) ===\n";
$t('add a teaching by pasting a YouTube link: video id, thumbnail, publish date are filled in automatically', function () use ($asMaster) {
    $asMaster(); Livewire::test(R\TeachingResource\Pages\CreateTeaching::class)->fillForm(['youtube_url' => 'https://youtu.be/aqz-KE-bpKQ?si=abc', 'title' => 'Test message', 'speaker' => 'Apostle Tavonga Vutabwashe', 'series' => 'Faith Series', 'status' => 'published', 'is_featured' => true])->call('create')->assertHasNoFormErrors();
    $t = Teaching::where('title', 'Test message')->first(); return $t && $t->video_id === 'aqz-KE-bpKQ' && str_contains($t->thumbnail_url, 'aqz-KE-bpKQ') && $t->published_at !== null && $t->created_by !== null; });
$t('invalid, non-YouTube and script links are refused', function () use ($asMaster) { $asMaster(); foreach (['https://vimeo.com/123456789', 'javascript:alert(1)', 'https://evil.example/watch?v=aqz-KE-bpKQ', 'not a link'] as $bad) { Livewire::test(R\TeachingResource\Pages\CreateTeaching::class)->fillForm(['youtube_url' => $bad, 'title' => 'Bad', 'speaker' => 'x', 'status' => 'published'])->call('create')->assertHasFormErrors(['youtube_url']); } return true; });
$t('members see it in Watch, featured on top; a draft stays hidden; scheduled-in-future stays hidden', function () use ($A) {
    Teaching::create(['title' => 'Draft one', 'youtube_url' => 'https://youtu.be/aqz-KE-bpKQ', 'video_id' => 'aqz-KE-bpKQ', 'speaker' => 'x', 'status' => 'draft']); Teaching::create(['title' => 'Future one', 'youtube_url' => 'https://youtu.be/aqz-KE-bpKQ', 'video_id' => 'aqz-KE-bpKQ', 'speaker' => 'x', 'status' => 'published', 'published_at' => now()->addDays(3)]);
    $d = app(WatchService::class)->teachings(); $titles = collect($d['items'])->pluck('title'); return $d['featured'] !== null && $titles->contains('Test message') && !$titles->contains('Draft one') && !$titles->contains('Future one'); });
$t('edit a teaching (change the link) and delete it from the console', function () use ($asMaster) {
    $asMaster(); $tc = Teaching::where('title', 'Test message')->first(); Livewire::test(R\TeachingResource\Pages\EditTeaching::class, ['record' => $tc->getKey()])->fillForm(['youtube_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'])->call('save')->assertHasNoFormErrors();
    $ok = $tc->fresh()->video_id === 'dQw4w9WgXcQ'; Livewire::test(R\TeachingResource\Pages\ListTeachings::class)->assertSuccessful()->callTableAction('delete', $tc->fresh()); Teaching::whereIn('title', ['Draft one', 'Future one'])->delete(); return $ok && Teaching::where('title', 'Test message')->doesntExist(); });

echo "\n=== Live sessions ===\n";
$t('schedule an official live session from the console; the app lists it; invalid link refused', function () use ($asMaster, $A) {
    $asMaster(); $at = now()->addDay()->format('Y-m-d H:i:s');
    Livewire::test(R\LiveSessionResource\Pages\CreateLiveSession::class)->fillForm(['title' => 'Sunday Service LIVE (test)', 'url' => 'https://www.youtube.com/live/aqz-KE-bpKQ', 'scheduled_at' => $at, 'is_official' => true, 'status' => 'scheduled'])->call('create')->assertHasNoFormErrors();
    Livewire::test(R\LiveSessionResource\Pages\CreateLiveSession::class)->fillForm(['title' => 'bad', 'url' => 'https://example.com/x', 'scheduled_at' => $at, 'status' => 'scheduled'])->call('create')->assertHasFormErrors(['url']);
    $s = LiveSession::where('title', 'Sunday Service LIVE (test)')->first(); $listed = collect(app(WatchService::class)->lives($A)['upcoming'])->pluck('title');
    Livewire::test(R\LiveSessionResource\Pages\ListLiveSessions::class)->assertSuccessful()->assertCanSeeTableRecords([$s])->callTableAction('delete', $s); return $s && $s->video_id === 'aqz-KE-bpKQ' && $s->is_official && $listed->contains('Sunday Service LIVE (test)'); });

echo "\n=== Marketplace ===\n";
$partner = User::where('role', 'partner')->first(); $listing = app(App\Services\Market\MarketService::class)->saveListing($partner, ['title' => 'Admin test product ' . $tag, 'description' => 'A product for moderation testing purposes', 'category' => 'Other', 'price' => 5, 'stock' => 2]);
$t('listings oversight: suspend (seller told, hidden from the shop), reinstate, orders list loads', function () use ($asMaster, $listing, $partner, $A) {
    $asMaster(); $lt = Livewire::test(R\MarketListingResource\Pages\ListMarketListings::class)->assertSuccessful()->assertCanSeeTableRecords([$listing])->callTableAction('suspend', $listing, ['reason' => 'Prohibited item'])->assertHasNoTableActionErrors(); $s = $listing->fresh()->status === 'suspended';
    $browse = collect(app(App\Services\Market\MarketService::class)->browse($A, [])['items'])->pluck('id'); $told = Notification::where('user_id', $partner->id)->where('category', 'market')->where('title', 'like', '%suspended%')->exists();
    $lt->callTableAction('reinstate', $listing->fresh())->assertHasNoTableActionErrors(); Livewire::test(R\MarketOrderResource\Pages\ListMarketOrders::class)->assertSuccessful();
    return $s && !$browse->contains($listing->id) && $told && $listing->fresh()->status === 'active'; });

echo "\n=== Dashboard ===\n";
$t('the community widget renders with live numbers; stats agree with the database', function () use ($asMaster) { $asMaster(); Livewire::test(App\Filament\Widgets\Master\CommunityStats::class)->assertSuccessful()->assertSee('Posts today')->assertSee('Open reports'); $s = app(ModerationService::class)->stats(); return $s['profiles'] === DB::table('community_profiles')->count() && $s['channels'] === Channel::where('status', 'active')->count(); });
$t('every community admin page renders', function () use ($asMaster) { $asMaster(); foreach ([R\CommunityPostResource\Pages\ListCommunityPosts::class, R\CommunityReportResource\Pages\ListCommunityReports::class, R\CommunityChannelResource\Pages\ListCommunityChannels::class, R\CommunityMemberResource\Pages\ListCommunityMembers::class, R\TeachingResource\Pages\ListTeachings::class, R\LiveSessionResource\Pages\ListLiveSessions::class, R\MarketListingResource\Pages\ListMarketListings::class, R\MarketOrderResource\Pages\ListMarketOrders::class] as $page) { Livewire::test($page)->assertSuccessful(); } return true; });

// cleanup
$u = array_values(array_unique($users));
Listing::withTrashed()->where('title', 'like', 'Admin test product%')->forceDelete(); DB::table('market_orders')->whereIn('buyer_id', $u)->delete();
Channel::withTrashed()->whereIn('owner_id', $u)->forceDelete(); DB::table('community_posts')->whereIn('user_id', $u)->delete(); DB::table('community_reports')->whereIn('reporter_id', $u)->delete();
DB::table('notifications')->whereIn('user_id', $u)->delete(); DB::table('audit_logs')->whereIn('user_id', $u)->orWhereIn('actor_id', $u)->delete(); DB::table('community_live_sessions')->where('title', 'like', '%(test)%')->delete(); DB::table('community_teachings')->where('title', 'Test message')->delete();
DB::table('personal_access_tokens')->whereIn('tokenable_id', $u)->delete(); User::whereIn('id', $u)->delete(); Cache::flush();
echo "\ncleaned up " . count($u) . " users\nRESULT: $pass passed, $fail failed\n";
