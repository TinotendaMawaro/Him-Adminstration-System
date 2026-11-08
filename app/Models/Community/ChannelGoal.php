<?php

namespace App\Models\Community;

use Illuminate\Database\Eloquent\Model;

class ChannelGoal extends Model
{
    protected $table = 'channel_goals';

    protected $fillable = ['channel_id', 'created_by', 'title', 'description', 'target_date', 'progress', 'status'];

    protected function casts(): array
    {
        return ['target_date' => 'date'];
    }

    public function creator() { return $this->belongsTo(\App\Models\User::class, 'created_by'); }
    public function updates() { return $this->hasMany(\App\Models\Community\ChannelGoalUpdate::class, 'goal_id'); }
}
