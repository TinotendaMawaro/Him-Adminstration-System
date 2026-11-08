<?php

namespace App\Models\Community;

use Illuminate\Database\Eloquent\Model;

class ChannelMeeting extends Model
{
    protected $table = 'channel_meetings';

    protected $fillable = ['channel_id', 'created_by', 'title', 'description', 'starts_at', 'ends_at', 'mode', 'link_url', 'location', 'status', 'reminder_sent'];

    protected function casts(): array
    {
        return ['starts_at' => 'datetime', 'ends_at' => 'datetime', 'reminder_sent' => 'boolean'];
    }

    public function channel() { return $this->belongsTo(\App\Models\Community\Channel::class); }
    public function creator() { return $this->belongsTo(\App\Models\User::class, 'created_by'); }
    public function rsvps() { return $this->hasMany(\App\Models\Community\ChannelMeetingRsvp::class, 'meeting_id'); }
}
