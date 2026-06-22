<?php

namespace App\Services;

use App\Models\Partner;
use App\Models\PartnerBenefit;
use App\Models\PartnerBenefitCatalog;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;

class PartnerBenefitService
{
    /**
     * Assign benefits to a partner based on their current package.
     *
     * @param Partner $partner
     * @param Payment|null $payment Optional payment that triggered the assignment
     * @return void
     */
    public function assignBenefits(Partner $partner, ?Payment $payment = null): void
    {
        if (!$partner->package) {
            return;
        }

        $packageOrder = (int) $partner->package->sort_order;

        $eligibleBenefits = PartnerBenefitCatalog::active()
            ->ordered()
            ->where('min_package_order', '<=', $packageOrder)
            ->get();

        foreach ($eligibleBenefits as $catalog) {
            $exists = PartnerBenefit::where('partner_id', $partner->id)
                ->where('catalog_id', $catalog->id)
                ->exists();

            if (!$exists) {
                PartnerBenefit::create([
                    'partner_id'              => $partner->id,
                    'catalog_id'              => $catalog->id,
                    'tier'                    => $partner->tier,
                    'benefit_key'             => $catalog->key,
                    'unlocked_at'             => now(),
                    'unlocked_by_payment_id'  => $payment?->id,
                ]);
            }
        }
    }

    /**
     * Get all active benefits for a partner.
     */
    public function getPartnerBenefits(Partner $partner)
    {
        return PartnerBenefit::where('partner_id', $partner->id)
            ->with('catalog')
            ->get()
            ->map(fn ($pb) => $pb->catalog)
            ->filter()
            ->sortBy('sort_order')
            ->values();
    }
}
