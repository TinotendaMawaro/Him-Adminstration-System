<?php

namespace App\Policies;

use App\Models\User;

class EventPolicy
{
    public function viewAny(User $user): bool
    {
        // All authenticated users can browse published events
        return true;
    }

    public function view(User $user, \App\Models\Event $event): bool
    {
        if ($event->is_public) return true;
        return $user->hasAnyRole(['master', 'event', 'finance', 'hod']);
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['master', 'event']);
    }

    public function update(User $user, \App\Models\Event $event): bool
    {
        if ($user->isMaster()) return true;
        if ($user->isEventRole()) return $event->created_by === $user->id;
        return false;
    }

    public function delete(User $user, \App\Models\Event $event): bool
    {
        return $user->isMaster();
    }

    public function manageRegistrations(User $user, \App\Models\Event $event): bool
    {
        if ($user->isMaster()) return true;
        if ($user->isEventRole()) return $event->created_by === $user->id;
        return false;
    }
}
