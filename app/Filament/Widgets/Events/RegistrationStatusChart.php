<?php

namespace App\Filament\Widgets\Events;

use App\Enums\RegistrationStatus;
use App\Filament\Support\GatedByRole;
use Filament\Widgets\ChartWidget;
use Illuminate\Support\Facades\DB;

class RegistrationStatusChart extends ChartWidget
{
    use GatedByRole;

    protected static array $roles = ['master', 'event'];
    protected static ?string $heading = 'Registration status';
    protected static ?int $sort = 3;
    protected static ?string $maxHeight = '300px';

    protected function getType(): string
    {
        return 'doughnut';
    }

    protected function getData(): array
    {
        $counts = DB::table('event_registrations as er')->join('events as e', 'e.id', '=', 'er.event_id')
            ->whereNull('e.deleted_at')->groupBy('er.status')->selectRaw('er.status, COUNT(*) as c')->pluck('c', 'status');

        $palette = ['pending' => '#e0a030', 'confirmed' => '#4f9d69', 'attended' => '#1e3a5f', 'cancelled' => '#d9534f'];
        $labels = $data = $colors = [];
        foreach (RegistrationStatus::cases() as $case) {
            $labels[] = $case->getLabel();
            $data[]   = (int) ($counts[$case->value] ?? 0);
            $colors[] = $palette[$case->value] ?? '#8a8d93';
        }

        return ['labels' => $labels, 'datasets' => [['data' => $data, 'backgroundColor' => $colors, 'borderWidth' => 2]]];
    }

    protected function getOptions(): array
    {
        return ['plugins' => ['legend' => ['position' => 'bottom']], 'scales' => ['x' => ['display' => false], 'y' => ['display' => false]]];
    }
}
