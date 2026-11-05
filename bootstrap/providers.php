<?php

// The three Filament staff panels (Master, Finance, Events) are only needed for their own pages. Booting them on every
// JSON API call (login, notifications, the React portals' polling...) cost seconds, so they are skipped for /api/*.
$apiRequest = PHP_SAPI !== 'cli'
    && str_starts_with((string) parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH), '/api/');

return array_values(array_filter([
    App\Providers\AppServiceProvider::class,
    $apiRequest ? null : App\Providers\Filament\AdminPanelProvider::class,
    $apiRequest ? null : App\Providers\Filament\EventsPanelProvider::class,
    $apiRequest ? null : App\Providers\Filament\FinancePanelProvider::class,
]));
