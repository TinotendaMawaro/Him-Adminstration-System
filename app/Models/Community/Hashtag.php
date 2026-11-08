<?php

namespace App\Models\Community;

use Illuminate\Database\Eloquent\Model;

class Hashtag extends Model
{
    protected $table = 'community_hashtags';
    public $timestamps = false;

    protected $fillable = ['tag', 'uses_count', 'last_used_at'];

    protected function casts(): array
    {
        return ['last_used_at' => 'datetime'];
    }

}
