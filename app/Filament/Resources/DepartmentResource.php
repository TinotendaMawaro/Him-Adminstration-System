<?php

namespace App\Filament\Resources;

use App\Filament\Resources\DepartmentResource\Pages;
use App\Filament\Resources\DepartmentResource\RelationManagers;
use App\Models\Department;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Forms\Components\Card;
use Filament\Forms\Components\TextInput;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class DepartmentResource extends Resource
{
    protected static ?string $model = Department::class;

    public static function canAccess(): bool
    {
        return auth()->user()?->hasAnyRole(['master']) ?? false;
    }

    protected static ?string $navigationIcon = 'heroicon-o-briefcase';

    protected static ?string $navigationGroup = 'Church Management';

    protected static ?int $navigationSort = 2;

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                Card::make()
                    ->schema([
                        TextInput::make('name')->required()
                    ])
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')->sortable()->searchable(),
                TextColumn::make('created_at')->dateTime()
            ])
            ->filters([
                //
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\Action::make('hod')->label('Appoint HOD')->icon('heroicon-o-building-office')->color('warning')
                    ->modalDescription(fn (\App\Models\Department $record) => 'Choose the zone, then someone from it. They become head of ' . $record->name . '.')
                    ->form([
                        \Filament\Forms\Components\Select::make('zone_id')->label('Zone')->required()->searchable()->live()
                            ->default(fn (\App\Models\Department $record) => $record->zone_id)->disabled(fn (\App\Models\Department $record) => (bool) $record->zone_id)->dehydrated(true)
                            ->options(fn () => \App\Models\Zone::orderBy('code')->get()->mapWithKeys(fn ($z) => [$z->id => "{$z->code} · {$z->name}"])->all())
                            ->afterStateUpdated(fn (\Filament\Forms\Set $set) => $set('user_id', null))
                            ->helperText('The head must belong to this zone.'),
                        \Filament\Forms\Components\Select::make('user_id')->label('Person')->required()->searchable()
                            ->helperText('Only people who belong to the chosen zone are listed.')
                            ->getSearchResultsUsing(fn (string $search, \Filament\Forms\Get $get) => \App\Models\User::query()->where('zone_id', $get('zone_id'))->where('is_active', true)
                                ->whereIn('role', ['member', 'partner', 'hod', 'pastor'])->where('name', 'like', "%{$search}%")->orderBy('name')->limit(30)->pluck('name', 'id')->all())
                            ->getOptionLabelUsing(fn ($value) => \App\Models\User::find($value)?->name),
                        \Filament\Forms\Components\Toggle::make('immediate')->label('Effective immediately')->default(true)->helperText('Off: they receive an invitation to accept or decline.'),
                    ])
                    ->action(function (\App\Models\Department $record, array $data) {
                        try {
                            app(\App\Services\LeadershipService::class)->appointHod($record, \App\Models\User::findOrFail($data['user_id']), auth()->user(), (bool) $data['immediate']);
                        } catch (\Illuminate\Validation\ValidationException $e) {
                            \Filament\Notifications\Notification::make()->title('Not possible')->body(collect($e->errors())->flatten()->first())->danger()->send();
                            return;
                        }
                        \Filament\Notifications\Notification::make()->title('Head of department appointed')->success()->send();
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
            'index' => Pages\ListDepartments::route('/'),
            'create' => Pages\CreateDepartment::route('/create'),
            'edit' => Pages\EditDepartment::route('/{record}/edit'),
        ];
    }
}
