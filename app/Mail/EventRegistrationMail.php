<?php

namespace App\Mail;

use App\Models\EventRegistration;
use Illuminate\Mail\Mailables\Attachment;

/** Registration lifecycle for an event. kinds: registered | confirmed | cancelled | attended. Includes a calendar invite when useful. */
class EventRegistrationMail extends BrandedMail
{
    public function __construct(public EventRegistration $registration, public string $kind = 'registered')
    {
        parent::__construct();
    }

    protected function compose(): array
    {
        $r     = $this->registration->loadMissing(['event', 'user']);
        $e     = $r->event;
        $first = trim(explode(' ', (string) $r->user?->name)[0]) ?: 'friend';
        $balance = max(0, (float) $r->amount_due - (float) $r->amount_paid);

        $facts = array_filter([
            'Event'     => $e->title,
            'When'      => self::localTime($e->starts_at, 'l, j M Y · H:i') . ($e->ends_at ? ' – ' . self::localTime($e->ends_at, 'H:i T') : ''),
            'Where'     => trim(($e->venue_name ?? '') . ($e->venue_address ? ', ' . $e->venue_address : '')) ?: null,
            'Reference' => $r->reference_number,
            'Fee'       => $r->amount_due > 0 ? '$' . number_format((float) $r->amount_due, 2) : null,
            'Paid'      => $r->amount_due > 0 ? '$' . number_format((float) $r->amount_paid, 2) : null,
            'Balance'   => $balance > 0 ? '$' . number_format($balance, 2) : null,
        ]);

        $copy = match ($this->kind) {
            'confirmed' => ['success', "You're confirmed for {$e->title}", "You're confirmed!", ["Your place at {$e->title} is confirmed. We can't wait to see you."]],
            'cancelled' => ['warning', "Your registration for {$e->title} was cancelled", 'Registration cancelled', ["Your registration for {$e->title} has been cancelled. If this is a mistake, you can register again while spaces remain."]],
            'attended'  => ['success', "Thank you for joining {$e->title}", 'Thank you for joining us', ["It was wonderful having you at {$e->title}. We pray it was a blessing to you."]],
            default     => ['info', "We received your registration for {$e->title}", 'Registration received', [$r->status?->value === 'confirmed'
                ? "You are registered for {$e->title}."
                : "Thank you for registering for {$e->title}. Our events team will confirm your place shortly."]],
        };
        [$tone, $subject, $title, $intro] = $copy;

        $cta = match ($this->kind) {
            'cancelled', 'attended' => ['label' => 'See upcoming events', 'url' => self::portalUrl()],
            default                 => ['label' => 'View my registration', 'url' => self::portalUrl()],
        };

        return [
            'subject'   => $subject,
            'preheader' => self::localTime($e->starts_at, 'l, j M · H:i') . ($e->venue_name ? ' · ' . $e->venue_name : ''),
            'tone'      => $tone,
            'title'     => $title,
            'greeting'  => "Dear {$first},",
            'intro'     => $intro,
            'facts'     => in_array($this->kind, ['attended'], true) ? [] : $facts,
            'cta'       => $cta,
            'notice'    => ($balance > 0 && in_array($this->kind, ['registered', 'confirmed'], true))
                ? 'A balance of $' . number_format($balance, 2) . ' is still due. You can pay it online any time from your portal using the Give button (choose Events & conferences), or at the event desk.'
                : null,
            'outro'     => in_array($this->kind, ['registered', 'confirmed'], true) ? ['A calendar invite is attached so you can add it to your phone in one tap.'] : [],
        ];
    }

    public function attachments(): array
    {
        if (!in_array($this->kind, ['registered', 'confirmed'], true)) {
            return [];
        }

        $e = $this->registration->loadMissing('event')->event;
        if (!$e?->starts_at) {
            return [];
        }

        $fmt   = fn ($d) => $d->copy()->utc()->format('Ymd\THis\Z');
        $esc   = fn (?string $s) => str_replace(["\\", ';', ',', "\n"], ["\\\\", '\;', '\,', '\n'], (string) $s);
        $end   = $e->ends_at ?? $e->starts_at->copy()->addHours(2);
        $ics   = implode("\r\n", [
            'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Heartfelt International Ministries//Events//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
            'BEGIN:VEVENT',
            'UID:event-' . $e->id . '-reg-' . $this->registration->id . '@heartfelt',
            'DTSTAMP:' . $fmt(now()),
            'DTSTART:' . $fmt($e->starts_at),
            'DTEND:' . $fmt($end),
            'SUMMARY:' . $esc($e->title),
            'LOCATION:' . $esc(trim(($e->venue_name ?? '') . ($e->venue_address ? ', ' . $e->venue_address : ''))),
            'DESCRIPTION:' . $esc('Registration ref ' . $this->registration->reference_number),
            'END:VEVENT', 'END:VCALENDAR',
        ]) . "\r\n";

        return [Attachment::fromData(fn () => $ics, 'event-' . $e->id . '.ics')->withMime('text/calendar')];
    }
}
