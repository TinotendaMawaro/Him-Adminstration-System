<?php

namespace App\Filament\Widgets\Events;

use App\Filament\Support\GatedByRole;
use App\Filament\Support\Money;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;
use Illuminate\Support\Facades\DB;

class EventsStats extends StatsOverviewWidget
{
    use GatedByRole;

    protected static array $roles = ['master', 'event'];
    protected static ?int $sort = 1;
    protected static ?string $pollingInterval = '60s';

    protected function getColumns(): int
    {
        return 4;
    }

    protected function getStats(): array
    {
        $events = DB::table('events')->whereNull('deleted_at');

        $upcoming  = (clone $events)->where('status', 'published')->where('starts_at', '>', now())->count();
        $drafts    = (clone $events)->where('status', 'draft')->count();
        $thisMonth = (clone $events)->where('status', '!=', 'cancelled')->whereBetween('starts_at', [now()->startOfMonth(), now()->endOfMonth()])->count();

        $reg = DB::table('event_registrations as er')->join('events as e', 'e.id', '=', 'er.event_id')->whereNull('e.deleted_at');

        $activeRegs = (clone $reg)->where('er.status', '!=', 'cancelled')->where('e.starts_at', '>', now())->count();
        $pending    = (clone $reg)->where('er.status', 'pending')->count();

        // Attendance rate across events that have already happened.
        $past      = (clone $reg)->where('e.starts_at', '<', now())->where('er.status', '!=', 'cancelled');
        $pastTotal = (clone $past)->count();
        $attended  = (clone $past)->where('er.status', 'attended')->count();
        $rate      = $pastTotal ? round($attended / $pastTotal * 100) : null;

        $collected = (float) DB::table('event_registrations as er')->join('events as e', 'e.id', '=', 'er.event_id')
            ->whereNull('e.deleted_at')->where('er.status', '!=', 'cancelled')->sum('er.amount_paid');
        $outstanding = (float) DB::table('event_registrations as er')->join('events as e', 'e.id', '=', 'er.event_id')
            ->whereNull('e.deleted_at')->where('er.status', '!=', 'cancelled')->selectRaw('COALESCE(SUM(GREATEST(er.amount_due - er.amount_paid, 0)),0) as o')->value('o');

        return [
            Stat::make('Upcoming events', (string) $upcoming)->description("$thisMonth this month · $drafts drafts")->descriptionIcon('heroicon-m-calendar-days')->color('primary'),
            Stat::make('Active registrations', number_format($activeRegs))->description('For upcoming events')->descriptionIcon('heroicon-m-ticket')->color('success'),
            Stat::make('Awaiting confirmation', (string) $pending)->description('Pending registrations')->descriptionIcon('heroicon-m-clock')->color($pending ? 'warning' : 'gray'),
            Stat::make('Attendance rate', $rate === null ? '—' : $rate . '%')->description('Of past event registrations')->descriptionIcon('heroicon-m-user-group')->color($rate !== null && $rate < 50 ? 'danger' : 'success'),
            Stat::make('Registration revenue', Money::fmt($collected))->description(Money::fmt($outstanding) . ' still owed')->descriptionIcon('heroicon-m-banknotes')->color('primary'),
        ];
    }
}
