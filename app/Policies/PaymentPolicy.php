<?php

namespace App\Policies;

use App\Models\Payment;
use App\Models\User;

class PaymentPolicy
{
    /** Master and Finance can see all payments */
    public function viewAny(User $user): bool
    {
        return $user->hasAnyRole(['master', 'finance']);
    }

    /** Event role can only see payments linked to an event registration */
    public function view(User $user, Payment $payment): bool
    {
        if ($user->isMaster() || $user->isFinance()) return true;
        if ($user->isEventRole()) return $payment->event_registration_id !== null;
        return $payment->user_id === $user->id;
    }

    public function create(User $user): bool
    {
        return $user->hasAnyRole(['master', 'finance']) || $user->isPartner() || $user->isMember();
    }

    public function update(User $user, Payment $payment): bool
    {
        return $user->hasAnyRole(['master', 'finance']);
    }

    public function delete(User $user, Payment $payment): bool
    {
        return $user->isMaster();
    }
}
