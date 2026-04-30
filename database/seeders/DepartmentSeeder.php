<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DepartmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $departments = [
            [
                'name' => 'Media',
                'description' => 'Media production, broadcasting, and digital communications',
                'color' => 'violet',
                'zone_id' => null,
            ],
            [
                'name' => 'Sound',
                'description' => 'Audio engineering, sound management, and worship tech',
                'color' => 'emerald',
                'zone_id' => null,
            ],
            [
                'name' => 'Heartfelt Music Ministry',
                'description' => 'Leading worship through music and vocal performances',
                'color' => 'rose',
                'zone_id' => null,
            ],
            [
                'name' => 'Discipleship',
                'description' => 'New converts follow-up and spiritual growth mentoring',
                'color' => 'sky',
                'zone_id' => null,
            ],
            [
                'name' => 'Merchandise',
                'description' => 'Church store, resource sales, and merchandise management',
                'color' => 'amber',
                'zone_id' => null,
            ],
            [
                'name' => 'Events',
                'description' => 'Event planning, coordination, and church program execution',
                'color' => 'orange',
                'zone_id' => null,
            ],
            [
                'name' => 'Sanctuary Keepers',
                'description' => 'Facility maintenance, cleanliness, and church environment care',
                'color' => 'teal',
                'zone_id' => null,
            ],
            [
                'name' => 'Security',
                'description' => 'Church safety, crowd control, and security operations',
                'color' => 'slate',
                'zone_id' => null,
            ],
            [
                'name' => 'Archives',
                'description' => 'Record keeping, documentation, and historical archives',
                'color' => 'indigo',
                'zone_id' => null,
            ],
            [
                'name' => 'Admin and Finance',
                'description' => 'Administrative operations, accounting, and financial management',
                'color' => 'green',
                'zone_id' => null,
            ],
            [
                'name' => 'Pioneers',
                'description' => 'Outreach, evangelism, and new church planting initiatives',
                'color' => 'pink',
                'zone_id' => null,
            ],
            [
                'name' => 'Longevity',
                'description' => 'Senior members ministry, retiree support, and legacy programs',
                'color' => 'blue',
                'zone_id' => null,
            ],
        ];

        foreach ($departments as $dept) {
            \App\Models\Department::create($dept);
        }
    }
}
