<?php

namespace App\Filament\Pages\Master;

use App\Models\Region;
use App\Services\StatsService;
use Filament\Forms;
use Filament\Forms\Concerns\InteractsWithForms;
use Filament\Forms\Contracts\HasForms;
use Filament\Pages\Page;

/**
 * One place for the master admin to download review packs as CSV
 * (opens in Excel). Every download is written to the audit log.
 */
class ReportsExports extends Page implements HasForms
{
    use InteractsWithForms;

    protected static ?string $navigationIcon = 'heroicon-o-arrow-down-on-square-stack';
    protected static ?string $navigationGroup = 'Reports';
    protected static ?int $navigationSort = 1;
    protected static ?string $navigationLabel = 'Reports & exports';
    protected static ?string $title = 'Reports & exports';
    protected static ?string $slug = 'reports-exports';
    protected static string $view = 'filament.pages.reports-exports';

    public ?array $data = ['period' => 'this_year', 'region' => null];

    public static function canAccess(): bool
    {
        return auth()->user()?->isMaster() ?? false;
    }

    public function form(Forms\Form $form): Forms\Form
    {
        return $form->statePath('data')->columns(2)->schema([
            Forms\Components\Select::make('period')->label('Period (financial reports)')->options(StatsService::periodOptions())->live()->native(false)->selectablePlaceholder(false),
            Forms\Components\Select::make('region')->label('Region (financial reports)')->options(fn () => Region::orderBy('name')->pluck('name', 'id')->all())->placeholder('All regions')->live()->native(false),
        ]);
    }

    /** @return array<string, array<int, array{key: string, title: string, description: string, scoped: bool}>> */
    public function catalogue(): array
    {
        return [
            'People & structure' => [
                ['key' => 'pastors', 'title' => 'Pastors', 'description' => 'Every pastor with zone, region, responsibilities and members in their zone.', 'scoped' => false],
                ['key' => 'zones', 'title' => 'Zones summary', 'description' => 'Members, pastors, home groups, income year-to-date and last report per zone.', 'scoped' => false],
                ['key' => 'members', 'title' => 'Members', 'description' => 'Full member register with zone, region, home group and status.', 'scoped' => false],
                ['key' => 'member-growth', 'title' => 'Membership growth', 'description' => 'New and total members for the last 24 months.', 'scoped' => false],
            ],
            'Finance' => [
                ['key' => 'financial', 'title' => 'Financial summary', 'description' => 'Total income by contribution type for the chosen period.', 'scoped' => true],
                ['key' => 'contributions', 'title' => 'Contributions by zone', 'description' => 'Tithes, offerings, seeds and more per zone and region.', 'scoped' => true],
                ['key' => 'tithers', 'title' => 'Tithers list', 'description' => 'Everyone who tithed, largest first.', 'scoped' => true],
                ['key' => 'offerings', 'title' => 'Offerings list', 'description' => 'Everyone who gave an offering.', 'scoped' => true],
                ['key' => 'seeds', 'title' => 'Seeds list', 'description' => 'Everyone who sowed a seed.', 'scoped' => true],
                ['key' => 'payments', 'title' => 'All payments', 'description' => 'Every payment with receipt, status and method.', 'scoped' => true],
            ],
            'Events' => [
                ['key' => 'events', 'title' => 'Events summary', 'description' => 'Registrations, attendance and money collected per event.', 'scoped' => false],
                ['key' => 'registrations', 'title' => 'Event registrations', 'description' => 'Full attendee list across all events.', 'scoped' => false],
            ],
        ];
    }

    public function url(string $key, bool $scoped): string
    {
        return route('exports.download', array_filter([
            'report' => $key,
            'period' => $scoped ? ($this->data['period'] ?? null) : null,
            'region' => $scoped ? ($this->data['region'] ?? null) : null,
        ]));
    }
}
