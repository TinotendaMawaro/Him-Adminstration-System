<?php

namespace App\Filament\Resources\PastorResource\Pages;

use App\Filament\Resources\PastorResource;
use Filament\Resources\Pages\EditRecord;

class EditPastor extends EditRecord
{
    protected static string $resource = PastorResource::class;

    /** The login account carries the display name: keep it in step with the pastor record. */
    protected function afterSave(): void
    {
        $this->record->user?->update(['name' => trim("{$this->record->name} {$this->record->surname}")]);
    }
}
