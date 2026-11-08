<?php

/**
 * Sign-in policy for the member / pastor / partner / HOD portals.
 */
return [
    /*
     * Pastors sign in with a pastor code (e.g. R0101P01). Codes follow a fixed pattern and are therefore GUESSABLE, so a
     * code alone is a weak credential. Turn this on to require the pastor's password as well.
     * Pastors set or reset their password with "Forgot password" (using the email on their account).
     */
    'pastor_password_required' => (bool) env('AUTH_PASTOR_PASSWORD_REQUIRED', false),

    // Brute-force protection (counted per account and per IP address).
    'max_failures_per_account' => 8,      // email sign-in: failures before a lockout
    'max_failures_per_ip'      => 20,
    'lockout_seconds'          => 900,    // 15 minutes
    'code_failures_per_ip'     => 6,      // pastor-code sign-in: unknown/wrong codes per IP before a lockout

    // A person keeps at most this many signed-in devices; the oldest sessions are signed out.
    'max_tokens_per_user' => 5,

    // Secret the hosting platform's cron sends (Authorization: Bearer ...) to run the scheduled jobs on serverless hosting.
    'cron_secret' => env('CRON_SECRET'),

    // Where staff are sent if they try the member sign-in by mistake.
    'staff_portals' => [
        'master'  => '/admin',
        'finance' => '/finance',
        'event'   => '/events',
    ],
];
