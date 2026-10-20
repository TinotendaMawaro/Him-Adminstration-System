<?php

namespace App\Filament\Resources;

use App\Filament\Resources\BankingDetailResource\Pages;
use App\Filament\Resources\BankingDetailResource\RelationManagers;
use App\Models\BankingDetail;
use Filament\Forms;
use Filament\Forms\Components\Card;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class BankingDetailResource extends Resource
{
    protected static ?string $model = BankingDetail::class;

    public static function canAccess(): bool
    {
        return auth()->user()?->hasAnyRole(['master', 'finance']) ?? false;
    }

    protected static ?string $navigationIcon = 'heroicon-o-building-library';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Card::make()
                    ->schema([
                        TextInput::make('bank_name')->required(),
                        TextInput::make('account_name')->required(),
                        TextInput::make('account_number')->numeric()->required(),
                        TextInput::make('account_type')->required(),
                        TextInput::make('branch_code')->required(),
                        TextInput::make('branch_name')->required(),
                        TextInput::make('swift')->required()
                    ])
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('bank_name')->sortable()->searchable(),
                TextColumn::make('account_name')->sortable(),
                TextColumn::make('account_number')->sortable(),
                TextColumn::make('branch_code')->sortable(),
                TextColumn::make('branch_name')->sortable(),
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
            'index' => Pages\ListBankingDetails::route('/'),
            'create' => Pages\CreateBankingDetail::route('/create'),
            'edit' => Pages\EditBankingDetail::route('/{record}/edit'),
        ];
    }
}
