<?php

namespace App\Filament\Widgets\Events;

use App\Filament\Support\GatedByRole;
use App\Filament\Support\Palette;
use App\Services\StatsService;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Facades\DB;

class RegistrationTrendChart extends ChartWidget
{
    use GatedByRole;

    protected static array $roles = ['master', 'event'];
    protected static ?string $heading = 'Registrations per month';
    protected static ?int $sort = 4;
    protected static ?string $maxHeight = '300px';
    protected int|string|array $columnSpan = 2;

    protected function getType(): string
    {
        return 'line';
    }

    protected function getData(): array
    {
        $months = app(StatsService::class)->monthStarts(12);
        $rows = DB::table('event_registrations')->where('created_at', '>=', $months->first())
            ->selectRaw("DATE_FORMAT(created_at, '%Y-%m') as m, COUNT(*) as c")->groupBy('m')->pluck('c', 'm');

        return [
            'labels'   => $months->map->format('M Y')->all(),
            'datasets' => [[
                'label'           => 'Registrations',
                'data'            => $months->map(fn ($m) => (int) ($rows[$m->format('Y-m')] ?? 0))->all(),
                'borderColor'     => Palette::at(3),
                'backgroundColor' => Palette::alpha(Palette::at(3), .12),
                'fill'            => true,
                'tension'         => .35,
            ]],
        ];
    }

    protected function getOptions(): array
    {
        return ['plugins' => ['legend' => ['display' => false]], 'scales' => ['y' => ['beginAtZero' => true, 'ticks' => ['precision' => 0]]]];
    }
}
