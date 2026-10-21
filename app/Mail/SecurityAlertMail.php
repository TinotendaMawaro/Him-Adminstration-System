<?php

namespace App\Mail;

use App\Models\User;

/**
 * Security-sensitive account events. Never optional.
 * kinds: password_changed | email_changed_old | email_changed_new
 */
class SecurityAlertMail extends BrandedMail
{
    public function __construct(
        public User $user,
        public string $kind,
        public ?string $otherEmail = null,   // the new address (for _old) or the previous one (for _new)
        public ?string $ip = null,
        public ?string $device = null,
    ) {
        parent::__construct();
    }

    protected function compose(): array
    {
        $first = trim(explode(' ', $this->user->name)[0]) ?: 'there';
        $when  = self::localTime(now(), 'D j M Y, H:i T');

        $facts = array_filter(['When' => $when, 'IP address' => $this->ip, 'Device' => $this->device]);

        return match ($this->kind) {
            'email_changed_old' => [
                'subject'   => 'Your sign-in email was changed',
                'preheader' => 'The email address on your account was changed.',
                'tone'      => 'warning',
                'title'     => 'Sign-in email changed',
                'greeting'  => "Hello {$first},",
                'intro'     => ["The email address on your account was changed to {$this->otherEmail}. From now on, messages and sign-in will use the new address."],
                'facts'     => $facts,
                'cta'       => null,
                'notice'    => 'Wasn\'t you? Contact ' . config('mailing.support_email') . ' immediately so we can secure your account.',
                'outro'     => [],
            ],
            'email_changed_new' => [
                'subject'   => 'This is now your ' . config('mailing.brand.short') . ' email address',
                'preheader' => 'Your account email address was updated.',
                'tone'      => 'info',
                'title'     => 'Email address confirmed',
                'greeting'  => "Hello {$first},",
                'intro'     => ['This address is now the one on your account' . ($this->otherEmail ? " (replacing {$this->otherEmail})" : '') . '. We will send receipts and important updates here.'],
                'facts'     => $facts,
                'cta'       => ['label' => 'Open my portal', 'url' => self::portalUrl()],
                'notice'    => null,
                'outro'     => [],
            ],
            default => [
                'subject'   => 'Your password was changed',
                'preheader' => 'The password on your account was just changed.',
                'tone'      => 'warning',
                'title'     => 'Password changed',
                'greeting'  => "Hello {$first},",
                'intro'     => ['The password on your account was just changed. If this was you, there is nothing more to do.'],
                'facts'     => $facts,
                'cta'       => null,
                'notice'    => 'Wasn\'t you? Reset your password straight away from the sign-in page ("Forgot password?") and contact ' . config('mailing.support_email') . '.',
                'outro'     => [],
            ],
        };
    }
}
