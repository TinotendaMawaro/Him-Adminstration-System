<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MemberResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'name'            => $this->name,
            'surname'         => $this->surname,
            'full_name'       => $this->full_name,
            'member_number'   => $this->member_number,
            'status'          => $this->status,
            'is_baptised'     => $this->is_baptised,
            'membership_date' => $this->membership_date?->format('Y-m-d'),
            'date_of_birth'   => $this->date_of_birth?->format('Y-m-d'),
            'zone'            => $this->whenLoaded('zone', fn () => [
                'id'   => $this->zone->id,
                'name' => $this->zone->name,
            ]),
            'home_group'      => $this->whenLoaded('homeGroup', fn () => [
                'id'   => $this->homeGroup->id,
                'name' => $this->homeGroup->name,
            ]),
            'department'      => $this->whenLoaded('department', fn () => [
                'id'   => $this->department->id,
                'name' => $this->department->name,
            ]),
            'gender'          => $this->whenLoaded('gender', fn () => [
                'id'   => $this->gender->id,
                'name' => $this->gender->name,
            ]),
            'is_partner'      => $this->whenLoaded('partner', fn () => $this->partner !== null),
        ];
    }
}
