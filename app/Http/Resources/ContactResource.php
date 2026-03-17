<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ContactResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'street_address'             => $this->street_address,
            'suburb'                     => $this->suburb,
            'city'                       => $this->city,
            'postal_code'                => $this->postal_code,
            'country'                    => $this->whenLoaded('country', fn () => [
                'id'   => $this->country->id,
                'name' => $this->country->name,
            ]),
            'phone_primary'              => $this->phone_primary,
            'phone_secondary'            => $this->phone_secondary,
            'whatsapp'                   => $this->whatsapp,
            'email_secondary'            => $this->email_secondary,
            'emergency_contact_name'     => $this->emergency_contact_name,
            'emergency_contact_phone'    => $this->emergency_contact_phone,
            'emergency_contact_relation' => $this->emergency_contact_relation,
        ];
    }
}
