<?php

namespace Database\Seeders;

use App\Models\Pastor;
use Illuminate\Database\Seeder;

class SimplifyPastorCodes extends Seeder
{
    public function run(): void
    {
        $pastors = Pastor::all();

        foreach ($pastors as $pastor) {
            if ($pastor->code) {
                $oldCode = $pastor->code;
                $newCode = preg_replace('/PO0+(\d+)$/', 'PO$1', $oldCode);
                
                $pastor->code = $newCode;
                $pastor->save();

                if ($pastor->user) {
                    $pastor->user->unique_code = $newCode;
                    $pastor->user->save();
                }

                $this->command->info("{$oldCode} -> {$newCode}");
            }
        }

        $this->command->info('Done.');
    }
}