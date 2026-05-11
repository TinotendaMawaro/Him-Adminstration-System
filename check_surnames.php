<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';

$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

$surnames = [
    "Chikanya", "Chindawi", "Machine", "Chinoyevedza", "Mudhefi", 
    "Kasokoya", "Mushiwekufa", "Madamombe", "Zitsenga", "Nyamatore", 
    "Taderera", "Makoni", "Mabasa", "Munemo", "Nyazamba", "Jekecha", 
    "Dzuda", "Tembo", "Machabe", "Mufunga", "Matiringe", "Jiri", 
    "Zizhou", "Takototsa", "Mawarura", "Mapani", "Mugari", "Chaponda", 
    "Matenda", "Brian", "Msipa", "Matare", "Emma", "Badza", "Masendeke", 
    "Makombe", "Magunje", "Bwerinofa", "Pfumayaramba", "Chigiya", 
    "Nyamanhari", "Musakanda"
];

$users = DB::table("users")->select("id", "name")->get();

foreach($surnames as $surname){
    $found = false;
    foreach($users as $user){
        if(stripos($user->name, $surname) !== false){
            echo "Found: $surname matches $user->name (ID: $user->id)".PHP_EOL;
            $found = true;
        }
    }
    if(!$found){
        echo "No match found for: $surname".PHP_EOL;
    }
}
