<?php

namespace App\Mail;

use App\Models\Notification;

/** An email copy of an in-app notification. Optional: people can switch these copies off. */
class NotificationMail extends BrandedMail
{
    public function __construct(public Notification $notification)
    {
        parent::__construct();
    }

    public function optional(): bool
    {
        return true;
    }

    /** The notification's title without its leading emoji, so it reads cleanly as a subject in every inbox. */
    public static function headline(Notification $n): string
    {
        return trim(preg_replace('/^[^\p{L}\p{N}]+/u', '', (string) $n->title)) ?: (string) $n->title;
    }

    protected function compose(): array
    {
        $n       = $this->notification->loadMissing('user');
        $first   = trim(explode(' ', (string) $n->user?->name)[0]) ?: 'there';
        $private = in_array($n->category, (array) config('mailing.notifications.private_categories'), true);

        $title = self::headline($n);

        return [
            'subject'   => $title,
            'preheader' => $private ? 'You have a new update in your portal.' : \Illuminate\Support\Str::limit(strip_tags((string) $n->message), 110),
            'tone'      => match ($n->type) { 'success' => 'success', 'warning' => 'warning', 'error', 'danger' => 'danger', default => 'info' },
            'title'     => $title,
            'greeting'  => "Hello {$first},",
            'intro'     => [$private
                ? 'You have a new update. For your privacy, the details stay inside your portal — sign in to read it.'
                : strip_tags((string) $n->message)],
            'facts'     => [],
            'cta'       => ['label' => 'Open my portal', 'url' => self::portalUrl()],
            'notice'    => null,
            'outro'     => [],
        ];
    }
}
