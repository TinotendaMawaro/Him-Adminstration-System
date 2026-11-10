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
                Tables\Actions\ActionGroup::make([
                    Tables\Actions\Action::make('pic')->label('Set pastor in charge')->icon('heroicon-o-star')
                        ->modalDescription('The pastor in charge leads this zone. The previous one stays a pastor of the zone. Both are told.')
                        ->form([\Filament\Forms\Components\Select::make('pastor_id')->label('Pastor')->required()->searchable()
                            ->options(fn (Zone $record) => \App\Models\Pastor::where('zone_id', $record->id)->get()->mapWithKeys(fn ($p) => [$p->id => trim("{$p->name} {$p->surname}") . ' (' . $p->code . ')' . ($p->is_zone_pastor ? ' - current' : '')])->all())
                            ->helperText('Only pastors already in this zone are listed. Transfer a pastor into the zone first if needed.')])
                        ->action(function (Zone $record, array $data) {
                            try {
                                app(\App\Services\LeadershipService::class)->setPastorInCharge($record, \App\Models\Pastor::findOrFail($data['pastor_id']), auth()->user());
                            } catch (\Illuminate\Validation\ValidationException $e) {
                                \Filament\Notifications\Notification::make()->title('Not possible')->body(collect($e->errors())->flatten()->first())->danger()->send();
                                return;
                            }
                            \Filament\Notifications\Notification::make()->title('Pastor in charge updated')->success()->send();
                        }),
                    Tables\Actions\Action::make('zoneAdmin')->label('Set zone administrator')->icon('heroicon-o-key')
                        ->visible(fn () => app(\App\Services\LeadershipService::class)->hasZoneAdminSupport())
                        ->form([
                            \Filament\Forms\Components\Select::make('pastor_id')->label('Pastor')->required()->searchable()
                                ->options(fn (Zone $record) => \App\Models\Pastor::where('zone_id', $record->id)->get()->mapWithKeys(fn ($p) => [$p->id => trim("{$p->name} {$p->surname}") . ($p->is_zone_admin ? ' - administrator' : '')])->all()),
                            \Filament\Forms\Components\Toggle::make('on')->label('Make administrator')->default(true)->helperText('Switch off to remove the role.'),
                        ])
                        ->action(function (Zone $record, array $data) {
                            try {
                                app(\App\Services\LeadershipService::class)->setZoneAdmin($record, \App\Models\Pastor::findOrFail($data['pastor_id']), (bool) $data['on'], auth()->user());
                            } catch (\Illuminate\Validation\ValidationException $e) {
                                \Filament\Notifications\Notification::make()->title('Not possible')->body(collect($e->errors())->flatten()->first())->danger()->send();
                                return;
                            }
                            \Filament\Notifications\Notification::make()->title('Zone administrator updated')->success()->send();
                        }),
                ])->label('Leadership')->icon('heroicon-o-user-group'),
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
