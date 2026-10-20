<?php

namespace App\Providers\Filament;

use App\Filament\Pages\Finance\ContributionsLedger;
use App\Filament\Pages\Finance\Contributors;
use App\Filament\Resources\BankingDetailResource;
use App\Filament\Resources\PartnerResource;
use App\Filament\Resources\PaymentResource;
use App\Filament\Resources\ZoneReportResource;
use App\Filament\Widgets\Finance;
use App\Filament\Widgets\Master\IncomeByRegionChart;
use App\Filament\Widgets\Master\IncomeTrendChart;
use Filament\Navigation\NavigationGroup;
use Filament\Pages;
use Filament\Panel;
use Filament\PanelProvider;
use Filament\Support\Colors\Color;

/**
 * Finance portal — receipting, payment verification, automated giving lists and
 * zone remittance tracking. Master and Finance roles only.
 */
class FinancePanelProvider extends PanelProvider
{
    public function panel(Panel $panel): Panel
    {
        $panel = $panel
            ->id('finance')
            ->path('finance')
            ->colors([
                'primary' => Color::hex('#0f766e'), // deep teal
                'warning' => Color::hex('#c9a84c'),
            ])
            ->navigationGroups([NavigationGroup::make('Finance')])
            ->resources([
                PaymentResource::class,
                ZoneReportResource::class,
                PartnerResource::class,
                BankingDetailResource::class,
            ])
            ->pages([Pages\Dashboard::class, ContributionsLedger::class, Contributors::class])
            ->widgets([
                Finance\FinanceStats::class,
                IncomeTrendChart::class,
                IncomeByRegionChart::class,
                Finance\IncomeSplitChart::class,
                Finance\PendingPaymentsTable::class,
            ]);

        return PortalDefaults::apply($panel, 'Heartfelt · Finance', '#0f766e');
    }
}
