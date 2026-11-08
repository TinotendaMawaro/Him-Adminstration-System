<?php

namespace App\Filament\Resources\TeachingResource\Pages;

use App\Filament\Resources\TeachingResource;
use Filament\Resources\Pages\CreateRecord;

class CreateTeaching extends CreateRecord
{
    protected static string $resource = TeachingResource::class;

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        return TeachingResource::prepare($data);
    }
}
