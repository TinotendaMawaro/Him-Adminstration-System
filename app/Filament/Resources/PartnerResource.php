<?php

namespace App\Filament\Resources;

use App\Filament\Resources\PartnerResource\Pages;
use App\Models\Partner;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Forms\Components\Card;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Toggle;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\BadgeColumn;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class PartnerResource extends Resource
{
    protected static ?string $model = Partner::class;

    protected static ?string $navigationIcon = 'heroicon-o-heart';

    protected static ?string $navigationGroup = 'Finance';

    protected static ?int $navigationSort = 2;

    protected static ?string $navigationLabel = 'Partners';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Card::make()
                    ->schema([
                        Select::make('user_id')
                            ->label('User')
                            ->relationship('user', 'name')
                            ->searchable()
                            ->preload()
                            ->required(),

                        TextInput::make('partner_number')->unique()->maxLength(255),

                        Select::make('tier')
                            ->options(array_combine(
                                array_map(fn ($t) => $t->getLabel(), \App\Enums\PartnerTier::cases()),
                                array_map(fn ($t) => $t->value, \App\Enums\PartnerTier::cases())
                            ))
                            ->nullable(),

                        Select::make('status')
                            ->options(\App\Enums\PartnerStatus::class)
                            ->nullable(),

                        TextInput::make('pledge_amount')->numeric()->prefix('$'),

                        Select::make('pledge_frequency')
                            ->options(array_combine(
                                array_map(fn ($f) => $f->getLabel(), \App\Enums\PledgeFrequency::cases()),
                                array_map(fn ($f) => $f->value, \App\Enums\PledgeFrequency::cases())
                            ))
                            ->nullable(),

                        TextInput::make('partnership_date')->type('date'),
                        TextInput::make('renewal_date')->type('date'),
                        TextInput::make('cancelled_at')->type('date'),
                        TextInput::make('suspended_at')->type('date'),

                        Textarea::make('notes')->columnSpanFull(),
                        Toggle::make('is_active')->label('Active')->default(true),
                    ])
                    ->columns(2),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('partner_number')->searchable()->sortable(),
                TextColumn::make('full_name')->searchable()->sortable(),
                TextColumn::make('tier')->badge()->color(fn ($state) => $state?->getColor()),
                BadgeColumn::make('status')->color(fn ($state) => \App\Enums\PartnerStatus::from($state)?->getColor()),
                TextColumn::make('pledge_amount')->money('USD')->sortable(),
                TextColumn::make('total_giving')->money('USD')->sortable(),
                TextColumn::make('partnership_date')->date()->sortable(),
                TextColumn::make('renewal_date')->date()->sortable(),
            ])
            ->filters([
                SelectFilter::make('tier')
                    ->options(array_combine(
                        array_map(fn ($t) => $t->getLabel(), \App\Enums\PartnerTier::cases()),
                        array_map(fn ($t) => $t->value, \App\Enums\PartnerTier::cases())
                    )),
                SelectFilter::make('status')
                    ->options(\App\Enums\PartnerStatus::class),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListPartners::route('/'),
            'create' => Pages\CreatePartner::route('/create'),
            'edit'   => Pages\EditPartner::route('/{record}/edit'),
        ];
    }

    public static function canAccess(): bool
    {
        return auth()->user()?->isMaster() ?? false;
    }
}
