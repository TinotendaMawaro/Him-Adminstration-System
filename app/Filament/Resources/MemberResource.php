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
                        Forms\Components\Textarea::make('reason')->maxLength(300)->rows(2),
                    ])
                    ->modalDescription('Moves the member and their login to the new zone. They leave their current home group.')
                    ->action(function (Member $r, array $data) {
                        DB::transaction(function () use ($r, $data) {
                            $from = $r->zone_id;
                            $r->update(['zone_id' => $data['zone_id'], 'home_group_id' => null]);
                            if ($r->user_id) {
                                User::whereKey($r->user_id)->update(['zone_id' => $data['zone_id'], 'home_group_id' => null]);
                            }
                            AuditTrail::record('member.transferred', auth()->user(), $r, ['from_zone' => $from, 'to_zone' => (int) $data['zone_id'], 'reason' => $data['reason'] ?? null], $r->user_id);
                        });
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
