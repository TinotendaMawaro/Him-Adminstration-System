<?php

namespace App\Filament\Widgets\Master;

use App\Filament\Support\GatedByRole;
use App\Filament\Support\Palette;
use App\Services\StatsService;
use Filament\Widgets\ChartWidget;

class IncomeByRegionChart extends ChartWidget
{
    use GatedByRole;

    protected static array $roles = ['master', 'finance'];
    protected static ?string $heading = 'Income by region (top 10)';
    protected static ?int $sort = 4;
    protected static ?string $maxHeight = '300px';
    public ?string $filter = 'this_year';

    protected function getFilters(): ?array
    {
        return StatsService::periodOptions();
    }

    protected function getType(): string
    {
        return 'bar';
    }

    protected function getData(): array
    {
        $s = app(StatsService::class);
        [$from, $to] = $s->periodBounds($this->filter ?? 'this_year');
        // Top regions only: 20+ regions make an unreadable bar chart. The full list is in the exports.
        $rows = $s->incomeByRegion($from, $to)->take(10);

        return [
            'labels'   => $rows->pluck('label')->all(),
            'datasets' => [[
                'label'           => 'Income',
                'data'            => $rows->pluck('total')->map(fn ($v) => (float) $v)->all(),
                'backgroundColor' => Palette::at(0),
                'borderRadius'    => 4,
                'barThickness'    => 16,
            ]],
        ];
    }

    protected function getOptions(): array
    {
        return ['indexAxis' => 'y', 'plugins' => ['legend' => ['display' => false]], 'scales' => ['x' => ['beginAtZero' => true]]];
    }
}
