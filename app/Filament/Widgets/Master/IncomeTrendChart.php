<?php

namespace App\Filament\Widgets\Master;

use App\Enums\PaymentType;
use App\Filament\Support\GatedByRole;
use App\Filament\Support\Palette;
use App\Services\StatsService;
use Filament\Widgets\ChartWidget;

class IncomeTrendChart extends ChartWidget
{
    use GatedByRole;

    protected static array $roles = ['master', 'finance'];
    protected static ?string $heading = 'Monthly income by contribution type';
    protected static ?string $description = 'Completed (receipted) payments only';
    protected static ?int $sort = 3;
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
        $d = app(StatsService::class)->incomeByTypeMonthly((int) $this->filter);

        $datasets = [];
        $i = 0;
        foreach ($d['series'] as $type => $values) {
            $datasets[] = [
                'label'           => PaymentType::tryFrom($type)?->getLabel() ?? ucfirst($type),
                'data'            => $values,
                'backgroundColor' => Palette::at($i++),
                'borderRadius'    => 3,
            ];
        }

        return ['labels' => $d['labels'], 'datasets' => $datasets];
    }

    protected function getOptions(): array
    {
        return [
            'plugins' => ['legend' => ['position' => 'bottom']],
            'scales'  => ['x' => ['stacked' => true], 'y' => ['stacked' => true, 'beginAtZero' => true]],
        ];
    }
}
