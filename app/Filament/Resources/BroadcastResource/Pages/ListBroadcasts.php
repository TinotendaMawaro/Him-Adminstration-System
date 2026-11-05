<?php

namespace App\Filament\Resources\BroadcastResource\Pages;

use App\Filament\Resources\BroadcastResource;
use App\Services\BroadcastService;
use Filament\Actions;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ListRecords;
use Illuminate\Validation\ValidationException;

class ListBroadcasts extends ListRecords
{
    protected static string $resource = BroadcastResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\Action::make('compose')->label('New message')->icon('heroicon-o-paper-airplane')
                ->modalHeading('Message pastors')->modalSubmitActionLabel('Send message')->modalWidth('2xl')
                ->form(BroadcastResource::composeForm())
                ->action(function (array $data) {
                    $type = $data['audience_type'];

                    try {
                        $sent = app(BroadcastService::class)->send(
                            auth()->user(), $data['subject'], $data['body'], $type,
                            $type === 'all' ? [] : (array) ($data[$type] ?? []), (bool) ($data['email_copy'] ?? true),
                        );
                    } catch (ValidationException $e) {
                        Notification::make()->title('Not sent')->body(collect($e->errors())->flatten()->first())->danger()->send();

                        return;
                    }

                    Notification::make()->title('Message sent')->body("Delivered to {$sent->recipients_count} pastor(s).")->success()->send();
                }),
        ];
    }
}
