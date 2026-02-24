<?php

namespace App\Filament\Resources\DemographyResource\Pages;

use App\Filament\Resources\DemographyResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListDemographies extends ListRecords
{
    protected static string $resource = DemographyResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
