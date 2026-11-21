<?php
/*
 * Notifications vs messages in the pastor portal, archiving, the unread/read/archived tabs, pagination, and the HOD candidate list.
 * Everything runs inside a database transaction that is rolled back at the end.
 *   MAILING_ENABLED=false php scripts/verify/notifications_verify.php
 */
require __DIR__ . '/../../vendor/autoload.php';
$app = require __DIR__ . '/../../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
$http = $app->make(Illuminate\Contracts\Http\Kernel::class);

use App\Models\Department;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

$pass = 0; $fail = 0;
$ok = function (string $name, bool $cond, $detail = '') use (&$pass, &$fail) {
    $cond ? $pass++ : $fail++;
    echo ($cond ? '  ok   ' : '  FAIL ') . $name . ($cond || $detail === '' ? '' : '  -> ' . (is_string($detail) ? $detail : json_encode($detail))) . "\n";
};
$call = function (string $method, string $uri, array $data = [], ?string $token = null) use ($http) {
    Cache::flush(); auth()->forgetGuards();
    $server = ['HTTP_ACCEPT' => 'application/json', 'CONTENT_TYPE' => 'application/json', 'REMOTE_ADDR' => '10.88.' . random_int(1, 250) . '.' . random_int(1, 250)];
    if ($token) { $server['HTTP_AUTHORIZATION'] = "Bearer {$token}"; }
    $r = $http->handle(Request::create($uri, $method, $method === 'GET' ? $data : [], [], [], $server, $method !== 'GET' && $data ? json_encode($data) : null));
    return [$r->getStatusCode(), json_decode($r->getContent(), true), $r];
};

DB::beginTransaction();

$zone = App\Models\Zone::whereHas('pastors', fn ($q) => $q->has('pastor'))->whereHas('users', fn ($q) => $q->where('role', 'member')->where('is_active', true))->first();
$pastor = $zone->pastors()->has('pastor')->first();
$pt = $pastor->createToken('nv')->plainTextToken;
$member = User::where('zone_id', $zone->id)->where('role', 'member')->where('is_active', true)->first();
$mt = $member->createToken('nv')->plainTextToken;

Notification::where('user_id', $pastor->id)->delete();
$mk = fn (string $title, ?string $cat) => Notification::create(['user_id' => $pastor->id, 'title' => $title, 'message' => 'm', 'type' => 'info', 'category' => $cat, 'is_read' => false]);

echo "== Messages go to the inbox, changes go to notifications ==\n";
[$c] = $call('POST', '/api/messages/direct', ['receiver_id' => $pastor->id, 'content' => 'Pastor, hello from a member'], $mt);
$ok('a member can message the zone pastor', $c === 201, $c);
$msgNote = Notification::where('user_id', $pastor->id)->where('category', 'message')->latest('id')->first();
$ok('that message created a message notification', (bool) $msgNote);
$ok('it remembers who sent it (so the inbox opens that conversation)', (int) ($msgNote->related_id ?? 0) === $member->id, $msgNote?->related_id);
$ok('it is of kind "message"', ($msgNote?->kind ?? null) === 'message');

$joined = $mk('New member joined', 'member');
for ($i = 1; $i <= 11; $i++) { $mk("Zone change {$i}", 'member_update'); }

[$c, $b] = $call('GET', '/api/notifications', ['kind' => 'notification', 'tab' => 'unread', 'per_page' => 5], $pt);
$ok('the notifications tab lists 5 per page, no messages among them', $c === 200 && count($b['notifications']) === 5 && collect($b['notifications'])->every(fn ($n) => $n['kind'] === 'notification'), [$c, count($b['notifications'] ?? [])]);
$ok('it reports total and last page', ($b['meta']['total'] ?? 0) === 12 && ($b['meta']['last_page'] ?? 0) === 3, $b['meta'] ?? null);
$ok('unread messages and notifications are counted apart', ($b['unread_messages'] ?? -1) === 1 && ($b['unread_notifications'] ?? -1) === 12 && ($b['unread_count'] ?? -1) === 13, [$b['unread_messages'] ?? null, $b['unread_notifications'] ?? null, $b['unread_count'] ?? null]);
[$c, $b] = $call('GET', '/api/notifications', ['kind' => 'notification', 'tab' => 'unread', 'per_page' => 5, 'page' => 3], $pt);
$ok('the last page has the remainder', count($b['notifications'] ?? []) === 2, count($b['notifications'] ?? []));
[$c, $b] = $call('GET', '/api/notifications', ['kind' => 'message'], $pt);
$ok('the inbox side lists only the message', count($b['notifications'] ?? []) === 1 && $b['notifications'][0]['kind'] === 'message');

