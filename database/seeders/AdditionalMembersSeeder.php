<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AdditionalMembersSeeder extends Seeder
{
    private array $members = [
        // zone_code, name, surname, gender, demography, status
        ['R0101', 'Tinotenda', 'Mawaro',   'Male',   'Young Adult', 'active'],
        ['R0101', 'Alpha',     'Mutamb',   'Male',   'Adult',       'active'],
        ['R0801', 'Robin',     'Mawaro',   'Male',   'Young Adult', 'active'],
        ['R0102', 'Meick',     'Melson',   'Male',   'Adult',       'active'],
    ];

    public function run(): void
    {
        $maleId = DB::table('genders')->where('name', 'Male')->value('id');
        $adultId = DB::table('demographies')->where('name', 'Adult')->value('id');
        $youngAdultId = DB::table('demographies')->where('name', 'Young Adult')->value('id');

        if (!$maleId) { $this->command->error('Male gender not found'); return; }

        $counter = 2; // Starting member number (1 is Alpha)
        foreach ($this->members as [$zoneCode, $name, $surname, $gender, $demography, $status]) {
            $zone = DB::table('zones')->where('code', $zoneCode)->first();
            if (!$zone) {
                $this->command->warn("Zone {$zoneCode} not found, skipping {$name} {$surname}");
                continue;
            }
            $homeGroup = DB::table('home_groups')->where('zone_id', $zone->id)->first();
            $demoId = $demography === 'Adult' ? $adultId : $youngAdultId;

            $email = strtolower("$name.$surname@heartfelt.church");
            $email = preg_replace('/[^a-z0-9._@-]/', '', $email);

            $userId = DB::table('users')->insertGetId([
                'name'              => "$name $surname",
                'email'             => $email,
                'password'          => Hash::make('password'),
                'role'              => 'member',
                'is_active'         => true,
                'terms_accepted'    => true,
                'completed_tour'    => true,
                'created_at'        => now(),
                'updated_at'        => now(),
            ]);

            DB::table('members')->insert([
                'member_number'    => 'MEM-' . sprintf('%04d', $counter++),
                'name'             => $name,
                'surname'          => $surname,
                'user_id'          => $userId,
                'zone_id'          => $zone->id,
                'home_group_id'    => $homeGroup?->id,
                'gender_id'        => $maleId,
                'demography_id'    => $demoId,
                'date_of_birth'    => date('Y-m-d', rand(strtotime('-30 years'), strtotime('-20 years'))),
                'membership_date'  => now(),
                'status'           => $status,
                'is_baptised'      => rand(0, 1),
                'can_be_partner'   => 1,
                'created_at'       => now(),
                'updated_at'       => now(),
            ]);
        }

        $this->command->info(count($this->members) . ' additional members seeded.');
    }
}
