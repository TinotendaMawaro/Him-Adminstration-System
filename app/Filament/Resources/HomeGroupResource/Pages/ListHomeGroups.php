<?php

namespace App\Filament\Resources\HomeGroupResource\Pages;

use App\Filament\Resources\HomeGroupResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListHomeGroups extends ListRecords
{
    protected static string $resource = HomeGroupResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
