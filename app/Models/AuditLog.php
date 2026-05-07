<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuditLog extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'user_id',
        'action',
        'actor_id',
        'details',
        'subject_type',
        'subject_id',
        'target_type',
        'target_id',
        'occurred_at',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'details' => 'array',
        'occurred_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Indicates if the model should be timestamped.
     */
    public $timestamps = false;

    /**
     * Get the user that this audit log entry is about.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the user who performed the action.
     */
    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_id');
    }

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
     * Scope to filter by action type.
     */
    public function scopeAction($query, string $action)
    {
        return $query->where('action', $action);
    }

    /**
     * Scope to filter by actor.
     */
    public function scopeByActor($query, int $actorId)
    {
        return $query->where('actor_id', $actorId);
    }

    /**
     * Scope to filter by date range.
     */
    public function scopeDateRange($query, string $startDate, string $endDate)
    {
        return $query->whereBetween('occurred_at', [$startDate, $endDate]);
    }

    /**
     * Scope for chronological ordering.
     */
    public function scopeChronological($query)
    {
        return $query->orderBy('occurred_at', 'desc');
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
     * Scope for activities related to a specific target.
     */
    public function scopeForTarget($query, Model $target)
    {
        return $query->where('target_type', $target->getMorphClass())
                    ->where('target_id', $target->getKey());
    }
}
