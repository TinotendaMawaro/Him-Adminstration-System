<?php

/**
 * ClicknPay "PayMe" online payment gateway.
 *
 * The public unique IDs identify which ClicknPay account receives the money, so the
 * mapping from contribution type to account lives here and is enforced server-side:
 * the browser can never choose an account.
 */
return [
    'base_url' => env('PAYME_BASE_URL', 'https://backendservices.clicknpay.africa:2081'),

    // Only redirect customers to these hosts (guards against a tampered gateway response).
    'allowed_pay_hosts' => ['openapi.africa'],

    'currency' => env('PAYME_CURRENCY', 'USD'),

    // true = the customer pays the gateway fee on top; false = the church absorbs it.
    'customer_charged' => (bool) env('PAYME_CUSTOMER_CHARGED', true),

    'timeout'         => 20,
    'connect_timeout' => 8,

    'min_amount' => (float) env('PAYME_MIN_AMOUNT', 1),
    'max_amount' => (float) env('PAYME_MAX_AMOUNT', 20000),

    // How many unfinished online attempts one person may have open per hour.
    'max_open_per_hour' => 10,

    // Unpaid online attempts older than this many days are closed as abandoned.
    'abandon_after_days' => 7,

    // Where "Back to portal" points after a payment (defaults to the site root).
    'portal_url' => env('PAYME_PORTAL_URL'),

    /*
     * account key => ClicknPay public unique id + the contribution types it accepts.
     * Event registrations and other types have no online account, so they are not offered online.
     */
    'accounts' => [
        'giving' => [
            'public_id' => env('PAYME_GIVING_ID'),
            'types'     => ['tithe', 'offering', 'seed'],
        ],
        'partners' => [
            'public_id' => env('PAYME_PARTNER_ID'),
            'types'     => ['partnership'],
        ],
    ],
];
