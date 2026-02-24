<?php

namespace App\Filament\Resources\DemographyResource\Pages;

use App\Filament\Resources\DemographyResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditDemography extends EditRecord
{
    protected static string $resource = DemographyResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
