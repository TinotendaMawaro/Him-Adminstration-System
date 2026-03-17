<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'reference'     => $this->reference,
            'type'          => $this->type,
            'amount'        => $this->amount,
            'currency'      => $this->currency,
            'status'        => $this->status,
            'method'        => $this->method,
            'paid_at'       => $this->paid_at?->toIso8601String(),
            'notes'         => $this->notes,
            'user'          => $this->whenLoaded('user', fn () => [
                'id'   => $this->user->id,
                'name' => $this->user->name,
            ]),
            'event_registration' => $this->whenLoaded('eventRegistration', fn () =>
            new EventRegistrationResource($this->eventRegistration)
            ),
            'recorded_by'   => $this->whenLoaded('recordedBy', fn () => [
                'id'   => $this->recordedBy->id,
                'name' => $this->recordedBy->name,
            ]),
        ];
    }
}
