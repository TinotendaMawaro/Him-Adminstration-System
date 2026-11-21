<?php
/* Become a partner from the app, then start the gateway payment. Rolled back. Run: php scripts/verify/partner_enroll_check.php */
require __DIR__ . '/../../vendor/autoload.php';
$app = require __DIR__ . '/../../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
$http = $app->make(Illuminate\Contracts\Http\Kernel::class);
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
\Illuminate\Support\Facades\Cache::flush();
DB::beginTransaction();
$u = User::where('role', 'member')->where('is_active', true)->whereNotNull('zone_id')->whereDoesntHave('partner')->first();
$tok = $u->createToken('pe')->plainTextToken;
$call = function ($m, $uri, $d = []) use ($http, $tok) {
    auth()->forgetGuards();
    $r = $http->handle(Request::create($uri, $m, [], [], [], ['HTTP_ACCEPT' => 'application/json', 'CONTENT_TYPE' => 'application/json', 'REMOTE_ADDR' => '10.5.' . random_int(1,250) . '.' . random_int(1,250), 'HTTP_AUTHORIZATION' => "Bearer $tok", 'HTTP_X_HIM_CLIENT' => 'app'], $d ? json_encode($d) : null));
    echo "$m $uri -> {$r->getStatusCode()} " . substr($r->getContent(), 0, 600) . "\n";
    return json_decode($r->getContent(), true);
};
$pk = $call('GET', '/api/partnership-packages');
$id = $pk['data'][0]['id'] ?? $pk['packages'][0]['id'] ?? null;
$amt = $pk['data'][0]['monthly_amount'] ?? 10;
$call('POST', '/api/partners/enroll', ['package_id' => $id, 'contribution_type' => 'monthly', 'payment_method' => 'visa']);
$call('POST', '/api/online-payments', ['type' => 'partnership', 'amount' => (float) $amt]);
DB::rollBack();
