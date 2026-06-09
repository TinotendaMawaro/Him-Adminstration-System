<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class IocHomeGroupsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $iocHomeGroups = [
            // IOC Zone R0101 - Harare North
            ['R0101', 'Mabelreign', '26 Cotswold Way, Cotswold Hills Mabelreign', 'Sunday', '09:00:00'],
            ['R0101', 'Ashdown Park', '19 Sandy Lane Ashdown Park, Harare', 'Sunday', '09:00:00'],
            ['R0101', 'Bloomingdale', 'To be assigned', 'Sunday', '09:00:00'],
            ['R0101', 'Spitzkop Rainham', 'Plot Number 11, Spitzkop Harare', 'Sunday', '09:00:00'],
            ['R0101', 'Cold Comfort', 'To be assigned', 'Sunday', '09:00:00'],
            ['R0101', 'Tynwald North', 'To be assigned', 'Sunday', '09:00:00'],
            ['R0101', 'Sunridge', 'Proposed to combine with Avonlea/Greencroft', 'Sunday', '09:00:00'],
            ['R0101', 'Marlborough', 'To be assigned', 'Sunday', '09:00:00'],
            ['R0101', 'NBS Gillingham', 'New Home Group', 'Sunday', '09:00:00'],
            ['R0101', 'Westlea, Nkwisi, Lenana, Matidoda', '5349 Nkwisi Gardens Tynwald Harare', 'Sunday', '09:00:00'],
            ['R0101', 'Avonlea and Greencroft', 'To be assigned', 'Sunday', '09:00:00'],
            ['R0101', 'Borrowdale', 'Sister Takunda Taderera 0772593558', 'Sunday', '09:00:00'],
            ['R0101', 'Southview Park', 'To be assigned', 'Sunday', '09:00:00'],
            ['R0101', 'Rugare', 'To be assigned', 'Sunday', '09:00:00'],
            ['R0101', 'Eyecourt', '154 Eyecourt, Harare', 'Sunday', '09:00:00'],
            ['R0101', 'Waterfalls', '712 Reelar Parktown, Waterfalls Harare', 'Sunday', '09:00:00'],
            ['R0101', 'Mainway Meadows', 'To be assigned', 'Sunday', '09:00:00'],
            ['R0101', 'Msasa/Chadcome/Hillside/Braeside', 'Provisional until appointment of the new Leader', 'Sunday', '09:00:00'],
            ['R0101', 'Avondale', 'To be assigned', 'Sunday', '09:00:00'],
            ['R0101', 'Madokere', '13047 Madokero Tynwald', 'Sunday', '09:00:00'],
            ['R0101', 'Hatfield', 'To be assigned', 'Sunday', '09:00:00'],
            ['R0101', 'Dzivarasekwa ext', '308 Nehanda Dzivarasekwa Extension Harare', 'Sunday', '09:00:00'],
            ['R0101', 'Harare City centre', 'To be assigned', 'Sunday', '09:00:00'],
            ['R0101', 'Fairview', 'To be assigned', 'Sunday', '09:00:00'],
            ['R0101', 'Belvedere North', 'To be assigned', 'Sunday', '09:00:00'],
            ['R0101', 'Mount Pleasant', 'To be assigned', 'Sunday', '09:00:00'],
            ['R0101', 'Belvedere South', 'To be assigned', 'Sunday', '09:00:00'],
            ['R0101', 'Warren Park 1&2', '20 8th Close Warren Park harare', 'Sunday', '09:00:00'],

            // Zone R0603 - Kuwadzana (Home Group: Kuwadzana Phase 3)
            // Kuwadzana Phase 3 is in West Harare
            ['R0603', 'Kuwadzana Phase 3', 'To be assigned', 'Sunday', '09:00:00'],

            // Zone R0604 - Granary (Home Group: Whitecliff Granary)
            // Whitecliff / Granary area is in North-West Harare = Granary zone
            ['R0604', 'Whitecliff Granary', 'To be assigned', 'Sunday', '09:00:00'],

            // Zone R0605 - Kambuzuma (Home Group: Kambuzuma/Westwood)
            // Kambuzuma address is in South-West Harare
            ['R0605', 'Kambuzuma/Westwood', '9056 section 3, Kambuzuma Harare', 'Sunday', '09:00:00'],

            // Zone R0702 - Retreat (Home Group: Waterfalls Retreat)
            // Waterfalls Retreat is in South Harare
            ['R0702', 'Waterfalls Retreat', 'To be assigned', 'Sunday', '09:00:00'],

            // Zone R0704 - Stoneridge (Home Group: Chisipiti/Mandara/Glen Lorne/Chishawasha)
            // These areas are in South-East Harare
            ['R0704', 'Chisipiti, Mandara, Glen Lorne, Chishawasha', 'To be assigned', 'Sunday', '09:00:00'],

            // Zone R0804 - Highfields (Home Group: Warren Park D)
            // Warren Park D is in South-West Harare, grouped with Highfields area
            ['R0804', 'Warren Park D', 'To be assigned', 'Sunday', '09:00:00'],

            // Zone R0502 - Greendale (Home Group: Greendale)
            ['R0502', 'Greendale', 'To be assigned', 'Sunday', '09:00:00'],

            // Zone R2302 - Domboshava (Home Group: Domboshava)
            ['R2302', 'Domboshava', 'To be assigned', 'Sunday', '09:00:00'],
        ];

        $created = 0;
        foreach ($iocHomeGroups as [$zoneCode, $name, $location, $meetingDay, $meetingTime]) {
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

        $this->command->info("Created/updated {$created} IOC home groups.");
    }
}
