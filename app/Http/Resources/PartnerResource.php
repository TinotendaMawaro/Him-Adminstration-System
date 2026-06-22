<?php

namespace App\Http\Resources;

use App\Http\Resources\PartnershipPackageResource;
use App\Http\Resources\PartnerBenefitResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PartnerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                 => $this->id,
            'name'               => $this->name,
            'surname'            => $this->surname,
            'full_name'          => $this->full_name,
            'partner_number'     => $this->partner_number,
            'tier'               => $this->tier,
            'tier_label'         => $this->tier?->getLabel(),
            'tier_color'         => $this->tier?->getColor(),
            'status'             => $this->status,
            'pledge_amount'      => (float) $this->pledge_amount,
            'pledge_frequency'   => $this->pledge_frequency,
            'contribution_type'  => $this->contribution_type?->getLabel(),
            'partnership_date'   => $this->partnership_date?->format('Y-m-d'),
            'renewal_date'       => $this->renewal_date?->format('Y-m-d'),
            'cancelled_at'       => $this->cancelled_at?->format('Y-m-d'),
            'suspended_at'       => $this->suspended_at?->format('Y-m-d'),
            'payment_method'     => $this->payment_method,
            'payment_reference'  => $this->payment_reference,
            'payment_notes'      => $this->payment_notes,
            'renewal_terms'      => $this->renewal_terms,
            'total_giving'       => $this->total_giving,
            'points_earned'      => (int) $this->points_earned,
            'zone'               => $this->whenLoaded('zone', fn () => [
                'id'   => $this->zone->id,
                'name' => $this->zone->name,
                'code' => $this->zone->code,
            ]),
            'package'            => $this->whenLoaded('package', fn () => new PartnershipPackageResource($this->package)),
            'is_member'          => $this->member_id !== null,
            'notes'              => $this->notes,
        ];
    }
}
