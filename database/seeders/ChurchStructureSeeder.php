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
    // Regional-leader pastor codes (sourced from zonal PDF)
    // ─────────────────────────────────────────────────────────────────────────
    private array $regionalLeaderCodes = [
        'R0101P01', // Region 01
        'R0201P01', // Region 02
        'R0301P01', // Region 03
        'R0401P01', // Region 04
        'R0501P01', // Region 05
        'R0601P01', // Region 06
        'R0701P01', // Region 07
        'R0801P01', // Region 08
        'R1001P01', // Region 10 (first listed; regional-leader column absent from PDF)
        'R1101P01', // Region 11
        'R1201P01', // Region 12
        'R1301P01', // Region 13
        'R1401P01', // Region 14
        'R1501P01', // Region 15
        'R1601P01', // Region 16
        'R1701P01', // Region 17
        'R1801P01', // Region 18
        'R1901P01', // Region 19
        'R2001P01', // Region 20
        'R2101P01', // Region 21
        'R2201P01', // Region 22
        'R2301P01', // Region 23
    ];

    // ─────────────────────────────────────────────────────────────────────────
    // Countries  [name, country_code]
    // ─────────────────────────────────────────────────────────────────────────
    private array $countries = [
        ['name' => 'Zimbabwe',             'country_code' => 'ZW'],
        ['name' => 'South Africa',         'country_code' => 'ZA'],
        ['name' => 'Mozambique',           'country_code' => 'MZ'],
        ['name' => 'Diaspora',             'country_code' => 'Diaspora'],
        ['name' => 'United Arab Emirates', 'country_code' => 'AE'],
        ['name' => 'United States',        'country_code' => 'US'],
        ['name' => 'United Kingdom',       'country_code' => 'GB'],
    ];

    // ─────────────────────────────────────────────────────────────────────────
    // Regions  [region_key, name, country_code]
    //
    // Region 09 is absent from the zonal PDF — Katso / Chitowo (formerly R09xx)
    // appear in Region 23 with zone codes R2301/R2302. Handled via zone override
    // in the pastors array below.
    //
    // Region 15 spans UAE / USA / UK but the regions table holds a single
    // country_id. It is assigned ZW (sending-church country); zone-level
    // geography is captured in the zone names (UAE, USA, UK).
    // ─────────────────────────────────────────────────────────────────────────
    private array $regions = [
        ['01', 'Region 01', 'ZW'],
        ['02', 'Region 02', 'ZW'],
        ['03', 'Region 03', 'ZW'],
        ['04', 'Region 04', 'ZW'],
        ['05', 'Region 05', 'ZW'],
        ['06', 'Region 06', 'ZW'],
        ['07', 'Region 07', 'ZW'],
        ['08', 'Region 08', 'ZW'],
        ['10', 'Region 10', 'ZW'],
        ['11', 'Region 11', 'ZW'],
        ['12', 'Region 12', 'ZW'],
        ['13', 'Region 13', 'ZW'],
        ['14', 'Region 14', 'ZW'],
        ['15', 'Region 15', 'Diaspora'],
        ['16', 'Region 16', 'ZW'],
        ['17', 'Region 17', 'ZA'],
        ['18', 'Region 18', 'ZW'],
        ['19', 'Region 19', 'MZ'],
        ['20', 'Region 20', 'ZW'],
        ['21', 'Region 21', 'ZW'],
        ['22', 'Region 22', 'ZW'],
        ['23', 'Region 23', 'ZW'],
    ];

    // ─────────────────────────────────────────────────────────────────────────
    // Zones  [name, zone_code, region_key]
    // ─────────────────────────────────────────────────────────────────────────
    private array $zones = [
        // Region 01
        ['IOC Dzivarasekwa', 'R0101', '01'],
        ['AFDIS',            'R0102', '01'],
        ['Zone R0103',       'R0103', '01'], // name not listed in source PDF

        // Region 02
        ['Mandra (Rsk)', 'R0201', '02'],
        ['Nyameni',      'R0202', '02'],
        ['Wedza',        'R0203', '02'],

        // Region 03
        ['Ruwa',      'R0301', '03'],
        ['Damofalls', 'R0302', '03'],
        ['Eastview',  'R0303', '03'],

        // Region 04
        ['Zengeza',  'R0401', '04'],
        ['Seke',     'R0402', '04'],
        ['St Marys', 'R0403', '04'],
        ['Dema',     'R0404', '04'],

        // Region 05
        ['Epworth',   'R0501', '05'],
        ['Greendale', 'R0502', '05'],
        ['Mabvuku',   'R0503', '05'],
        ['Chabwino',  'R0504', '05'],
        ['Chikurubi', 'R0505', '05'],

        // Region 06
        ['Mufakose',  'R0601', '06'],
        ['Norton',    'R0602', '06'],
        ['Kuwadzana', 'R0603', '06'],
        ['Granary',   'R0604', '06'],
        ['Kambuzuma', 'R0605', '06'],

        // Region 07
        ['Southlea Park', 'R0701', '07'],
        ['Retreat',       'R0702', '07'],
        ['Hopely',        'R0703', '07'],
        ['Stoneridge',    'R0704', '07'],
        ['Fidelity',      'R0705', '07'],

        // Region 08
        ['Glen View',  'R0801', '08'],
        ['Glen Norah', 'R0802', '08'],
        ['Budiriro',   'R0803', '08'],
        ['Highfields', 'R0804', '08'],

        // Region 10
        ['Waverly',    'R1001', '10'],
        ['Rimuka',     'R1002', '10'],
        ['Chegutu',    'R1003', '10'],
        ['Turf',       'R1004', '10'],
        ['Ingezi',     'R1005', '10'],
        ['Nembudziya', 'R1006', '10'],

        // Region 11
        ['Kwekwe City', 'R1101', '11'],
        ['Mbizo',       'R1102', '11'],
        ['Gokwe',       'R1103', '11'],

        // Region 12
        ['Chipadze', 'R1201', '12'],
        ['Glendale', 'R1202', '12'],
        ['Mvurwi',   'R1203', '12'],
        ['Mazowe',   'R1204', '12'],

        // Region 13
        ['Mutawatawa', 'R1301', '13'],
        ['Murewa',     'R1302', '13'],
        ['Mutoko',     'R1303', '13'],

        // Region 14
        ['St Ives',       'R1401', '14'],
        ['Karoi',         'R1402', '14'],
        ['Chinhoyi City', 'R1403', '14'],
        ['Kariba',        'R1404', '14'],
        ['Banket',        'R1405', '14'],

        // Region 15
        ['UAE', 'R1501', '15'],
        ['USA', 'R1502', '15'],
        ['UK',  'R1503', '15'],

        // Region 16
        ['Zvishavane', 'R1601', '16'],
        ['Masvingo',   'R1602', '16'],
        ['Beitbridge', 'R1603', '16'],

        // Region 17
        ['Kempton Park', 'R1701', '17'],
        ['Johannesburg', 'R1702', '17'],
        ['Pretoria',     'R1703', '17'],
        ['Gemistone',    'R1704', '17'],
        ['Cape Town',    'R1705', '17'],
        ['Maputo',       'R1706', '17'],

        // Region 18
        ['Nkulumane',    'R1801', '18'],
        ['Cowdray Park', 'R1802', '18'],

        // Region 19
        ['Tete',   'R1901', '19'],
        ['Malawi', 'R1902', '19'],

        // Region 20
        ['Gwanda',      'R2001', '20'],
        ['Makwe',       'R2002', '20'],
        ['Gwanda City', 'R2003', '20'],

        // Region 21
        ['Mutare Chikanga', 'R2101', '21'],
        ['Dangamvura',      'R2102', '21'],
        ['Rusape',          'R2103', '21'],
        ['Manica',          'R2104', '21'],
        ['Chimoio',         'R2105', '21'],

        // Region 22
        ['Gweru City', 'R2201', '22'],
        ['Mkoba',      'R2202', '22'],
        ['Shurugwi',   'R2203', '22'],
        ['Senga',      'R2204', '22'],

        // Region 23
        ['Hatcliff',   'R2301', '23'],
        ['Domboshava', 'R2302', '23'],
    ];

    // ─────────────────────────────────────────────────────────────────────────
    // Pastors  [unique_code, fullName, zoneCodeOverride|null]
    //
    // zoneCodeOverride: supply an explicit zone code when the standard
    // derivation (first 5 chars of pastor code) does not match any zone.
    // Example: R0901P01 → zone R0901 doesn't exist; the zonal PDF places
    // Katso in zone R2301 (Hatcliff, Region 23).
    //
    // Known PDF anomalies:
    //  - R0705P01 appears twice in pastors PDF; second corrected to R0705P02.
    //  - P1401P02 starts with 'P' instead of 'R'; kept as-is (source typo).
    //  - R1902P01 appears twice in pastors PDF; second corrected to R1902P02.
    //  - R0901/R0902 codes map to Region 23 zones per the zonal PDF.
    // ─────────────────────────────────────────────────────────────────────────
    private array $pastors = [
        // ── Region 01 ─────────────────────────────────────────────────────────
        ['R0101P01', 'Cee',          null],
        ['R0102P01', 'Mtombeni E',   null],
        ['R0102P02', 'Mtombeni M',   null],
        ['R0103P01', 'Chonzi M',     null],
        ['R0103P02', 'Chonzi L',     null],

        // ── Region 02 ─────────────────────────────────────────────────────────
        ['R0201P01', 'Chari',        null],
        ['R0201P02', 'Chari T',      null],
        ['R0202P01', 'Tonderai',     null],

        // ── Region 03 ─────────────────────────────────────────────────────────
        ['R0301P01', 'Kunaka',       null],
        ['R0301P02', 'Kunaka P',     null],
        ['R0302P01', 'Dzikiti',      null],
        ['R0302P02', 'Dzikiti L',    null],
        ['R0303P01', 'Lorraine',     null],

        // ── Region 04 ─────────────────────────────────────────────────────────
        ['R0401P01', 'Chonzi B',     null],
        ['R0401P02', 'Chonzi L',     null],
        ['R0402P01', 'Munemo',       null],
        ['R0402P02', 'Munemo L',     null],
        ['R0403P01', 'Nzira',        null],
        ['R0403P02', 'Nzira L',      null],
        ['R0404P01', 'Nyamayaro',    null],
        ['R0404P02', 'Nyamayaro L',  null],

        // ── Region 05 ─────────────────────────────────────────────────────────
        ['R0501P01', 'Muridzi',      null],
        ['R0501P02', 'Muridzi L',    null],
        ['R0502P01', 'Mutume',       null],
        ['R0502P02', 'Mutume L',     null],
        ['R0503P01', 'Mubobo',       null],
        ['R0504P01', 'Shemiah',      null],
        ['R0505P01', 'Mbewe',        null],
        ['R0505P02', 'Mbewe L',      null],

        // ── Region 06 ─────────────────────────────────────────────────────────
        ['R0601P01', 'Shumba G',     null],
        ['R0601P02', 'Shumba C',     null],
        ['R0602P01', 'Bright',       null],
        ['R0603P01', 'Nelson',       null],
        ['R0603P02', 'Lesley',       null],
        ['R0604P01', 'Matimbira',    null],
        ['R0604P02', 'Matimbira L',  null],
        ['R0605P01', 'Kaseke',       null],
        ['R0605P02', 'Kaseke L',     null],

        // ── Region 07 ─────────────────────────────────────────────────────────
        ['R0701P01', 'Nemangwe',     null],
        ['R0701P02', 'Nemangwe F',   null],
        ['R0702P01', 'Bakasa',       null],
        ['R0702P02', 'Bakasa G',     null],
        ['R0703P01', 'Mutara',       null],
        ['R0703P02', 'Mutara T',     null],
        ['R0704P01', 'Zizhou',       null],
        ['R0704P02', 'Zizhou L',     null],
        ['R0705P01', 'Kasvosve',     null],
        ['R0705P02', 'Kasvosve L',   null], // PDF had R0705P01 again — corrected

        // ── Region 08 ─────────────────────────────────────────────────────────
        ['R0801P01', 'Maminimini',   null],
        ['R0801P02', 'Maminimini M', null],
        ['R0802P01', 'Tinarwo',      null],
        ['R0802P02', 'Tinarwo C',    null],
        ['R0803P01', 'Mahuno',       null],
        ['R0803P02', 'Mahuno L',     null],
        ['R0804P01', 'Mlamilo',      null],
        ['R0804P02', 'Mlamilo L',    null],

        // ── Region 23 (formerly R09 in pastors PDF — zonal PDF places these here)
        ['R0901P01', 'Katso',        'R2301'], // Hatcliff, Region 23
        ['R0901P02', 'Katso L',      'R2301'],
        ['R0902P01', 'Chitowo',      'R2302'], // Domboshava, Region 23
        ['R0902P02', 'Chitowo L',    'R2302'],

        // ── Region 10 ─────────────────────────────────────────────────────────
        ['R1001P01', 'Maunganidze',   null],
        ['R1001P02', 'Maunganidze L', null],
        ['R1002P01', 'Nemaunga',      null],
        ['R1002P02', 'Nemaunga L',    null],
        ['R1003P01', 'Oscar',         null],
        ['R1004P01', 'Mtshalanji',    null],
        ['R1004P02', 'Mtshalanji L',  null],
        ['R1005P01', 'Molai',         null],
        ['R1005P02', 'Molai M',       null],
        ['R1006P01', 'Kavhu',         null],
        ['R1006P02', 'Kavhu L',       null],

        // ── Region 11 ─────────────────────────────────────────────────────────
        ['R1101P01', 'Utahwashe S',  null],
        ['R1102P01', 'Mrambiwa',     null],
        ['R1102P02', 'Murambiwa L',  null],
        ['R1103P01', 'Mashavira',    null],

        // ── Region 12 ─────────────────────────────────────────────────────────
        ['R1201P01', 'Kuhlengisa',   null],
        ['R1201P02', 'Kuhlengisa L', null],
        ['R1202P01', 'Mhangami',     null],
        ['R1202P02', 'Mhangami L',   null],
        ['R1203P01', 'Chinake',      null],
        ['R1203P02', 'Chinake L',    null],

        // ── Region 13 ─────────────────────────────────────────────────────────
        ['R1301P01', 'Mhavasha',     null],
        ['R1301P02', 'Mhavasha L',   null],
        ['R1302P01', 'Mundingi',     null],
        ['R1302P02', 'Mundingi L',   null],
        ['R1303P01', 'Cledgyman',    null],

        // ── Region 14 ─────────────────────────────────────────────────────────
        ['R1401P01', 'Kahoba',       null],
        ['R1401P02', 'Kahoba L',     null], // 'P' prefix typo in source — zone derived from R1401
        ['R1402P01', 'Mtshalanji',   null],
        ['R1402P02', 'Mtshalanji L', null],
        ['R1403P01', 'Moyo',         null],
        ['R1403P02', 'Moyo L',       null],
        ['R1404P01', 'Mtshalanji B', null],
        ['R1405P01', 'Ndebele',      null],

        // ── Region 15 ─────────────────────────────────────────────────────────
        ['R1501P01', 'Mudzinge',     null],
        ['R1501P02', 'Mudzinge L',   null],
        ['R1502P01', 'Tundu',        null],
        ['R1502P02', 'Tundu S',      null],

        // ── Region 16 ─────────────────────────────────────────────────────────
        ['R1601P01', 'Matema',       null],
        ['R1601P02', 'Matema L',     null],
        ['R1602P01', 'Nguruve',      null],
        ['R1602P02', 'Nguruve L',    null],
        ['R1603P01', 'Dhlamini',     null],
        ['R1603P02', 'Dhlamini L',   null],

        // ── Region 17 ─────────────────────────────────────────────────────────
        ['R1701P01', 'Tsiko',        null],
        ['R1701P02', 'Tsiko C',      null],
        ['R1702P01', 'Gandiwa',      null],
        ['R1702P02', 'Gandiwa L',    null],
        ['R1703P01', 'Gumbo',        null],
        ['R1703P02', 'Gumbo L',      null],
        ['R1704P01', 'Gemistone',    null],
        ['R1705P01', 'Goba',         null],
        ['R1705P02', 'Goba L',       null],
        ['R1706P01', 'Jimu',         null],
        ['R1706P02', 'Jimu L',       null],

        // ── Region 18 ─────────────────────────────────────────────────────────
        ['R1801P01', 'Mbofana',      null],
        ['R1801P02', 'Mbofana L',    null],

        // ── Region 19 ─────────────────────────────────────────────────────────
        ['R1901P01', 'Mutebuka',     null],
        ['R1902P01', 'Chima',        null],
        ['R1902P02', 'Chima L',      null], // PDF had R1902P01 again — corrected

        // ── Region 20 ─────────────────────────────────────────────────────────
        ['R2001P01', 'Mutasa Beauty', null],
        ['R2001P02', 'Mutasa M',      null],

        // ── Region 21 ─────────────────────────────────────────────────────────
        ['R2101P01', 'Musabayana',   null],
        ['R2101P02', 'Musabayana L', null],
        ['R2102P01', 'Muneri',       null],
        ['R2103P01', 'Kabichi',      null],
        ['R2103P02', 'Kabichi L',    null],
        ['R2104P01', 'Mabaye',       null],
        ['R2104P02', 'Mabaye L',     null],
        ['R2105P01', 'Cofe',         null],
        ['R2105P02', 'Cofe M',       null],

        // ── Region 22 ─────────────────────────────────────────────────────────
        ['R2201P01', 'Zikhali',      null],
        ['R2201P02', 'Zikhali P',    null],
        ['R2202P01', 'Sibanda',      null],
        ['R2202P02', 'Sibanda L',    null],
        ['R2203P01', 'Ruwende',      null],
        ['R2203P02', 'Ruwende L',    null],
        ['R2204P01', 'Musevenzo',    null],
        ['R2204P02', 'Musevenzo L',  null],
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
                    'name'         => $country['name'],
                    'country_code' => $country['country_code'],
                    'created_at'   => now(),
                    'updated_at'   => now(),
                ]);
            }
        }

        return $ids;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Step 2 — Regions
    // Returns: ['01' => 1, '02' => 2, ...]
    // ─────────────────────────────────────────────────────────────────────────
    private function seedRegions(array $countryIds): array
    {
        $ids = [];

        foreach ($this->regions as [$key, $name, $countryCode]) {
            $existing = DB::table('regions')->where('name', $name)->first();

            if ($existing) {
                $ids[$key] = $existing->id;
            } else {
                $ids[$key] = DB::table('regions')->insertGetId([
                    'name'       => $name,
                    'country_id' => $countryIds[$countryCode],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        return $ids;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Step 3 — Zones
    // Returns: ['R0101' => 1, 'R0102' => 2, ...]
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
                    'region_id'  => $regionIds[$regionKey],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        return $ids;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Step 4 — Users + Pastors
    // ─────────────────────────────────────────────────────────────────────────
    private function seedPastors(array $zoneIds, array $regionIds): void
    {
        foreach ($this->pastors as [$code, $fullName, $zoneOverride]) {
            $parts     = explode(' ', $fullName, 2);
            $surname   = $parts[0];
            $firstName = $parts[1] ?? '';

            // Derive zone code: use override if provided, else first 5 chars of pastor code.
            $zoneCode = $zoneOverride ?? strtoupper(substr($code, 0, 5));

            // Derive region key: chars 1–2 of the zone code (e.g. R0101 → '01').
            $regionKey = substr($zoneCode, 1, 2);

            $zoneId   = $zoneIds[$zoneCode]    ?? null;
            $regionId = $regionIds[$regionKey]  ?? null;

            $isRegionalLeader = in_array($code, $this->regionalLeaderCodes, true);

            $email = strtolower($code) . '@heartfelt.church';

            $user = User::updateOrCreate(
                ['email' => $email],
                [
                    'name'           => $fullName,
                    'password'       => Hash::make('password'),
                    'role'           => 'pastor',
                    'unique_code'    => $code,
                    'is_active'      => true,
                    'terms_accepted' => true,
                    'completed_tour' => true,
                ]
            );

            Pastor::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'name'               => $firstName,
                    'surname'            => $surname,
                    'code'               => $code,
                    'title'              => 'Pastor',
                    'zone_id'            => $zoneId,
                    'region_id'          => $regionId,
                    'is_zone_pastor'     => true,
                    'is_regional_leader' => $isRegionalLeader,
                ]
            );
        }
    }
}
