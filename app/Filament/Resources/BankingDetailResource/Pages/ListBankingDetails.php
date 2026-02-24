<?php

namespace App\Filament\Resources\BankingDetailResource\Pages;

use App\Filament\Resources\BankingDetailResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListBankingDetails extends ListRecords
{
    protected static string $resource = BankingDetailResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
