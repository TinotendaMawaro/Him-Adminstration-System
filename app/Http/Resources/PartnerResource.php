<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PartnerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'name'             => $this->name,
            'surname'          => $this->surname,
            'full_name'        => $this->full_name,
            'partner_number'   => $this->partner_number,
            'tier'             => $this->tier,
            'status'           => $this->status,
            'pledge_amount'    => $this->pledge_amount,
            'pledge_frequency' => $this->pledge_frequency,
            'partnership_date' => $this->partnership_date?->format('Y-m-d'),
            'total_giving'     => $this->total_giving,
            'zone'             => $this->whenLoaded('zone', fn () => [
                'id'   => $this->zone->id,
                'name' => $this->zone->name,
            ]),
            'is_member'        => $this->member_id !== null,
        ];
    }
}
