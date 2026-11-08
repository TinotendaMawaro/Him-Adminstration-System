<?php

namespace App\Providers\Filament;

use App\Filament\Widgets\Master;
use Filament\Navigation\NavigationGroup;
use Filament\Pages;
use Filament\Panel;
use Filament\PanelProvider;
use Filament\Support\Colors\Color;

/**
 * Master console — full control of the whole system: people, structure, finance,
 * events and statistics. Only users with the `master` role can enter.
 */
class AdminPanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        $panel = $panel
            ->default()
            ->id('admin')
            ->path('admin')
            ->colors([
                'primary' => Color::hex('#1e3a5f'), // deep navy
                'warning' => Color::hex('#c9a84c'), // gold
            ])
            ->navigationGroups([
                NavigationGroup::make('Church Management'),
                NavigationGroup::make('Community'),
                NavigationGroup::make('Finance')->collapsed(),
                NavigationGroup::make('Events')->collapsed(),
                NavigationGroup::make('Reports'),
                NavigationGroup::make('System Management')->collapsed(),
            ])
            ->discoverResources(in: app_path('Filament/Resources'), for: 'App\\Filament\\Resources')
            ->discoverPages(in: app_path('Filament/Pages/Master'), for: 'App\\Filament\\Pages\\Master')
            ->discoverPages(in: app_path('Filament/Pages/Finance'), for: 'App\\Filament\\Pages\\Finance')
            ->pages([Pages\Dashboard::class])
            ->widgets([
                Master\MasterStats::class,
                Master\MemberGrowthChart::class,
                Master\IncomeTrendChart::class,
                Master\IncomeByRegionChart::class,
                Master\MembersByRegionChart::class,
                Master\PastorsByRegionChart::class,
                Master\AttendanceTrendChart::class,
                Master\ZoneLeaderboard::class,
                Master\CommunityStats::class,
            ]);

        return PortalDefaults::apply($panel, 'Heartfelt · Master', '#c9a84c');
    }
}
