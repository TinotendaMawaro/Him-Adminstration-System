<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ZoneContactSeeder extends Seeder
{
    /**
     * Zone contact data mapped by zone code
     * Sources: Official zonal PDF + user-provided addresses
     */
    private array $contacts = [
        // Region 01
        ['R0101', 'IOC',            '1 Sandy Lane, Ashdown Park, Harare', '0780292352'],
        ['R0102', 'Dzivarasekwa',   'Munyarari Building, Glenview 3 Shops, Harare', '0777971325, 0715616565'],
        ['R0103', 'AFDIS',          'HIM Church Stand, Stapleford',       '0777971325, 0715616565'],

        // Region 02
        ['R0201', 'Mandra (Rsk)', 'To be assigned', null],
        ['R0202', 'Nyameni', 'To be assigned', null],
        ['R0203', 'Wedza', 'To be assigned', null],

        // Region 03
        ['R0301', 'Ruwa', 'To be assigned', null],
        ['R0302', 'Damofalls', 'To be assigned', null],
        ['R0303', 'Eastview', 'To be assigned', null],

        // Region 04
        ['R0401', 'Zengeza', 'To be assigned', null],
        ['R0402', 'Seke', 'To be assigned', null],
        ['R0403', 'St Marys', 'To be assigned', null],
        ['R0404', 'Dema', 'To be assigned', null],

        // Region 05
        ['R0501', 'Epworth', 'To be assigned', null],
        ['R0502', 'Greendale', 'To be assigned', null],
        ['R0503', 'Mabvuku', 'To be assigned', null],
        ['R0504', 'Chabwino', 'To be assigned', null],
        ['R0505', 'Chikurubi', 'Room 28, Support Unit Primary School, Chikurubi S/Unit Camp', '0773638981'],

        // Region 06
        ['R0601', 'Mufakose', 'Corner Bubye and Musasa (Blue Roof), Mufakose', '0773287296, 0778793098'],
        ['R0602', 'Norton', 'Opposite Flamingo flats, stand number 30, Shonhiwa street, Norton City', '0783965411'],
        ['R0603', 'Kuwadzana', 'To be assigned', null],
        ['R0604', 'Granary', 'To be assigned', null],
        ['R0605', 'Kambuzuma', 'To be assigned', null],

        // Region 07
        ['R0701', 'Southlea Park', 'To be assigned', null],
        ['R0702', 'Retreat', 'To be assigned', null],
        ['R0703', 'Hopely', 'To be assigned', null],
        ['R0704', 'Stoneridge', 'To be assigned', null],
        ['R0705', 'Fidelity', 'To be assigned', null],

        // Region 08
        ['R0801', 'Glen View', '2nd Floor, Munyarari Building, Glenview 3 Shops, Harare', '0780292352'],
        ['R0802', 'Glen Norah', 'To be assigned', null],
        ['R0803', 'Budiriro', 'To be assigned', null],
        ['R0804', 'Highfields', 'Wollovale Road Opposite Munenzva Bus Company, Harare Highfield', '0773736650'],

        // Region 10
        ['R1001', 'Waverly', 'To be assigned', null],
        ['R1002', 'Rimuka', 'Chisangano Rimuka Hall, Rimuka, Kadoma', '0772424593'],
        ['R1003', 'Chegutu', 'To be assigned', null],
        ['R1004', 'Turf', '5533 Mhondoro Ngezi Turf (3 bedrooms)', '+263784003241'],
        ['R1005', 'Ingezi', 'To be assigned', null],
        ['R1006', 'Nembudziya', 'To be assigned', null],

        // Region 11
        ['R1101', 'Kwekwe City', 'To be assigned', null],
        ['R1102', 'Mbizo', 'To be assigned', null],
        ['R1103', 'Gokwe', 'To be assigned', null],

        // Region 12
        ['R1201', 'Chipadze', 'To be assigned', null],
        ['R1202', 'Glendale', 'To be assigned', null],
        ['R1203', 'Mvurwi', 'To be assigned', null],
        ['R1204', 'Mazowe', 'To be assigned', null],

        // Region 13
        ['R1301', 'Mutawatawa', 'To be assigned', null],
        ['R1302', 'Murewa', 'To be assigned', null],
        ['R1303', 'Mutoko', 'To be assigned', null],

        // Region 14
        ['R1401', 'St Ives', 'To be assigned', null],
        ['R1402', 'Karoi', 'To be assigned', null],
        ['R1403', 'Chinhoyi City', 'Chinhoyi Hall Rank Area', '0776888319, 0782817044'],
        ['R1404', 'Kariba', 'To be assigned', null],
        ['R1405', 'Banket', 'To be assigned', null],

        // Region 15 (Diaspora)
        ['R1501', 'UAE', 'To be assigned', null],
        ['R1502', 'USA', 'To be assigned', null],
        ['R1503', 'UK', 'To be assigned', null],

        // Region 16
        ['R1601', 'Zvishavane', 'To be assigned', null],
        ['R1602', 'Masvingo', 'Runyararo West, Light industry, Simon Mazorodze, Masvingo', null],
        ['R1603', 'Beitbridge', 'To be assigned', null],

        // Region 17
        ['R1701', 'Kempton Park', '107 Commissioner Street, Kempton Park', '+27838777418'],
        ['R1702', 'Johannesburg', '180 Prairie Street, Rosettenville, Johannesburg (upstairs)', '+27659852110'],
        ['R1703', 'Pretoria', '555 Francis Baard Street, Arcadia, Pretoria 0002', '0613431021/0631671146'],
        ['R1704', 'Gemistone', 'Revelas Towers Second Floor, 17 Queen Street, Germiston', '+27832387002'],
        ['R1705', 'Cape Town', 'To be assigned', null],
        ['R1706', 'Maputo', 'To be assigned', null],

        // Region 18
        ['R1801', 'Nkulumane', 'To be assigned', null],
        ['R1802', 'Cowdray Park', 'To be assigned', null],

        // Region 19
        ['R1901', 'Tete', 'To be assigned', null],
        ['R1902', 'Malawi', 'To be assigned', null],

        // Region 20
        ['R2001', 'Gwanda', 'To be assigned', null],
        ['R2002', 'Makwe', 'To be assigned', null],
        ['R2003', 'Gwanda City', 'To be assigned', null],

        // Region 21
        ['R2101', 'Mutare Chikanga', 'To be assigned', null],
        ['R2102', 'Dangamvura', 'To be assigned', null],
        ['R2103', 'Rusape', 'To be assigned', null],
        ['R2104', 'Manica', 'To be assigned', null],
        ['R2105', 'Chimoio', 'To be assigned', null],

        // Region 22
        ['R2201', 'Gweru City', 'To be assigned', null],
        ['R2202', 'Mkoba', 'To be assigned', null],
        ['R2203', 'Shurugwi', 'To be assigned', null],
        ['R2204', 'Senga', 'To be assigned', null],

        // Region 23
        ['R2301', 'Hatcliff', 'Heartfelt Church Stand, Murove Village, Domboshava', '0718249572, 0785706706'],
        ['R2302', 'Domboshava', 'Heartfelt Church Stand, Murove Village, Domboshava', '0718249572, 0785706706'],
    ];

    /**
     * Run the database seeding.
     */
    public function run(): void
    {
        foreach ($this->contacts as [$code, $name, $address, $phone]) {
            $updated = DB::table('zones')
                ->where('code', $code)
                ->update([
                    'address' => $address,
                    'phone' => $phone,
                    'updated_at' => now(),
                ]);

            if ($updated === 0) {
                $this->command->warn("Zone with code {$code} not found in database. Skipping.");
            }
        }

        $this->command->info('Zone contact information populated successfully.');
    }
}
