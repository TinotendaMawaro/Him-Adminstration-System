<?php

namespace App\Observers;

use App\Mail\NotificationMail;
use App\Models\EmailLog;
use App\Models\Notification;
use App\Support\Mailing;

/**
 * Mirrors in-app notifications to email — as a copy, with guard rails:
 * categories can be excluded or kept private, repeats inside a window are sent once, and one person
 * can only receive so many copies a day (so an hourly reminder job can never flood an inbox).
 */
class NotificationObserver
{
    private static bool $emailOff = false;

    /** Create notifications inside the callback WITHOUT their email copy (in-app only). */
    public static function withoutEmail(callable $callback): mixed
    {
        $previous = self::$emailOff;
        self::$emailOff = true;
        try {
            return $callback();
        } finally {
            self::$emailOff = $previous;
        }
    }

    public function created(Notification $notification): void
    {
        if (self::$emailOff) {
            return;
        }

        $cfg = config('mailing.notifications');

        if (!$cfg['mirror'] || !$notification->user || !$notification->user->is_active) {
            return;
        }

        if (in_array($notification->category, (array) $cfg['exclude_categories'], true)
            || in_array($notification->title, (array) ($cfg['exclude_titles'] ?? []), true)) {
            return;
        }

        $subject = NotificationMail::headline($notification);

        $recent = EmailLog::where('user_id', $notification->user_id)->where('template', 'notification');

        $duplicate = (clone $recent)->where('subject', $subject)->where('created_at', '>=', now()->subHours((int) $cfg['dedupe_hours']))->exists();
        if ($duplicate) {
            return;
        }

        if ((clone $recent)->where('created_at', '>=', now()->subDay())->count() >= (int) $cfg['max_per_user_per_day']) {
            return;
        }

        Mailing::to($notification->user, new NotificationMail($notification));
    }
}
