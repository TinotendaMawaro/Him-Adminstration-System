<?php

namespace App\Console\Commands;

use App\Models\Zone;
use Illuminate\Console\Command;

class ListZones extends Command
{
    protected $signature = 'app:list-zones';

    protected $description = 'List all zones with codes';

    public function handle()
    {
        $zones = Zone::select('id', 'name', 'code', 'region_id')
            ->orderBy('code')
            ->get();

        $this->table(['ID', 'Code', 'Name', 'Region ID'], $zones->map(fn($z) => [$z->id, $z->code, $z->name, $z->region_id]));
    }
}