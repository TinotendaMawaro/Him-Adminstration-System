<?php

namespace App\Filament\Resources;

use App\Enums\MemberStatus;
use App\Filament\Resources\MemberResource\Pages;
use App\Models\Member;
use App\Models\Region;
use App\Models\User;
use App\Models\Zone;
use App\Services\AuditTrail;
use Filament\Forms;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;

/**
 * Master oversight of every member in the church: search, filter, change status,
 * and move a member between zones (keeping the login account in step).
 */
class MemberResource extends Resource
{
    protected static ?string $model = Member::class;

    protected static ?string $navigationIcon = 'heroicon-o-users';
    protected static ?string $navigationGroup = 'Church Management';
    protected static ?int $navigationSort = 2;
    protected static ?string $recordTitleAttribute = 'member_code';

    public static function canAccess(): bool
    {
        return auth()->user()?->isMaster() ?? false;
    }

    public static function canCreate(): bool { return false; }
    public static function canEdit($record): bool { return false; }
    public static function canDelete($record): bool { return false; }

    public static function getGloballySearchableAttributes(): array
    {
        return ['name', 'surname', 'member_code', 'member_number', 'user.email'];
    }

    /** The details head office can set. The zone is chosen when adding; to change it later use "Move zone" (it needs a reason). */
    public static function personForm(bool $creating, ?Member $member = null): array
    {
        $emailRule = \Illuminate\Validation\Rule::unique('users', 'email')->ignore($member?->user_id);

        return [
            Forms\Components\Grid::make(2)->schema([
                Forms\Components\TextInput::make('name')->label('First name')->required()->maxLength(120),
                Forms\Components\TextInput::make('surname')->required()->maxLength(120),
                Forms\Components\TextInput::make('email')->email()->required()->maxLength(190)->rules([$emailRule]),
                Forms\Components\TextInput::make('phone')->tel()->maxLength(20),
                Forms\Components\DatePicker::make('date_of_birth')->label('Date of birth')->maxDate(now()->subYear())->native(false),
                Forms\Components\Select::make('gender_id')->label('Gender')->options(fn () => \App\Models\Gender::orderBy('name')->pluck('name', 'id')->all())->native(false),
                Forms\Components\Select::make('zone_id')->label('Zone')->required()->searchable()->visible($creating)
                    ->options(fn () => Zone::orderBy('code')->get()->mapWithKeys(fn ($z) => [$z->id => "{$z->code} · {$z->name}"])->all()),
                Forms\Components\Select::make('status')->options(MemberStatus::class)->default('active')->required()->native(false),
                Forms\Components\Toggle::make('is_baptised')->label('Baptised'),
                Forms\Components\Toggle::make('can_be_partner')->label('Can be a partner'),
            ]),
        ];
    }

    private static function mapValidation(\Closure $do): void
    {
        try {
            $do();
        } catch (\Illuminate\Validation\ValidationException $e) {
            Notification::make()->title('Not possible')->body(collect($e->errors())->flatten()->first())->danger()->send();
        }
    }

