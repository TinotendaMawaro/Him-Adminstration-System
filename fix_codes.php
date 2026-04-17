<?php

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Pastor;

echo "=== Updating Pastor Codes to R[Region][Zone]PO[Number] Format ===\n\n";

// Get all pastors ordered by zone
$pastors = Pastor::with('user.zone')->get()->groupBy(function($p) {
    return $p->user->zone->code ?? 'UNKNOWN';
});

$newCodes = [];

foreach ($pastors as $zoneCode => $zonePastors) {
    if ($zoneCode === 'UNKNOWN') continue;
    
    $pastorNum = 1;
    foreach ($zonePastors as $pastor) {
        // New format: R0101PO1 = R + Region(01) + Zone(01) + PO + Number(1,2,3)
        $newCode = $zoneCode . 'PO' . $pastorNum;
        $newCodes[$pastor->id] = $newCode;
        
        echo "Old: {$pastor->code} -> New: {$newCode} ({$pastor->user->name})\n";
        $pastorNum++;
    }
}

// Update all codes
foreach ($newCodes as $pastorId => $newCode) {
    Pastor::where('id', $pastorId)->update(['code' => $newCode]);
}

echo "\n=== Updated " . count($newCodes) . " pastor codes ===\n";

echo "\n=== Sample verification ===\n";
$pastors = Pastor::with('user.zone')->get()->take(15);
foreach ($pastors as $p) {
    echo "{$p->code} - {$p->user->name} - Zone: {$p->user->zone->code}\n";
}