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

            'zone_id'        => $this->when($this->isPastor() || $this->isMember() || $this->isPartner(), function () {
                return $this->isMember() && $this->member?->zone_id 
                    ? $this->member->zone_id 
                    : $this->zone_id;
            }),
            'zone'           => $this->whenLoaded('member', function () {
                if ($this->isMember() && $this->member?->zone) {
                    $region = $this->member->zone->relationLoaded('region') ? $this->member->zone->region : null;
                    return [
                        'id'   => $this->member->zone->id,
                        'code' => $this->member->zone->code,
                        'name' => $this->member->zone->name,
                        'address' => $this->member->zone->address,
                        'phone'   => $this->member->zone->phone,
                        'region'  => $region ? [
                            'id'   => $region->id,
                            'name' => $region->name,
                            'country' => $region->relationLoaded('country') ? [
                                'id'   => $region->country->id,
                                'name' => $region->country->name,
                                'code' => $region->country->country_code,
                            ] : null,
                        ] : null,
                        'created_at' => $this->member->zone->created_at?->format('Y-m-d'),
                    ];
                }
                return $this->whenLoaded('zone', function () {
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
                });
            }),

            'home_group_id'  => $this->when($this->isPastor() || $this->isMember() || $this->isPartner(), function () {
                return $this->isMember() && $this->member?->home_group_id
                    ? $this->member->home_group_id
                    : $this->home_group_id;
            }),
            'home_group'     => $this->whenLoaded('member', function () {
                if ($this->isMember() && $this->member?->homeGroup) {
                    return [
                        'id'   => $this->member->homeGroup->id,
                        'name' => $this->member->homeGroup->name,
                        'location' => $this->member->homeGroup->location,
                        'meeting_day' => $this->member->homeGroup->meeting_day,
                        'meeting_time' => $this->member->homeGroup->meeting_time?->format('H:i'),
                    ];
                }
                return $this->whenLoaded('homeGroup', fn () => [
                    'id' => $this->homeGroup->id, 
                    'name' => $this->homeGroup->name,
                ]);
            }),
            'department_id'  => $this->department_id,
            'department'     => $this->whenLoaded('department', fn () => [
                'id' => $this->department->id, 'name' => $this->department->name,
            ]),

            // Pastor information for members
            'pastor' => $this->when($this->isMember() || $this->isPartner(), function () {
                $pastor = $this->zone?->currentPastor;
                if ($pastor) {
                    return [
                        'id' => $pastor->id,
                        'name' => $pastor->name,
                        'email' => $pastor->email,
                        'phone' => $pastor->phone,
                    ];
                }
                return null;
            }),

            'pastor'  => $this->whenLoaded('pastor',  fn () => new PastorResource($this->pastor)),
            'member'  => $this->whenLoaded('member',  fn () => new MemberResource($this->member)),
            'partner' => $this->whenLoaded('partner', fn () => new PartnerResource($this->partner)),
            'contact' => $this->whenLoaded('contact', fn () => new ContactResource($this->contact)),
        ];
    }
}
