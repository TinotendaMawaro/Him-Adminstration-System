<?php

namespace App\Filament\Resources;

use App\Filament\Resources\PastorResource\Pages;
use App\Models\Pastor;
use App\Models\Region;
use App\Models\Zone;
use App\Models\ZoneHistory;
use App\Services\PastorTransferService;
use Filament\Forms;
use Filament\Forms\Form;
use Filament\Infolists;
use Filament\Infolists\Infolist;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class PastorResource extends Resource
{
    protected static ?string $model = Pastor::class;

    protected static ?string $navigationIcon = 'heroicon-o-user-circle';
    protected static ?string $navigationGroup = 'Church Management';
    protected static ?int $navigationSort = 1;
    protected static ?string $recordTitleAttribute = 'code';

    public static function canAccess(): bool
    {
        return auth()->user()?->isMaster() ?? false;
    }

    /** Pastors are created with their login account; this screen manages and transfers them. */
    public static function canCreate(): bool { return false; }

    public static function getGloballySearchableAttributes(): array
    {
        return ['name', 'surname', 'code', 'user.email'];
    }

    public static function form(Form $form): Form
    {
        return $form->schema([
            Forms\Components\Section::make('Pastor')->columns(2)->schema([
                Forms\Components\TextInput::make('title')->maxLength(40),
                Forms\Components\TextInput::make('code')->disabled()->dehydrated(false)->helperText('Login code — change it from Users.'),
                Forms\Components\TextInput::make('name')->required()->maxLength(120),
                Forms\Components\TextInput::make('surname')->required()->maxLength(120),
                Forms\Components\DatePicker::make('ordained_date')->maxDate(now()),
            ]),
            Forms\Components\Section::make('Account')->columns(2)->relationship('user')->schema([
                Forms\Components\TextInput::make('email')->label('Email (where the password link is sent)')->email()->required()->maxLength(190)
                    ->unique(ignoreRecord: true)->columnSpanFull(),
                Forms\Components\DatePicker::make('date_of_birth')->label('Date of birth')->maxDate(now()->subYear())->native(false),
                Forms\Components\TextInput::make('phone')->tel()->maxLength(20),
            ]),
            Forms\Components\Section::make('Responsibilities')->columns(3)->schema([
                Forms\Components\Toggle::make('is_zone_pastor')->label('Zone pastor'),
                Forms\Components\Toggle::make('is_regional_leader')->label('Regional leader'),
                Forms\Components\Toggle::make('is_general_overseer')->label('General overseer'),
            ]),
            Forms\Components\Placeholder::make('assignment')->label('Assignment')
                ->content('Use the Transfer action on the pastors list to move a pastor to another zone or region.'),
        ]);
    }

    public static function infolist(Infolist $infolist): Infolist
    {
        return $infolist->schema([
            Infolists\Components\Section::make()->columns(4)->schema([
                Infolists\Components\TextEntry::make('full_name')->label('Pastor')->weight('bold')->size('lg'),
                Infolists\Components\TextEntry::make('code')->badge(),
                Infolists\Components\TextEntry::make('user.email')->label('Email')->placeholder('—')->copyable(),
                Infolists\Components\TextEntry::make('ordained_date')->date('d M Y')->placeholder('—'),
                Infolists\Components\TextEntry::make('zone.name')->label('Zone')->placeholder('Unassigned'),
                Infolists\Components\TextEntry::make('zone.region.name')->label('Region')->placeholder('—'),
                Infolists\Components\IconEntry::make('is_zone_pastor')->label('Zone pastor')->boolean(),
                Infolists\Components\IconEntry::make('is_regional_leader')->label('Regional leader')->boolean(),
            ]),
            Infolists\Components\Section::make('Zone statistics')->columns(4)->schema([
                Infolists\Components\TextEntry::make('stat_members')->label('Active members')
                    ->state(fn (Pastor $r) => DB::table('members')->where('zone_id', $r->zone_id)->whereNull('deleted_at')->where('status', 'active')->count()),
                Infolists\Components\TextEntry::make('stat_groups')->label('Home groups')
                    ->state(fn (Pastor $r) => DB::table('home_groups')->where('zone_id', $r->zone_id)->count()),
                Infolists\Components\TextEntry::make('stat_income')->label('Income year to date')
                    ->state(fn (Pastor $r) => '$' . number_format((float) DB::table('payments')->where('zone_id', $r->zone_id)->whereNull('deleted_at')->where('status', 'completed')->where('paid_at', '>=', now()->startOfYear())->sum('amount'), 2)),
                Infolists\Components\TextEntry::make('stat_report')->label('Last report')
                    ->state(fn (Pastor $r) => ($data = DB::table('reports')->where('zone_id', $r->zone_id)->max('report_date')) ? \Carbon\Carbon::parse($data)->format('d M Y') : 'Never'),
            ]),
            Infolists\Components\Section::make('Assignment history')->collapsed()->schema([
                Infolists\Components\RepeatableEntry::make('history')->hiddenLabel()->columns(4)
                    ->state(fn (Pastor $r) => $r->user_id ? ZoneHistory::with('zone')->where('pastor_id', $r->user_id)->orderByDesc('start_date')->get()->map(fn ($h) => [
                        'zone' => $h->zone?->name, 'start' => $h->start_date?->format('d M Y'), 'end' => $h->end_date?->format('d M Y') ?? 'Present', 'notes' => $h->notes,
                    ])->all() : [])
                    ->schema([
                        Infolists\Components\TextEntry::make('zone'), Infolists\Components\TextEntry::make('start'),
                        Infolists\Components\TextEntry::make('end'), Infolists\Components\TextEntry::make('notes'),
                    ]),
            ]),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->modifyQueryUsing(fn (Builder $query) => $query->with(['user', 'zone.region']))
            ->columns([
                Tables\Columns\TextColumn::make('code')->badge()->searchable()->sortable(),
                Tables\Columns\TextColumn::make('full_name')->label('Pastor')
                    ->state(fn (Pastor $r) => trim("{$r->title} {$r->name} {$r->surname}"))
                    ->searchable(['name', 'surname']),
                Tables\Columns\TextColumn::make('user.email')->label('Email')->toggleable()->placeholder('—'),
                Tables\Columns\TextColumn::make('zone.name')->label('Zone')->placeholder('Unassigned')->sortable(),
                Tables\Columns\TextColumn::make('zone.region.name')->label('Region')->placeholder('—'),
                Tables\Columns\IconColumn::make('is_zone_pastor')->label('Zone pastor')->boolean(),
                Tables\Columns\IconColumn::make('is_regional_leader')->label('Regional')->boolean()->toggleable(),
                Tables\Columns\IconColumn::make('is_general_overseer')->label('Overseer')->boolean()->toggleable(isToggledHiddenByDefault: true),
                Tables\Columns\TextColumn::make('members')->label('Members in zone')
                    ->state(fn (Pastor $r) => DB::table('members')->where('zone_id', $r->zone_id)->whereNull('deleted_at')->where('status', 'active')->count())
                    ->numeric(),
            ])
            ->defaultSort('code')
            ->filters([
                Tables\Filters\SelectFilter::make('region')->options(fn () => Region::orderBy('name')->pluck('name', 'id')->all())
                    ->query(fn (Builder $query, array $data) => $query->when($data['value'] ?? null, fn ($query, $v) => $query->whereHas('zone', fn ($z) => $z->where('region_id', $v)))),
                Tables\Filters\SelectFilter::make('zone_id')->label('Zone')->searchable()
                    ->options(fn () => Zone::orderBy('code')->get()->mapWithKeys(fn ($z) => [$z->id => "{$z->code} · {$z->name}"])->all()),
                Tables\Filters\TernaryFilter::make('is_zone_pastor')->label('Zone pastor'),
                Tables\Filters\TernaryFilter::make('is_regional_leader')->label('Regional leader'),
                Tables\Filters\TernaryFilter::make('unassigned')->label('Unassigned')->queries(
                    true: fn (Builder $query) => $query->whereNull('zone_id'), false: fn (Builder $query) => $query->whereNotNull('zone_id'), blank: fn (Builder $query) => $query),
            ], layout: Tables\Enums\FiltersLayout::AboveContentCollapsible)
            ->actions([
                Tables\Actions\ViewAction::make(),
                Tables\Actions\EditAction::make(),
                Tables\Actions\Action::make('passwordLink')->label('Send password link')->icon('heroicon-o-key')->color('info')
                    ->requiresConfirmation()->modalHeading(fn (Pastor $r) => "Email a password link to {$r->name} {$r->surname}?")
                    ->modalDescription(fn (Pastor $r) => 'The link goes to ' . ($r->user?->email ?? 'no email on file') . ' and lets them choose their own password. Correct the email first (Edit) if it is wrong.')
                    ->visible(fn (Pastor $r) => (bool) $r->user)
                    ->action(function (Pastor $r) {
                        try {
                            app(\App\Services\PeopleProvisioner::class)->sendPasswordLink($r->user, auth()->user());
                        } catch (\Illuminate\Validation\ValidationException $e) {
                            Notification::make()->title('Not sent')->body(collect($e->errors())->flatten()->first())->danger()->send();
                            return;
                        }
                        Notification::make()->title('Password link sent')->body("Sent to {$r->user->email}")->success()->send();
                    }),
                Tables\Actions\Action::make('remove')->label('Remove')->icon('heroicon-o-trash')->color('danger')
                    ->requiresConfirmation()->modalHeading(fn (Pastor $r) => "Remove {$r->name} {$r->surname}?")
                    ->modalDescription('Their login stops working immediately; their history is kept. If they led their zone, the zone will need a new lead pastor.')
                    ->action(function (Pastor $r) {
                        app(\App\Services\PeopleProvisioner::class)->removePastor($r, auth()->user());
                        Notification::make()->title('Pastor removed')->success()->send();
                    }),
                Tables\Actions\Action::make('transfer')->label('Transfer')->icon('heroicon-o-arrows-right-left')->color('warning')
                    ->modalHeading(fn (Pastor $r) => "Transfer {$r->name} {$r->surname}")
                    ->modalDescription('Moves the pastor (and their login) to another zone and its region. History, audit trail and a notification to the pastor are recorded.')
                    ->modalSubmitActionLabel('Transfer pastor')
                    ->form([
                        Forms\Components\Select::make('region_id')->label('Region')->options(fn () => Region::orderBy('name')->pluck('name', 'id')->all())
                            ->live()->afterStateUpdated(fn (Forms\Set $set) => $set('zone_id', null))->dehydrated(false),
                        Forms\Components\Select::make('zone_id')->label('New zone')->required()->searchable()
                            ->options(fn (Forms\Get $get, Pastor $r) => Zone::query()
                                ->when($get('region_id'), fn ($query, $v) => $query->where('region_id', $v))
                                ->where('id', '!=', $r->zone_id)->orderBy('code')->get()
                                ->mapWithKeys(fn ($z) => [$z->id => "{$z->code} · {$z->name}"])->all()),
                        Forms\Components\DatePicker::make('effective')->label('Effective date')->default(now())->required(),
                        Forms\Components\Textarea::make('reason')->label('Reason / notes')->maxLength(500)->rows(2),
                    ])
                    ->action(function (Pastor $r, array $data) {
                        try {
                            $moved = app(PastorTransferService::class)->transfer($r, Zone::findOrFail($data['zone_id']), auth()->user(), $data['reason'] ?? null, $data['effective'] ?? null);
                        } catch (ValidationException $e) {
                            Notification::make()->title('Transfer not possible')->body(collect($e->errors())->flatten()->first())->danger()->send();
                            return;
                        }
                        Notification::make()->title('Pastor transferred')->body("{$moved->name} {$moved->surname} is now in " . $moved->zone->name)->success()->send();
                    }),
            ])
            ->headerActions([
                Tables\Actions\Action::make('export')->label('Export CSV')->icon('heroicon-o-arrow-down-tray')->color('gray')
                    ->url(fn () => route('exports.download', ['report' => 'pastors'])),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListPastors::route('/'),
            'view'  => Pages\ViewPastor::route('/{record}'),
            'edit'  => Pages\EditPastor::route('/{record}/edit'),
        ];
    }
}
