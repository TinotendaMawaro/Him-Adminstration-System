<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

$zoneId = DB::table('zones')->where('code', 'R0101')->value('id');
$hgs = DB::table("home_groups")->where("zone_id", $zoneId)->select("id", "name", "leader_id")->orderBy("name")->get();
foreach($hgs as $hg){
    echo str_pad($hg->id, 3, " ", STR_PAD_LEFT) . " | " . str_pad($hg->name, 40, " ", STR_PAD_RIGHT) . " | Leader ID: " . ($hg->leader_id ?: "NULL") . PHP_EOL;
}

?>