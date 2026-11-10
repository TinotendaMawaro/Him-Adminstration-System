<?php

namespace App\Models\Community;

use Illuminate\Database\Eloquent\Model;

class Teaching extends Model
{
    protected $table = 'community_teachings';

    protected $fillable = ['title', 'description', 'youtube_url', 'video_id', 'thumbnail_url', 'series', 'speaker', 'is_featured', 'partners_only', 'status', 'views_count', 'created_by', 'published_at'];

    protected function casts(): array
    {
        return ['is_featured' => 'boolean', 'partners_only' => 'boolean', 'published_at' => 'datetime'];
    }

}
