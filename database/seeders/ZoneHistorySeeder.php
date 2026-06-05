<?php

namespace Database\Seeders;

use App\Models\Pastor;
use App\Models\Zone;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ZoneHistorySeeder extends Seeder
{
    /**
     * Map zone code → first pastor code from the spec.
     * Inserts active histories into zone_histories.
     */
    private array $map = [
        // Region 01 - Harare North
        'R0101' => 'R0101P01',
        'R0102' => 'R0102P01',
        'R0103' => 'R0103P01',

        // Region 02 - Marondera
        'R0201' => 'R0201P01',
        'R0202' => 'R0202P01',
        // R0203 - Wedza - TBA

        // Region 03 - Ruwa
        'R0301' => 'R0301P01',
        'R0302' => 'R0302P01',
        'R0303' => 'R0303P01',

        // Region 04 - Chitungwiza
        'R0401' => 'R0401P01',
        'R0402' => 'R0402P01',
        'R0403' => 'R0403P01',
        'R0404' => 'R0404P01',

        // Region 05 - Epworth
        'R0501' => 'R0501P01',
        'R0502' => 'R0502P01',
        'R0503' => 'R0503P01',
        'R0504' => 'R0504P01',
        'R0505' => 'R0505P01',

        // Region 06 - West Harare
        'R0601' => 'R0601P01',
        'R0602' => 'R0602P01',
        'R0603' => 'R0603P01',
        'R0604' => 'R0604P01',
        'R0605' => 'R0605P01',

        // Region 07 - South Harare
        'R0701' => 'R0701P01',
        'R0702' => 'R0702P01',
        'R0703' => 'R0703P01',
        'R0704' => 'R0704P01',
        'R0705' => 'R0705P01',

        // Region 08 - South West Harare
        'R0801' => 'R0801P01',
        'R0802' => 'R0802P01',
        'R0803' => 'R0803P01',
        'R0804' => 'R0804P01',

        // Region 10 - Midlands West
        'R1001' => 'R1001P01',
        'R1002' => 'R1002P01',
        'R1003' => 'R1003P01',
        'R1004' => 'R1004P01',
        'R1005' => 'R1005P01',
        'R1006' => 'R1006P01',

        // Region 11 - Kwekwe
        'R1101' => 'R1101P01',
        'R1102' => 'R1102P01',
        'R1103' => 'R1103P01',

        // Region 12 - Mazowe
        'R1201' => 'R1201P01',
        'R1202' => 'R1202P01',
        'R1203' => 'R1203P01',
        // R1204 - Mazowe - TBA

        // Region 13 - Mutoko
        'R1301' => 'R1301P01',
        'R1302' => 'R1302P01',
        'R1303' => 'R1303P01',

        // Region 14 - Mashonaland West
        'R1401' => 'R1401P01',
        'R1402' => 'R1402P01',
        'R1403' => 'R1403P01',
        'R1404' => 'R1404P01',
        'R1405' => 'R1405P01',

        // Region 15 - International
        'R1501' => 'R1501P01',
        'R1502' => 'R1502P01',
        // R1503 - UK - TBA

        // Region 16 - Masvingo
        'R1601' => 'R1601P01',
        'R1602' => 'R1602P01',
        'R1603' => 'R1603P01',

        // Region 17 - South Africa & Mozambique
        'R1701' => 'R1701P01',
        'R1702' => 'R1702P01',
        'R1703' => 'R1703P01',
        // R1704 - Germiston - TBA
        'R1705' => 'R1705P01',
        'R1706' => 'R1706P01',

        // Region 18 - Bulawayo North
        'R1801' => 'R1801P01',
        // R1802 - Cowdray Park - TBA

        // Region 19 - Mozambique/Malawi
        'R1901' => 'R1901P01',
        'R1902' => 'R1902P01',

        // Region 20 - Gwanda
        'R2001' => 'R2001P01',
        // R2002 - Makwe - TBA
        // R2003 - Gwanda City - TBA

        // Region 21 - Manicaland
        'R2101' => 'R2101P01',
        'R2102' => 'R2102P01',
        'R2103' => 'R2103P01',
        'R2104' => 'R2104P01',
        'R2105' => 'R2105P01',

        // Region 22 - Gweru
        'R2201' => 'R2201P01',
        'R2202' => 'R2202P01',
        'R2203' => 'R2203P01',
        'R2204' => 'R2204P01',

        // Region 23 - Hatcliff
        'R2301' => 'R2301P01',
        'R2302' => 'R2302P01',
    ];

    public function run(): void
    {
        $zones   = Zone::all()->keyBy('code');
        $pastors = Pastor::all()->keyBy('code');
        $now     = now();
        $inserted = 0;
        $fixed    = 0;
        $skipped  = 0;
        $errors   = 0;

        foreach ($this->map as $zoneCode => $pastorCode) {
            $zone   = $zones[$zoneCode] ?? null;
            $pastor = $pastors[$pastorCode] ?? null;

            if (! $zone || ! $pastor) {
                $this->command->warn("Missing zone={$zoneCode} or pastor={$pastorCode}");
                $skipped++;
                continue;
            }

            $userId = $pastor->user_id;
            if (! $userId) {
                $this->command->warn("Pastor {$pastorCode} has no user_id — skipping zone {$zoneCode}");
                $skipped++;
                continue;
            }

            // Find an existing active history for this zone
            $existing = DB::table('zone_histories')
                ->where('zone_id', $zone->id)
                ->whereNull('end_date')
                ->first();

            if ($existing) {
                try {
                    DB::table('zone_histories')
                        ->where('id', $existing->id)
                        ->update([
                            'pastor_id'  => $userId,
                            'updated_at' => $now,
                        ]);
                    $fixed++;
                } catch (\Throwable $e) {
                    $this->command->error("Failed updating zone_histories {$existing->id}: " . $e->getMessage());
                    $errors++;
                }
                continue;
            }

            try {
                DB::table('zone_histories')->insert([
                    'zone_id'    => $zone->id,
                    'pastor_id'  => $userId,
                    'start_date' => $now,
                    'end_date'   => null,
                    'notes'      => 'Assigned from ChurchStructureSeeder',
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
                $inserted++;
            } catch (\Throwable $e) {
                $this->command->error("Failed inserting zone_histories for {$zoneCode}: " . $e->getMessage());
                $errors++;
            }
        }

        $this->command->info("ZoneHistorySeeder: inserted={$inserted}, fixed={$fixed}, skipped={$skipped}, errors={$errors}");
    }
}
