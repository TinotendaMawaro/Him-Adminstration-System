<?php

namespace Database\Seeders;

use App\Models\Partner;
use App\Models\User;
use App\Models\Zone;
use App\Models\PartnershipPackage;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class InsertDummyPartnerSeeder extends Seeder
{
    public function run(): void
    {
        // Ensure a zone exists (use first available or create R0101)
        $zone = Zone::where('code', 'R0101')->first();
        if (!$zone) {
            $zone = Zone::first();
        }

        if (!$zone) {
            $this->command->warn('No zones found. Please run ChurchStructureSeeder first.');
            return;
        }

        // Ensure a package exists (use first active package)
        $package = PartnershipPackage::active()->first();
        if (!$package) {
            $package = PartnershipPackage::first();
        }

        if (!$package) {
            $this->command->warn('No partnership packages found. Please run PartnershipPackageSeeder first.');
            return;
        }

        // Create or find the dummy user for Taku 0101
        $email = 'taku0101@heartfelt.church';
        $user = User::updateOrCreate(
            ['email' => $email],
            [
                'name'           => 'Taku 0101',
                'password'       => Hash::make('password'),
                'role'           => 'partner',
                'zone_id'        => $zone->id,
                'is_active'      => true,
                'terms_accepted' => true,
                'completed_tour' => true,
                'email_verified_at' => now(),
            ]
        );

        // Generate partner number in format PT-R0101-0001
        $zoneCode = $zone->code ?? 'GENERAL';
        $prefix = 'PT-' . $zoneCode . '-';
        $lastPartner = Partner::where('partner_number', 'LIKE', $prefix . '%')
            ->orderByDesc('partner_number')
            ->first();

        if ($lastPartner) {
            $lastNumber = (int) substr(strrchr($lastPartner->partner_number, '-'), 1);
            $nextNumber = $lastNumber + 1;
        } else {
            $nextNumber = 1;
        }

        $partnerNumber = $prefix . str_pad((string) $nextNumber, 4, '0', STR_PAD_LEFT);

        // Create the dummy partner record
        $partner = Partner::updateOrCreate(
            ['user_id' => $user->id],
            [
                'name'             => 'Taku',
                'surname'          => '0101',
                'partner_number'   => $partnerNumber,
                'tier'             => \App\Enums\PartnerTier::Gold,
                'pledge_amount'    => 20.00,
                'pledge_frequency' => \App\Enums\PledgeFrequency::Monthly,
                'contribution_type'=> \App\Enums\ContributionType::Monthly,
                'partnership_date' => now()->subMonths(6),
                'renewal_date'     => now()->addYear(),
                'status'           => \App\Enums\PartnerStatus::Active,
                'zone_id'          => $zone->id,
                'package_id'       => $package->id,
                'payment_method'   => 'bank_transfer',
                'payment_reference' => 'TXN-TAKU-' . Str::random(8),
                'payment_notes'    => 'Dummy partner record for testing pastor portal',
                'renewal_terms'    => 'Monthly auto-renewal',
                'points_earned'    => 120,
                'notes'            => 'Dummy partner inserted for pastor portal testing',
            ]
        );

        // Assign benefits based on package
        if ($package) {
            app(\App\Services\PartnerBenefitService::class)->assignBenefits($partner);
        }

        $this->command->info("Dummy partner created successfully:");
        $this->command->info("Name: Taku 0101");
        $this->command->info("Email: {$email}");
        $this->command->info("Partner Number: {$partnerNumber}");
        $this->command->info("Tier: Gold");
        $this->command->info("Zone: {$zone->name} ({$zoneCode})");
        $this->command->info("Package: {$package->name}");
        $this->command->info("Status: Active");
    }
}
