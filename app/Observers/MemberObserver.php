<?php

namespace App\Observers;

use App\Models\Member;
use App\Models\User;
use App\Services\MilestoneDispatcher;
use App\Services\BadgeAwardService;

class MemberObserver
{
    public function __construct(
        protected MilestoneDispatcher $milestones,
        protected BadgeAwardService   $badges,
    ) {}

    public function saved(Member $member): void
    {
        \App\Support\PeopleSync::fromMember($member);

        // Track membership milestone
        if ($member->wasRecentlyCreated && $member->membership_date) {
            $this->milestones->dispatch('membership', $member->user, [
                'achieved_at' => $member->membership_date,
                'subtitle'    => $member->zone?->name ?? 'HIM',
            ]);
        }

        // Track baptism
        if ($member->is_baptised && $member->wasChanged('is_baptised')) {
            $this->milestones->dispatch('baptism', $member->user, [
                'subtitle' => 'A new life in Christ',
            ]);
        }
    }
}
