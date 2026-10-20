<?php

namespace App\Filament\Widgets\Master;

use App\Filament\Support\GatedByRole;
use App\Filament\Support\Money;
use App\Services\StatsService;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class MasterStats extends StatsOverviewWidget
{
    use GatedByRole;

    protected static array $roles = ['master'];
    protected static ?int $sort = 1;
    protected static ?string $pollingInterval = null;

    protected function getColumns(): int
    {
        return 4;
    }

    protected function getStats(): array
    {
        $s = app(StatsService::class);
        $k = $s->kpis();

        $growth  = $s->memberGrowth(12);
        $income  = $s->incomeByTypeMonthly(12);
        $monthly = collect($income['series'])->reduce(
            fn ($c, $series) => collect($series)->map(fn ($v, $i) => ($c[$i] ?? 0) + $v)->all(),
            []
        );

        $incomeChange = StatsService::change($k['income_month'], $k['income_prev']);
        $memberChange = StatsService::change($k['new_members'], $k['new_members_prev']);

        $trend = fn (?float $c) => $c === null ? ['New this month', 'heroicon-m-sparkles', 'success']
            : ($c >= 0 ? [($c > 0 ? '+' : '') . $c . '% vs last month', 'heroicon-m-arrow-trending-up', 'success']
                       : [$c . '% vs last month', 'heroicon-m-arrow-trending-down', 'danger']);

        [$iDesc, $iIcon, $iColor] = $trend($incomeChange);
        [$mDesc, $mIcon, $mColor] = $trend($memberChange);

        return [
            Stat::make('Active members', number_format($k['active_members']))
                ->description($k['new_members'] . ' joined this month · ' . $mDesc)->descriptionIcon($mIcon)->color($mColor)
                ->chart($growth['new']),
            Stat::make('Income this month', Money::fmt($k['income_month']))
                ->description($iDesc)->descriptionIcon($iIcon)->color($iColor)
                ->chart($monthly ?: [0]),
            Stat::make('Income year to date', Money::fmt($k['income_ytd']))
                ->description($k['pending_payments'] . ' payments awaiting verification')
                ->descriptionIcon('heroicon-m-clock')->color($k['pending_payments'] ? 'warning' : 'gray'),
            Stat::make('Active partners', number_format($k['active_partners']))
                ->description('Covenant partners')->descriptionIcon('heroicon-m-heart')->color('primary'),
            Stat::make('Pastors', number_format($k['pastors']))
                ->description('Across ' . $k['zones'] . ' zones')->descriptionIcon('heroicon-m-user-circle')->color('primary'),
            Stat::make('Zones', number_format($k['zones']))
                ->description($k['regions'] . ' regions')->descriptionIcon('heroicon-m-map')->color('gray'),
            Stat::make('Home groups', number_format($k['home_groups']))
                ->description('Cell communities')->descriptionIcon('heroicon-m-user-group')->color('gray'),
            Stat::make('New members (month)', number_format($k['new_members']))
                ->description($mDesc)->descriptionIcon($mIcon)->color($mColor),
        ];
    }
}
