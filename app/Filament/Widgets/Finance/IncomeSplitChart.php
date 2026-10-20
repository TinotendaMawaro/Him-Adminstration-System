<?php

namespace App\Filament\Widgets\Finance;

use App\Enums\PaymentType;
use App\Filament\Support\GatedByRole;
use App\Filament\Support\Palette;
use App\Services\StatsService;
use Filament\Widgets\ChartWidget;

class IncomeSplitChart extends ChartWidget
{
    use GatedByRole;

    protected static array $roles = ['master', 'finance'];
    protected static ?string $heading = 'Income split by type';
    protected static ?int $sort = 5;
    protected static ?string $maxHeight = '300px';
    public ?string $filter = 'this_month';

    protected function getFilters(): ?array
    {
        return StatsService::periodOptions();
    }

    protected function getType(): string
    {
        return 'doughnut';
    }

    protected function getData(): array
    {
        $s = app(StatsService::class);
        [$from, $to] = $s->periodBounds($this->filter ?? 'this_month');
        $rows = $s->incomeByType($from, $to);

        return [
            'labels'   => $rows->map(fn ($r) => PaymentType::tryFrom($r->label)?->getLabel() ?? ucfirst($r->label))->all(),
            'datasets' => [[
                'data'            => $rows->pluck('total')->map(fn ($v) => (float) $v)->all(),
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
