<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PartnerBenefitResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'tier' => $this->tier,
            'benefit_key' => $this->benefit_key,
            'unlocked_at' => $this->unlocked_at?->toIso8601String(),
            'unlocked_by_payment_id' => $this->unlocked_by_payment_id,
        ];
    }
}
