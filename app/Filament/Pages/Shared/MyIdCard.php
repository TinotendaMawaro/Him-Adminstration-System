<?php

namespace App\Filament\Pages\Shared;

use App\Services\IdCardService;
use Filament\Pages\Page;

/** Every staff member's own ID card (master, finance, events): QR code, download as PNG/SVG, print. */
class MyIdCard extends Page
{
    protected static ?string $navigationIcon = 'heroicon-o-identification';
    protected static ?string $navigationLabel = 'My ID card';
    protected static ?string $title = 'My ID card';
    protected static ?string $slug = 'my-id-card';
    protected static ?int $navigationSort = 99;
    protected static string $view = 'filament.pages.my-id-card';

    public static function canAccess(): bool
    {
        return auth()->check();
    }

    public function card(): array
    {
        return app(IdCardService::class)->forUser(auth()->user());
    }
}
