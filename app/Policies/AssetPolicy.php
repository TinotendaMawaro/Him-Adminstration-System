<?php

namespace App\Policies;

use App\Models\Asset;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class AssetPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->isPastor() || $user->isFinance() || $user->isMaster() || $user->isPartner() || $user->isMember();
    }

    public function view(User $user, Asset $asset): bool
    {
        if ($user->isPastor() && $user->zone_id) {
            return $asset->zone_id === $user->zone_id || ($asset->partner && $asset->partner->zone_id === $user->zone_id);
        }

        return $user->isFinance() || $user->isMaster() || $user->id === $asset->assigned_to_partner_id;
    }

    public function create(User $user): bool
    {
        return $user->isPastor() || $user->isFinance() || $user->isMaster();
    }

    public function update(User $user, Asset $asset): bool
    {
        return $user->isFinance() || $user->isMaster() || ($user->isPastor() && $user->zone_id && $asset->zone_id === $user->zone_id);
    }

    public function delete(User $user, Asset $asset): bool
    {
        return $user->isMaster() || $user->isFinance();
    }
}
