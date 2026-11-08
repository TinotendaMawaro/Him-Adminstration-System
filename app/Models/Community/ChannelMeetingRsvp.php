<?php

namespace App\Models\Community;

use Illuminate\Database\Eloquent\Model;

class ChannelMeetingRsvp extends Model
{
    protected $table = 'channel_meeting_rsvps';

    protected $fillable = ['meeting_id', 'user_id', 'status'];

}
