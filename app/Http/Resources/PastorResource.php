<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PastorResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'name'          => $this->name,
            'surname'       => $this->surname,
            'full_name'     => $this->full_name,
            'title'         => $this->title,
            'code'          => $this->code,
            'is_zone_pastor'=> $this->is_zone_pastor,
            'ordained_date' => $this->ordained_date?->format('Y-m-d'),
            'zone'          => $this->whenLoaded('zone', fn () => [
                'id'   => $this->zone->id,
                'name' => $this->zone->name,
            ]),
        ];
    }
}
