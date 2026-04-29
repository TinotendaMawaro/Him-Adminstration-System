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
        // Map zone names to IDs from zones table
        $zoneMap = [
            'IOC Zone' => 1,       // IOC
            'AFDIS Zone' => 2,     // AFDIS
            'Glenview Zone' => 29, // Glen View
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
            
            // Create a simple user for each member
            $email = strtolower(str_replace(' ', '.', $member['name'])) . '@test.local';
            $userId = DB::table('users')->insertGetId([
                'name' => $member['name'],
                'email' => $email,
                'password' => Hash::make('password'),
                'role' => 'member',
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $data[] = [
                'member_code' => $code,
                'name'        => $member['name'],
                'surname'     => '',
                'member_number' => null,
                'zone_id'     => $zoneMap[$member['zone']],
                'user_id'     => $userId,
                'status'      => 'active',
                'is_baptised' => 0,
                'can_be_partner' => 1,
                'created_at'  => now(),
                'updated_at'  => now(),
            ];
        }

        DB::table('members')->insert($data);
    }
}