    public static function table(Table $table): Table
    {
        return $table
            ->modifyQueryUsing(fn (Builder $query) => $query->with(['user', 'zone.region', 'homeGroup', 'department']))
            ->columns([
                Tables\Columns\TextColumn::make('member_code')->label('Code')->badge()->searchable()->sortable()->placeholder('—'),
                Tables\Columns\TextColumn::make('full_name')->label('Member')
                    ->state(fn (Member $r) => "{$r->name} {$r->surname}")->searchable(['name', 'surname']),
                Tables\Columns\TextColumn::make('user.email')->label('Email')->searchable()->toggleable(),
                Tables\Columns\TextColumn::make('zone.name')->label('Zone')->placeholder('—')->sortable(),
                Tables\Columns\TextColumn::make('zone.region.name')->label('Region')->placeholder('—')->toggleable(),
                Tables\Columns\TextColumn::make('homeGroup.name')->label('Home group')->placeholder('—')->toggleable(),
                Tables\Columns\TextColumn::make('department.name')->label('Department')->placeholder('—')->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('status')->badge(),
                Tables\Columns\IconColumn::make('is_baptised')->label('Baptised')->boolean()->toggleable(),
                Tables\Columns\TextColumn::make('membership_date')->label('Member since')->date('d M Y')->sortable(),
            ])
            ->defaultSort('membership_date', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('status')->options(MemberStatus::class)->multiple(),
                Tables\Filters\SelectFilter::make('region')->options(fn () => Region::orderBy('name')->pluck('name', 'id')->all())
                    ->query(fn (Builder $query, array $data) => $query->when($data['value'] ?? null, fn ($query, $v) => $query->whereHas('zone', fn ($z) => $z->where('region_id', $v)))),
                Tables\Filters\SelectFilter::make('zone_id')->label('Zone')->searchable()
                    ->options(fn () => Zone::orderBy('code')->get()->mapWithKeys(fn ($z) => [$z->id => "{$z->code} · {$z->name}"])->all()),
                Tables\Filters\TernaryFilter::make('is_baptised')->label('Baptised'),
                Tables\Filters\TernaryFilter::make('no_home_group')->label('Home group')->queries(
                    true: fn (Builder $query) => $query->whereNull('home_group_id'), false: fn (Builder $query) => $query->whereNotNull('home_group_id'), blank: fn (Builder $query) => $query)
                    ->trueLabel('Not in a home group')->falseLabel('In a home group'),
            ], layout: Tables\Enums\FiltersLayout::AboveContentCollapsible)
            ->actions([
                Tables\Actions\Action::make('edit')->label('Edit')->icon('heroicon-o-pencil-square')->color('gray')
                    ->modalHeading(fn (Member $r) => "Edit {$r->name} {$r->surname}")->modalWidth('3xl')
                    ->form(fn (Member $r) => self::personForm(false, $r))
                    ->fillForm(fn (Member $r) => $r->only(['name', 'surname', 'date_of_birth', 'gender_id', 'is_baptised', 'can_be_partner']) + ['email' => $r->user?->email, 'phone' => $r->user?->phone, 'status' => $r->status?->value])
                    ->action(function (Member $r, array $data) {
                        app(\App\Services\PeopleProvisioner::class)->updateMember($r, $data, auth()->user());
                        Notification::make()->title('Member updated')->success()->send();
                    }),
                Tables\Actions\Action::make('remove')->label('Remove')->icon('heroicon-o-trash')->color('danger')
                    ->requiresConfirmation()->modalHeading(fn (Member $r) => "Remove {$r->name} {$r->surname}?")
                    ->modalDescription('Their login stops working immediately. Their history, giving and receipts are kept.')
                    ->action(function (Member $r) {
                        self::mapValidation(function () use ($r) {
                            app(\App\Services\PeopleProvisioner::class)->removeMember($r, auth()->user());
                            Notification::make()->title('Member removed')->success()->send();
                        });
                    }),
                Tables\Actions\Action::make('status')->label('Status')->icon('heroicon-o-flag')->color('gray')
                    ->form([Forms\Components\Select::make('status')->options(MemberStatus::class)->required()])
                    ->fillForm(fn (Member $r) => ['status' => $r->status?->value])
                    ->action(function (Member $r, array $data) {
                        $old = $r->status?->value;
                        $r->update(['status' => $data['status']]);
                        AuditTrail::record('member.status_changed', auth()->user(), $r, ['from' => $old, 'to' => $data['status']], $r->user_id);
                        Notification::make()->title('Status updated')->success()->send();
                    }),
                Tables\Actions\Action::make('transfer')->label('Move zone')->icon('heroicon-o-arrows-right-left')->color('warning')
                    ->form([
                        Forms\Components\Select::make('zone_id')->label('New zone')->required()->searchable()
                            ->options(fn (Member $r) => Zone::where('id', '!=', $r->zone_id)->orderBy('code')->get()->mapWithKeys(fn ($z) => [$z->id => "{$z->code} · {$z->name}"])->all()),
                        Forms\Components\Textarea::make('reason')->required()->minLength(3)->maxLength(300)->rows(2),
                    ])
                    ->modalDescription('Moves the member and their login to the new zone. They leave their current home group and keep their member number.')
                    ->action(function (Member $r, array $data) {
                        try {
                            app(\App\Services\MemberTransferService::class)->transfer($r, Zone::findOrFail($data['zone_id']), auth()->user(), $data['reason']);
                        } catch (\Illuminate\Validation\ValidationException $e) {
                            Notification::make()->title('Move not possible')->body(collect($e->errors())->flatten()->first())->danger()->send();
                            return;
                        }
                        Notification::make()->title('Member moved')->success()->send();
                    }),
            ])
            ->headerActions([
                Tables\Actions\Action::make('export')->label('Export CSV')->icon('heroicon-o-arrow-down-tray')->color('gray')
                    ->url(fn () => route('exports.download', ['report' => 'members'])),
            ]);
    }

    public static function getPages(): array
    {
        return ['index' => Pages\ListMembers::route('/')];
    }
}
