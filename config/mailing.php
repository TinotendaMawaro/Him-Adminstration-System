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

    /*
     * The logo shown at the top of every email. By default it is EMBEDDED in each message (shows in the
     * inbox with no hosting and no "load images" prompt). Set MAIL_LOGO_URL to use a hosted https image instead.
     */
    'logo' => [
        'path' => public_path('images/logo.jpeg'),
        'url'  => env('MAIL_LOGO_URL'),
        'alt'  => 'Heartfelt International Ministries',
    ],

    // Times shown in emails (the server itself runs in UTC).
    'timezone' => env('MAIL_TIMEZONE', 'Africa/Harare'),

    // Where "Open my portal" buttons go. Blank = APP_URL.
    'portal_url'    => env('PORTAL_URL'),
    'support_email' => env('MAIL_SUPPORT_ADDRESS', 'support@heartfeltonline.org'),

    // Test mode: when set, EVERY email is delivered to this one address instead of its real recipient (the intended
    // recipient is shown in the subject). Leave blank in production.
    'redirect_to' => env('MAIL_REDIRECT_TO'),

    // Never email addresses on reserved/test domains (demo data, seeders, examples).
    'reserved_tlds'   => ['test', 'invalid', 'example', 'localhost', 'local'],
    // heartfelt.church is only the placeholder domain on the seeded demo accounts (the ministry's own domain is heartfeltonline.org).
    'reserved_domains' => ['example.com', 'example.org', 'example.net', 'heartfelt.church'],
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
        'exclude_titles'     => ['Thank you for your gift', 'Registration payment received'],
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
