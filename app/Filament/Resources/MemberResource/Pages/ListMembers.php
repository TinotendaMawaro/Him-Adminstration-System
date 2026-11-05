<?php

namespace App\Filament\Resources\MemberResource\Pages;

use App\Filament\Resources\MemberResource;
use Filament\Actions;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ListRecords;

class ListMembers extends ListRecords
{
    protected static string $resource = MemberResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\Action::make('new')->label('New member')->icon('heroicon-o-user-plus')
                ->modalHeading('Add a member')->modalDescription('They receive a welcome email with a secure link to choose their password.')->modalWidth('3xl')
                ->form(MemberResource::personForm(true))
                ->action(function (array $data) {
                    $member = app(\App\Services\PeopleProvisioner::class)->createMember($data, auth()->user());
                    Notification::make()->title('Member added')->body("{$member->name} {$member->surname} · {$member->member_code}")->success()->send();
                }),
        ];
    }
}
