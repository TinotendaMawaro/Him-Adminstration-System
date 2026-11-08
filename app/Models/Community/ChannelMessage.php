<?php

namespace App\Models\Community;

use Illuminate\Database\Eloquent\Model;

class ChannelMessage extends Model
{
    protected $table = 'channel_messages';
    public $timestamps = false;

    protected $fillable = ['channel_id', 'user_id', 'body', 'created_at'];

    protected function casts(): array
    {
        return ['created_at' => 'datetime'];
    }

    public function author() { return $this->belongsTo(\App\Models\User::class, 'user_id'); }
}
