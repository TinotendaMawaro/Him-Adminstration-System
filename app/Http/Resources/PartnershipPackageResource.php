<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PartnershipPackageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                 => $this->id,
            'name'               => $this->name,
            'slug'               => $this->slug,
            'monthly_amount'     => (float) $this->monthly_amount,
            'benefits'           => $this->benefits,
            'impact_description' => $this->impact_description,
            'color'              => $this->color,
            'icon'               => $this->icon,
            'sort_order'         => $this->sort_order,
            'is_active'          => $this->is_active,
            'partner_count'      => $this->when(isset($this->partner_count), $this->partner_count),
        ];
    }
}