echo "== Read, archive, restore ==\n";
[$c] = $call('PUT', "/api/notifications/{$joined->id}/read", [], $pt);
$ok('opening a notification marks it read', $c === 200 && $joined->fresh()->is_read === true, $c);
[$c, $b] = $call('GET', '/api/notifications', ['kind' => 'notification', 'tab' => 'read'], $pt);
$ok('it now appears under Read, not Unread', collect($b['notifications'])->pluck('id')->contains($joined->id));
[$c, $b] = $call('POST', "/api/notifications/{$joined->id}/archive", [], $pt);
$ok('archiving works', $c === 200 && $joined->fresh()->archived_at !== null, [$c, $b['message'] ?? null]);
[$c, $b] = $call('GET', '/api/notifications', ['kind' => 'notification', 'tab' => 'archived'], $pt);
$ok('it appears under Archived', collect($b['notifications'])->pluck('id')->contains($joined->id));
[$c, $b] = $call('GET', '/api/notifications', ['kind' => 'notification', 'tab' => 'read'], $pt);
$ok('and no longer under Read', !collect($b['notifications'])->pluck('id')->contains($joined->id));
[$c] = $call('DELETE', "/api/notifications/{$joined->id}/archive", [], $pt);
$ok('restoring brings it back', $c === 200 && $joined->fresh()->archived_at === null, $c);
[$c, $b] = $call('POST', "/api/notifications/{$joined->id}/archive", [], $mt);
$ok("someone else cannot archive a pastor's notification (404)", $c === 404, $c);
[$c, $b] = $call('PUT', '/api/notifications/read-all', [], $pt);
$ok('"mark all read" works (it used to 500: the route had no method)', $c === 200, [$c, $b['message'] ?? null]);
[$c, $b] = $call('GET', '/api/notifications', ['tab' => 'unread'], $pt);
$ok('nothing is left unread', ($b['unread_count'] ?? -1) === 0, $b['unread_count'] ?? null);

echo "== Announcements reach the inbox ==\n";
$dept = Department::first();
if ($dept) {
    $member->update(['department_id' => $dept->id]);
    [$c, $b] = $call('POST', '/api/messages/announcement', ['department_id' => $dept->id, 'content' => 'Practice on Friday'], $pt);
    $ok('a pastor can announce to a department', $c === 201, [$c, $b['message'] ?? null]);
    [$c, $b] = $call('GET', '/api/messages/announcements', [], $mt);
    $ok('the member sees it under announcements', $c === 200 && collect($b['announcements'] ?? [])->contains(fn ($a) => $a['content'] === 'Practice on Friday'), $c);
    $note = Notification::where('user_id', $member->id)->where('category', 'message')->latest('id')->first();
    $ok('and it was a message notification pointing at the sender', $note && (int) $note->related_id === $pastor->id, $note?->related_id);
}

echo "== Assign HOD lists every member, in any zone ==\n";
$otherZoneMember = User::where('role', 'member')->where('is_active', true)->where('zone_id', '!=', $zone->id)->first();
[$c, $b] = $call('GET', '/api/departments/hod-candidates', ['per_page' => 50], $pt);
$ok('the list loads for a pastor', $c === 200 && !empty($b['data']), [$c, count($b['data'] ?? [])]);
$ok('it is paged', isset($b['meta']['last_page'], $b['meta']['total']));
$ok('it includes members of other zones and countries, not just the pastor\'s zone', $otherZoneMember ? collect($b['data'])->pluck('zone')->unique()->count() > 1 || $b['meta']['last_page'] > 1 : true);
$ok('it never offers pastors', collect($b['data'])->every(fn ($u) => in_array($u['role'], ['member', 'hod', 'partner'], true)));
$firstName = explode(' ', trim($b['data'][0]['name']))[0];
[$c, $b2] = $call('GET', '/api/departments/hod-candidates', ['search' => $firstName], $pt);
$ok('searching by name works', $c === 200 && count($b2['data']) >= 1 && collect($b2['data'])->every(fn ($u) => stripos($u['name'] . $u['email'], $firstName) !== false), $c);
[$c] = $call('GET', '/api/departments/hod-candidates', [], $mt);
$ok('a plain member cannot open the list (403)', $c === 403, $c);
if ($otherZoneMember && $dept) {
    [$c, $b] = $call('POST', "/api/departments/{$dept->id}/assign-hod", ['user_id' => $otherZoneMember->id], $pt);
    $ok('a pastor can appoint a member from another zone', in_array($c, [200, 201], true), [$c, $b['message'] ?? null]);
}

DB::rollBack();
echo "\nRESULT: {$pass} passed, {$fail} failed (all changes rolled back)\n";
exit($fail ? 1 : 0);
