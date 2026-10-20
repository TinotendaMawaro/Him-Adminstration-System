<?php

namespace App\Providers\Filament;

use App\Filament\Resources\EventRegistrationResource;
use App\Filament\Resources\EventResource;
use App\Filament\Resources\PartnerDirectoryResource;
use App\Filament\Widgets\Events;
use Filament\Navigation\NavigationGroup;
use Filament\Pages;
use Filament\Panel;
use Filament\PanelProvider;
use Filament\Support\Colors\Color;

/**
 * Events portal — manage events, registrations, check-in, the partner directory and statistics.
 * Master and Events roles only.
 */
class EventsPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        $panel = $panel
            ->id('events')
            ->path('events')
            ->colors([
                'primary' => Color::hex('#6d28d9'), // violet
                'warning' => Color::hex('#c9a84c'),
            ])
            ->navigationGroups([NavigationGroup::make('Events')])
            ->resources([
                EventResource::class,
                EventRegistrationResource::class,
                PartnerDirectoryResource::class,
            ])
            ->pages([Pages\Dashboard::class])
            ->widgets([
                Events\EventsStats::class,
                Events\RegistrationsPerEventChart::class,
                Events\RegistrationStatusChart::class,
                Events\RegistrationTrendChart::class,
                Events\UpcomingEventsTable::class,
            ]);

        return PortalDefaults::apply($panel, 'Heartfelt · Events', '#6d28d9');
    }
}
