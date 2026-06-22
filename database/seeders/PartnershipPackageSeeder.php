<?php

namespace Database\Seeders;

use App\Models\PartnershipPackage;
use Illuminate\Database\Seeder;

class PartnershipPackageSeeder extends Seeder
{
    public function run(): void
    {
        $packages = [
            [
                'name'              => 'Bronze Partner',
                'slug'              => 'bronze-partner',
                'monthly_amount'    => 5.00,
                'benefits'          => [
                    'Digital Devotionals',
                    'Monthly Newsletter',
                ],
                'impact_description' => [
                    'Helps fund daily ministry operations',
                    'Supports local outreach programs',
                ],
                'color'             => '#cd7f32',
                'icon'              => 'medal',
                'sort_order'        => 1,
                'is_active'         => true,
            ],
            [
                'name'              => 'Silver Partner',
                'slug'              => 'silver-partner',
                'monthly_amount'    => 10.00,
                'benefits'          => [
                    'Bronze Benefits',
                    'Priority Prayer Requests',
                ],
                'impact_description' => [
                    'Enables expanded community programs',
                    'Funds youth ministry initiatives',
                ],
                'color'             => '#c0c0c0',
                'icon'              => 'medal',
                'sort_order'        => 2,
                'is_active'         => true,
            ],
            [
                'name'              => 'Gold Partner',
                'slug'              => 'gold-partner',
                'monthly_amount'    => 20.00,
                'benefits'          => [
                    'Silver Benefits',
                    'Leadership Training Access',
                ],
                'impact_description' => [
                    'Supports pastoral training',
                    'Funds church planting efforts',
                ],
                'color'             => '#ffd700',
                'icon'              => 'trophy',
                'sort_order'        => 3,
                'is_active'         => true,
            ],
            [
                'name'              => 'Platinum Partner',
                'slug'              => 'platinum-partner',
                'monthly_amount'    => 50.00,
                'benefits'          => [
                    'Gold Benefits',
                    'Quarterly Partner Meetings',
                ],
                'impact_description' => [
                    'Funds regional conferences',
                    'Supports humanitarian aid',
                ],
                'color'             => '#e5e4e2',
                'icon'              => 'trophy',
                'sort_order'        => 4,
                'is_active'         => true,
            ],
            [
                'name'              => 'Kingdom Builder',
                'slug'              => 'kingdom-builder',
                'monthly_amount'    => 100.00,
                'benefits'          => [
                    'Platinum Benefits',
                    'Annual Appreciation Event',
                ],
                'impact_description' => [
                    'Funds major ministry projects',
                    'Supports global missions',
                ],
                'color'             => '#9b59b6',
                'icon'              => 'crown',
                'sort_order'        => 5,
                'is_active'         => true,
            ],
            [
                'name'              => 'Vision Partner',
                'slug'              => 'vision-partner',
                'monthly_amount'    => 500.00,
                'benefits'          => [
                    'All Benefits',
                    'Executive Ministry Briefings',
                    'Vision Strategy Sessions',
                ],
                'impact_description' => [
                    'Accelerates long-term ministry vision',
                    'Enables legacy and generational impact',
                ],
                'color'             => '#1e3a5f',
                'icon'              => 'crown',
                'sort_order'        => 6,
                'is_active'         => true,
            ],
        ];

        foreach ($packages as $package) {
            PartnershipPackage::updateOrCreate(['slug' => $package['slug']], $package);
        }
    }
}
