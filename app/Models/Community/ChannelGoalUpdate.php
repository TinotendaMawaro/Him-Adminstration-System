<?php

namespace App\Models\Community;

use Illuminate\Database\Eloquent\Model;

class ChannelGoalUpdate extends Model
{
    protected $table = 'channel_goal_updates';
    public $timestamps = false;

    protected $fillable = ['goal_id', 'user_id', 'note', 'progress', 'created_at'];

    protected function casts(): array
    {
        return ['created_at' => 'datetime'];
    }

    public function user() { return $this->belongsTo(\App\Models\User::class); }
}
