<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ActivityLog extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'action',
        'description',
        'subject_type',
        'subject_id',
        'target_type',
        'target_id',
        'actor_id',
        'metadata',
        'occurred_at',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'metadata' => 'array',
        'occurred_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the subject of the activity (polymorphic).
     */
    public function subject(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Get the target of the activity (polymorphic).
     */
    public function target(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Get the user who performed the action.
     */
    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_id');
    }

    /**
     * Scope for chronological ordering.
     */
    public function scopeChronological($query)
    {
        return $query->orderBy('occurred_at', 'desc');
    }

    /**
     * Scope for specific actions.
     */
    public function scopeAction($query, string $action)
    {
        return $query->where('action', $action);
    }

    /**
     * Scope for activities by a specific actor.
     */
    public function scopeByActor($query, int $actorId)
    {
        return $query->where('actor_id', $actorId);
    }

    /**
     * Scope for activities related to a specific subject.
     */
    public function scopeForSubject($query, Model $subject)
    {
        return $query->where('subject_type', $subject->getMorphClass())
                    ->where('subject_id', $subject->getKey());
    }

    /**
     * Get formatted description with placeholders replaced.
     */
    public function getFormattedDescriptionAttribute(): string
    {
        $description = $this->description;
        $metadata = $this->metadata ?? [];

        foreach ($metadata as $key => $value) {
            $description = str_replace(":{$key}:", $value, $description);
        }

        return $description;
    }
}
