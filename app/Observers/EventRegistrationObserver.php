<?php

namespace App\Observers;

use App\Mail\EventRegistrationMail;
use App\Models\EventRegistration;
use App\Support\Mailing;

/** Emails the attendee at each step of a registration: received, confirmed, cancelled, attended. */
class EventRegistrationObserver
{
    public function created(EventRegistration $registration): void
    {
        $this->send($registration, $registration->status?->value === 'confirmed' ? 'confirmed' : 'registered');
    }

    public function updated(EventRegistration $registration): void
    {
        if (!$registration->wasChanged('status')) {
            return;
        }

        $kind = match ($registration->status?->value) {
            'confirmed' => 'confirmed',
            'cancelled' => 'cancelled',
            'attended'  => 'attended',
            default     => null,
        };

        $kind && $this->send($registration, $kind);
    }

    private function send(EventRegistration $registration, string $kind): void
    {
        if ($registration->user) {
            Mailing::to($registration->user, new EventRegistrationMail($registration, $kind));
        }
    }
}
