<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MemberResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'member_code' => $this->member_code ?? $this->member_number,
            'member_number' => $this->member_number,
            'full_name' => $this->full_name,
            'phone' => $this->whenLoaded('user', fn () => $this->user->phone ?? null),
            'email' => $this->whenLoaded('user', fn () => $this->user->email ?? null),
            'title' => $this->whenLoaded('user', fn () => $this->user->title ?? null),
            'membership_date' => $this->membership_date?->format('Y-m-d'),
            'status' => match(true) {
                $this->status instanceof \App\Enums\MemberStatus => $this->status->value,
                default => $this->status ?? 'active',
            },
            'zone' => $this->whenLoaded('zone', fn () => [
                'id' => $this->zone->id,
                'name' => $this->zone->name,
                'code' => $this->zone->code ?? null,
            ]),
            'home_group' => $this->whenLoaded('homeGroup', fn () => [
                'id' => $this->homeGroup->id,
                'name' => $this->homeGroup->name,
            ]),
            'department' => $this->whenLoaded('department', fn () => [
                'id' => $this->department->id,
                'name' => $this->department->name,
            ]),
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
