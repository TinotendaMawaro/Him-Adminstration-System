<?php

namespace Database\Seeders;

use App\Models\PrayerCenterCategory;
use Illuminate\Database\Seeder;

class PrayerCenterCategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name' => 'prayer_request',
                'label' => 'Prayer Request',
                'description' => 'Request prayer for yourself, family, or others',
                'color' => '#D4AF37',
                'icon' => 'hands-praying',
                'sort_order' => 1,
            ],
            [
                'name' => 'counseling_request',
                'label' => 'Counseling Request',
                'description' => 'Request pastoral counseling or guidance',
                'color' => '#60A5FA',
                'icon' => 'message-circle',
                'sort_order' => 2,
            ],
            [
                'name' => 'testimony',
                'label' => 'Testimony',
                'description' => 'Share how God has moved in your life',
                'color' => '#34D399',
                'icon' => 'sun',
                'sort_order' => 3,
            ],
        ];

        foreach ($categories as $cat) {
            PrayerCenterCategory::create($cat);
        }
    }
}
