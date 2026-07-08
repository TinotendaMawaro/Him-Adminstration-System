<?php

namespace App\Enums;

enum PrayerMessageStatus: string
{
    case Pending            = 'pending';
    case Approved           = 'approved';
    case Flagged            = 'flagged';
    case Rejected           = 'rejected';
    case InProgress         = 'in_progress';
    case Resolved           = 'resolved';
    case TestimonyApproved  = 'testimony_approved';

    public function label(): string
    {
        return match($this) {
            self::Pending            => 'Pending',
            self::Approved           => 'Approved',
            self::Flagged            => 'Flagged for Review',
            self::Rejected           => 'Rejected',
            self::InProgress         => 'In Progress',
            self::Resolved           => 'Resolved',
            self::TestimonyApproved  => 'Approved for Sharing',
        };
    }

    public function color(): string
    {
        return match($this) {
            self::Pending            => 'amber',
            self::Approved           => 'emerald',
            self::Flagged            => 'red',
            self::Rejected           => 'gray',
            self::InProgress         => 'sky',
            self::Resolved           => 'green',
            self::TestimonyApproved  => 'purple',
        };
    }
}
