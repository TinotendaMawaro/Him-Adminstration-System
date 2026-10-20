<?php

namespace App\Filament\Resources;

use App\Filament\Resources\HomeGroupResource\Pages;
use App\Filament\Resources\HomeGroupResource\RelationManagers;
use App\Models\HomeGroup;
use App\Models\Zone;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Forms\Components\Card;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Select;
use Filament\Resources\Resource;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class HomeGroupResource extends Resource
{
    protected static ?string $model = HomeGroup::class;

    public static function canAccess(): bool
    {
        return auth()->user()?->hasAnyRole(['master']) ?? false;
    }

    protected static ?string $navigationIcon = 'heroicon-o-shield-check';

    protected static ?string $navigationGroup = 'Church Management';

    protected static ?int $navigationSort = 1;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Card::make()
                    ->schema([
                        TextInput::make('name')->required(),
                        Select::make('zone_id')
                            ->label('Zone')
                            ->options(Zone::all()->pluck('name', 'id')->toArray())
                            ->searchable(),
                    ])
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')->sortable()->searchable(),
                TextColumn::make('zone.name')->sortable(),
                TextColumn::make('created_at')->dateTime()
            ])
            ->filters([
                //
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
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
            'index' => Pages\ListHomeGroups::route('/'),
            'create' => Pages\CreateHomeGroup::route('/create'),
            'edit' => Pages\EditHomeGroup::route('/{record}/edit'),
        ];
    }
}
