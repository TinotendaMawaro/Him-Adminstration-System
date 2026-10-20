<?php

namespace App\Filament\Widgets\Events;

use App\Filament\Support\GatedByRole;
use App\Filament\Support\Palette;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Facades\DB;

class RegistrationsPerEventChart extends ChartWidget
{
    use GatedByRole;

    protected static array $roles = ['master', 'event'];
    protected static ?string $heading = 'Registrations vs capacity';
    protected static ?string $description = 'Next published events';
    protected static ?int $sort = 2;
    protected static ?string $maxHeight = '320px';
    protected int|string|array $columnSpan = 2;

    protected function getType(): string
    {
        return 'bar';
    }

    protected function getData(): array
    {
        $rows = DB::table('events as e')->whereNull('e.deleted_at')->where('e.status', 'published')->where('e.starts_at', '>', now())
            ->orderBy('e.starts_at')->limit(10)
            ->selectRaw("e.title, e.capacity,
                (SELECT COUNT(*) FROM event_registrations x WHERE x.event_id = e.id AND x.status IN ('confirmed','attended')) as confirmed,
                (SELECT COUNT(*) FROM event_registrations x WHERE x.event_id = e.id AND x.status = 'pending') as pending")
            ->get();

        $labels = $rows->map(fn ($r) => \Illuminate\Support\Str::limit($r->title, 22))->all();

        return [
            'labels'   => $labels,
            'datasets' => [
                ['label' => 'Confirmed', 'data' => $rows->pluck('confirmed')->map(fn ($v) => (int) $v)->all(), 'backgroundColor' => Palette::at(5), 'borderRadius' => 3, 'stack' => 's'],
                ['label' => 'Pending', 'data' => $rows->pluck('pending')->map(fn ($v) => (int) $v)->all(), 'backgroundColor' => Palette::at(1), 'borderRadius' => 3, 'stack' => 's'],
                ['type' => 'line', 'label' => 'Capacity', 'data' => $rows->pluck('capacity')->map(fn ($v) => $v ? (int) $v : null)->all(),
                    'borderColor' => Palette::at(4), 'backgroundColor' => Palette::at(4), 'borderDash' => [6, 4], 'pointRadius' => 3, 'fill' => false],
            ],
        ];
    }

    protected function getOptions(): array
    {
        return [
            'plugins' => ['legend' => ['position' => 'bottom']],
            'scales'  => ['x' => ['stacked' => true], 'y' => ['stacked' => true, 'beginAtZero' => true, 'ticks' => ['precision' => 0]]],
        ];
    }
}
