<?php

namespace App\Support;

use App\Models\User;

/**
 * Decides whether an email may be sent at all. The single place that keeps seeders, demo data,
 * opted-out and bouncing addresses from ever reaching Resend.
 */
class EmailGate
{
    private static int $silenced = 0;

    /** Run a block (e.g. a seeder) without sending any email. Nestable. */
    public static function silence(callable $callback): mixed
    {
        self::$silenced++;
        try {
            return $callback();
        } finally {
            self::$silenced--;
        }
    }

    public static function isSilenced(): bool
    {
        if (self::$silenced > 0) {
            return true;
        }

        // Belt and braces: `php artisan db:seed --class=Anything` must never email real addresses either.
        if (app()->runningInConsole()) {
            $argv = implode(' ', $_SERVER['argv'] ?? []);

            return str_contains($argv, 'db:seed') || (str_contains($argv, 'migrate:fresh') && str_contains($argv, '--seed'));
        }

        return false;
    }

    /** A real, routable address (not a reserved/test domain such as demo.heartfelt.test or example.com). */
    public static function deliverable(?string $email): bool
    {
        if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return false;
        }

        $domain = strtolower(substr(strrchr($email, '@'), 1));

        foreach ((array) config('mailing.always_allowed_domains') as $allowed) {
            if ($domain === $allowed || str_ends_with($domain, '.' . $allowed)) {
                return true;
            }
        }

        if (in_array($domain, (array) config('mailing.reserved_domains'), true)) {
            return false;
        }

        $tld = substr(strrchr($domain, '.') ?: ".{$domain}", 1);

        return !in_array($tld, (array) config('mailing.reserved_tlds'), true);
    }

    /**
     * @return string|null  null when sending is allowed, otherwise the reason it is not:
     *                      disabled | silenced | undeliverable | suppressed | opted_out
     */
    public static function check(?User $user, string $email, bool $optional): ?string
    {
        if (!config('mailing.enabled')) {
            return 'disabled';
        }
        if (self::isSilenced()) {
            return 'silenced';
        }
        if (!self::deliverable($email)) {
            return 'undeliverable';
        }
        if ($user?->email_suppressed_at) {
            return 'suppressed';       // hard bounce or spam complaint: never email again until an admin clears it
        }
        if ($optional && $user && $user->email_notifications === false) {
            return 'opted_out';
        }

        return null;
    }
}
