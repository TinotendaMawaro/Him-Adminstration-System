<?php

namespace App\Mail;

use App\Models\Payment;
use Illuminate\Support\Facades\URL;

/** The receipt for a completed payment (counter or online). */
class PaymentReceiptMail extends BrandedMail
{
    public function __construct(public Payment $payment)
    {
        parent::__construct();
    }

    protected function compose(): array
    {
        $p = $this->payment->loadMissing(['user', 'zone.region', 'confirmedBy']);
        $first = trim(explode(' ', (string) $p->user?->name)[0]) ?: 'friend';
        $type  = $p->type->getLabel();

        $link = URL::temporarySignedRoute('receipts.signed', now()->addDays((int) config('mailing.signed_link_days', 30)), ['payment' => $p->id]);

        return [
            'subject'   => "Receipt {$p->receipt_number} — thank you for your " . strtolower($type),
            'preheader' => "We received your {$type} of {$p->currency} " . number_format((float) $p->amount, 2) . '.',
            'tone'      => 'success',
            'title'     => 'Thank you — payment received',
            'greeting'  => "Dear {$first},",
            'intro'     => ["We have received your {$type}. May God multiply it back to you. Here is your receipt:"],
            'facts'     => array_filter([
                'Receipt no.' => $p->receipt_number,
                'Amount'      => "{$p->currency} " . number_format((float) $p->amount, 2),
                'For'         => $type,
                'Method'      => $p->method?->getLabel(),
                'Date'        => self::localTime($p->paid_at ?? $p->created_at),
                'Zone'        => $p->zone ? trim($p->zone->name . ($p->zone->region ? ' · ' . $p->zone->region->name : '')) : null,
                'Reference'   => $p->client_reference ?: $p->reference,
            ]),
            'cta'       => ['label' => 'View & print receipt', 'url' => $link],
            'notice'    => null,
            'outro'     => ['Keep this email for your records. The link above works without signing in and expires in ' . config('mailing.signed_link_days', 30) . ' days.'],
        ];
    }
}
