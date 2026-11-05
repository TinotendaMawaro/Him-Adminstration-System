<?php

namespace App\Filament\Pages\Master;

use App\Services\StatsService;
use Carbon\Carbon;
use Filament\Forms;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Pages\Page;
use Illuminate\Support\Collection;

/** The ministry month at a glance: every zone's reported figures next to what the system recorded. */
class MonthlyReport extends Page implements HasForms
{
    use InteractsWithForms;

    protected static ?string $navigationIcon = 'heroicon-o-calendar-days';
    protected static ?string $navigationGroup = 'Reports';
    protected static ?int $navigationSort = 0;
    protected static ?string $navigationLabel = 'Monthly report';
    protected static ?string $title = 'Monthly ministry report';
    protected static ?string $slug = 'monthly-report';
    protected static string $view = 'filament.pages.monthly-report';

    public ?array $data = [];

    public static function canAccess(): bool
    {
        return auth()->user()?->isMaster() ?? false;
    }

    public function mount(): void
    {
        $this->form->fill(['month' => now()->format('Y-m')]);
    }

    public function form(Forms\Form $form): Forms\Form
    {
        $options = collect(range(0, 23))->mapWithKeys(fn ($i) => [now()->startOfMonth()->subMonths($i)->format('Y-m') => now()->startOfMonth()->subMonths($i)->format('F Y')])->all();

        return $form->statePath('data')->schema([
            Forms\Components\Select::make('month')->label('Month')->options($options)->live()->native(false)->selectablePlaceholder(false),
        ]);
    }

    public function monthDate(): Carbon
    {
        $month = $this->data['month'] ?? now()->format('Y-m');

        return preg_match('/^\d{4}-\d{2}$/', $month) ? Carbon::createFromFormat('Y-m-d', $month . '-01')->startOfDay() : now()->startOfMonth();
    }

    /** @return Collection<int, object> */
    public function rows(): Collection
    {
        return app(StatsService::class)->monthlyZoneReport($this->monthDate());
    }

    public function expected(): int
    {
        return app(StatsService::class)->expectedWeeklyReports($this->monthDate());
    }

    public function exportUrl(): string
    {
        return route('exports.download', ['report' => 'monthly', 'month' => $this->monthDate()->format('Y-m')]);
    }
}
