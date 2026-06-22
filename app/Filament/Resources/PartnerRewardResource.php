<?php

namespace App\Filament\Resources;

use App\Filament\Resources\PartnerRewardResource\Pages;
use App\Models\PartnerReward;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Forms\Components\Card;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Toggle;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class PartnerRewardResource extends Resource
{
    protected static ?string $model = PartnerReward::class;

    protected static ?string $navigationIcon = 'heroicon-o-gift';

    protected static ?string $navigationGroup = 'Finance';

    protected static ?int $navigationSort = 3;

    protected static ?string $navigationLabel = 'Partner Rewards';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Card::make()
                    ->schema([
                        TextInput::make('name')->required()->maxLength(255)->columnSpanFull(),

                        Textarea::make('description')->columnSpanFull(),

                        Select::make('category')
                            ->options([
                                'conference_discount' => 'Conference Discount',
                                'book'                 => 'Book',
                                'merchandise'          => 'Merchandise',
                                'event'                => 'Special Event',
                            ])
                            ->required()
                            ->columnSpan(1),

                        TextInput::make('points_required')
                            ->required()
                            ->numeric()
                            ->minValue(1)
                            ->columnSpan(1),

                        TextInput::make('monetary_value')
                            ->numeric()
                            ->prefix('$')
                            ->columnSpan(1),

                        TextInput::make('image')->nullable()->maxLength(255)->columnSpan(1),

                        TextInput::make('stock')
                            ->numeric()
                            ->nullable()
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
                TextColumn::make('category')->badge(),
                TextColumn::make('points_required')->sortable(),
                TextColumn::make('monetary_value')->money('USD')->sortable(),
                TextColumn::make('stock')->sortable(),
                IconColumn::make('is_active')->boolean(),
                TextColumn::make('created_at')->dateTime()->sortable(),
            ])
            ->filters([
                SelectFilter::make('category')
                    ->options([
                        'conference_discount' => 'Conference Discount',
                        'book'                 => 'Book',
                        'merchandise'          => 'Merchandise',
                        'event'                => 'Special Event',
                    ]),
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
            'index'  => Pages\ListPartnerRewards::route('/'),
            'create' => Pages\CreatePartnerReward::route('/create'),
            'edit'   => Pages\EditPartnerReward::route('/{record}/edit'),
        ];
    }

    public static function canAccess(): bool
    {
        return auth()->user()?->isMaster() ?? false;
    }
}
