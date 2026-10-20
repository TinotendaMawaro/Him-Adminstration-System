<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Pastor;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Database\Seeders\ChurchStructureSeeder;
use Database\Seeders\ZoneHistorySeeder;
use Database\Seeders\DepartmentSeeder;
use Database\Seeders\HomeGroupSeeder;
use Database\Seeders\IocHomeGroupsSeeder;
use Database\Seeders\GenderSeeder;
use Database\Seeders\DemographySeeder;
use Database\Seeders\AdditionalMembersSeeder;
use Database\Seeders\PartnershipPackageSeeder;
use Database\Seeders\PartnerRewardSeeder;
use Database\Seeders\PartnerBenefitCatalogSeeder;
use Database\Seeders\PrayerCenterCategorySeeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── Church Structure (zones, regions, countries, pastors) ─────────────────
        $this->call([
            ChurchStructureSeeder::class,
        ]);

        // ── Reference Data (genders, demographies) ───────────────────────────────
        $this->call([
            GenderSeeder::class,
            DemographySeeder::class,
        ]);

        // ── Home Groups ───────────────────────────────────────────────────────────
        $this->call([
            HomeGroupSeeder::class,
        ]);

        $this->call([
            IocHomeGroupsSeeder::class,
        ]);

        // ── Zone Histories ───────────────────────────────────────────────────────
        $this->call([
            ZoneHistorySeeder::class,
        ]);

        // ── Departments ─────────────────────────────────────────────────────────
        $this->call([
            DepartmentSeeder::class,
        ]);

        // ── Master admin ──────────────────────────────────────────────────────
        User::updateOrCreate(
            ['email' => 'master@heartfelt.church'],
            [
                'name'           => 'Master Admin',
                'password'       => Hash::make('password'),
                'role'           => 'master',
                'is_active'      => true,
                'terms_accepted' => true,
                'completed_tour' => true,
            ]
        );

        // ── Finance user ──────────────────────────────────────────────────────
        User::updateOrCreate(
            ['email' => 'finance@heartfelt.church'],
            [
                'name'           => 'Finance Manager',
                'password'       => Hash::make('password'),
                'role'           => 'finance',
                'is_active'      => true,
                'terms_accepted' => true,
                'completed_tour' => true,
            ]
        );

        // ── Event coordinator ─────────────────────────────────────────────────
        User::updateOrCreate(
            ['email' => 'events@heartfelt.church'],
            [
                'name'           => 'Events Coordinator',
                'password'       => Hash::make('password'),
                'role'           => 'event',
                'is_active'      => true,
                'terms_accepted' => true,
                'completed_tour' => true,
            ]
        );

        // ── HOD (example) ─────────────────────────────────────────────────────
        User::updateOrCreate(
            ['email' => 'hod@heartfelt.church'],
            [
                'name'           => 'Head of Department',
                'password'       => Hash::make('password'),
                'role'           => 'hod',
                'is_active'      => true,
                'terms_accepted' => true,
                'completed_tour' => true,
            ]
        );

        // ── Pastor (code login) ───────────────────────────────────────────────
        $pastorUser = User::updateOrCreate(
            ['unique_code' => 'R0101P01'],
            [
                'email'           => 'pastor@heartfelt.church',
                'name'           => 'Pastor Cee',
                'password'       => Hash::make('password'),
                'role'           => 'pastor',
                'zone_id'        => DB::table('zones')->where('code', 'R0101')->first()?->id,
                'is_active'      => true,
                'terms_accepted' => true,
                'completed_tour' => true,
            ]
        );

        \App\Models\Pastor::updateOrCreate(
            ['user_id' => $pastorUser->id],
            [
                'name'             => 'Cee',
                'surname'          => 'Vutabwashe',
                'code'             => 'R0101P01',
                'title'            => 'Pastor',
                'is_zone_pastor'   => true,
                'is_regional_leader' => true,
            ]
        );
//
//        \App\Models\Pastor::updateOrCreate(
//            ['user_id' => $pastorUser->id],
//            [
//                'name'           => 'Cee',
//                'surname'        => 'Vutabwashe',
//                'code'           => 'R0101P01',
//                'title'          => 'Pastor',
//                'is_zone_pastor' => true,
//                'is_regional_leader' => true,
//            ]
//        );

        // ── Member ────────────────────────────────────────────────────────────
        $memberUser = User::updateOrCreate(
            ['email' => 'alpha@heartfelt.church'],
            [
                'name'              => 'Alpha M',
                'password'          => Hash::make('password'),
                'role'              => 'member',
                'is_active'         => true,
                'terms_accepted'    => true,
                'completed_tour'    => true,
            ]
        );

        // Get reference IDs
        $zoneId = DB::table('zones')->where('code', 'R0101')->first()?->id;
        $homeGroupId = DB::table('home_groups')->where('zone_id', $zoneId)->first()?->id;
        $genderId = DB::table('genders')->where('name', 'Male')->first()?->id;
        $demographyId = DB::table('demographies')->where('name', 'Adult')->first()?->id;

        // Zone-scoped pastor views filter on users.zone_id, so the demo member needs it too.
        $memberUser->update(['zone_id' => $zoneId, 'home_group_id' => $homeGroupId]);

        \App\Models\Member::updateOrCreate(
            ['user_id' => $memberUser->id],
            [
                'name'             => 'Alpha',
                'surname'          => 'M',
                'member_number'    => 'MEM-0001',
                'zone_id'          => $zoneId,
                'home_group_id'    => $homeGroupId,
                'gender_id'        => $genderId,
                'demography_id'    => $demographyId,
                'date_of_birth'    => '1990-05-15',
                'status'           => 'active',
                'is_baptised'      => false,
                'can_be_partner'   => true,
                'membership_date'  => now(),
            ]
        );

        // ── Additional Sample Members (3-4 total) ───────────────────────────────
        $this->call([
            AdditionalMembersSeeder::class,
        ]);

        // ── Partner (not a member) ────────────────────────────────────────────
        $partnerUser = User::updateOrCreate(
            ['email' => 'partner@heartfelt.church'],
            [
                'name'           => 'Tino Partner',
                'password'       => Hash::make('password'),
                'role'           => 'partner',
                'zone_id'        => $zoneId,
                'is_active'      => true,
                'terms_accepted' => true,
                'completed_tour' => true,
            ]
        );

        \App\Models\Partner::updateOrCreate(
            ['user_id' => $partnerUser->id],
            [
                'name'             => 'Tino',
                'surname'          => 'Partner',
                'partner_number'   => 'PTR-0001',
                'tier'             => 'jubilee',
                'pledge_amount'    => 150.00,
                'pledge_frequency' => 'monthly',
                'partnership_date' => now()->subYear(),
                'status'           => 'active',
                'zone_id'          => $zoneId,
            ]
        );

        $this->call([
            PartnershipPackageSeeder::class,
            PartnerRewardSeeder::class,
            PartnerBenefitCatalogSeeder::class,
            PrayerCenterCategorySeeder::class,
        ]);
    }
}
