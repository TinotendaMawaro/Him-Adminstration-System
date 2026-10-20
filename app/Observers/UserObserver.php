<?php

namespace App\Observers;

use App\Models\User;
use App\Services\BadgeAwardService;
use App\Services\MilestoneDispatcher;

class UserObserver
{
    public function __construct(
        protected MilestoneDispatcher $milestones,
        protected BadgeAwardService   $badges,
    ) {}

    public function saved(User $user): void
    {
        if (!$user->member) {
            return;
        }

        // First home group
        if ($user->wasChanged('home_group_id') && $user->home_group_id) {
            $this->badges->awardIfEligible($user, 'first_homegroup');
            $this->milestones->dispatch('leadership', $user, [
                'title' => 'Joined a Home Group',
            ]);
        }

        // First department
        if ($user->wasChanged('department_id') && $user->department_id) {
            $this->badges->awardIfEligible($user, 'first_department');
        }
    }
}
