<?php

namespace App\Filament\Resources;

use App\Enums\UserRole;
use App\Filament\Resources\UserResource\Pages;
use App\Models\User;
use App\Services\AuditTrail;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\CreateRecord;
use Filament\Resources\Pages\Page;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Validation\Rules\Password;

/**
 * Every login account in the system. Staff accounts (master, finance, events) are created and managed here;
 * members and pastors are added from their own screens (so each gets the matching record), and shown here read-mostly.
 */
class UserResource extends Resource
{
    private const STAFF = ['master', 'finance', 'event'];

    protected static ?string $model = User::class;

    protected static ?string $navigationIcon = 'heroicon-o-user';
    protected static ?string $navigationLabel = 'Users';
    protected static ?string $navigationGroup = 'System Management';
    protected static ?int $navigationSort = 0;

    public static function canAccess(): bool
    {
        return auth()->user()?->hasAnyRole(['master']) ?? false;
    }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Account')->columns(2)->schema([
                Forms\Components\TextInput::make('name')->required()->maxLength(255),
                Forms\Components\TextInput::make('email')->label('Email address')->email()->required()->maxLength(255)->unique(ignoreRecord: true),
                Forms\Components\Select::make('role')->required()->native(false)
                    ->options(fn (?User $record) => $record && !in_array($record->role->value, self::STAFF, true)
                        ? [$record->role->value => $record->role->getLabel()]    // members/pastors/partners/HODs keep their role
                        : collect(self::STAFF)->mapWithKeys(fn ($r) => [$r => UserRole::from($r)->getLabel()])->all())
                    ->disabled(fn (?User $record) => $record && !in_array($record->role->value, self::STAFF, true))
                    ->helperText('Add members and pastors from their own screens so they get the matching record.'),
                Forms\Components\TextInput::make('phone')->tel()->maxLength(20),
                Forms\Components\DatePicker::make('date_of_birth')->label('Date of birth')->maxDate(now()->subYear())->native(false),
                Forms\Components\Toggle::make('is_active')->label('Active')->default(true)
                    ->helperText('Switching this off signs the person out immediately.'),
            ]),
            Forms\Components\Section::make('Password')->columns(2)->schema([
                Forms\Components\TextInput::make('password')->password()->revealable()
                    ->rule(Password::min(10)->letters()->numbers())
                    ->same('passwordConfirmation')
                    ->dehydrated(fn ($state) => filled($state))
                    ->required(fn (Page $livewire): bool => $livewire instanceof CreateRecord)
                    ->helperText('At least 10 characters, with letters and numbers. Leave blank to keep the current one.'),
                Forms\Components\TextInput::make('passwordConfirmation')->password()->revealable()->label('Confirm password')
                    ->dehydrated(false)
                    ->required(fn (Page $livewire): bool => $livewire instanceof CreateRecord),
            ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('created_at', 'desc')
            ->columns([
                Tables\Columns\TextColumn::make('name')->sortable()->searchable(),
                Tables\Columns\TextColumn::make('email')->sortable()->searchable()->toggleable(),
                Tables\Columns\TextColumn::make('role')->badge()->sortable(),
                Tables\Columns\IconColumn::make('is_active')->label('Active')->boolean()->sortable(),
                Tables\Columns\TextColumn::make('last_login_at')->label('Last sign-in')->since()->placeholder('Never')->sortable()->toggleable(),
                Tables\Columns\TextColumn::make('created_at')->label('Created')->dateTime('d M Y')->sortable()->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('role')->options(UserRole::class)->multiple(),
                Tables\Filters\TernaryFilter::make('is_active')->label('Active'),
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
                Tables\Actions\Action::make('toggle')
                    ->label(fn (User $r) => $r->is_active ? 'Deactivate' : 'Activate')
                    ->icon(fn (User $r) => $r->is_active ? 'heroicon-o-lock-closed' : 'heroicon-o-lock-open')
                    ->color(fn (User $r) => $r->is_active ? 'danger' : 'success')
                    ->requiresConfirmation()
                    ->visible(fn (User $r) => $r->id !== auth()->id())   // nobody locks themselves out
                    ->action(function (User $r) {
                        $r->update(['is_active' => !$r->is_active]);
                        if (!$r->is_active) {
                            $r->tokens()->delete();
                        }
                        AuditTrail::record($r->is_active ? 'user.activated' : 'user.deactivated', auth()->user(), $r, [], $r->id);
                        Notification::make()->title($r->is_active ? 'Account activated' : 'Account deactivated')->success()->send();
                    }),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index'  => Pages\ListUsers::route('/'),
            'create' => Pages\CreateUser::route('/create'),
            'edit'   => Pages\EditUser::route('/{record}/edit'),
        ];
    }
}
