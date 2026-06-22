<?php

namespace Database\Seeders;

use App\Models\PartnerReward;
use App\Models\User;
use Illuminate\Database\Seeder;

class PartnerRewardSeeder extends Seeder
{
    public function run(): void
    {
        $rewards = [
            [
                'name' => 'Conference Discount',
                'description' => '20% discount on any ministry conference registration',
                'category' => 'conference_discount',
                'points_required' => 500,
                'monetary_value' => 50.00,
                'stock' => 100,
                'is_active' => true,
            ],
            [
                'name' => 'Ministry Book Bundle',
                'description' => 'One selected ministry book or devotional',
                'category' => 'book',
                'points_required' => 200,
                'monetary_value' => 25.00,
                'stock' => 50,
                'is_active' => true,
            ],
            [
                'name' => 'Ministry Merchandise',
                'description' => 'Branded hoodie, cap, or t-shirt',
                'category' => 'merchandise',
                'points_required' => 300,
                'monetary_value' => 35.00,
                'stock' => 30,
                'is_active' => true,
            ],
            [
                'name' => 'Special Event Ticket',
                'description' => 'VIP access to a special ministry event',
                'category' => 'event',
                'points_required' => 1000,
                'monetary_value' => 100.00,
                'stock' => 20,
                'is_active' => true,
            ],
        ];

        foreach ($rewards as $reward) {
            PartnerReward::updateOrCreate(['name' => $reward['name']], $reward);
        }
    }
}
