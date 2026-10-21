<?php

namespace App\Mail;

use App\Models\User;

/**
 * "These details on your account were changed." $changes is a list of [label, from, to].
 */
class AccountChangedMail extends BrandedMail
{
    /** @param array<int, array{0:string,1:?string,2:?string}> $changes */
    public function __construct(public User $user, public array $changes, public ?string $changedBy = null)
    {
        parent::__construct();
    }

    protected function compose(): array
    {
        $first = trim(explode(' ', $this->user->name)[0]) ?: 'there';

        $facts = [];
        $deactivated = $reactivated = false;
        foreach ($this->changes as [$label, $from, $to]) {
            $facts[$label] = ($from !== null && $from !== '' ? "{$from}  →  " : '') . ($to !== null && $to !== '' ? $to : 'removed');
            if ($label === 'Account status') {
                $deactivated = $to === 'Deactivated';
                $reactivated = $to === 'Active';
            }
        }

        return [
            'subject'   => $deactivated ? 'Your account has been deactivated' : ($reactivated ? 'Your account has been reactivated' : 'Your account details were updated'),
            'preheader' => 'A change was made to your ' . config('mailing.brand.short') . ' account.',
            'tone'      => $deactivated ? 'warning' : 'info',
            'title'     => $deactivated ? 'Account deactivated' : ($reactivated ? 'Welcome back — account reactivated' : 'Your account was updated'),
            'greeting'  => "Hello {$first},",
            'intro'     => [$this->changedBy
                ? "{$this->changedBy} updated the following on your account:"
                : 'The following was updated on your account:'],
            'facts'     => $facts,
            'cta'       => $deactivated ? null : ['label' => 'Review my account', 'url' => self::portalUrl()],
            'notice'    => 'If you did not expect this change, please contact us straight away at ' . config('mailing.support_email') . '.',
            'outro'     => [],
        ];
    }
}
