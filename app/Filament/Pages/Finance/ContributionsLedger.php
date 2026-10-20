<?php

namespace App\Filament\Pages\Finance;

use App\Models\Region;
use App\Services\StatsService;
use Filament\Forms;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Pages\Page;
use Illuminate\Support\Collection;

/**
 * Tithes, offerings, seeds and other giving rolled up automatically from receipted payments,
 * by zone and region, for any period. No manual capture.
 */
class ContributionsLedger extends Page implements HasForms
{
    use InteractsWithForms;

    protected static ?string $navigationIcon = 'heroicon-o-table-cells';
    protected static ?string $navigationGroup = 'Finance';
    protected static ?int $navigationSort = 2;
    protected static ?string $navigationLabel = 'Contributions ledger';
    protected static ?string $title = 'Contributions ledger';
    protected static ?string $slug = 'contributions-ledger';
    protected static string $view = 'filament.pages.contributions-ledger';

    public ?array $data = ['period' => 'this_month', 'region' => null];

    public static function canAccess(): bool
    {
        return auth()->user()?->hasAnyRole(['master', 'finance']) ?? false;
    }

    public function form(Forms\Form $form): Forms\Form
    {
        return $form->statePath('data')->columns(2)->schema([
            Forms\Components\Select::make('period')->options(StatsService::periodOptions())->default('this_month')->live()->native(false)->selectablePlaceholder(false),
            Forms\Components\Select::make('region')->options(fn () => Region::orderBy('name')->pluck('name', 'id')->all())
                ->placeholder('All regions')->live()->native(false),
        ]);
    }

    public function getRows(): Collection
    {
        $s = app(StatsService::class);
        [$from, $to] = $s->periodBounds($this->data['period'] ?? 'this_month');

        return $s->contributionsByZone($from, $to, $this->data['region'] ?: null);
    }

    public function exportUrl(): string
    {
        return route('exports.download', array_filter(['report' => 'contributions', 'period' => $this->data['period'] ?? null, 'region' => $this->data['region'] ?? null]));
    }
}
