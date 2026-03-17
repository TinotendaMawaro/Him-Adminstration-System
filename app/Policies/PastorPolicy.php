<?php

namespace App\Policies;

use App\Models\User;

class PastorPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['master', 'finance']);
    }

    public function view(User $user, \App\Models\Pastor $pastor): bool
    {
        return $user->isMaster() || $pastor->user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return $user->isMaster();
    }

    public function update(User $user, \App\Models\Pastor $pastor): bool
    {
        if ($user->isMaster()) return true;
        return $pastor->user_id === $user->id;
    }

    public function delete(User $user, \App\Models\Pastor $pastor): bool
    {
        return $user->isMaster();
    }
}
