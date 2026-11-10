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
                Tables\Actions\Action::make('leader')->label('Assign leader')->icon('heroicon-o-user-plus')->color('warning')
                    ->modalDescription(fn (\App\Models\HomeGroup $record) => 'Choose someone from ' . ($record->zone?->name ?? 'this zone') . '. They join the group and become its leader.')
                    ->form([
                        \Filament\Forms\Components\Select::make('user_id')->label('Person')->required()->searchable()
                            ->helperText('Only people who belong to this zone are listed.')
                            ->getSearchResultsUsing(fn (string $search, $record) => \App\Models\User::query()->where('zone_id', $record->zone_id)->where('is_active', true)
                                ->whereIn('role', ['member', 'partner', 'hod'])->where('name', 'like', "%{$search}%")->orderBy('name')->limit(30)->pluck('name', 'id')->all())
                            ->getOptionLabelUsing(fn ($value) => \App\Models\User::find($value)?->name),
                    ])
                    ->action(function (\App\Models\HomeGroup $record, array $data) {
                        try {
                            app(\App\Services\LeadershipService::class)->assignHomeGroupLeader($record, \App\Models\User::findOrFail($data['user_id']), auth()->user());
                        } catch (\Illuminate\Validation\ValidationException $e) {
                            \Filament\Notifications\Notification::make()->title('Not possible')->body(collect($e->errors())->flatten()->first())->danger()->send();
                            return;
                        }
                        \Filament\Notifications\Notification::make()->title('Home group leader assigned')->success()->send();
                    }),
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
