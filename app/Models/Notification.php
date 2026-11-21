<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Schema;

class Notification extends Model
{
    use HasFactory;

    /** Messages arrive as notifications too; these categories belong in the inbox, everything else in the notifications tab. */
    public const MESSAGE_CATEGORIES = ['message'];

    protected $fillable = [
        'user_id',
        'title',
        'message',
        'type',
        'category',
        'is_read',
        'read_at',
        'scheduled_for',
        'archived_at',
        'related_id',
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'read_at' => 'datetime',
        'scheduled_for' => 'datetime',
        'archived_at' => 'datetime',
    ];

    protected $appends = ['kind'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /** 'message' (open it in the inbox) or 'notification' (open it in the notifications tab). */
    public function getKindAttribute(): string
    {
        return in_array($this->category, self::MESSAGE_CATEGORIES, true) ? 'message' : 'notification';
    }

    public function markAsRead()
    {
        $this->update([
            'is_read' => true,
            'read_at' => now(),
        ]);
    }

    /** Whether the archive / related-person columns exist yet (they arrive with a migration; the code works without them). */
    public static function hasArchive(): bool
    {
        static $has = null;

        return $has ??= Schema::hasColumn('notifications', 'archived_at');
    }

    public static function hasRelated(): bool
    {
        static $has = null;

        return $has ??= Schema::hasColumn('notifications', 'related_id');
    }

    public function scopeNotArchived(Builder $q): Builder
    {
        return self::hasArchive() ? $q->whereNull('archived_at') : $q;
    }
}
