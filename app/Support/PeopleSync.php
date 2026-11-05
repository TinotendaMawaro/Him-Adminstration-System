<?php

namespace App\Support;

use App\Models\Member;
use App\Models\User;

/**
 * A person's zone, home group, department and date of birth live on BOTH their login account and their member
 * record (different portals read different ones). Whichever side is edited, the other follows, so they can never
 * drift apart. Uses plain queries on purpose: no model events, so the two sides cannot trigger each other in a loop.
 */
class PeopleSync
{
    private const SHARED = ['zone_id', 'home_group_id', 'department_id', 'date_of_birth'];

    public static function fromUser(User $user): void
    {
        $changes = array_intersect_key($user->getChanges(), array_flip(self::SHARED));

        if ($changes && $user->role->value !== 'pastor') {
            Member::where('user_id', $user->id)->update($changes);
        }
    }

    public static function fromMember(Member $member): void
    {
        $changes = array_intersect_key($member->getChanges(), array_flip(self::SHARED));

        if ($changes && $member->user_id) {
            User::whereKey($member->user_id)->update($changes);
        }
    }
}
