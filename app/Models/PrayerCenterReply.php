<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PrayerCenterReply extends Model
{
    protected $fillable = [
        'message_id', 'user_id', 'reply', 'type', 'is_internal', 'read_at',
    ];

    protected function casts(): array
    {
        return [
            'is_internal' => 'boolean',
            'read_at'     => 'datetime',
            'type'        => \App\Enums\PrayerReplyType::class,
        ];
    }

    public function message(): BelongsTo
    {
        return $this->belongsTo(PrayerCenterMessage::class, 'message_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
