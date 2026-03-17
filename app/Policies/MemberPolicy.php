<?php

namespace App\Policies;

use App\Models\User;

class MemberPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['master', 'hod', 'pastor']);
    }

    public function view(User $user, \App\Models\Member $member): bool
    {
        if ($user->isMaster()) return true;
        if ($user->isPastor())  return $member->zone_id === $user->zone_id;
        if ($user->isHOD())     return $member->department_id === $user->department_id;
        return $member->user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['master', 'pastor']);
    }

    public function update(User $user, \App\Models\Member $member): bool
    {
        if ($user->isMaster()) return true;
        if ($user->isPastor())  return $member->zone_id === $user->zone_id;
        return $member->user_id === $user->id;
    }

    public function delete(User $user, \App\Models\Member $member): bool
    {
        return $user->isMaster();
    }
}
