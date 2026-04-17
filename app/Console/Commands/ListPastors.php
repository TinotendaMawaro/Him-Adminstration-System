<?php

namespace App\Console\Commands;

use App\Models\Pastor;
use Illuminate\Console\Command;

class ListPastors extends Command
{
    protected $signature = 'app:list-pastors';

    protected $description = 'List all pastors with codes';

    public function handle()
    {
        $pastors = Pastor::with('zone:id,code,name')
            ->orderBy('code')
            ->get();

        $this->table(
            ['ID', 'Code', 'Name', 'Surname', 'Zone', 'Zone Pastor?'],
            $pastors->map(fn($p) => [
                $p->id,
                $p->code,
                $p->name,
                $p->surname,
                $p->zone?->code . ' - ' . $p->zone?->name,
                $p->is_zone_pastor ? 'Yes' : 'No'
            ])
        );
    }
}