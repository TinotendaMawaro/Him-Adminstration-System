<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HomeGroupUpdate extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'home_group_id',
        'user_id',
        'title',
        'content',
        'type',
        'is_pinned',
        'published_at',
    ];

    /**
     * The attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'published_at' => 'datetime',
            'is_pinned' => 'boolean',
        ];
    }

    /**
     * Get the home group this update belongs to
     */
    public function homeGroup()
    {
        return $this->belongsTo(HomeGroup::class);
    }

    /**
     * Get the user who created this update
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope for pinned updates
     */
    public function scopePinned($query)
    {
        return $query->where('is_pinned', true);
    }

    /**
     * Scope for recent updates
     */
    public function scopeRecent($query, $days = 30)
    {
        return $query->where('published_at', '>=', now()->subDays($days));
    }
}
