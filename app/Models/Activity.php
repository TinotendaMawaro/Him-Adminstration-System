<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Activity extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'department_id',
        'created_by',
        'title',
        'description',
        'date',
        'time',
        'location',
        'type',
        'status',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'date' => 'date',
        'time' => 'datetime:H:i',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the department that owns the activity.
     */
    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    /**
     * Get the user who created the activity.
     */
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * Get activity type badge color.
     */
    public function getTypeBadgeColorAttribute()
    {
        return match($this->type) {
            'activity' => 'from-amber-400 to-amber-600',
            'event' => 'from-sky-400 to-sky-600',
            'meeting' => 'from-purple-400 to-purple-600',
            default => 'from-gray-400 to-gray-600',
        };
    }

    /**
     * Get status badge color.
     */
    public function getStatusBadgeColorAttribute()
    {
        return match($this->status) {
            'draft' => 'from-gray-400 to-gray-600',
            'upcoming' => 'from-sky-400 to-sky-600',
            'in_progress' => 'from-amber-400 to-amber-600',
            'completed' => 'from-emerald-400 to-emerald-600',
            'cancelled' => 'from-red-400 to-red-600',
            default => 'from-gray-400 to-gray-600',
        };
    }
}
