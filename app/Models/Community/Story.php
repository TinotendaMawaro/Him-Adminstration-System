<?php

namespace App\Models\Community;

use Illuminate\Database\Eloquent\Model;

class Story extends Model
{
    protected $table = 'community_stories';

    protected $fillable = ['user_id', 'kind', 'media_url', 'caption', 'background', 'views_count', 'expires_at'];

    protected function casts(): array
    {
        return ['expires_at' => 'datetime'];
    }

    public function author() { return $this->belongsTo(\App\Models\User::class, 'user_id'); }
    public function scopeLive($q) { return $q->where('expires_at', '>', now()); }
}
