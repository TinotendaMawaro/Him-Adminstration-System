<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$pastor = \App\Models\User::where('role', 'pastor')->first();
$zoneId = $pastor->zone_id;

$partners = \App\Models\Partner::whereHas('user', fn ($q) => $q->where('zone_id', $zoneId))
    ->with(['user:id,name,email,phone', 'zone:id,name'])
    ->get();

echo "Pastor zone_id: $zoneId\n";
echo "Partners visible to pastor: " . $partners->count() . PHP_EOL;
foreach ($partners as $p) {
    echo "- " . $p->name . " " . $p->surname . " (user zone: " . ($p->user->zone_id ?? 'null') . ")\n";
}
