<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Zone;
use App\Models\ZoneHistory;
use App\Models\User;
use App\Models\Pastor;

echo "=== Zone R0101 ===\n";
$zone = Zone::where('code', 'R0101')->first();
if ($zone) {
    echo "ID: {$zone->id}\n";
    echo "Name: {$zone->name}\n";
    echo "Region ID: {$zone->region_id}\n";
} else {
    echo "NOT FOUND\n";
}

echo "\n=== ZoneHistories for R0101 ===\n";
if ($zone) {
    $histories = ZoneHistory::where('zone_id', $zone->id)->get();
    foreach ($histories as $h) {
        echo "ID: {$h->id}, pastor_id: {$h->pastor_id}, end_date: " . ($h->end_date ?? 'NULL') . "\n";
        $user = User::find($h->pastor_id);
        echo "  User: " . ($user ? $user->name : 'NOT FOUND') . "\n";
        $pastor = Pastor::where('user_id', $h->pastor_id)->first();
        echo "  Pastor code: " . ($pastor ? $pastor->code : 'NONE') . "\n";
    }
    if ($histories->isEmpty()) echo "NO HISTORIES\n";
}

echo "\n=== Zone R0102 ===\n";
$zone2 = Zone::where('code', 'R0102')->first();
if ($zone2) {
    echo "ID: {$zone2->id}, Name: {$zone2->name}\n";
    $h2 = ZoneHistory::where('zone_id', $zone2->id)->first();
    if ($h2) {
        echo "History: pastor_id={$h2->pastor_id}\n";
        $u2 = User::find($h2->pastor_id);
        echo "User: " . ($u2 ? $u2->name : 'NOT FOUND') . "\n";
    } else {
        echo "NO HISTORY\n";
    }
} else {
    echo "NOT FOUND\n";
}

echo "\n=== All Zones count ===\n";
echo Zone::count() . "\n";
