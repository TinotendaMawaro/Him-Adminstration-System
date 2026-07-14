<?php

namespace Database\Seeders;

use App\Models\BadgeCatalog;
use Illuminate\Database\Seeder;

class BadgeCatalogSeeder extends Seeder
{
    public function run(): void
    {
        $badges = [
            [
                'slug' => 'first_service',
                'name' => 'First Service',
                'description' => 'Attended your first church service',
                'icon' => '🙏',
                'tier' => 'bronze',
                'color' => '#f97316',
                'sort_order' => 1,
            ],
            [
                'slug' => 'first_homegroup',
                'name' => 'First Home Group',
                'description' => 'Joined your first home group',
                'icon' => '🏠',
                'tier' => 'bronze',
                'color' => '#10b981',
                'sort_order' => 2,
            ],
            [
                'slug' => 'first_department',
                'name' => 'First Department',
                'description' => 'Joined your first ministry department',
                'icon' => '🏢',
                'tier' => 'silver',
                'color' => '#8b5cf6',
                'sort_order' => 3,
            ],
            [
                'slug' => 'first_partnership',
                'name' => 'First Partnership',
                'description' => 'Enrolled in your first partnership',
                'icon' => '💝',
                'tier' => 'gold',
                'color' => '#f43f5e',
                'sort_order' => 4,
            ],
            [
                'slug' => 'leadership_promotion',
                'name' => 'Leadership Promotion',
                'description' => 'Promoted to a leadership role (HOD or Home Group Leader)',
                'icon' => '⭐',
                'tier' => 'platinum',
                'color' => '#6366f1',
                'sort_order' => 5,
            ],
        ];

        foreach ($badges as $badge) {
            BadgeCatalog::updateOrCreate(['slug' => $badge['slug']], $badge);
        }
    }
}
