<?php

namespace App\Filament\Widgets\Master;

use App\Services\Community\ModerationService;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

/** The community at a glance, on the master dashboard. */
class CommunityStats extends StatsOverviewWidget
{
    protected static ?int $sort = 3;
    protected ?string $heading = 'Community & marketplace';

    public static function canView(): bool
    {
        return auth()->user()?->isMaster() ?? false;
    }

    protected function getStats(): array
    {
        $s = app(ModerationService::class)->stats();

        return [
            Stat::make('Posts today', number_format($s['posts_today']))->description("{$s['posts_week']} this week · {$s['active_people']} people posting")->icon('heroicon-o-chat-bubble-left-right')->color('primary'),
            Stat::make('Open reports', number_format($s['open_reports']))->description($s['open_reports'] ? 'Waiting for review' : 'All clear')->icon('heroicon-o-flag')->color($s['open_reports'] ? 'danger' : 'success'),
            Stat::make('Channels', number_format($s['channels']))->description("{$s['live_now']} live now")->icon('heroicon-o-user-group')->color('info'),
            Stat::make('Marketplace', number_format($s['listings']) . ' listings')->description("{$s['orders_week']} orders this week")->icon('heroicon-o-shopping-bag')->color('warning'),
        ];
    }
}
