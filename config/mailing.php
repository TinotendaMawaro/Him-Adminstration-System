<?php

/**
 * Application-level email behaviour (transport lives in config/mail.php -> Resend).
 */
return [
    // Master switch: false stops every outgoing email (they are silently skipped, not queued).
    'enabled' => (bool) env('MAILING_ENABLED', true),

    'brand' => [
        'name'    => 'Heartfelt International Ministries',
        'short'   => 'Heartfelt',
        'tagline' => 'One family. One faith. One mission.',
        'navy'    => '#1e3a5f',
        'gold'    => '#c9a84c',
    ],

    // Times shown in emails (the server itself runs in UTC).
    'timezone' => env('MAIL_TIMEZONE', 'Africa/Harare'),

    // Where "Open my portal" buttons go. Blank = APP_URL.
    'portal_url'    => env('PORTAL_URL'),
    'support_email' => env('MAIL_SUPPORT_ADDRESS', 'support@heartfeltonline.org'),

    // Never email addresses on reserved/test domains (demo data, seeders, examples).
    'reserved_tlds'   => ['test', 'invalid', 'example', 'localhost', 'local'],
    'reserved_domains' => ['example.com', 'example.org', 'example.net'],
    // ...except Resend's own test inbox, which is safe by design.
    'always_allowed_domains' => ['resend.dev'],

    /*
     * In-app notifications are mirrored to email (a copy, not a replacement).
     */
    'notifications' => [
        'mirror'             => (bool) env('MAIL_MIRROR_NOTIFICATIONS', true),
        // Categories that are never emailed.
        // event_registration: EventRegistrationMail already covers it. 'Thank you for your gift': the receipt email does.
        'exclude_categories' => ['event_registration'],
        'exclude_titles'     => ['Thank you for your gift'],
        // Emailed without the message body (content stays inside the portal).
        'private_categories' => ['prayer_center'],
        // Same person + same title inside this window is emailed once (hourly reminders would otherwise flood).
        'dedupe_hours'       => 12,
        'max_per_user_per_day' => 20,
    ],

    // Svix signing secret from Resend (Webhooks -> your endpoint). Blank = webhook endpoint refuses requests.
    'webhook_secret' => env('RESEND_WEBHOOK_SECRET'),

    // Signed links (receipts, unsubscribe) stay valid this many days.
    'signed_link_days' => 30,
];
