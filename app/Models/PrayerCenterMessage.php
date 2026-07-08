<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class PrayerCenterMessage extends Model
{
    use SoftDeletes;

    const STATUS_PENDING           = 'pending';
    const STATUS_APPROVED          = 'approved';
    const STATUS_FLAGGED           = 'flagged';
    const STATUS_REJECTED          = 'rejected';
    const STATUS_IN_PROGRESS       = 'in_progress';
    const STATUS_RESOLVED          = 'resolved';
    const STATUS_TESTIMONY_APPROVED = 'testimony_approved';

    protected $fillable = [
        'user_id', 'category_id', 'subject', 'message', 'message_original',
        'status', 'priority', 'moderation_notes', 'metadata',
        'read_at', 'responded_at',
    ];

    protected function casts(): array
    {
        return [
            'metadata'     => 'array',
            'read_at'      => 'datetime',
            'responded_at' => 'datetime',
            'deleted_at'   => 'datetime',
            'status'       => \App\Enums\PrayerMessageStatus::class,
            'priority'     => \App\Enums\PrayerMessagePriority::class,
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(PrayerCenterCategory::class);
    }

    public function replies(): HasMany
    {
        return $this->hasMany(PrayerCenterReply::class, 'message_id')->orderBy('created_at');
    }

    public function latestReply(): HasMany
    {
        return $this->hasMany(PrayerCenterReply::class, 'message_id')->latest()->limit(1);
    }
}
