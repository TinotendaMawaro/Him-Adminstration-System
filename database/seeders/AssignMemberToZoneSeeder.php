<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AssignMemberToZoneSeeder extends Seeder
{
    public function run(): void
    {
        // Get member Alpha M
        $member = DB::table('members')->where('name', 'Alpha')->first();
        if (!$member) {
            $this->command->error('Member "Alpha" not found.');
            return;
        }

        // Get a real zone (e.g., R0101 - IOC Dzivarasekwa)
        $zone = DB::table('zones')->where('code', 'R0101')->first();
        if (!$zone) {
            $this->command->error('Zone R0101 not found.');
            return;
        }

        // Get a home group in that zone
        $homeGroup = DB::table('home_groups')->where('zone_id', $zone->id)->first();
        $homeGroupId = $homeGroup?->id;

        // Get gender (Male) and demography (Adult)
        $gender = DB::table('genders')->where('name', 'Male')->first();
        $demography = DB::table('demographies')->where('name', 'Adult')->first();

        // Update the member
        DB::table('members')->where('id', $member->id)->update([
            'zone_id'          => $zone->id,
            'home_group_id'    => $homeGroupId,
            'gender_id'        => $gender?->id,
            'demography_id'    => $demography?->id,
            'date_of_birth'    => '1990-05-15',
            'updated_at'       => now(),
        ]);

        $this->command->info("Member Alpha assigned to zone: {$zone->code} - {$zone->name}");
        if ($homeGroup) {
            $this->command->info("Home group: {$homeGroup->name}");
        }
    }
}
