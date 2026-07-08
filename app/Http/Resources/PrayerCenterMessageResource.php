<?php

namespace App\Http\Resources;

use App\Models\PrayerCenterReply;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PrayerCenterMessageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $user = $request->user();
        $isPastor = $user?->role?->value === \App\Enums\UserRole::Pastor->value
            || $user?->isPastor() === true;

        $latest = $this->latestReply?->first();
        $unreadReplies = $this->replies()
            ->where('user_id', '!=', $user?->id)
            ->whereNull('read_at')
            ->count();

        return [
            'id'                => $this->id,
            'user_id'           => $this->user_id,
            'user'              => $this->whenLoaded('user', fn () => [
                'id'    => $this->user->id,
                'name'  => $this->user->name,
                'email' => $this->user->email,
            ]),
            'category'          => new PrayerCenterCategoryResource($this->whenLoaded('category', $this->category)),
            'subject'           => $this->subject,
            'message'           => $this->message,
            'status'            => $this->status?->value ?? $this->status,
            'status_label'      => $this->status?->label() ?? ucfirst($this->status),
            'priority'          => $this->priority?->value ?? $this->priority,
            'priority_label'    => $this->priority?->label() ?? ucfirst($this->priority),
            'moderation_notes'  => $isPastor ? $this->moderation_notes : null,
            'metadata'          => $isPastor ? $this->metadata : null,
            'read_at'           => $this->read_at?->diffForHumans(),
            'responded_at'      => $this->responded_at?->diffForHumans(),
            'replies'           => PrayerCenterReplyResource::collection($this->whenLoaded('replies')),
            'latest_reply'      => $this->whenLoaded('latestReply', fn () => $latest ? new PrayerCenterReplyResource($latest) : null),
            'unread_replies'    => $unreadReplies,
            'reply_count'       => $this->replies->count(),
            'created_at'        => $this->created_at->toDateTimeString(),
            'updated_at'        => $this->updated_at->toDateTimeString(),
        ];
    }
}
