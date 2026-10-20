<?php

namespace App\Filament\Resources;

use App\Enums\PartnerStatus;
use App\Enums\PartnerTier;
use App\Filament\Resources\PartnerDirectoryResource\Pages;
use App\Models\Partner;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

/**
 * Read-only partner directory for the events team (to invite and recognise partners).
 * Deliberately shows no pledge, giving or payment data — that stays in Finance.
 */
class PartnerDirectoryResource extends Resource
{
    protected static ?string $model = Partner::class;

    protected static ?string $navigationIcon = 'heroicon-o-heart';
    protected static ?string $navigationGroup = 'Events';
    protected static ?int $navigationSort = 2;
    protected static ?string $modelLabel = 'partner';
    protected static ?string $pluralModelLabel = 'Partners directory';
    protected static ?string $slug = 'partners-directory';

    public static function canAccess(): bool
    {
        return auth()->user()?->hasAnyRole(['master', 'event']) ?? false;
    }

    public static function canCreate(): bool { return false; }
    public static function canEdit($record): bool { return false; }
    public static function canDelete($record): bool { return false; }

    public static function table(Table $table): Table
    {
        return $table
            ->modifyQueryUsing(fn (Builder $query) => $query->with(['user', 'zone', 'package']))
            ->columns([
                Tables\Columns\TextColumn::make('partner_number')->label('Partner no.')->searchable()->sortable()->badge(),
                Tables\Columns\TextColumn::make('name')->label('Partner')->state(fn (Partner $r) => "{$r->name} {$r->surname}")->searchable(['name', 'surname']),
                Tables\Columns\TextColumn::make('tier')->badge(),
                Tables\Columns\TextColumn::make('status')->badge(),
                Tables\Columns\TextColumn::make('package.name')->label('Package')->placeholder('—')->toggleable(),
                Tables\Columns\TextColumn::make('zone.name')->label('Zone')->placeholder('—')->sortable(),
                Tables\Columns\TextColumn::make('user.email')->label('Email')->searchable()->toggleable()->copyable(),
                Tables\Columns\TextColumn::make('user.phone')->label('Phone')->toggleable()->placeholder('—'),
                Tables\Columns\TextColumn::make('partnership_date')->label('Partner since')->date('d M Y')->sortable(),
            ])
            ->defaultSort('partnership_date', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('tier')->options(PartnerTier::class)->multiple(),
                Tables\Filters\SelectFilter::make('status')->options(PartnerStatus::class)->default(PartnerStatus::Active->value),
            ], layout: Tables\Enums\FiltersLayout::AboveContentCollapsible);
    }

    public static function getPages(): array
    {
        return ['index' => Pages\ListPartnerDirectory::route('/')];
    }
}
