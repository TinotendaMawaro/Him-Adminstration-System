<?php

namespace App\Filament\Resources;

use App\Filament\Resources\PartnershipPackageResource\Pages;
use App\Models\PartnershipPackage;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Forms\Components\Card;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\ColorPicker;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Components\KeyValue;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class PartnershipPackageResource extends Resource
{
    protected static ?string $model = PartnershipPackage::class;

    protected static ?string $navigationIcon = 'heroicon-o-tag';

    protected static ?string $navigationGroup = 'Finance';

    protected static ?int $navigationSort = 1;

    protected static ?string $navigationLabel = 'Partnership Packages';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Card::make()
                    ->schema([
                        TextInput::make('name')
                            ->required()
                            ->maxLength(255)
                            ->columnSpanFull(),

                        TextInput::make('slug')
                            ->required()
                            ->maxLength(255)
                            ->unique(ignoreRecord: true)
                            ->columnSpanFull(),

                        TextInput::make('monthly_amount')
                            ->required()
                            ->numeric()
                            ->prefix('$')
                            ->columnSpanFull(),

                        KeyValue::make('benefits')
                            ->label('Benefits')
                            ->afterStateHydrated(fn ($component, $state) => $component->state($state ?? []))
                            ->columnSpanFull(),

                        KeyValue::make('impact_description')
                            ->label('Impact Description')
                            ->afterStateHydrated(fn ($component, $state) => $component->state($state ?? []))
                            ->columnSpanFull(),

                        TextInput::make('color')
                            ->default('#3b82f6')
                            ->maxLength(7)
                            ->columnSpan(1),

                        TextInput::make('icon')
                            ->maxLength(255)
                            ->columnSpan(1),

                        TextInput::make('sort_order')
                            ->numeric()
                            ->default(0)
                            ->columnSpan(1),

                        Toggle::make('is_active')
                            ->default(true)
                            ->columnSpan(1),
                    ])
                    ->columns(2),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')->searchable()->sortable(),
                TextColumn::make('slug')->searchable(),
                TextColumn::make('monthly_amount')->money('USD')->sortable(),
                TextColumn::make('sort_order')->sortable(),
                IconColumn::make('is_active')->boolean(),
                TextColumn::make('partners_count')
                    ->label('Partners')
                    ->state(fn ($record) => $record->partners()->count())
                    ->sortable(),
                TextColumn::make('created_at')->dateTime()->sortable(),
            ])
            ->filters([
                Tables\Filters\TernaryFilter::make('is_active')
                    ->label('Active Status'),
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
            'index'  => Pages\ListPartnershipPackages::route('/'),
            'create' => Pages\CreatePartnershipPackage::route('/create'),
            'edit'   => Pages\EditPartnershipPackage::route('/{record}/edit'),
        ];
    }

    public static function canAccess(): bool
    {
        return auth()->user()?->isMaster() ?? false;
    }
}
