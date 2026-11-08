<?php

namespace App\Models\Community;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Comment extends Model
{
    use SoftDeletes;

    protected $table = 'community_comments';

    protected $fillable = ['post_id', 'user_id', 'parent_id', 'body', 'likes_count', 'status'];

    public function author() { return $this->belongsTo(\App\Models\User::class, 'user_id'); }
    public function post() { return $this->belongsTo(\App\Models\Community\Post::class, 'post_id'); }
}
