<?php

namespace Database\Seeders;

use App\Models\Pastor;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class ChurchStructureSeeder extends Seeder
{
    // ─────────────────────────────────────────────────────────────────────────
    // Regional Leader Pastor Codes (one per region - first zone pastor)
    // ─────────────────────────────────────────────────────────────────────────
    private array $regionalLeaderCodes = [
        'R0101P01', // Region 01 - Harare North
        'R0201P01', // Region 02 - Marondera
        'R0301P01', // Region 03 - Ruwa
        'R0401P01', // Region 04 - Chitungwiza
        'R0501P01', // Region 05 - Epworth
        'R0601P01', // Region 06 - West Harare
        'R0701P01', // Region 07 - South Harare
        'R0801P01', // Region 08 - South West Harare
        // No Region 09
        'R1001P01', // Region 10 - Midlands West
        'R1101P01', // Region 11 - Kwekwe
        'R1201P01', // Region 12 - Mazowe
        'R1301P01', // Region 13 - Mutoko
        'R1401P01', // Region 14 - Mashonaland West
        'R1501P01', // Region 15 - International
        'R1601P01', // Region 16 - Masvingo
        'R1701P01', // Region 17 - South Africa & Mozambique
        'R1801P01', // Region 18 - Bulawayo North
        'R1901P01', // Region 19 - Mozambique/Malawi
        'R2001P01', // Region 20 - Gwanda
        'R2101P01', // Region 21 - Manicaland
        'R2201P01', // Region 22 - Gweru
        'R2301P01', // Region 23 - Hatcliff
    ];

    private array $generalOverseerCodes = [
        'R0101P01', // Pastor C Vutabwashe - General Overseer of all regional leaders
    ];

    // ─────────────────────────────────────────────────────────────────────────
    // Countries  [name, country_code]
    // ─────────────────────────────────────────────────────────────────────────
    private array $countries = [
        ['name' => 'Zimbabwe',             'country_code' => 'ZW'],
        ['name' => 'South Africa',         'country_code' => 'ZA'],
        ['name' => 'Mozambique',           'country_code' => 'MZ'],
        ['name' => 'Diaspora',             'country_code' => 'DIASPORA'],
        ['name' => 'United Arab Emirates', 'country_code' => 'AE'],
        ['name' => 'United States',        'country_code' => 'US'],
        ['name' => 'United Kingdom',       'country_code' => 'GB'],
    ];

    // ─────────────────────────────────────────────────────────────────────────
    // Regions  [code, name, country_code]
    // Matches exact spec: REGION 01 - HARARE NORTH, etc.
    // ─────────────────────────────────────────────────────────────────────────
    private array $regions = [
        ['01', 'Harare North',              'ZW'],
        ['02', 'Marondera',                 'ZW'],
        ['03', 'Ruwa',                      'ZW'],
        ['04', 'Chitungwiza',               'ZW'],
        ['05', 'Epworth',                   'ZW'],
        ['06', 'West Harare',               'ZW'],
        ['07', 'South Harare',              'ZW'],
        ['08', 'South West Harare',         'ZW'],
        // Region 09 intentionally absent (spec has no Region 09)
        ['10', 'Midlands West',             'ZW'],
        ['11', 'Kwekwe',                    'ZW'],
        ['12', 'Mazowe',                    'ZW'],
        ['13', 'Mutoko',                    'ZW'],
        ['14', 'Mashonaland West',          'ZW'],
        ['15', 'International',             'DIASPORA'],
        ['16', 'Masvingo',                  'ZW'],
        ['17', 'South Africa & Mozambique', 'ZA'],
        ['18', 'Bulawayo North',            'ZW'],
        ['19', 'Mozambique/Malawi',         'MZ'],
        ['20', 'Gwanda',                    'ZW'],
        ['21', 'Manicaland',                'ZW'],
        ['22', 'Gweru',                     'ZW'],
        ['23', 'Hatcliff',                  'ZW'],
    ];

    // ─────────────────────────────────────────────────────────────────────────
    // Zones  [name, zone_code, region_code]
    // zone_code format: R[Region][Zone] e.g. R0101
    // ─────────────────────────────────────────────────────────────────────────
    private array $zones = [
        // Region 01 - Harare North
        // Regional Leader: Pastor C Vutabwashe
        ['IOC',             'R0101', '01'],
        ['Dzivarasekwa',    'R0102', '01'],
        ['AFDIS',           'R0103', '01'],

        // Region 02 - Marondera
        ['Marondera',            'R0201', '02'],
        ['Nyameni',              'R0202', '02'],
        ['Wedza',                'R0203', '02'],

        // Region 03 - Ruwa
        ['Ruwa',                 'R0301', '03'],
        ['Damofalls',            'R0302', '03'],
        ['Eastview',             'R0303', '03'],

        // Region 04 - Chitungwiza
        ['Zengeza',              'R0401', '04'],
        ['Seke',                 'R0402', '04'],
        ['St Marys',             'R0403', '04'],
        ['Dema',                 'R0404', '04'],

        // Region 05 - Epworth
        ['Epworth',              'R0501', '05'],
        ['Greendale',            'R0502', '05'],
        ['Mabvuku',              'R0503', '05'],
        ['Chabwino',             'R0504', '05'],
        ['Chikurubi',            'R0505', '05'],

        // Region 06 - West Harare
        ['Mufakose',             'R0601', '06'],
        ['Norton',               'R0602', '06'],
        ['Kuwadzana',            'R0603', '06'],
        ['Granary',              'R0604', '06'],
        ['Kambuzuma',            'R0605', '06'],

        // Region 07 - South Harare
        ['Southlea Park',        'R0701', '07'],
        ['Retreat',              'R0702', '07'],
        ['Hopely',               'R0703', '07'],
        ['Stoneridge',           'R0704', '07'],
        ['Fidelity',             'R0705', '07'],

        // Region 08 - South West Harare
        ['Glen View',            'R0801', '08'],
        ['Glen Norah',           'R0802', '08'],
        ['Budiriro',             'R0803', '08'],
        ['Highfields',           'R0804', '08'],

        // Region 10 - Midlands West
        ['Waverly',              'R1001', '10'],
        ['Rimuka',               'R1002', '10'],
        ['Chegutu',              'R1003', '10'],
        ['Turf',                 'R1004', '10'],
        ['Ingezi',               'R1005', '10'],
        ['Nembudziya',           'R1006', '10'],

        // Region 11 - Kwekwe
        ['Kwekwe City',          'R1101', '11'],
        ['Mbizo',                'R1102', '11'],
        ['Gokwe',                'R1103', '11'],

        // Region 12 - Mazowe
        ['Chipadze',             'R1201', '12'],
        ['Glendale',             'R1202', '12'],
        ['Mvurwi',               'R1203', '12'],
        ['Mazowe',               'R1204', '12'],

        // Region 13 - Mutoko
        ['Mutawatawa',           'R1301', '13'],
        ['Murewa',               'R1302', '13'],
        ['Mutoko',               'R1303', '13'],

        // Region 14 - Mashonaland West
        ['St Ives',              'R1401', '14'],
        ['Karoi',                'R1402', '14'],
        ['Chinhoyi City',        'R1403', '14'],
        ['Kariba',               'R1404', '14'],
        ['Banket',               'R1405', '14'],

        // Region 15 - International
        ['UAE',                  'R1501', '15'],
        ['USA',                  'R1502', '15'],
        ['UK',                   'R1503', '15'],

        // Region 16 - Masvingo
        ['Zvishavane',           'R1601', '16'],
        ['Masvingo',             'R1602', '16'],
        ['Beitbridge',           'R1603', '16'],

        // Region 17 - South Africa & Mozambique
        ['Kempton Park',         'R1701', '17'],
        ['Johannesburg',         'R1702', '17'],
        ['Pretoria',             'R1703', '17'],
        ['Germiston',            'R1704', '17'],
        ['Cape Town',            'R1705', '17'],
        ['Maputo',               'R1706', '17'],

        // Region 18 - Bulawayo North
        ['Nkulumane',            'R1801', '18'],
        ['Cowdray Park',         'R1802', '18'],

        // Region 19 - Mozambique/Malawi
        ['Tete',                 'R1901', '19'],
        ['Malawi',               'R1902', '19'],

        // Region 20 - Gwanda
        ['Gwanda',               'R2001', '20'],
        ['Makwe',                'R2002', '20'],
        ['Gwanda City',          'R2003', '20'],

        // Region 21 - Manicaland
        ['Mutare',               'R2101', '21'],
        ['Chikanga',             'R2102', '21'],
        ['Dangamvura',           'R2103', '21'],
        ['Rusape',               'R2104', '21'],
        ['Manica/Chimoio',       'R2105', '21'],

        // Region 22 - Gweru
        ['Gweru City',           'R2201', '22'],
        ['Mkoba',                'R2202', '22'],
        ['Shurugwi',             'R2203', '22'],
        ['Senga',                'R2204', '22'],

        // Region 23 - Hatcliff
        ['Hatcliff',             'R2301', '23'],
        ['Domboshava',           'R2302', '23'],
    ];

    // ─────────────────────────────────────────────────────────────────────────
    // Pastors  [pastor_code, full_name, zone_override|null]
    //
    // Each entry maps directly to the spec above:
    //   R0101P01 = Pastor 01 in Zone R0101 (IOC Dzivarasekwa)
    //   R0101P02 = Pastor 02 in Zone R0101 TBA
    //
    // zone_override: used only for Region 23 pastors whose codes in the
    // old system were R0901/R0902 (Region 09, now defunct).
    // ─────────────────────────────────────────────────────────────────────────
    private array $pastors = [
        // ── Region 01 - Harare North ──────────────────────────────────────────
        ['R0101P01', 'C Vutabwashe',  null],     // Regional Leader, Zone R0101
        ['R0101P02', 'TBA', null],
        ['R0102P01', 'Pastor Evans',   null],     // Regional Leader Dzivarasekwa
        ['R0103P01', 'Pastor Chonzi Jnr', null],  // Regional Leader AFDIS

        // ── Region 02 - Marondera ─────────────────────────────────────────────
        ['R0201P01', 'Pastor Chari',  null],      // Regional Leader
        ['R0201P02', 'Pastor Chari L', null],
        ['R0202P01', 'Pastor Tonderai', null],

        // ── Region 03 - Ruwa ──────────────────────────────────────────────────
        ['R0301P01', 'Pastor Kunaka', null],       // Regional Leader
        ['R0301P02', 'Pastor Kunaka L', null],
        ['R0302P01', 'Pastor Dzikiti', null],
        ['R0303P01', 'Pastor Lorraine', null],

        // ── Region 04 - Chitungwiza ───────────────────────────────────────────
        ['R0401P01', 'Pastor Chonzi B', null],     // Regional Leader
        ['R0401P02', 'Pastor Chonzi L', null],
        ['R0402P01', 'Pastor Munemo', null],
        ['R0403P01', 'Pastor Nzira', null],
        ['R0404P01', 'Pastor Nyamayaro', null],

        // ── Region 05 - Epworth ────────────────────────────────────────────────
        ['R0501P01', 'Pastor Muridzi', null],      // Regional Leader
        ['R0501P02', 'Pastor Muridzi L', null],
        ['R0502P01', 'Pastor Mutume', null],
        ['R0503P01', 'Pastor Mubobo', null],
        ['R0504P01', 'Pastor Shemiah', null],
        ['R0505P01', 'Pastor Mbewe', null],

        // ── Region 06 - West Harare ────────────────────────────────────────────
        ['R0601P01', 'Pastor Greater', null],      // Regional Leader
        ['R0601P02', 'Pastor Greater L', null],
        ['R0602P01', 'Pastor Bright', null],
        ['R0603P01', 'Pastor Nelson', null],
        ['R0604P01', 'Pastor Matimbira', null],
        ['R0605P01', 'Pastor Kaseke', null],

        // ── Region 07 - South Harare ──────────────────────────────────────────
        ['R0701P01', 'Pastor Nemangwe', null],     // Regional Leader
        ['R0701P02', 'Pastor Nemangwe L', null],
        ['R0702P01', 'Pastor Bakasa', null],
        ['R0703P01', 'Pastor Mutara', null],
        ['R0704P01', 'Pastor Zizhou', null],
        ['R0705P01', 'Pastor Kasvosve', null],

        // ── Region 08 - South West Harare ─────────────────────────────────────
        ['R0801P01', 'Pastor Maminimini', null],   // Regional Leader
        ['R0801P02', 'Pastor Maminimini L', null],
        ['R0802P01', 'Pastor Tinarwo', null],
        ['R0803P01', 'Pastor Mahuno', null],
        ['R0804P01', 'Pastor Mlamilo', null],

        // ── Region 10 - Midlands West ─────────────────────────────────────────
        ['R1001P01', 'Pastor Maunganidze', null],  // Regional Leader
        ['R1001P02', 'Pastor Maunganidze L', null],
        ['R1002P01', 'Pastor Nemaunga', null],
        ['R1003P01', 'Pastor Oscar', null],
        ['R1004P01', 'Pastor Mtshalanji', null],
        ['R1005P01', 'Pastor Molai', null],
        ['R1006P01', 'Pastor Kavhu', null],

        // ── Region 11 - Kwekwe ────────────────────────────────────────────────
        ['R1101P01', 'Pastor S Utahwashe', null],  // Regional Leader
        ['R1102P01', 'Pastor Mrambiwa', null],
        ['R1103P01', 'Pastor Mashavira', null],

        // ── Region 12 - Mazowe ────────────────────────────────────────────────
        ['R1201P01', 'Pastor Kuhlengisa', null],   // Regional Leader
        ['R1202P01', 'Pastor Mhangami', null],
        ['R1203P01', 'Pastor Chinake', null],

        // ── Region 13 - Mutoko ────────────────────────────────────────────────
        ['R1301P01', 'Pastor Mhavasha', null],     // Regional Leader
        ['R1302P01', 'Pastor Mundingi', null],
        ['R1303P01', 'Pastor Cledgyman', null],

        // ── Region 14 - Mashonaland West ──────────────────────────────────────
        ['R1401P01', 'Pastor Kahoba', null],       // Regional Leader
        ['R1401P02', 'Pastor Kahoba L', null],
        ['R1402P01', 'Pastor Mtshalanji', null],
        ['R1403P01', 'Pastor Moyo', null],
        ['R1404P01', 'Pastor Mtshalanji B', null],
        ['R1405P01', 'Pastor Ndebele', null],

        // ── Region 15 - International ─────────────────────────────────────────
        ['R1501P01', 'Pastor Mudzinge', null],     // Regional Leader (UAE)
        ['R1502P01', 'Pastor Tundu', null],        // Regional Leader (USA)
        // R1503 - UK - TBA (no pastor assigned in spec, skip)

        // ── Region 16 - Masvingo ──────────────────────────────────────────────
        ['R1601P01', 'Pastor Matema', null],       // Regional Leader
        ['R1602P01', 'Pastor Nguruve', null],
        ['R1603P01', 'Pastor Dhlamini', null],

        // ── Region 17 - South Africa & Mozambique ─────────────────────────────
        ['R1701P01', 'Pastor Tsiko', null],        // Regional Leader
        ['R1702P01', 'Pastor Gandiwa', null],
        ['R1703P01', 'Pastor Gumbo', null],
        ['R1705P01', 'Pastor Goba', null],
        ['R1706P01', 'Pastor Jimu', null],

        // ── Region 18 - Bulawayo North ────────────────────────────────────────
        ['R1801P01', 'Pastor Mbofana', null],      // Regional Leader
        // R1802 - Cowdray Park - TBA (no pastor, skip)

        // ── Region 19 - Mozambique/Malawi ─────────────────────────────────────
        ['R1901P01', 'Pastor Mutebuka', null],     // Regional Leader
        ['R1902P01', 'Pastor Chima', null],

        // ── Region 20 - Gwanda ────────────────────────────────────────────────
        ['R2001P01', 'Pastor Beauty', null],       // Regional Leader
        // R2002 - Makwe - TBA (skip)
        // R2003 - Gwanda City - TBA (skip)

        // ── Region 21 - Manicaland ────────────────────────────────────────────
        ['R2101P01', 'Pastor Musabayana', null],   // Regional Leader
        ['R2102P01', 'Pastor Muneri', null],
        ['R2103P01', 'Pastor Kabichi', null],
        ['R2104P01', 'Pastor Mabaye', null],
        ['R2105P01', 'Pastor Cofe', null],

        // ── Region 22 - Gweru ─────────────────────────────────────────────────
        ['R2201P01', 'Pastor Zikhali', null],      // Regional Leader
        ['R2202P01', 'Pastor Sibanda', null],
        ['R2203P01', 'Pastor Ruwende', null],
        ['R2204P01', 'Pastor Musevenzo', null],

        // ── Region 23 - Hatcliff ──────────────────────────────────────────────
        // NOTE: R0901P01 and R0902P01 in old system → mapped to R2301/R2302
        // Now updated to use the new Region 23 code format
        ['R2301P01', 'Pastor Katso',   null],      // Regional Leader, Zone R2301
        ['R2301P02', 'Pastor Katso L', null],
        ['R2302P01', 'Pastor Chitowo', null],      // Zone R2302
        ['R2302P02', 'Pastor Chitowo L', null],
    ];

    // ─────────────────────────────────────────────────────────────────────────
    // Entry point
    // ─────────────────────────────────────────────────────────────────────────
    public function run(): void
    {
        $countryIds = $this->seedCountries();
        $regionIds  = $this->seedRegions($countryIds);
        $zoneIds    = $this->seedZones($regionIds);
        $this->seedPastors($zoneIds, $regionIds);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Step 1 — Countries
    // Returns: ['ZW' => 1, 'ZA' => 2, ...]
    // ─────────────────────────────────────────────────────────────────────────
    private function seedCountries(): array
    {
        $ids = [];

        foreach ($this->countries as $country) {
            $existing = DB::table('countries')
                ->where('country_code', $country['country_code'])
                ->first();

            if ($existing) {
                $ids[$country['country_code']] = $existing->id;
            } else {
                $ids[$country['country_code']] = DB::table('countries')->insertGetId([
                    'name'        => $country['name'],
                    'country_code'=> $country['country_code'],
                    'created_at'  => now(),
                    'updated_at'  => now(),
                ]);
            }
        }

        return $ids;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Step 2 — Regions
    // Returns: ['01' => 1, '02' => 2, ...]
    // Region code, name, country_code
    // ─────────────────────────────────────────────────────────────────────────
    private function seedRegions(array $countryIds): array
    {
        $ids = [];

        foreach ($this->regions as [$code, $name, $countryCode]) {
            $existing = DB::table('regions')
                ->where('code', $code)
                ->orWhere('code', 'like', '%' . $code)
                ->first();

            if ($existing) {
                // Use the code as the key if it matches, otherwise fallback
                $ids[$code] = $existing->id;
            } else {
                // Try to insert with code if column exists, otherwise fallback
                try {
                    $ids[$code] = DB::table('regions')->insertGetId([
                        'name'       => $name,
                        'code'       => $code,
                        'country_id' => $countryIds[$countryCode],
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                } catch (\Exception $e) {
                    // If code column doesn't exist yet, insert without it
                    $ids[$code] = DB::table('regions')->insertGetId([
                        'name'       => $name,
                        'country_id' => $countryIds[$countryCode],
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        }

        return $ids;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Step 3 — Zones
    // Returns: ['R0101' => 1, 'R0102' => 2, ...]
    // Name, zone_code, region_code
    // ─────────────────────────────────────────────────────────────────────────
    private function seedZones(array $regionIds): array
    {
        $ids = [];

        foreach ($this->zones as [$name, $code, $regionKey]) {
            $existing = DB::table('zones')->where('code', $code)->first();

            if ($existing) {
                $ids[$code] = $existing->id;
            } else {
                $ids[$code] = DB::table('zones')->insertGetId([
                    'name'       => $name,
                    'code'       => $code,
                    'region_id'  => $regionIds[$regionKey] ?? null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        return $ids;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Step 4 — Users + Pastors
    // Pastor code: R[Region][Zone]P[##]
    // Member code: R[Region][Zone]M-[####]
    // HOD code:    R[Region][Zone]HOD[###]
    // ─────────────────────────────────────────────────────────────────────────
    private function seedPastors(array $zoneIds, array $regionIds): void
    {
        foreach ($this->pastors as [$code, $fullName, $zoneOverride]) {
            $parts     = explode(' ', $fullName, 2);
            $surname   = $parts[0];
            $firstName = $parts[1] ?? '';

            // Derive zone code from pastor code: first 5 chars = zone code
            // e.g. R0101P01 → zone = R0101
            $derivedZoneCode = strtoupper(substr($code, 0, 5));

            // Use override if provided (for R0901/R0902 → R2301/R2302 migration)
            $zoneCode = $zoneOverride ?? $derivedZoneCode;

            // Derive region key: chars 1-2 of zone code (e.g. R0101 → '01')
            if (preg_match('/^R(\d{2})/', $zoneCode, $matches)) {
                $regionKey = $matches[1];
            } else {
                $regionKey = substr($zoneCode, 1, 2);
            }

            $zoneId     = $zoneIds[$zoneCode] ?? null;
            $regionId   = $regionIds[$regionKey] ?? null;
            $isRegionalLeader = in_array($code, $this->regionalLeaderCodes, true);
            $isGeneralOverseer = in_array($code, $this->generalOverseerCodes, true);

            $email = strtolower($code).'@heartfelt.church';

            $user = User::updateOrCreate(
                ['email' => $email],
                [
                    'name'              => $fullName,
                    'password'          => Hash::make('password'),
                    'role'              => 'pastor',
                    'unique_code'       => $code,
                    'is_active'         => true,
                    'terms_accepted'    => true,
                    'completed_tour'    => true,
                    'zone_id'           => $zoneId,
                ]
            );

            Pastor::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'name'              => $firstName,
                    'surname'           => $surname,
                    'code'              => $code,
                    'title'             => 'Pastor',
                    'zone_id'           => $zoneId,
                    'region_id'         => $regionId,
                    'is_zone_pastor'    => true,
                    'is_regional_leader'=> $isRegionalLeader,
                    'is_general_overseer' => $isGeneralOverseer,
                ]
            );
        }
    }
}
