<?php

namespace App\Filament\Pages\Finance;

use App\Models\Region;
use App\Models\Zone;
use App\Services\StatsService;
use Filament\Forms;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Pages\Page;
use Illuminate\Support\Collection;

/**
 * The automated list of people who gave tithes / offerings / seeds in a period,
 * filterable by region and zone, largest givers first.
 */
class Contributors extends Page implements HasForms
{
    use InteractsWithForms;

    private const LIMIT = 500;

    protected static ?string $navigationIcon = 'heroicon-o-user-group';
    protected static ?string $navigationGroup = 'Finance';
    protected static ?int $navigationSort = 3;
    protected static ?string $navigationLabel = 'Tithers & givers';
    protected static ?string $title = 'Tithers, offerings & seeds';
    protected static ?string $slug = 'givers';
    protected static string $view = 'filament.pages.contributors';

    public ?array $data = ['type' => 'tithe', 'period' => 'this_month', 'region' => null, 'zone' => null];

    public static function canAccess(): bool
    {
        return auth()->user()?->hasAnyRole(['master', 'finance']) ?? false;
    }

    public function form(Forms\Form $form): Forms\Form
    {
        return $form->statePath('data')->columns(4)->schema([
            Forms\Components\Select::make('type')->label('Giving')->options(['tithe' => 'Tithes', 'offering' => 'Offerings', 'seed' => 'Seeds', 'building_fund' => 'Building fund', 'missions' => 'Missions'])
                ->live()->native(false)->selectablePlaceholder(false),
            Forms\Components\Select::make('period')->options(StatsService::periodOptions())->live()->native(false)->selectablePlaceholder(false),
            Forms\Components\Select::make('region')->options(fn () => Region::orderBy('name')->pluck('name', 'id')->all())->placeholder('All regions')
                ->live()->native(false)->afterStateUpdated(fn (Forms\Set $set) => $set('zone', null)),
            Forms\Components\Select::make('zone')->placeholder('All zones')->live()->native(false)->searchable()
                ->options(fn (Forms\Get $get) => Zone::query()->when($get('region'), fn ($q, $v) => $q->where('region_id', $v))->orderBy('code')->get()
                    ->mapWithKeys(fn ($z) => [$z->id => "{$z->code} · {$z->name}"])->all()),
        ]);
    }

    public function getRows(): Collection
    {
        $s = app(StatsService::class);
        [$from, $to] = $s->periodBounds($this->data['period'] ?? 'this_month');

        return $s->contributors($this->data['type'] ?? 'tithe', $from, $to, $this->data['region'] ?: null, $this->data['zone'] ?: null);
    }

    public function limit(): int
    {
        return self::LIMIT;
    }

    public function exportUrl(): ?string
    {
        $report = ['tithe' => 'tithers', 'offering' => 'offerings', 'seed' => 'seeds'][$this->data['type'] ?? 'tithe'] ?? null;

        return $report ? route('exports.download', array_filter(['report' => $report, 'period' => $this->data['period'] ?? null, 'region' => $this->data['region'] ?? null])) : null;
    }
}
