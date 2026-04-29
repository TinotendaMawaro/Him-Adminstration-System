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
            'member_code'     => $this->member_code,
            'status'          => $this->status,
            'is_baptised'     => $this->is_baptised,
            'can_be_partner'  => $this->can_be_partner,
            'membership_date' => $this->membership_date?->format('Y-m-d'),
            'date_of_birth'   => $this->date_of_birth?->format('Y-m-d'),
            'email'           => $this->email,
            'phone'           => $this->phone,
            'mobile'          => $this->mobile,
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
            'demography'      => $this->whenLoaded('demography', fn () => [
                'id'   => $this->demography->id,
                'name' => $this->demography->name,
            ]),
            'partner'         => $this->whenLoaded('partner', fn () => [
                'id'      => $this->partner->id,
                'name'    => $this->partner->name,
                'surname' => $this->partner->surname,
            ]),
            'created_at'      => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at'      => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
