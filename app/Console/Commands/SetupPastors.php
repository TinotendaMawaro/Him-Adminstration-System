<?php

namespace App\Console\Commands;

use App\Models\Country;
use App\Models\Region;
use App\Models\Zone;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class SetupPastors extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:setup-pastors';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Set up pastors, regions, and zones from the provided list';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Setting up HEARTFELT INTERNATIONAL MINISTRIES pastors...');

        $pastors = [
            ['name' => 'Pastor Cee', 'code' => 'R0101P01'],
            ['name' => 'Pastor Mtombeni E', 'code' => 'R0102P01'],
            ['name' => 'Pastor Mtombeni M', 'code' => 'R0102P02'],
            ['name' => 'Pastor Chonzi M', 'code' => 'R0103P01'],
            ['name' => 'Pastor Chonzi(L)', 'code' => 'R0103P02'],
            ['name' => 'Pastor Chari', 'code' => 'R0201P01'],
            ['name' => 'Pastor Chari. T', 'code' => 'R0201P02'],
            ['name' => 'Pastor Tonderai', 'code' => 'R0202P01'],
            ['name' => 'Pastor Kunaka', 'code' => 'R0301P01'],
            ['name' => 'Pastor Kunaka. P', 'code' => 'R0301P02'],
            ['name' => 'Pastor Dzikiti', 'code' => 'R0302P01'],
            ['name' => 'Pastor Dzikiti(L)', 'code' => 'R0302P02'],
            ['name' => 'Pastor Lorraine', 'code' => 'R0303P01'],
            ['name' => 'Pastor Chonzi. B', 'code' => 'R0401P01'],
            ['name' => 'Pastor Chonzi. L', 'code' => 'R0401P02'],
            ['name' => 'Pastor Munemo', 'code' => 'R0402P01'],
            ['name' => 'Pastor Munemo(L)', 'code' => 'R0402P02'],
            ['name' => 'Pastor Nzira', 'code' => 'R0403P01'],
            ['name' => 'Pastor Nzira(L)', 'code' => 'R0403P02'],
            ['name' => 'Pastor Nyamayaro', 'code' => 'R0404P01'],
            ['name' => 'Pastor Nyamayaro(L)', 'code' => 'R0404P02'],
            ['name' => 'Pastor Muridzi', 'code' => 'R0501P01'],
            ['name' => 'Pastor Muridzi(L)', 'code' => 'R0501P02'],
            ['name' => 'Pastor Mutume', 'code' => 'R0502P01'],
            ['name' => 'Pastor Mutume(L)', 'code' => 'R0502P02'],
            ['name' => 'Pastor Mubobo', 'code' => 'R0503P01'],
            ['name' => 'Pastor Shemiah', 'code' => 'R0504P01'],
            ['name' => 'Pastor Mbewe', 'code' => 'R0505P01'],
            ['name' => 'Pastor Mbewe(L)', 'code' => 'R0505P02'],
            ['name' => 'Pastor Shumba. G', 'code' => 'R0601P01'],
            ['name' => 'Pastor Shumba. C', 'code' => 'R0601P02'],
            ['name' => 'Pastor Bright', 'code' => 'R0602P01'],
            ['name' => 'Pastor Nelson', 'code' => 'R0603P01'],
            ['name' => 'Pastor Lesley', 'code' => 'R0603P02'],
            ['name' => 'Pastor Matimbira', 'code' => 'R0604P01'],
            ['name' => 'Pastor Matimbira(L)', 'code' => 'R0604P02'],
            ['name' => 'Pastor Kaseke', 'code' => 'R0605P01'],
            ['name' => 'Pastor Kaseke(L)', 'code' => 'R0605P02'],
            ['name' => 'Pastor Nemangwe', 'code' => 'R0701P01'],
            ['name' => 'Pastor Nemangwe. F', 'code' => 'R0701P02'],
            ['name' => 'Pastor Bakasa', 'code' => 'R0702P01'],
            ['name' => 'Pastor Bakasa. G', 'code' => 'R0702P02'],
            ['name' => 'Pastor Mutara', 'code' => 'R0703P01'],
            ['name' => 'Pastor Mutara. T', 'code' => 'R0703P02'],
            ['name' => 'Pastor Zizhou', 'code' => 'R0704P01'],
            ['name' => 'Pastor Zizhou(L)', 'code' => 'R0704P02'],
            ['name' => 'Pastor Kasvosve', 'code' => 'R0705P01'],
            ['name' => 'Pastor Kasvosve(L)', 'code' => 'R0705P02'],
            ['name' => 'Pastor Maminimini', 'code' => 'R0801P01'],
            ['name' => 'Pastor Maminimini. M', 'code' => 'R0801P02'],
            ['name' => 'Pastor Tinarwo', 'code' => 'R0802P01'],
            ['name' => 'Pastor Tinarwo. C', 'code' => 'R0802P02'],
            ['name' => 'Pastor Mahuno', 'code' => 'R0803P01'],
            ['name' => 'Pastor Mahuno(L)', 'code' => 'R0803P02'],
            ['name' => 'Pastor Mlamilo', 'code' => 'R0804P01'],
            ['name' => 'Pastor Mlamilo(L)', 'code' => 'R0804P02'],
            ['name' => 'Pastor Katso', 'code' => 'R0901P01'],
            ['name' => 'Pastor Katso(L)', 'code' => 'R0901P02'],
            ['name' => 'Pastor Chitowo', 'code' => 'R0902P01'],
            ['name' => 'Pastor Chitowo(L)', 'code' => 'R0902P02'],
            ['name' => 'Pastor Maunganidze', 'code' => 'R1001P01'],
            ['name' => 'Pastor Maunganidze(L)', 'code' => 'R1001P02'],
            ['name' => 'Pastor Nemaunga', 'code' => 'R1002P01'],
            ['name' => 'Pastor Nemaunga(L)', 'code' => 'R1002P02'],
            ['name' => 'Pastor Oscar', 'code' => 'R1003P01'],
            ['name' => 'Pastor Mtshalanji', 'code' => 'R1004P01'],
            ['name' => 'Pastor Mtshalanji(L)', 'code' => 'R1004P02'],
            ['name' => 'Pastor Molai', 'code' => 'R1005P01'],
            ['name' => 'Pastor Molai(M)', 'code' => 'R1005P02'],
            ['name' => 'Pastor Kavhu', 'code' => 'R1006P01'],
            ['name' => 'Pastor Kavhu(L)', 'code' => 'R1006P02'],
            ['name' => 'Pastor S Utahwashe', 'code' => 'R1101P01'],
            ['name' => 'Pastor Mrambiwa', 'code' => 'R1102P01'],
            ['name' => 'Pastor Murambiwa(L)', 'code' => 'R1102P02'],
            ['name' => 'Pastor Mashavira', 'code' => 'R1103P01'],
            ['name' => 'Pastor Kuhlengisa', 'code' => 'R1201P01'],
            ['name' => 'Pastor Kuhlengisa(L)', 'code' => 'R1201P02'],
            ['name' => 'Pastor Mhangami', 'code' => 'R1202P01'],
            ['name' => 'Pastor Mhangami(L)', 'code' => 'R1202P02'],
            ['name' => 'Pastor Chinake', 'code' => 'R1203P01'],
            ['name' => 'Pastor Chinake(L)', 'code' => 'R1203P02'],
            ['name' => 'Pastor Mhavasha', 'code' => 'R1301P01'],
            ['name' => 'Pastor Mhavasha(L)', 'code' => 'R1301P02'],
            ['name' => 'Pastor Mundingi', 'code' => 'R1302P01'],
            ['name' => 'Pastor Mundingi(L)', 'code' => 'R1302P02'],
            ['name' => 'Pastor Cledgyman', 'code' => 'R1303P01'],
            ['name' => 'Pastor Kahoba', 'code' => 'R1401P01'],
            ['name' => 'Pastor Kahoba(L)', 'code' => 'R1401P02'],
            ['name' => 'Pastor Mtshalanji', 'code' => 'R1402P01'],
            ['name' => 'Pastor Mtshalanji(L)', 'code' => 'R1402P02'],
            ['name' => 'Pastor Moyo', 'code' => 'R1403P01'],
            ['name' => 'Pastor Moyo(L)', 'code' => 'R1403P02'],
            ['name' => 'Pastor Mtshalanji', 'code' => 'R1404P01'],
            ['name' => 'Pastor Ndebele', 'code' => 'R1405P01'],
            ['name' => 'Pastor Mudzinge', 'code' => 'R1501P01'],
            ['name' => 'Pastor Mudzinge(L)', 'code' => 'R1501P02'],
            ['name' => 'Pastor Tundu', 'code' => 'R1502P01'],
            ['name' => 'Pastor Tundu. S', 'code' => 'R1502P02'],
            ['name' => 'Pastor Matema', 'code' => 'R1601P01'],
            ['name' => 'Pastor Matema(L)', 'code' => 'R1601P02'],
            ['name' => 'Pastor Nguruve', 'code' => 'R1602P01'],
            ['name' => 'Pastor Nguruve(L)', 'code' => 'R1602P02'],
            ['name' => 'Pastor Dhlamini', 'code' => 'R1603P01'],
            ['name' => 'Pastor Dhlamini(L)', 'code' => 'R1603P02'],
            ['name' => 'Pastor Tsiko', 'code' => 'R1701P01'],
            ['name' => 'Pastor Tsiko. C', 'code' => 'R1701P02'],
            ['name' => 'Pastor Gandiwa', 'code' => 'R1702P01'],
            ['name' => 'Pastor Gandiwa(L)', 'code' => 'R1702P02'],
            ['name' => 'Pastor Gumbo', 'code' => 'R1703P01'],
            ['name' => 'Pastor Gumbo(L)', 'code' => 'R1703P02'],
            ['name' => 'Pastor Gemistone', 'code' => 'R1704P01'],
            ['name' => 'Pastor Goba', 'code' => 'R1705P01'],
            ['name' => 'Pastor Goba(L)', 'code' => 'R1705P02'],
            ['name' => 'Pastor Jimu', 'code' => 'R1706P01'],
            ['name' => 'Pastor Jimu(L)', 'code' => 'R1706P02'],
            ['name' => 'Pastor Mbofana', 'code' => 'R1801P01'],
            ['name' => 'Pastor Mbofana(L)', 'code' => 'R1801P02'],
            ['name' => 'Pastor Mutebuka', 'code' => 'R1901P01'],
            ['name' => 'Pastor Chima', 'code' => 'R1902P01'],
            ['name' => 'Pastor Chima(L)', 'code' => 'R1902P02'],
            ['name' => 'Pastor Beauty Mutasa', 'code' => 'R2001P01'],
            ['name' => 'Pastor Mutasa(M)', 'code' => 'R2001P02'],
            ['name' => 'Pastor Musabayana', 'code' => 'R2101P01'],
            ['name' => 'Pastor Musabayana(L)', 'code' => 'R2101P02'],
            ['name' => 'Pastor Muneri', 'code' => 'R2102P01'],
            ['name' => 'Pastor Kabichi', 'code' => 'R2103P01'],
            ['name' => 'Pastor Kabichi(L)', 'code' => 'R2103P02'],
            ['name' => 'Pastor Mabaye', 'code' => 'R2104P01'],
            ['name' => 'Pastor Mabaye(L)', 'code' => 'R2104P02'],
            ['name' => 'Pastor Cofe', 'code' => 'R2105P01'],
            ['name' => 'Pastor Cofe. M', 'code' => 'R2105P02'],
            ['name' => 'Pastor Zikhali', 'code' => 'R2201P01'],
            ['name' => 'Pastor Zikhali. P', 'code' => 'R2201P02'],
            ['name' => 'Pastor Sibanda', 'code' => 'R2202P01'],
            ['name' => 'Pastor Sibanda(L)', 'code' => 'R2202P02'],
            ['name' => 'Pastor Ruwende', 'code' => 'R2203P01'],
            ['name' => 'Pastor Ruwende(L)', 'code' => 'R2203P02'],
            ['name' => 'Pastor Musevenzo', 'code' => 'R2204P01'],
            ['name' => 'Pastor Musevenzo(L)', 'code' => 'R2204P02'],
        ];

        $this->info('Found ' . count($pastors) . ' pastors to process');

        // Get or create country
        $country = Country::first();
        if (!$country) {
            $country = Country::create(['name' => 'Zimbabwe', 'country_code' => 'ZW']);
            $this->info('Created country: Zimbabwe');
        }

        $createdRegions = 0;
        $createdZones = 0;
        $createdPastors = 0;
        $updatedPastors = 0;

        // Process each pastor
        foreach ($pastors as $pastorData) {
            $code = $pastorData['code'];
            $name = $pastorData['name'];

            // Extract region and zone from code (RXXYYPZZ)
            if (preg_match('/R(\d{2})(\d{2})P\d{2}/', $code, $matches)) {
                $regionNum = $matches[1];
                $zoneNum = $matches[2];

                // Create region if not exists
                $region = Region::firstOrCreate(
                    ['name' => 'Region ' . $regionNum],
                    ['country_id' => $country->id]
                );

                if ($region->wasRecentlyCreated) {
                    $createdRegions++;
                }

                // Create zone if not exists
                $zone = Zone::firstOrCreate(
                    ['code' => $regionNum . $zoneNum],
                    [
                        'name' => 'Zone ' . $regionNum . $zoneNum,
                        'region_id' => $region->id
                    ]
                );

                if ($zone->wasRecentlyCreated) {
                    $createdZones++;
                }

                // Create or update pastor
                $email = strtolower(str_replace([' ', '.', '(L)'], ['', '', 'lieutenant'], $name)) . '.' . strtolower($code) . '@heartfelt.church';

                $user = User::updateOrCreate(
                    ['unique_code' => $code],
                    [
                        'name' => $name,
                        'email' => $email,
                        'password' => Hash::make('password'),
                        'role' => 'pastor',
                        'zone_id' => $zone->id,
                        'is_active' => true,
                        'terms_accepted' => true,
                        'completed_tour' => true,
                    ]
                );

                if ($user->wasRecentlyCreated) {
                    $createdPastors++;
                } else {
                    $updatedPastors++;
                }
            }
        }

        $this->info("Setup complete!");
        $this->info("Created: $createdRegions regions, $createdZones zones, $createdPastors pastors");
        $this->info("Updated: $updatedPastors pastors");

        return Command::SUCCESS;
    }
}
