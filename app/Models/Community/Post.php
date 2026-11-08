<?php

namespace App\Models\Community;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Post extends Model
{
    use SoftDeletes;

    protected $table = 'community_posts';

    protected $fillable = ['user_id', 'channel_id', 'repost_of_id', 'kind', 'body', 'media', 'poll', 'likes_count', 'comments_count', 'reposts_count', 'views_count', 'is_pinned', 'status'];

    protected function casts(): array
    {
        return ['media' => 'array', 'poll' => 'array', 'is_pinned' => 'boolean'];
    }

    public function author() { return $this->belongsTo(\App\Models\User::class, 'user_id'); }
    public function channel() { return $this->belongsTo(\App\Models\Community\Channel::class); }
    public function original() { return $this->belongsTo(self::class, 'repost_of_id'); }
    public function comments() { return $this->hasMany(\App\Models\Community\Comment::class, 'post_id'); }
    public function hashtags() { return $this->belongsToMany(\App\Models\Community\Hashtag::class, 'community_post_hashtag', 'post_id', 'hashtag_id'); }
    public function scopePublished($q) { return $q->where('status', 'published'); }
}
