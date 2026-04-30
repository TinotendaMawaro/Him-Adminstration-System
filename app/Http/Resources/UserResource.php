<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'name'           => $this->name,
            'email'          => $this->email,
            // Serialize the enum to its string value for the frontend
            'role'           => $this->role->value,
            'role_label'     => $this->role->getLabel(),
            'unique_code'    => $this->when($this->isPastor(), $this->unique_code),
            'profile_photo'  => $this->profile_photo,
            'phone'          => $this->phone,
            'is_active'      => $this->is_active,
            'terms_accepted' => $this->terms_accepted,
            'completed_tour' => $this->completed_tour,
            'is_first_time'  => $this->isFirstTimeLogin(),

            'zone_id'        => $this->zone_id,
            'zone'           => $this->whenLoaded('zone', function () {
                $region = $this->zone->relationLoaded('region') ? $this->zone->region : null;
                return [
                    'id'      => $this->zone->id,
                    'name'    => $this->zone->name,
                    'code'    => $this->zone->code,
                    'address' => $this->zone->address,
                    'phone'   => $this->zone->phone,
                    'region'  => $region ? [
                        'id'   => $region->id,
                        'name' => $region->name,
                        'country' => $region->relationLoaded('country') ? [
                            'id'   => $region->country->id,
                            'name' => $region->country->name,
                            'code' => $region->country->country_code,
                        ] : null,
                    ] : null,
                    'created_at' => $this->zone->created_at?->format('Y-m-d'),
                ];
            }),

            'home_group_id'  => $this->home_group_id,
            'home_group'     => $this->whenLoaded('homeGroup', fn () => [
                'id' => $this->homeGroup->id, 'name' => $this->homeGroup->name,
            ]),
            'department_id'  => $this->department_id,
            'department'     => $this->whenLoaded('department', fn () => [
                'id' => $this->department->id, 'name' => $this->department->name,
            ]),

            'pastor'  => $this->whenLoaded('pastor',  fn () => new PastorResource($this->pastor)),
            'member'  => $this->whenLoaded('member',  fn () => new MemberResource($this->member)),
            'partner' => $this->whenLoaded('partner', fn () => new PartnerResource($this->partner)),
            'contact' => $this->whenLoaded('contact', fn () => new ContactResource($this->contact)),
        ];
    }
}
