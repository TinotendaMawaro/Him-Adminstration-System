<?php

namespace App\Models\Community;

use Illuminate\Database\Eloquent\Model;

class LiveSession extends Model
{
    protected $table = 'community_live_sessions';

    protected $fillable = ['channel_id', 'host_id', 'title', 'description', 'url', 'video_id', 'scheduled_at', 'status', 'is_official', 'reminder_sent', 'reminders_count'];

    protected function casts(): array
    {
        return ['scheduled_at' => 'datetime', 'is_official' => 'boolean', 'reminder_sent' => 'boolean'];
    }

    public function host() { return $this->belongsTo(\App\Models\User::class, 'host_id'); }
    public function channel() { return $this->belongsTo(\App\Models\Community\Channel::class); }
}
