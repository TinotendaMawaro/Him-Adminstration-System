<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EventRegistrationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'reference_number' => $this->reference_number,
            'status'           => $this->status,
            'amount_due'       => $this->amount_due,
            'amount_paid'      => $this->amount_paid,
            'balance_due'      => $this->balance_due,
            'is_fully_paid'    => $this->is_fully_paid,
            'event'            => $this->whenLoaded('event', fn () => [
                'id'    => $this->event->id,
                'title' => $this->event->title,
            ]),
        ];
    }
}
