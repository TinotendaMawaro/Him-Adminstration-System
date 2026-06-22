<?php

namespace App\Filament\Resources\PartnerResource\Pages;

use App\Filament\Resources\PartnerResource;
use Filament\Resources\Pages\ListRecords;
use Filament\Resources\Pages\Page;

class ListPartners extends ListRecords
{
    protected static string $resource = PartnerResource::class;
}
