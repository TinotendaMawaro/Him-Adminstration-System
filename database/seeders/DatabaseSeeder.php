<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
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
            ['email' => 'pastor@heartfelt.church'],
            [
                'name'           => 'Pastor Cee',
                'password'       => Hash::make('password'),
                'role'           => 'pastor',
                'unique_code'    => 'R0101P01',
                'is_active'      => true,
                'terms_accepted' => true,
                'completed_tour' => true,
            ]
        );

        \App\Models\Pastor::updateOrCreate(
            ['user_id' => $pastorUser->id],
            [
                'name'           => 'Cee',
                'surname'        => 'Vutabwashe',
                'code'           => 'R0101P01',
                'title'          => 'Pastor',
                'is_zone_pastor' => true,
            ]
        );

        // ── Member ────────────────────────────────────────────────────────────
        $memberUser = User::updateOrCreate(
            ['email' => 'alpha@heartfelt.church'],
            [
                'name'           => 'Alpha M',
                'password'       => Hash::make('password'),
                'role'           => 'member',
                'is_active'      => true,
                'terms_accepted' => true,
                'completed_tour' => true,
            ]
        );

        \App\Models\Member::updateOrCreate(
            ['user_id' => $memberUser->id],
            [
                'name'            => 'Alpha',
                'surname'         => 'M',
                'member_number'   => 'MEM-0001',
                'status'          => 'active',
                'membership_date' => now(),
            ]
        );

        // ── Partner (not a member) ────────────────────────────────────────────
        $partnerUser = User::updateOrCreate(
            ['email' => 'partner@heartfelt.church'],
            [
                'name'           => 'Tino Partner',
                'password'       => Hash::make('password'),
                'role'           => 'partner',
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
            ]
        );
    }
}
