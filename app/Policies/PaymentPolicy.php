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

    /** Only finance/master may record a payment as received. Members submit via /partners/me/payment (pending). */
    public function create(User $user): bool
    {
        return $user->hasAnyRole(['master', 'finance']);
    }

    /** Completed/voided payments are immutable financial records; correct them by voiding. */
    public function update(User $user, Payment $payment): bool
    {
        return $user->hasAnyRole(['master', 'finance']) && $payment->isPending();
    }

    public function confirm(User $user, Payment $payment): bool
    {
        return $user->hasAnyRole(['master', 'finance']) && $payment->isPending();
    }

    public function void(User $user, Payment $payment): bool
    {
        return $user->hasAnyRole(['master', 'finance']) && $payment->status !== \App\Enums\PaymentStatus::Voided;
    }

    /** Financial records are never deleted. */
    public function delete(User $user, Payment $payment): bool
    {
        return false;
    }

    public function restore(User $user, Payment $payment): bool
    {
        return false;
    }

    public function forceDelete(User $user, Payment $payment): bool
    {
        return false;
    }
}
