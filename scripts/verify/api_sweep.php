<?php
/*
 * Calls every parameterless GET endpoint of the API as a member, a partner, an HOD and a pastor, and fails if any returns a
 * server error (5xx). Run:  php scripts/verify/api_sweep.php     (set MAILING_ENABLED=false; nothing is written)
 */
require __DIR__ . '/../../vendor/autoload.php';
$app = require __DIR__ . '/../../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
$http = $app->make(Illuminate\Contracts\Http\Kernel::class);

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

$personas = [
    'member'  => User::where('role', 'member')->where('is_active', true)->orderBy('id')->first(),
    'partner' => User::where('role', 'partner')->where('is_active', true)->first(),
    'hod'     => User::where('role', 'hod')->where('is_active', true)->whereNotNull('department_id')->first() ?? User::where('role', 'hod')->where('is_active', true)->first(),
    'pastor'  => User::where('role', 'pastor')->where('is_active', true)->where('unique_code', 'R0101P01')->first() ?? User::where('role', 'pastor')->where('is_active', true)->first(),
];

$routes = collect(app('router')->getRoutes()->getRoutes())
    ->filter(fn ($r) => in_array('GET', $r->methods()) && str_starts_with($r->uri(), 'api/') && !str_contains($r->uri(), '{') && !str_contains($r->uri(), 'logout'))
    ->map(fn ($r) => $r->uri())->unique()->sort()->values();

echo 'personas: ' . implode(', ', array_keys(array_filter($personas))) . '   GET routes: ' . $routes->count() . "\n";

$errors = [];
foreach (array_filter($personas) as $name => $user) {
    $token = $user->createToken('sweep')->plainTextToken;
    $tally = [];
    foreach ($routes as $uri) {
        Cache::flush();
        auth()->forgetGuards();
        $server = ['HTTP_ACCEPT' => 'application/json', 'REMOTE_ADDR' => '10.77.' . random_int(1, 250) . '.' . random_int(1, 250), 'HTTP_AUTHORIZATION' => "Bearer {$token}"];
        $r = $http->handle(Request::create('/' . $uri, 'GET', [], [], [], $server));
        $code = $r->getStatusCode();
        $tally[$code] = ($tally[$code] ?? 0) + 1;
        if ($code >= 500) {
            $errors[] = [$name, $uri, $code, substr((string) (json_decode($r->getContent(), true)['message'] ?? ''), 0, 140)];
        }
    }
    ksort($tally);
    echo str_pad($name, 8) . json_encode($tally) . "\n";
    $user->tokens()->where('name', 'sweep')->delete();
}

echo "\n=== 5xx (server errors) ===\n";
if (!$errors) {
    echo "none\n";
    exit(0);
}
foreach ($errors as [$who, $uri, $code, $msg]) {
    echo "{$who}  {$uri}  {$code}  {$msg}\n";
}
exit(1);
