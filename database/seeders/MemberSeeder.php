<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class MemberSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Map zone names to zone codes
        $zoneCodeMap = [
            'IOC Zone' => 'R0101',
            'AFDIS Zone' => 'R0103',
            'Glenview Zone' => 'R0801',
        ];

        $members = [
            ['name' => 'Tinotenda Mawaro', 'zone' => 'IOC Zone'],
            ['name' => 'Alpha Mutamb',     'zone' => 'IOC Zone'],
            ['name' => 'Robin Mawaro',     'zone' => 'Glenview Zone'],
            ['name' => 'Meick Melson',     'zone' => 'AFDIS Zone'],
        ];

        $data = [];
        foreach ($members as $index => $member) {
            $code = sprintf('ME%02d', $index + 1);
            $zoneCode = $zoneCodeMap[$member['zone']];
            $zone = DB::table('zones')->where('code', $zoneCode)->first();
            $zoneId = $zone ? $zone->id : null;
            
            // Create a simple user for each member
            $email = strtolower(str_replace(' ', '.', $member['name'])) . '@test.local';
            $userId = DB::table('users')->insertGetId([
                'name' => $member['name'],
                'email' => $email,
                'password' => Hash::make('password'),
                'role' => 'member',
                'is_active' => true,
                'zone_id' => $zoneId,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $data[] = [
                'member_number' => $code,
                'name'          => $member['name'],
                'surname'       => '',
                'user_id'       => $userId,
                'zone_id'       => $zoneId,
                'status'        => 'active',
                'is_baptised'   => 0,
                'can_be_partner'=> 1,
                'created_at'    => now(),
                'updated_at'    => now(),
            ];
        }

        DB::table('members')->insert($data);
    }
}
