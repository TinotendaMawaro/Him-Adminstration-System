<?php

namespace App\Filament\Widgets\Master;

use App\Filament\Support\GatedByRole;
use App\Filament\Support\Money;
use App\Models\Zone;
use Filament\Tables;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget;
use Illuminate\Support\Facades\DB;

class ZoneLeaderboard extends TableWidget
{
    use GatedByRole;

    protected static array $roles = ['master'];
    protected static ?string $heading = 'Zone performance (year to date)';
    protected static ?int $sort = 8;
    protected int|string|array $columnSpan = 'full';

    public function table(Table $table): Table
    {
        $ytd = now()->startOfYear();

        return $table
            ->query(
                Zone::query()
                    ->with('region')
                    ->select('zones.*')
                    ->selectSub(DB::table('members')->selectRaw('COUNT(*)')->whereColumn('members.zone_id', 'zones.id')->whereNull('deleted_at')->where('status', 'active'), 'members_total')
                    ->selectSub(DB::table('payments')->selectRaw('COALESCE(SUM(amount),0)')->whereColumn('payments.zone_id', 'zones.id')->whereNull('deleted_at')->where('status', 'completed')->where('paid_at', '>=', $ytd), 'income_total')
                    ->selectSub(DB::table('reports')->selectRaw('MAX(report_date)')->whereColumn('reports.zone_id', 'zones.id'), 'last_report_on')
            )
            ->columns([
                Tables\Columns\TextColumn::make('code')->badge()->sortable()->searchable(),
                Tables\Columns\TextColumn::make('name')->label('Zone')->searchable()->sortable(),
                Tables\Columns\TextColumn::make('region.name')->label('Region')->placeholder('—'),
                Tables\Columns\TextColumn::make('members_total')->label('Active members')->numeric()->sortable(),
                Tables\Columns\TextColumn::make('income_total')->label('Income YTD')->formatStateUsing(fn ($state) => Money::fmt($state))->sortable(),
                Tables\Columns\TextColumn::make('last_report_on')->label('Last report')->date('d M Y')->placeholder('Never')->sortable()
                    ->color(fn ($state) => !$state || \Carbon\Carbon::parse($state)->lt(now()->subDays(14)) ? 'danger' : 'success'),
            ])
            ->defaultSort('income_total', 'desc')
            ->paginated([5, 10, 25])
            ->defaultPaginationPageOption(5);
    }
}
