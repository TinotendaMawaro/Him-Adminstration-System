<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PartnerPointResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'points'        => $this->points,
            'source'        => $this->source,
            'description'   => $this->description,
            'balance_after' => $this->balance_after,
            'created_at'    => $this->created_at?->toIso8601String(),
            'payment'       => $this->whenLoaded('payment', fn () => new PaymentResource($this->payment)),
        ];
    }
}
