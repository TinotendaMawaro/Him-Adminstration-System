<?php

namespace App\Filament\Widgets\Master;

use App\Filament\Support\GatedByRole;
use App\Filament\Support\Palette;
use App\Services\StatsService;
use Filament\Widgets\ChartWidget;

class PastorsByRegionChart extends ChartWidget
{
    use GatedByRole;

    protected static array $roles = ['master'];
    protected static ?string $heading = 'Pastors by region';
    protected static ?int $sort = 6;
    protected static ?string $maxHeight = '300px';

    protected function getType(): string
    {
        return 'pie';
    }

    protected function getData(): array
    {
        $rows = app(StatsService::class)->pastorsByRegion();

        return [
            'labels'   => $rows->pluck('label')->all(),
            'datasets' => [[
                'data'            => $rows->pluck('total')->map(fn ($v) => (int) $v)->all(),
                'backgroundColor' => Palette::take(max(1, $rows->count())),
                'borderWidth'     => 2,
            ]],
        ];
    }

    protected function getOptions(): array
    {
        return ['plugins' => ['legend' => ['position' => 'bottom']], 'scales' => ['x' => ['display' => false], 'y' => ['display' => false]]];
    }
}
