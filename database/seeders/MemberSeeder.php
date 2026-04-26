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
        // Get a default user id (e.g., master admin) for user_id not null constraint
        $defaultUser = DB::table('users')->where('role', 'master')->first();
        if (!$defaultUser) {
            $defaultUser = DB::table('users')->first();
        }
        $defaultUserId = $defaultUser->id ?? 1;

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
            $data[] = [
                'member_code' => $code,
                'name'        => $member['name'],
                'surname'     => '', // empty string allowed
                'member_number' => null, // nullable
                'zone_id'     => $zoneMap[$member['zone']],
                'user_id'     => $defaultUserId,
                'status'      => 'active',
                'is_baptised' => 0,
                'can_be_partner' => 1,
                'created_at'  => now(),
                'updated_at'  => now(),
                // other nullable columns can be left null
            ];
        }

        DB::table('members')->insert($data);
    }
}
