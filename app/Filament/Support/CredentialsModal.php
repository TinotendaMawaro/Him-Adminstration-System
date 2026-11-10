<?php

namespace App\Filament\Support;

use App\Services\CredentialService;
use Filament\Tables;

/**
 * The "new sign-in details" step that follows a transfer or a staff appointment. The credentials travel only in the action's
 * arguments (this one request/response), are shown once with Copy buttons, and can be downloaded as a watermarked PDF.
 * Nothing is stored: close the dialog and they are gone.
 */
class CredentialsModal
{
    public const NAME = 'credentials';

    public static function action(): Tables\Actions\Action
    {
        return Tables\Actions\Action::make(self::NAME)
            ->label('Sign-in details')
            ->modalHeading('New sign-in details')
            ->modalIcon('heroicon-o-key')
            ->modalWidth('lg')
            ->modalContent(fn (array $arguments) => view('filament.partials.credentials', ['c' => $arguments['creds'] ?? []]))
            ->modalSubmitActionLabel('Download PDF')
            ->modalCancelActionLabel('Close')
            ->closeModalByClickingAway(false)
            ->extraAttributes(['class' => 'hidden'])        // opened programmatically after the transfer / appointment
            ->action(function (array $arguments) {
                $creds = $arguments['creds'] ?? [];
                $name = 'heartfelt-credentials-' . preg_replace('/[^a-z0-9]+/i', '-', strtolower($creds['name'] ?? 'user')) . '.pdf';

                return response()->streamDownload(function () use ($creds) {
                    echo app(CredentialService::class)->pdf($creds);
                }, $name, ['Content-Type' => 'application/pdf', 'Cache-Control' => 'no-store, private']);
            });
    }

    /** The same dialog for a page-level (header) action. */
    public static function pageAction(): \Filament\Actions\Action
    {
        return \Filament\Actions\Action::make(self::NAME)
            ->label('Sign-in details')
            ->modalHeading('New sign-in details')
            ->modalIcon('heroicon-o-key')
            ->modalWidth('lg')
            ->modalContent(fn (array $arguments) => view('filament.partials.credentials', ['c' => $arguments['creds'] ?? []]))
            ->modalSubmitActionLabel('Download PDF')
            ->modalCancelActionLabel('Close')
            ->closeModalByClickingAway(false)
            ->extraAttributes(['class' => 'hidden'])
            ->action(function (array $arguments) {
                $creds = $arguments['creds'] ?? [];
                $name = 'heartfelt-credentials-' . preg_replace('/[^a-z0-9]+/i', '-', strtolower($creds['name'] ?? 'user')) . '.pdf';

                return response()->streamDownload(function () use ($creds) {
                    echo app(CredentialService::class)->pdf($creds);
                }, $name, ['Content-Type' => 'application/pdf', 'Cache-Control' => 'no-store, private']);
            });
    }

    /** Open the dialog for the record that was just transferred (or null for a header action). */
    public static function open($livewire, $record, array $creds): void
    {
        $livewire->replaceMountedTableAction(self::NAME, $record?->getKey(), ['creds' => $creds]);
    }
}
