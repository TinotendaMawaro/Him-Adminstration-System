<?php

namespace App\Filament\Resources\HomeGroupResource\Pages;

use App\Filament\Resources\HomeGroupResource;
use Filament\Actions;
use Filament\Resources\Pages\EditRecord;

class EditHomeGroup extends EditRecord
{
    protected static string $resource = HomeGroupResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\DeleteAction::make(),
        ];
    }
}
