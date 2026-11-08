<?php

namespace App\Models\Community;

use Illuminate\Database\Eloquent\Model;

class ChannelMember extends Model
{
    protected $table = 'channel_members';

    protected $fillable = ['channel_id', 'user_id', 'role', 'status', 'joined_at'];

    protected function casts(): array
    {
        return ['joined_at' => 'datetime'];
    }

    public function user() { return $this->belongsTo(\App\Models\User::class); }
    public function channel() { return $this->belongsTo(\App\Models\Community\Channel::class); }
}
