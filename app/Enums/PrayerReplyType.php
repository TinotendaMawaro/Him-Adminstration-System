<?php

namespace App\Enums;

enum PrayerReplyType: string
{
    case PastorReply     = 'pastor_reply';
    case MemberFollowup  = 'member_followup';
    case SystemNote      = 'system_note';

    public function label(): string
    {
        return match($this) {
            self::PastorReply    => 'Pastor Reply',
            self::MemberFollowup => 'Member Follow-up',
            self::SystemNote     => 'System Note',
        };
    }
}
