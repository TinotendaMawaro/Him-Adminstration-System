<?php

/*
 | Cross-origin access to the API. The web app runs on the same origin as the API, so it needs none of this. The NATIVE
 | apps (Capacitor: https://localhost on Android, capacitor://localhost on iOS) call the API from their own origin, so
 | those are allowed. Add more with CORS_ALLOWED_ORIGINS (comma separated). Tokens travel in the Authorization header,
 | never in cookies, so credentials are not shared across origins.
*/
return [
    'paths' => ['api/*'],
    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    'allowed_origins' => array_values(array_filter(array_merge(
        ['https://localhost', 'capacitor://localhost', 'ionic://localhost', 'http://localhost'],
        array_map('trim', explode(',', (string) env('CORS_ALLOWED_ORIGINS', ''))),
    ))),
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['Authorization', 'Content-Type', 'Accept', 'X-Requested-With'],
    'exposed_headers' => ['Retry-After'],
    'max_age' => 600,
    'supports_credentials' => false,
];
