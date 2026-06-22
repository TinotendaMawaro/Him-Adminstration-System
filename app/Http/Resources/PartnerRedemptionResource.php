<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PartnerRedemptionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                  => $this->id,
            'partner_id'          => $this->partner_id,
            'reward_id'           => $this->reward_id,
            'points_used'         => $this->points_used,
            'status'              => $this->status,
            'notes'               => $this->notes,
            'approved_by'         => $this->approved_by,
            'approved_at'         => $this->approved_at?->toIso8601String(),
            'created_at'          => $this->created_at?->toIso8601String(),
            'reward'              => $this->whenLoaded('reward', fn () => new PartnerRewardResource($this->reward)),
        ];
    }
}
