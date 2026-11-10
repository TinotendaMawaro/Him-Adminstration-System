<?php

namespace App\Filament\Resources\UserResource\Pages;

use App\Enums\UserRole;
use App\Filament\Resources\UserResource;
use App\Services\LeadershipService;
use Filament\Actions;
use Filament\Forms;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ListRecords;
use Illuminate\Validation\ValidationException;

class ListUsers extends ListRecords
{
    protected static string $resource = UserResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),

            // Finance and Events logins: head office appoints the person and hands over the credentials once (Copy / watermarked PDF).
            Actions\Action::make('appointStaff')->label('Appoint finance / events staff')->icon('heroicon-o-identification')->color('warning')
                ->modalHeading('Appoint a staff member')
                ->modalDescription('Creates their login and a temporary password. You will see the details once, with Copy and a PDF to hand over.')
                ->modalSubmitActionLabel('Appoint and show credentials')
                ->form([
                    Forms\Components\TextInput::make('name')->label('Full name')->required()->maxLength(120),
                    Forms\Components\TextInput::make('email')->label('Email (their login)')->email()->required()->maxLength(160),
                    Forms\Components\Select::make('role')->label('Portal')->required()->native(false)
                        ->options([UserRole::Finance->value => 'Finance portal', UserRole::Event->value => 'Events portal']),
                ])
                ->action(function (array $data) {
                    try {
                        $creds = app(LeadershipService::class)->appointStaff($data['name'], $data['email'], UserRole::from($data['role']), auth()->user());
                    } catch (ValidationException $e) {
                        Notification::make()->title('Not possible')->body(collect($e->errors())->flatten()->first())->danger()->send();

                        return;
                    }
                    Notification::make()->title('Staff member appointed')->success()->send();
                    $this->replaceMountedAction('credentials', ['creds' => $creds]);
                }),

            \App\Filament\Support\CredentialsModal::pageAction(),
        ];
    }
}
