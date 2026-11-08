<?php

namespace App\Models\Community;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Channel extends Model
{
    use SoftDeletes;

    protected $table = 'channels';

    protected $fillable = ['owner_id', 'name', 'slug', 'description', 'avatar_url', 'cover_url', 'category', 'is_private', 'is_official', 'status', 'members_count'];

    protected function casts(): array
    {
        return ['is_private' => 'boolean', 'is_official' => 'boolean'];
    }

    public function owner() { return $this->belongsTo(\App\Models\User::class, 'owner_id'); }
    public function members() { return $this->hasMany(\App\Models\Community\ChannelMember::class); }
    public function goals() { return $this->hasMany(\App\Models\Community\ChannelGoal::class); }
    public function meetings() { return $this->hasMany(\App\Models\Community\ChannelMeeting::class); }
    public function posts() { return $this->hasMany(\App\Models\Community\Post::class); }
}
