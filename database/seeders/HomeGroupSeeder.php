<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class HomeGroupSeeder extends Seeder
{
    private array $homeGroups = [
        // Region 01
        ['R0101', 'IOC Home Group', '1 Sandy Lane, Ashdown Park, Harare', 'Sunday', '09:00:00'],
        ['R0102', 'Dzivarasekwa Home Group', 'Munyarari Building, Glenview 3 Shops, Harare', 'Sunday', '09:00:00'],
        ['R0103', 'AFDIS Home Group', 'To be assigned', 'Sunday', '09:00:00'],

        // Region 02
        ['R0201', 'Mandra (Rsk) Home Group', 'To be assigned', 'Sunday', '09:00:00'],
        ['R0202', 'Nyameni Home Group', 'To be assigned', 'Sunday', '09:00:00'],
        ['R0203', 'Wedza Home Group', 'To be assigned', 'Sunday', '09:00:00'],

        // Region 03
        ['R0301', 'Ruwa Home Group', 'Ruwa Area', 'Sunday', '09:00:00'],
        ['R0302', 'Damofalls Home Group', 'Damofalls Area', 'Sunday', '09:00:00'],
        ['R0303', 'Eastview Home Group', 'Eastview Area', 'Sunday', '09:00:00'],

        // Region 04
        ['R0401', 'Zengeza Home Group', 'Zengeza Area', 'Sunday', '09:00:00'],
        ['R0402', 'Seke Home Group', 'Seke Area', 'Sunday', '09:00:00'],
        ['R0403', 'St Marys Home Group', 'St Marys Area', 'Sunday', '09:00:00'],
        ['R0404', 'Dema Home Group', 'Dema Area', 'Sunday', '09:00:00'],

        // Region 05
        ['R0501', 'Epworth Home Group', 'Epworth Area', 'Sunday', '09:00:00'],
        ['R0502', 'Greendale Home Group', 'Greendale Area', 'Sunday', '09:00:00'],
        ['R0503', 'Mabvuku Home Group', 'Mabvuku Area', 'Sunday', '09:00:00'],
        ['R0504', 'Chabwino Home Group', 'Chabwino Area', 'Sunday', '09:00:00'],
        ['R0505', 'Chikurubi Home Group', 'Room 28, Support Unit Primary School, Chikurubi S/Unit Camp', 'Sunday', '09:00:00'],

        // Region 06
        ['R0601', 'Mufakose Home Group', 'Corner Bubye and Musasa (Blue Roof), Mufakose', 'Sunday', '09:00:00'],
        ['R0602', 'Norton Home Group', 'Opposite Flamingo flats, stand number 30, Shonhiwa street, Norton City', 'Sunday', '09:00:00'],
        ['R0603', 'Kuwadzana Home Group', 'To be assigned', 'Sunday', '09:00:00'],
        ['R0604', 'Granary Home Group', 'To be assigned', 'Sunday', '09:00:00'],
        ['R0605', 'Kambuzuma Home Group', 'To be assigned', 'Sunday', '09:00:00'],

        // Region 07
        ['R0701', 'Southlea Park Home Group', 'To be assigned', 'Sunday', '09:00:00'],
        ['R0702', 'Retreat Home Group', 'To be assigned', 'Sunday', '09:00:00'],
        ['R0703', 'Hopely Home Group', 'To be assigned', 'Sunday', '09:00:00'],
        ['R0704', 'Stoneridge Home Group', 'To be assigned', 'Sunday', '09:00:00'],
        ['R0705', 'Fidelity Home Group', 'To be assigned', 'Sunday', '09:00:00'],

        // Region 08
        ['R0801', 'Glen View Home Group', '2nd Floor, Munyarari Building, Glenview 3 Shops, Harare', 'Sunday', '09:00:00'],
        ['R0802', 'Glen Norah Home Group', 'To be assigned', 'Sunday', '09:00:00'],
        ['R0803', 'Budiriro Home Group', 'To be assigned', 'Sunday', '09:00:00'],
        ['R0804', 'Highfields Home Group', 'Wollovale Road Opposite Munenzva Bus Company, Harare Highfield', 'Sunday', '09:00:00'],

        // Region 10
        ['R1001', 'Waverly Home Group', 'To be assigned', 'Sunday', '09:00:00'],
        ['R1002', 'Rimuka Home Group', 'Chisangano Rimuka Hall, Rimuka, Kadoma', 'Sunday', '09:00:00'],
        ['R1003', 'Chegutu Home Group', 'To be assigned', 'Sunday', '09:00:00'],
        ['R1004', 'Turf Home Group', '5533 Mhondoro Ngezi Turf (3 bedrooms)', 'Sunday', '09:00:00'],
        ['R1005', 'Ingezi Home Group', 'To be assigned', 'Sunday', '09:00:00'],
        ['R1006', 'Nembudziya Home Group', 'To be assigned', 'Sunday', '09:00:00'],

        // Region 11
        ['R1101', 'Kwekwe City Home Group', 'To be assigned', 'Sunday', '09:00:00'],
        ['R1102', 'Mbizo Home Group', 'To be assigned', 'Sunday', '09:00:00'],
        ['R1103', 'Gokwe Home Group', 'To be assigned', 'Sunday', '09:00:00'],

        // Region 12
        ['R1201', 'Chipadze Home Group', 'To be assigned', 'Sunday', '09:00:00'],
        ['R1202', 'Glendale Home Group', 'To be assigned', 'Sunday', '09:00:00'],
        ['R1203', 'Mvurwi Home Group', 'To be assigned', 'Sunday', '09:00:00'],
        ['R1204', 'Mazowe Home Group', 'To be assigned', 'Sunday', '09:00:00'],

        // Region 13
        ['R1301', 'Mutawatawa Home Group', 'To be assigned', 'Sunday', '09:00:00'],
        ['R1302', 'Murewa Home Group', 'To be assigned', 'Sunday', '09:00:00'],
        ['R1303', 'Mutoko Home Group', 'To be assigned', 'Sunday', '09:00:00'],

        // Region 14
        ['R1401', 'St Ives Home Group', 'To be assigned', 'Sunday', '09:00:00'],
        ['R1402', 'Karoi Home Group', 'To be assigned', 'Sunday', '09:00:00'],
        ['R1403', 'Chinhoyi City Home Group', 'Chinhoyi Hall Rank Area', 'Sunday', '09:00:00'],
        ['R1404', 'Kariba Home Group', 'To be assigned', 'Sunday', '09:00:00'],
        ['R1405', 'Banket Home Group', 'To be assigned', 'Sunday', '09:00:00'],

        // Region 15 (Diaspora)
        ['R1501', 'UAE Home Group', 'To be assigned', 'Friday', '19:00:00'],
        ['R1502', 'USA Home Group', 'To be assigned', 'Saturday', '10:00:00'],
        ['R1503', 'UK Home Group', 'To be assigned', 'Saturday', '10:00:00'],

        // Region 16
        ['R1601', 'Zvishavane Home Group', 'To be assigned', 'Sunday', '09:00:00'],
        ['R1602', 'Masvingo Home Group', 'Runyararo West, Light industry, Simon Mazorodze, Masvingo', 'Sunday', '09:00:00'],
        ['R1603', 'Beitbridge Home Group', 'To be assigned', 'Sunday', '09:00:00'],

        // Region 17
        ['R1701', 'Kempton Park Home Group', '107 Commissioner Street, Kempton Park', 'Sunday', '09:00:00'],
        ['R1702', 'Johannesburg Home Group', '180 Prairie Street, Rosettenville, Johannesburg (upstairs)', 'Sunday', '09:00:00'],
        ['R1703', 'Pretoria Home Group', '555 Francis Baard Street, Arcadia, Pretoria 0002', 'Sunday', '09:00:00'],
        ['R1704', 'Gemistone Home Group', 'Revelas Towers Second Floor, 17 Queen Street, Germiston', 'Sunday', '09:00:00'],
        ['R1705', 'Cape Town Home Group', 'To be assigned', 'Sunday', '09:00:00'],
        ['R1706', 'Maputo Home Group', 'To be assigned', 'Sunday', '09:00:00'],

        // Region 18
        ['R1801', 'Nkulumane Home Group', 'To be assigned', 'Sunday', '09:00:00'],
        ['R1802', 'Cowdray Park Home Group', 'To be assigned', 'Sunday', '09:00:00'],

        // Region 19
        ['R1901', 'Tete Home Group', 'To be assigned', 'Sunday', '09:00:00'],
        ['R1902', 'Malawi Home Group', 'To be assigned', 'Sunday', '09:00:00'],

        // Region 20
        ['R2001', 'Gwanda Home Group', 'To be assigned', 'Sunday', '09:00:00'],
        ['R2002', 'Makwe Home Group', 'To be assigned', 'Sunday', '09:00:00'],
        ['R2003', 'Gwanda City Home Group', 'To be assigned', 'Sunday', '09:00:00'],

        // Region 21
        ['R2101', 'Mutare Chikanga Home Group', 'To be assigned', 'Sunday', '09:00:00'],
        ['R2102', 'Dangamvura Home Group', 'To be assigned', 'Sunday', '09:00:00'],
        ['R2103', 'Rusape Home Group', 'To be assigned', 'Sunday', '09:00:00'],
        ['R2104', 'Manica Home Group', 'To be assigned', 'Sunday', '09:00:00'],
        ['R2105', 'Chimoio Home Group', 'To be assigned', 'Sunday', '09:00:00'],

        // Region 22
        ['R2201', 'Gweru City Home Group', 'To be assigned', 'Sunday', '09:00:00'],
        ['R2202', 'Mkoba Home Group', 'To be assigned', 'Sunday', '09:00:00'],
        ['R2203', 'Shurugwi Home Group', 'To be assigned', 'Sunday', '09:00:00'],
        ['R2204', 'Senga Home Group', 'To be assigned', 'Sunday', '09:00:00'],

        // Region 23
        ['R2301', 'Hatcliff Home Group', 'Heartfelt Church Stand, Murove Village, Domboshava', 'Sunday', '09:00:00'],
        ['R2302', 'Domboshava Home Group', 'Heartfelt Church Stand, Murove Village, Domboshava', 'Sunday', '09:00:00'],
    ];

    public function run(): void
    {
        $created = 0;
        foreach ($this->homeGroups as [$zoneCode, $name, $location, $meetingDay, $meetingTime]) {
            $zone = DB::table('zones')->where('code', $zoneCode)->first();
            if (!$zone) {
                $this->command->warn("Zone {$zoneCode} not found. Skipping home group '{$name}'.");
                continue;
            }

            DB::table('home_groups')->updateOrInsert(
                ['zone_id' => $zone->id, 'name' => $name],
                [
                    'location'      => $location,
                    'meeting_day'   => $meetingDay,
                    'meeting_time'  => $meetingTime,
                    'created_at'    => now(),
                    'updated_at'    => now(),
                ]
            );
            $created++;
        }

        $this->command->info("Created/updated {$created} home groups.");
    }
}
