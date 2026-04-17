<?php

namespace Database\Seeders;

use App\Models\Pastor;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UpdatePastorCodesToPOFormat extends Seeder
{
    public function run(): void
    {
        $pastors = Pastor::all();

        foreach ($pastors as $pastor) {
            if ($pastor->code && str_contains($pastor->code, 'P')) {
                $oldCode = $pastor->code;
                $newCode = str_replace('P', 'PO', $oldCode);
                
                $pastor->code = $newCode;
                $pastor->save();

                if ($pastor->user) {
                    $pastor->user->unique_code = $newCode;
                    $pastor->user->save();
                }

                $this->command->info("Updated: {$oldCode} -> {$newCode}");
            }
        }

        $this->command->info('All pastor codes updated to PO format.');
    }
}