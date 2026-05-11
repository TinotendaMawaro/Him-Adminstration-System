<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

// Reset leader_ids for IOC zone home groups
$zoneId = DB::table('zones')->where('code', 'R0101')->value('id');
$result = DB::table("home_groups")
    ->where("zone_id", $zoneId)
    ->update(["leader_id" => null]);

echo "Reset leader_ids for IOC zone home groups. Updated {$result} records.\n";
