<?php

namespace App\Policies;

use App\Models\User;

class PartnerPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['master', 'finance', 'pastor']);
    }

    public function view(User $user, \App\Models\Partner $partner): bool
    {
        if ($user->isMaster() || $user->isFinance()) return true;
        if ($user->isPastor()) return $partner->zone_id === $user->zone_id;
        return $partner->user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['master', 'finance']);
    }

    public function update(User $user, \App\Models\Partner $partner): bool
    {
        if ($user->isMaster() || $user->isFinance()) return true;
        return $partner->user_id === $user->id;
    }

    public function delete(User $user, \App\Models\Partner $partner): bool
    {
        return $user->isMaster();
    }
}
