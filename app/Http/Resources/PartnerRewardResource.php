<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PartnerRewardResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'name'             => $this->name,
            'description'      => $this->description,
            'category'         => $this->category,
            'points_required'  => $this->points_required,
            'monetary_value'   => (float) $this->monetary_value,
            'image'            => $this->image,
            'stock'            => $this->stock,
            'is_active'        => $this->is_active,
        ];
    }
}
