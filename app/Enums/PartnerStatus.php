<?php

namespace App\Enums;

use Filament\Support\Contracts\HasColor;
use Filament\Support\Contracts\HasIcon;
use Filament\Support\Contracts\HasLabel;

enum PartnerStatus: string implements HasLabel, HasColor
{
    case Active   = 'active';
    case Inactive = 'inactive';
    case Lapsed   = 'lapsed';

    public function getLabel(): string
    {
        return match($this) {
            self::Active   => 'Active',
            self::Inactive => 'Inactive',
            self::Lapsed   => 'Lapsed',
        };
    }

    public function getColor(): string | array | null
    {
        return match($this) {
            self::Active   => 'success',
            self::Inactive => 'gray',
            self::Lapsed   => 'warning',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
