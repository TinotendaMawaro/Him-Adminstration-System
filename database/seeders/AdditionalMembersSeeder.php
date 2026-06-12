<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AdditionalMembersSeeder extends Seeder
{
    private array $members = [
        ['R0101', 'Tinotenda', 'Mawaro',   'Male',   'Young Adult', 'active', '+263 77 123 4567', 'tinotenda.mawaro@heartfelt.church'],
        ['R0101', 'Alpha',     'Mutamb',   'Male',   'Adult',       'active', '+263 77 234 5678', 'alpha.mutamb@heartfelt.church'],
        ['R0101', 'Robin',     'Mawaro',   'Male',   'Young Adult', 'active', '+263 77 345 6789', 'robin.mawaro@heartfelt.church'],
        ['R0103', 'Meick',     'Melson',   'Male',   'Adult',       'active', '+263 77 456 7890', 'meick.melson@heartfelt.church'],
    ];

    public function run(): void
    {
        $maleId = DB::table('genders')->where('name', 'Male')->value('id');
        $adultId = DB::table('demographies')->where('name', 'Adult')->value('id');
        $youngAdultId = DB::table('demographies')->where('name', 'Young Adult')->value('id');

        if (!$maleId) { $this->command->error('Male gender not found'); return; }

        $counter = 2;
        foreach ($this->members as [$zoneCode, $name, $surname, $gender, $demography, $status, $phone, $email]) {
            $zone = DB::table('zones')->where('code', $zoneCode)->first();
            if (!$zone) {
                $this->command->warn("Zone {$zoneCode} not found, skipping {$name} {$surname}");
                continue;
            }
            $homeGroup = DB::table('home_groups')->where('zone_id', $zone->id)->first();
            $demoId = $demography === 'Adult' ? $adultId : $youngAdultId;

            $existingUser = DB::table('users')->where('email', $email)->first();
            if ($existingUser) {
                $userId = $existingUser->id;
                DB::table('users')->where('id', $userId)->update([
                    'phone'      => $phone,
                    'updated_at' => now(),
                ]);
            } else {
                $userId = DB::table('users')->insertGetId([
                    'name'              => "$name $surname",
                    'email'             => $email,
                    'phone'             => $phone,
                    'password'          => Hash::make('password'),
                    'role'              => 'member',
                    'is_active'         => true,
                    'terms_accepted'    => true,
                    'completed_tour'    => true,
                    'created_at'        => now(),
                    'updated_at'        => now(),
                ]);
            }

            $memberNumber = 'MEM-' . sprintf('%04d', $counter++);
            DB::table('members')->updateOrInsert(
                ['user_id' => $userId],
                [
                    'member_number'    => $memberNumber,
                    'name'             => $name,
                    'surname'          => $surname,
                    'zone_id'          => $zone->id,
                    'home_group_id'    => $homeGroup?->id,
                    'gender_id'        => $maleId,
                    'demography_id'    => $demoId,
                    'date_of_birth'    => date('Y-m-d', rand(strtotime('-30 years'), strtotime('-20 years'))),
                    'membership_date'  => now(),
                    'status'           => $status,
                    'is_baptised'      => rand(0, 1),
                    'can_be_partner'   => 1,
                    'updated_at'       => now(),
                ]
            );

            DB::table('contacts')->updateOrInsert(
                ['user_id' => $userId],
                [
                    'phone_primary' => $phone,
                    'whatsapp'      => $phone,
                    'created_at'    => now(),
                    'updated_at'    => now(),
                ]
            );
        }

        $this->command->info(count($this->members) . ' additional members seeded.');
    }
}
