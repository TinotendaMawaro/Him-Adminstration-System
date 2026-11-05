<?php

namespace App\Filament\Resources\PastorResource\Pages;

use App\Filament\Resources\PastorResource;
use Filament\Actions;
use Filament\Forms;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ListRecords;

class ListPastors extends ListRecords
{
    protected static string $resource = PastorResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\Action::make('new')->label('New pastor')->icon('heroicon-o-user-plus')->modalWidth('3xl')
                ->modalHeading('Add a pastor')
                ->modalDescription('A sign-in code is generated from the zone (for example R0101P02). The pastor receives a welcome email and a secure link to set a password.')
                ->form([
                    Forms\Components\Grid::make(2)->schema([
                        Forms\Components\TextInput::make('title')->maxLength(40)->placeholder('Pastor, Apostle, Prophet…'),
                        Forms\Components\Select::make('zone_id')->label('Zone')->required()->searchable()
                            ->options(fn () => \App\Models\Zone::orderBy('code')->get()->mapWithKeys(fn ($z) => [$z->id => "{$z->code} · {$z->name}"])->all()),
                        Forms\Components\TextInput::make('name')->label('First name')->required()->maxLength(120),
                        Forms\Components\TextInput::make('surname')->required()->maxLength(120),
                        Forms\Components\TextInput::make('email')->email()->required()->maxLength(190)->unique('users', 'email'),
                        Forms\Components\TextInput::make('phone')->tel()->maxLength(20),
                        Forms\Components\DatePicker::make('date_of_birth')->label('Date of birth')->maxDate(now()->subYear())->native(false),
                        Forms\Components\DatePicker::make('ordained_date')->maxDate(now())->native(false),
                    ]),
                ])
                ->action(function (array $data) {
                    $pastor = app(\App\Services\PeopleProvisioner::class)->createPastor($data, auth()->user());
                    Notification::make()->title('Pastor added')->body("{$pastor->name} {$pastor->surname} · sign-in code {$pastor->code}")->success()->send();
                }),
        ];
    }
}
