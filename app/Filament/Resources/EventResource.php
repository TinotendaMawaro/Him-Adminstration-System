<?php

namespace App\Filament\Resources;

use App\Enums\EventStatus;
use App\Enums\EventType;
use App\Filament\Resources\EventResource\Pages;
use App\Filament\Resources\EventResource\RelationManagers\RegistrationsRelationManager;
use App\Models\Event;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Grid;
use Filament\Forms\Components\Section;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TagsInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\SoftDeletingScope;

class EventResource extends Resource
{
    protected static ?string $model = Event::class;

    protected static ?string $navigationIcon = 'heroicon-o-calendar-days';

    protected static ?string $navigationGroup = 'Events';

    protected static ?int $navigationSort = 0;

    /** Only master admins and events coordinators see this resource. */
    public static function canAccess(): bool
    {
        return auth()->user()?->hasAnyRole(['master', 'event']) ?? false;
    }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Section::make('Event details')
                ->columns(2)
                ->schema([
                    TextInput::make('title')->required()->maxLength(255)->columnSpanFull(),
                    Textarea::make('description')->rows(4)->columnSpanFull(),
                    Select::make('type')
                        ->options(EventType::class)
                        ->default(EventType::SpecialService->value)
                        ->required(),
                    Select::make('status')
                        ->options(EventStatus::class)
                        ->default(EventStatus::Draft->value)
                        ->required(),
                    TextInput::make('category')->maxLength(100),
                    TextInput::make('host')->maxLength(255),
                    TextInput::make('theme')->maxLength(255)->columnSpanFull(),
                ]),

            Section::make('When & where')
                ->columns(2)
                ->schema([
                    DateTimePicker::make('starts_at')->required(),
                    DateTimePicker::make('ends_at')->after('starts_at'),
                    TextInput::make('venue_name')->maxLength(255),
                    TextInput::make('venue_address')->maxLength(255),
                    Select::make('zone_id')
                        ->label('Zone')
                        ->relationship('zone', 'name')
                        ->searchable()
                        ->preload()
                        ->placeholder('All zones'),
                    TextInput::make('scope')->maxLength(255),
                    Toggle::make('is_livestream')->live(),
                    TextInput::make('livestream_url')
                        ->url()
                        ->visible(fn ($get) => (bool) $get('is_livestream')),
                ]),

            Section::make('Registration')
                ->columns(2)
                ->schema([
                    Toggle::make('requires_registration')->live(),
                    Toggle::make('requires_checkin'),
                    Toggle::make('requires_payment')->live()
                        ->visible(fn ($get) => (bool) $get('requires_registration')),
                    Grid::make(2)
                        ->visible(fn ($get) => (bool) $get('requires_registration'))
                        ->schema([
                            TextInput::make('capacity')->numeric()->minValue(1),
                            DateTimePicker::make('registration_closes_at'),
                            TextInput::make('registration_fee')
                                ->numeric()->minValue(0)->prefix('$')->default(0)
                                ->visible(fn ($get) => (bool) $get('requires_payment')),
                            TextInput::make('currency')
                                ->default('USD')->length(3)
                                ->visible(fn ($get) => (bool) $get('requires_payment')),
                        ])->columnSpanFull(),
                ]),

            Section::make('Visibility')
                ->columns(2)
                ->schema([
                    Toggle::make('is_public')->default(true),
                    Toggle::make('is_featured'),
                    FileUpload::make('image')
                        ->image()
                        ->directory('events')
                        ->maxSize(2048)
                        ->columnSpanFull(),
                ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('title')->searchable()->sortable()->limit(40),
                TextColumn::make('type')->badge()->sortable(),
                TextColumn::make('status')->badge()->sortable(),
                TextColumn::make('starts_at')->dateTime('d M Y H:i')->sortable(),
                TextColumn::make('zone.name')->placeholder('All zones')->toggleable(),
                TextColumn::make('registrations_count')
                    ->label('Registered')
                    ->counts('registrations')
                    ->formatStateUsing(fn ($state, Event $record) => $record->capacity
                        ? "{$state} / {$record->capacity}"
                        : (string) $state),
                IconColumn::make('is_featured')->boolean()->toggleable(),
                TextColumn::make('createdBy.name')->label('Created by')->toggleable(isToggledHiddenByDefault: true),
            ])
            ->defaultSort('starts_at', 'desc')
            ->filters([
                SelectFilter::make('status')->options(EventStatus::class),
                SelectFilter::make('type')->options(EventType::class),
                TernaryFilter::make('is_featured')->label('Featured'),
                Tables\Filters\TrashedFilter::make()
                    ->visible(fn () => auth()->user()?->isMaster() ?? false),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\DeleteAction::make(),
                Tables\Actions\RestoreAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()->withoutGlobalScopes([SoftDeletingScope::class]);
    }

    public static function getRelations(): array
    {
        return [
            RegistrationsRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListEvents::route('/'),
            'create' => Pages\CreateEvent::route('/create'),
            'edit'   => Pages\EditEvent::route('/{record}/edit'),
        ];
    }
}
