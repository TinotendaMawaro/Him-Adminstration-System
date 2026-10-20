<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ZoneResource\Pages;
use App\Models\Zone;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Validation\Rule;

class ZoneResource extends Resource
{
    protected static ?string $model = Zone::class;

    public static function canAccess(): bool
    {
        return auth()->user()?->hasAnyRole(['master']) ?? false;
    }

    protected static ?string $navigationIcon = 'heroicon-o-globe-alt';

    protected static ?string $navigationGroup = 'Church Management';

    protected static ?int $navigationSort = 0;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Section::make()
                    ->columns(2)
                    ->schema([
                        TextInput::make('name')->required()->maxLength(255),
                        // Members register with this code (e.g. R0101), so it must be unique.
                        TextInput::make('code')
                            ->required()
                            ->maxLength(20)
                            ->unique(ignoreRecord: true)
                            ->helperText('Region + zone code, e.g. R0101. Members need this to register.'),
                        Select::make('region_id')
                            ->label('Region')
                            ->relationship('region', 'name')
                            ->searchable()
                            ->preload()
                            ->required(),
                        TextInput::make('year_established')->numeric()->minValue(1900)->maxValue((int) date('Y')),
                        TextInput::make('phone')->tel()->maxLength(50),
                        TextInput::make('location')->maxLength(255),
                        TextInput::make('address')->maxLength(500)->columnSpanFull(),
                        Textarea::make('description')->rows(3)->columnSpanFull(),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('code')->sortable()->searchable(),
                TextColumn::make('name')->sortable()->searchable(),
                TextColumn::make('region.name')->sortable()->placeholder('—'),
                TextColumn::make('location')->toggleable(),
                TextColumn::make('phone')->toggleable(),
                TextColumn::make('home_groups_count')->counts('home_groups')->label('Home groups')->sortable(),
                TextColumn::make('created_at')->dateTime()->toggleable(isToggledHiddenByDefault: true),
            ])
            ->defaultSort('code')
            ->filters([
                SelectFilter::make('region_id')->label('Region')->relationship('region', 'name'),
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
            'index' => Pages\ListZones::route('/'),
            'create' => Pages\CreateZone::route('/create'),
            'edit' => Pages\EditZone::route('/{record}/edit'),
        ];
    }
}
