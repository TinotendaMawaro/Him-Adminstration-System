<?php

namespace App\Filament\Widgets\Master;

use App\Filament\Support\GatedByRole;
use App\Filament\Support\Palette;
use App\Services\StatsService;
use Filament\Widgets\ChartWidget;

class AttendanceTrendChart extends ChartWidget
{
    use GatedByRole;

    protected static array $roles = ['master'];
    protected static ?string $heading = 'Service attendance';
    protected static ?string $description = 'Total attendance reported by zones each month';
    protected static ?int $sort = 7;
    protected static ?string $maxHeight = '300px';
    protected int|string|array $columnSpan = 1;

    protected function getType(): string
    {
        return 'line';
    }

    protected function getData(): array
    {
        $a = app(StatsService::class)->attendanceMonthly(12);

        return [
            'labels'   => $a['labels'],
            'datasets' => [[
                'label'           => 'Attendance',
                'data'            => $a['data'],
                'borderColor'     => Palette::at(2),
                'backgroundColor' => Palette::alpha(Palette::at(2), .12),
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
