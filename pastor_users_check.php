<?php
require __DIR__ . '/vendor/autoload.php';
$app = require __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Models\Pastor;

$code = 'R0101P01';

$user = User::where('unique_code', $code)->where('role', 'pastor')->first();
if (!$user) {
    die("User not found for code {$code}\n");
}

$user->load('pastor');

echo "User ID: {$user->id}\n";
echo "User name: {$user->name}\n";
echo "User zone_id (raw): " . ($user->getAttributes()['zone_id'] ?? 'null') . "\n";
echo "User zone_id (accessor): " . ($user->zone_id ?? 'null') . "\n";

if ($user->pastor) {
    echo "Pastor code: {$user->pastor->code}\n";
    echo "Pastor zone_id: {$user->pastor->zone_id}\n";
} else {
    echo "No pastor record linked\n";
}

$resolvedZoneId = $user->zone_id ?? $user->pastor?->zone_id;
echo "Resolved zone_id: " . ($resolvedZoneId ?? 'null') . "\n";

if ($resolvedZoneId) {
    $zone = DB::table('zones')->where('id', $resolvedZoneId)->first();
    echo "Resolved zone code: " . ($zone->code ?? 'null') . "\n";
    echo "Resolved zone name: " . ($zone->name ?? 'null') . "\n";
    $hgCount = DB::table('home_groups')->where('zone_id', $resolvedZoneId)->count();
    echo "Home groups count for resolved zone: {$hgCount}\n";

    echo "\nFirst 20 home groups:\n";
    $rows = DB::table('home_groups')->where('zone_id', $resolvedZoneId)->orderBy('name')->limit(20)->get(['id','name','leader_id']);
    foreach ($rows as $row) {
        echo "- id={$row->id} name={$row->name} leader_id=" . ($row->leader_id ?? 'null') . "\n";
    }
} else {
    echo "No resolved zone; cannot query home groups.\n";
}
