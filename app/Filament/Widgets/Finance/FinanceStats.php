<?php

namespace App\Filament\Widgets\Finance;

use App\Enums\PaymentStatus;
use App\Filament\Support\GatedByRole;
use App\Filament\Support\Money;
use App\Services\StatsService;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Illuminate\Support\Facades\DB;

class FinanceStats extends StatsOverviewWidget
{
    use GatedByRole;

    protected static array $roles = ['master', 'finance'];
    protected static ?int $sort = 1;
    protected static ?string $pollingInterval = '60s';

    protected function getColumns(): int
    {
        return 4;
    }

    protected function getStats(): array
    {
        $s = app(StatsService::class);

        $today     = $s->income(now()->startOfDay(), now()->endOfDay());
        $month     = $s->income(now()->startOfMonth(), now()->endOfDay());
        $prev      = $s->income(now()->subMonthNoOverflow()->startOfMonth(), now()->subMonthNoOverflow()->endOfMonth());
        $ytd       = $s->income(now()->startOfYear(), now()->endOfDay());
        $change    = StatsService::change($month, $prev);

        $pending = DB::table('payments')->whereNull('deleted_at')->where('status', PaymentStatus::Pending->value)
            ->selectRaw('COUNT(*) as c, COALESCE(SUM(amount),0) as t')->first();

        $outstanding = DB::table('reports')->where('status', 'submitted')->where('remittance_submitted', 0)->count();

        $tithes    = $s->income(now()->startOfMonth(), now()->endOfDay(), 'tithe');
        $offerings = $s->income(now()->startOfMonth(), now()->endOfDay(), 'offering');
        $seeds     = $s->income(now()->startOfMonth(), now()->endOfDay(), 'seed');

        return [
            Stat::make('Received today', Money::fmt($today))->description('Receipted payments')->descriptionIcon('heroicon-m-receipt-percent')->color('success'),
            Stat::make('This month', Money::fmt($month))
                ->description($change === null ? 'New' : (($change >= 0 ? '+' : '') . $change . '% vs last month'))
                ->descriptionIcon($change !== null && $change < 0 ? 'heroicon-m-arrow-trending-down' : 'heroicon-m-arrow-trending-up')
                ->color($change !== null && $change < 0 ? 'danger' : 'success'),
            Stat::make('Year to date', Money::fmt($ytd))->description('All contribution types')->descriptionIcon('heroicon-m-banknotes')->color('primary'),
            Stat::make('Awaiting verification', (string) $pending->c)
                ->description(Money::fmt($pending->t) . ' pending confirmation')->descriptionIcon('heroicon-m-clock')->color($pending->c ? 'warning' : 'gray'),
            Stat::make('Tithes (month)', Money::fmt($tithes))->color('success'),
            Stat::make('Offerings (month)', Money::fmt($offerings))->color('info'),
            Stat::make('Seeds (month)', Money::fmt($seeds))->color('warning'),
            Stat::make('Remittances outstanding', (string) $outstanding)
                ->description('Zone reports submitted, remittance not yet sent')->descriptionIcon('heroicon-m-exclamation-triangle')->color($outstanding ? 'danger' : 'gray'),
        ];
    }
}
