<?php

namespace Database\Seeders;

use App\Models\PartnerBenefitCatalog;
use Illuminate\Database\Seeder;

class PartnerBenefitCatalogSeeder extends Seeder
{
    public function run(): void
    {
        $benefits = [
            // Bronze Partner (order 1) - Base benefits
            ['key' => 'digital_devotionals', 'label' => 'Digital Devotionals', 'description' => 'Access to weekly digital devotionals', 'min_package_order' => 1, 'sort_order' => 1, 'is_active' => true],
            ['key' => 'monthly_newsletter', 'label' => 'Monthly Newsletter', 'description' => 'Monthly ministry newsletter', 'min_package_order' => 1, 'sort_order' => 2, 'is_active' => true],

            // Silver Partner (order 2) - Bronze + Priority Prayer Requests
            ['key' => 'priority_prayer_requests', 'label' => 'Priority Prayer Requests', 'description' => 'Your prayer requests receive priority attention', 'min_package_order' => 2, 'sort_order' => 3, 'is_active' => true],

            // Gold Partner (order 3) - Silver + Leadership Training
            ['key' => 'leadership_training', 'label' => 'Leadership Training Access', 'description' => 'Access to leadership training materials and sessions', 'min_package_order' => 3, 'sort_order' => 4, 'is_active' => true],

            // Platinum Partner (order 4) - Gold + Quarterly Partner Meetings
            ['key' => 'quarterly_partner_meetings', 'label' => 'Quarterly Partner Meetings', 'description' => 'Invitations to quarterly partner meetings', 'min_package_order' => 4, 'sort_order' => 5, 'is_active' => true],

            // Kingdom Builder (order 5) - Platinum + Annual Appreciation Event
            ['key' => 'annual_appreciation_event', 'label' => 'Annual Appreciation Event', 'description' => 'Invitation to the annual partner appreciation event', 'min_package_order' => 5, 'sort_order' => 6, 'is_active' => true],

            // Vision Partner (order 6) - All benefits + exclusive
            ['key' => 'executive_ministry_briefings', 'label' => 'Executive Ministry Briefings', 'description' => 'Exclusive executive ministry briefings', 'min_package_order' => 6, 'sort_order' => 7, 'is_active' => true],
            ['key' => 'vision_strategy_sessions', 'label' => 'Vision Strategy Sessions', 'description' => 'Invitation to vision strategy sessions', 'min_package_order' => 6, 'sort_order' => 8, 'is_active' => true],
        ];

        foreach ($benefits as $benefit) {
            PartnerBenefitCatalog::updateOrCreate(['key' => $benefit['key']], $benefit);
        }
    }
}
