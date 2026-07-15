<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EventResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                    => $this->id,
            'title'                 => $this->title,
            'description'           => $this->description,
            'type'                  => $this->type,
            'status'                => $this->status,
            'starts_at'             => $this->starts_at?->toIso8601String(),
            'ends_at'               => $this->ends_at?->toIso8601String(),
            'venue_name'            => $this->venue_name,
            'venue_address'         => $this->venue_address,
            'requires_registration' => $this->requires_registration,
            'requires_payment'      => $this->requires_payment,
            'registration_fee'      => $this->registration_fee,
            'currency'              => $this->currency,
            'capacity'              => $this->capacity,
            'spots_remaining'       => $this->spots_remaining,
            'registration_open'     => $this->registration_open,
            'registration_closes_at'=> $this->registration_closes_at?->toIso8601String(),
            'banner_image'          => $this->banner_image,
            'is_public'             => $this->is_public,
            'category'              => $this->category,
            'image'                 => $this->image,
            'banner_image'          => $this->banner_image,
            'host'                  => $this->host,
            'theme'                 => $this->theme,
            'is_featured'           => $this->is_featured ?? false,
            'is_livestream'         => $this->is_livestream ?? false,
            'livestream_url'        => $this->livestream_url,
            'registration_count'    => $this->when(
                $request->user()?->hasAnyRole(['master', 'event', 'finance']),
                $this->registration_count
            ),
            'zone'                  => $this->whenLoaded('zone', fn () => [
                'id'   => $this->zone->id,
                'name' => $this->zone->name,
            ]),
            'created_by'            => $this->whenLoaded('createdBy', fn () => [
                'id'   => $this->createdBy->id,
                'name' => $this->createdBy->name,
            ]),
            // Current user's registration status
            'my_registration'       => $this->whenLoaded('registrations', function () use ($request) {
                $reg = $this->registrations->firstWhere('user_id', $request->user()?->id);
                return $reg ? new EventRegistrationResource($reg) : null;
            }),
        ];
    }
}
