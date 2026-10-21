<?php

namespace App\Mail;

use App\Models\Payment;

/** A payment that did not go through (online attempt failed) or whose receipt was voided. kinds: failed | voided */
class PaymentIssueMail extends BrandedMail
{
    public function __construct(public Payment $payment, public string $kind = 'failed')
    {
        parent::__construct();
    }

    protected function compose(): array
    {
        $p     = $this->payment->loadMissing('user');
        $first = trim(explode(' ', (string) $p->user?->name)[0]) ?: 'friend';
        $type  = $p->type->getLabel();
        $amount = "{$p->currency} " . number_format((float) $p->amount, 2);

        if ($this->kind === 'voided') {
            return [
                'subject'   => "Receipt {$p->receipt_number} has been voided",
                'preheader' => 'Our finance team voided one of your receipts.',
                'tone'      => 'warning',
                'title'     => 'Receipt voided',
                'greeting'  => "Dear {$first},",
                'intro'     => ["Our finance team has voided receipt {$p->receipt_number} for your {$type}. This means it no longer counts toward your giving records."],
                'facts'     => array_filter(['Receipt no.' => $p->receipt_number, 'Amount' => $amount, 'For' => $type, 'Voided' => self::localTime($p->voided_at)]),
                'cta'       => null,
                'notice'    => 'If you have questions about this, please reply or contact ' . config('mailing.support_email') . ' with the receipt number.',
                'outro'     => [],
            ];
        }

        return [
            'subject'   => 'Your online payment was not completed',
            'preheader' => 'No money was taken. You can try again any time.',
            'tone'      => 'danger',
            'title'     => 'Payment not completed',
            'greeting'  => "Dear {$first},",
            'intro'     => ["Your online {$type} of {$amount} did not go through, so no payment was recorded. If money left your account it will be returned by your provider."],
            'facts'     => array_filter(['For' => $type, 'Amount' => $amount, 'Reference' => $p->client_reference]),
            'cta'       => ['label' => 'Try again from my portal', 'url' => self::portalUrl()],
            'notice'    => 'If you were charged and see no receipt in your portal within a day, contact ' . config('mailing.support_email') . ' with the reference above.',
            'outro'     => [],
        ];
    }
}
