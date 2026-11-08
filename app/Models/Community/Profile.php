<?php

namespace App\Models\Community;

use Illuminate\Database\Eloquent\Model;

class Profile extends Model
{
    protected $table = 'community_profiles';
    protected $primaryKey = 'user_id';
    public $incrementing = false;

    protected $fillable = ['user_id', 'handle', 'bio', 'website', 'cover_url', 'is_verified', 'banned_until', 'muted_until', 'moderation_note', 'followers_count', 'following_count', 'posts_count'];

    protected function casts(): array
    {
        return ['is_verified' => 'boolean', 'banned_until' => 'datetime', 'muted_until' => 'datetime'];
    }

    public function user() { return $this->belongsTo(\App\Models\User::class); }
    public function isBanned(): bool { return $this->banned_until && $this->banned_until->isFuture(); }
    public function isMuted(): bool { return $this->muted_until && $this->muted_until->isFuture(); }
}
