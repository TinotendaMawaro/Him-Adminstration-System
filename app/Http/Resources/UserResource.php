<?php

namespace App\Http\Resources;

use App\Enums\UserRole;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        // Ensure role is a UserRole enum (may be string during serialization)
        $role = $this->role instanceof UserRole ? $this->role : UserRole::from($this->role);

        return [
            'id'             => $this->id,
            'name'           => $this->name,
            'email'          => $this->email,
            'role'           => $role->value,
            'role_label'     => $role->getLabel(),
            'unique_code'    => $this->when($role === UserRole::Pastor, $this->unique_code),
            'profile_photo'  => $this->profile_photo,
            'phone'          => $this->phone,
            'is_active'      => $this->is_active,
            'terms_accepted' => $this->terms_accepted,
            'completed_tour' => $this->completed_tour,
            'is_first_time'  => $this->isFirstTimeLogin(),

            'hod_code'       => $this->when($role === UserRole::HOD, $this->hod_code),

            'zone_id'        => $this->zone_id,
            'zone'           => $this->when(in_array($role, [UserRole::Pastor, UserRole::Member, UserRole::Partner]), function () {
                // Build zone data array - pastor info requires pastors to be loaded
                $buildZone = function ($zone) {
                    $pastors = $zone->pastors ?? collect();
                    $pastorUser = $pastors->first(fn ($user) => str_ends_with($user->unique_code ?? '', 'P01'));

                    return [
                        'id'           => $zone->id,
                        'code'         => $zone->code,
                        'name'         => $zone->name,
                        'address'      => $zone->address,
                        'phone'        => $zone->phone,
                        'pastor_id'    => null,
                        'pastor_name'  => null,
                        'pastor_title' => null,
                        'region'       => $zone->relationLoaded('region') ? ($zone->region ? [
                            'id'   => $zone->region->id,
                            'name' => $zone->region->name,
                            'code' => $zone->region->code,
                        ] : null) : null,
                        'created_at' => $zone->created_at?->format('Y-m-d'),
                    ];
                };

                if ($role === UserRole::Member && $this->member?->zone) {
                    return $buildZone($this->member->zone);
                }
                if ($this->relationLoaded('zone') && $this->zone) {
                    return $buildZone($this->zone);
                }
                return null;
            }),

            'home_group_id'  => $this->when(in_array($role, [UserRole::Pastor, UserRole::Member, UserRole::Partner]), function () use ($role) {
                return $role === UserRole::Member && $this->member?->home_group_id
                    ? $this->member->home_group_id
                    : $this->home_group_id;
            }),
            'home_group'     => $this->whenLoaded('member', function () {
                if ($this->member?->homeGroup) {
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

            'pastor'  => $this->when($role === UserRole::Pastor, fn () => new PastorResource($this->pastor)),
            'member'  => $this->whenLoaded('member', fn () => new MemberResource($this->member)),
            'partner' => $this->whenLoaded('partner', fn () => new PartnerResource($this->partner)),
            'contact' => $this->whenLoaded('contact', fn () => new ContactResource($this->contact)),
        ];
    }
}