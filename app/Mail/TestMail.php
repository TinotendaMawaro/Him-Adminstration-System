<?php

namespace App\Mail;

/** Sent from the Master portal / `mail:preview` to prove delivery works end to end. */
class TestMail extends BrandedMail
{
    public function __construct(public string $sentBy = 'the system')
    {
        parent::__construct();
    }

    protected function compose(): array
    {
        return [
            'subject'   => 'Email delivery test',
            'preheader' => 'If you can read this, email delivery is working.',
            'tone'      => 'success',
            'title'     => 'Email is working',
            'greeting'  => null,
            'intro'     => ['This is a test message from ' . config('mailing.brand.name') . '. If you are reading it, the connection to the email provider is healthy.'],
            'facts'     => ['Sent by' => $this->sentBy, 'Sent at' => self::localTime(now(), 'j M Y, H:i:s T'), 'Mailer' => (string) config('mail.default'), 'From' => config('mail.from.address')],
            'cta'       => ['label' => 'Open the portal', 'url' => self::portalUrl()],
            'notice'    => null,
            'outro'     => [],
        ];
    }
}
