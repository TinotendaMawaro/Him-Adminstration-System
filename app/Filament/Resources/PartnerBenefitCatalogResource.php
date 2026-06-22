<?php

namespace App\Filament\Resources;

use App\Filament\Resources\PartnerBenefitCatalogResource\Pages;
use App\Models\PartnerBenefitCatalog;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Forms\Components\Card;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Components\Select;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class PartnerBenefitCatalogResource extends Resource
{
    protected static ?string $model = PartnerBenefitCatalog::class;

    protected static ?string $navigationIcon = 'heroicon-o-gift';

    protected static ?string $navigationGroup = 'Finance';

    protected static ?int $navigationSort = 4;

    protected static ?string $navigationLabel = 'Partner Benefits';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Card::make()
                    ->schema([
                        TextInput::make('key')
                            ->required()
                            ->maxLength(255)
                            ->unique(ignoreRecord: true)
                            ->columnSpanFull(),
                        TextInput::make('label')
                            ->required()
                            ->maxLength(255)
                            ->columnSpanFull(),
                        Textarea::make('description')
                            ->nullable()
                            ->columnSpanFull(),
                        TextInput::make('icon')
                            ->nullable()
                            ->maxLength(255)
                            ->columnSpan(1),
                        Select::make('min_package_order')
                            ->options([
                                1 => 'Bronze Partner',
                                2 => 'Silver Partner',
                                3 => 'Gold Partner',
                                4 => 'Platinum Partner',
                                5 => 'Kingdom Builder',
                                6 => 'Vision Partner',
                            ])
                            ->required()
                            ->default(1)
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
                TextColumn::make('key')->searchable()->sortable(),
                TextColumn::make('label')->searchable()->sortable(),
                TextColumn::make('min_package_order')
                    ->label('Min Package')
                    ->formatStateUsing(fn ($state) => match($state) {
                        1 => 'Bronze',
                        2 => 'Silver',
                        3 => 'Gold',
                        4 => 'Platinum',
                        5 => 'Kingdom Builder',
                        6 => 'Vision Partner',
                        default => $state,
                    })
                    ->sortable(),
                TextColumn::make('sort_order')->sortable(),
                IconColumn::make('is_active')->boolean(),
                TextColumn::make('created_at')->dateTime()->sortable(),
            ])
            ->filters([
                SelectFilter::make('min_package_order')
                    ->options([
                        1 => 'Bronze Partner',
                        2 => 'Silver Partner',
                        3 => 'Gold Partner',
                        4 => 'Platinum Partner',
                        5 => 'Kingdom Builder',
                        6 => 'Vision Partner',
                    ]),
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
            'index'  => Pages\ListPartnerBenefitCatalogs::route('/'),
            'create' => Pages\CreatePartnerBenefitCatalog::route('/create'),
            'edit'   => Pages\EditPartnerBenefitCatalog::route('/{record}/edit'),
        ];
    }

    public static function canAccess(): bool
    {
        return auth()->user()?->isMaster() ?? false;
    }
}
