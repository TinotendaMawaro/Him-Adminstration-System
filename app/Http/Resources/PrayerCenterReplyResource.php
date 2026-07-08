<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PrayerCenterReplyResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'message_id' => $this->message_id,
            'user_id'    => $this->user_id,
            'user'       => $this->whenLoaded('user', fn () => [
                'id'   => $this->user->id,
                'name' => $this->user->name,
            ]),
            'reply'      => $this->reply,
            'type'       => $this->type?->value ?? $this->type,
            'type_label' => $this->type?->label() ?? ucfirst($this->type),
            'is_internal'=> $this->is_internal,
            'read_at'    => $this->read_at?->diffForHumans(),
            'created_at' => $this->created_at->toDateTimeString(),
        ];
    }
}
