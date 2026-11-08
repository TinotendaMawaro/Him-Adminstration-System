<?php

namespace App\Models\Community;

use Illuminate\Database\Eloquent\Model;

class Teaching extends Model
{
    protected $table = 'community_teachings';

    protected $fillable = ['title', 'description', 'youtube_url', 'video_id', 'thumbnail_url', 'series', 'speaker', 'is_featured', 'status', 'views_count', 'created_by', 'published_at'];

    protected function casts(): array
    {
        return ['is_featured' => 'boolean', 'published_at' => 'datetime'];
    }

}
