<?php

namespace App\Filament\Widgets\Master;

use App\Filament\Support\GatedByRole;
use App\Filament\Support\Palette;
use App\Services\StatsService;
use Filament\Widgets\ChartWidget;

class MemberGrowthChart extends ChartWidget
{
    use GatedByRole;

    protected static array $roles = ['master'];
    protected static ?string $heading = 'Membership growth';
    protected static ?string $description = 'New members per month and running total';
    protected static ?int $sort = 2;
    protected static ?string $maxHeight = '320px';
    protected int|string|array $columnSpan = 2;
    public ?string $filter = '12';

    protected function getFilters(): ?array
    {
        return ['6' => 'Last 6 months', '12' => 'Last 12 months', '24' => 'Last 24 months'];
    }

    protected function getType(): string
    {
        return 'bar';
    }

    protected function getData(): array
    {
        $g = app(StatsService::class)->memberGrowth((int) $this->filter);

        return [
            'labels'   => $g['labels'],
            'datasets' => [
                ['label' => 'New members', 'data' => $g['new'], 'backgroundColor' => Palette::alpha(Palette::at(1), .85), 'borderRadius' => 4, 'yAxisID' => 'y'],
                ['type' => 'line', 'label' => 'Total members', 'data' => $g['total'], 'borderColor' => Palette::at(0), 'backgroundColor' => Palette::alpha(Palette::at(0), .1), 'tension' => .35, 'fill' => true, 'yAxisID' => 'y1'],
            ],
        ];
    }

    protected function getOptions(): array
    {
        return [
            'plugins' => ['legend' => ['position' => 'bottom']],
            'scales'  => [
                'y'  => ['beginAtZero' => true, 'position' => 'left', 'ticks' => ['precision' => 0], 'title' => ['display' => true, 'text' => 'New']],
                'y1' => ['beginAtZero' => true, 'position' => 'right', 'grid' => ['drawOnChartArea' => false], 'ticks' => ['precision' => 0], 'title' => ['display' => true, 'text' => 'Total']],
            ],
        ];
    }
}
