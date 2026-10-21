<?php

namespace App\Mail;

use App\Models\User;

/** "Reset your password" — used by the staff portals (Filament) and the member portals. Never optional. */
class ResetPasswordMail extends BrandedMail
{
    public function __construct(public User $user, public string $url, public int $minutes = 60)
    {
        parent::__construct();
        $this->to($user->email, $user->name);   // also lets Laravel's notification mail channel send this directly
        $this->recipientEmail  = $user->email;
        $this->recipientUserId = $user->id;
    }

    protected function compose(): array
    {
        $first = trim(explode(' ', $this->user->name)[0]) ?: 'there';

        return [
            'subject'   => 'Reset your password',
            'preheader' => 'Use this secure link to choose a new password.',
            'tone'      => 'info',
            'title'     => 'Reset your password',
            'greeting'  => "Hello {$first},",
            'intro'     => ['We received a request to reset the password on your account. Choose "Reset my password" to set a new one.'],
            'facts'     => [],
            'cta'       => ['label' => 'Reset my password', 'url' => $this->url],
            'notice'    => "This link expires in {$this->minutes} minutes and can be used once. If you did not ask for it, you can ignore this email — your password will not change.",
            'outro'     => [],
        ];
    }
}
