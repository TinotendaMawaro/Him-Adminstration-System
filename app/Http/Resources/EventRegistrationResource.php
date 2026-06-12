<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EventRegistrationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user = $this->user;

        return [
            'id'               => $this->id,
            'reference_number' => $this->reference_number,
            'status'           => $this->status,
            'amount_due'       => $this->amount_due,
            'amount_paid'      => $this->amount_paid,
            'balance_due'      => $this->balance_due,
            'is_fully_paid'    => $this->is_fully_paid,
            'registered_at'    => $this->created_at?->diffForHumans() ?? '—',
            'user'             => $user ? [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
                'phone' => $user->phone ?? null,
            ] : null,
            'event'            => $this->whenLoaded('event', fn () => [
                'id'    => $this->event->id,
                'title' => $this->event->title,
            ]),
        ];
    }
}
