<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ZoneReportResource\Pages;
use App\Filament\Support\Money;
use App\Models\Region;
use App\Models\Report;
use App\Services\AuditTrail;
use Filament\Infolists;
use Filament\Infolists\Infolist;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

/**
 * Read-only oversight of the weekly reports pastors submit from their zones:
 * tithes, offerings, designations, attendance and remittance to head office.
 */
class ZoneReportResource extends Resource
{
    protected static ?string $model = Report::class;

    protected static ?string $navigationIcon = 'heroicon-o-document-chart-bar';
    protected static ?string $navigationGroup = 'Finance';
    protected static ?int $navigationSort = 3;
    protected static ?string $modelLabel = 'zone report';
    protected static ?string $pluralModelLabel = 'Zone reports & remittances';
    protected static ?string $slug = 'zone-reports';

    public static function canAccess(): bool
    {
        return auth()->user()?->hasAnyRole(['master', 'finance']) ?? false;
    }

    public static function canCreate(): bool { return false; }
    public static function canEdit($record): bool { return false; }
    public static function canDelete($record): bool { return false; }

    public static function getNavigationBadge(): ?string
    {
        $n = Report::where('status', 'submitted')->where('remittance_submitted', 0)->count();

        return $n ? (string) $n : null;
    }

    public static function getNavigationBadgeColor(): ?string
    {
        return 'danger';
    }

    public static function infolist(Infolist $infolist): Infolist
    {
        return $infolist->schema([
            Infolists\Components\Section::make('Report')->columns(4)->schema([
                Infolists\Components\TextEntry::make('zone.name')->label('Zone'),
                Infolists\Components\TextEntry::make('zone.region.name')->label('Region')->placeholder('—'),
                Infolists\Components\TextEntry::make('service_type')->badge(),
                Infolists\Components\TextEntry::make('report_date')->date('d M Y'),
                Infolists\Components\TextEntry::make('user.name')->label('Submitted by'),
                Infolists\Components\TextEntry::make('submitted_at')->dateTime('d M Y, H:i'),
                Infolists\Components\IconEntry::make('is_late')->label('Late')->boolean()->trueColor('danger')->falseColor('success'),
                Infolists\Components\TextEntry::make('attendance'),
            ]),
            Infolists\Components\Section::make('Financials')->columns(4)->schema([
                Infolists\Components\TextEntry::make('tithes')->money('USD'),
                Infolists\Components\TextEntry::make('offerings')->money('USD'),
                Infolists\Components\TextEntry::make('building_fund')->money('USD'),
                Infolists\Components\TextEntry::make('missions')->money('USD'),
                Infolists\Components\TextEntry::make('other_designations')->money('USD'),
                Infolists\Components\TextEntry::make('cash_collection')->money('USD'),
                Infolists\Components\TextEntry::make('bank_deposit')->money('USD'),
                Infolists\Components\TextEntry::make('online_transfer')->money('USD'),
                Infolists\Components\TextEntry::make('total_income')->money('USD')->weight('bold')->size('lg'),
            ]),
            Infolists\Components\Section::make('Remittance to head office')->columns(4)->schema([
                Infolists\Components\IconEntry::make('remittance_submitted')->label('Sent')->boolean(),
                Infolists\Components\TextEntry::make('remittance_amount')->money('USD'),
                Infolists\Components\TextEntry::make('remittance_date')->date('d M Y')->placeholder('—'),
                Infolists\Components\TextEntry::make('reviewed_at')->label('Reviewed')->dateTime('d M Y, H:i')->placeholder('Not reviewed'),
                Infolists\Components\TextEntry::make('notes')->columnSpanFull()->placeholder('—'),
            ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->modifyQueryUsing(fn (Builder $query) => $query->with(['zone.region']))
            ->columns([
                Tables\Columns\TextColumn::make('report_date')->date('d M Y')->sortable()->label('Report date'),
                Tables\Columns\TextColumn::make('zone.name')->label('Zone')->searchable(),
                Tables\Columns\TextColumn::make('zone.region.name')->label('Region')->toggleable()->placeholder('—'),
                Tables\Columns\TextColumn::make('service_type')->badge()->formatStateUsing(fn ($state) => str($state)->replace('_', ' ')->title()),
                Tables\Columns\TextColumn::make('tithes')->formatStateUsing(fn ($state) => Money::fmt($state))->alignEnd(),
                Tables\Columns\TextColumn::make('offerings')->formatStateUsing(fn ($state) => Money::fmt($state))->alignEnd(),
                Tables\Columns\TextColumn::make('total_income')->label('Total')->alignEnd()->weight('bold')
                    ->formatStateUsing(fn ($state) => Money::fmt($state))
                    ->summarize(Tables\Columns\Summarizers\Sum::make()->formatStateUsing(fn ($state) => Money::fmt($state))),
                Tables\Columns\TextColumn::make('attendance')->numeric()->toggleable(),
                Tables\Columns\IconColumn::make('remittance_submitted')->label('Remitted')->boolean(),
                Tables\Columns\IconColumn::make('is_late')->label('Late')->boolean()->trueColor('danger')->falseColor('gray')->toggleable(),
                Tables\Columns\TextColumn::make('reviewed_at')->label('Reviewed')->since()->placeholder('—')->toggleable(),
            ])
            ->defaultSort('report_date', 'desc')
            ->filters([
                Tables\Filters\TernaryFilter::make('remittance_submitted')->label('Remittance')->placeholder('All')->trueLabel('Sent')->falseLabel('Outstanding'),
                Tables\Filters\TernaryFilter::make('is_late')->label('Late reports'),
                Tables\Filters\SelectFilter::make('region')->options(fn () => Region::orderBy('name')->pluck('name', 'id')->all())
                    ->query(fn (Builder $query, array $data) => $query->when($data['value'] ?? null, fn ($query, $v) => $query->whereHas('zone', fn ($z) => $z->where('region_id', $v)))),
                Tables\Filters\SelectFilter::make('year')->options(fn () => Report::query()->distinct()->orderByDesc('year')->pluck('year', 'year')->all()),
            ], layout: Tables\Enums\FiltersLayout::AboveContentCollapsible)
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\Action::make('review')->label('Mark reviewed')->icon('heroicon-o-check-circle')->color('success')
                    ->visible(fn (Report $r) => is_null($r->reviewed_at))
                    ->requiresConfirmation()
                    ->action(function (Report $r) {
                        $r->forceFill(['reviewed_by' => auth()->id(), 'reviewed_at' => now()])->save();
                        AuditTrail::record('zone_report.reviewed', auth()->user(), $r, ['zone_id' => $r->zone_id, 'week' => $r->week_number, 'year' => $r->year]);
                        Notification::make()->title('Report marked as reviewed')->success()->send();
                    }),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListZoneReports::route('/'),
            'view'  => Pages\ViewZoneReport::route('/{record}'),
        ];
    }
}
