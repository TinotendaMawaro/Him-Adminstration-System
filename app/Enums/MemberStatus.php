<?php

namespace App\Enums;

use Filament\Support\Contracts\HasColor;
use Filament\Support\Contracts\HasLabel;

enum MemberStatus: string implements HasLabel, HasColor
{
    case Active      = 'active';
    case Inactive    = 'inactive';
    case Transferred = 'transferred';
    case Deceased    = 'deceased';

    public function getLabel(): string
    {
        return match($this) {
            self::Active      => 'Active',
            self::Inactive    => 'Inactive',
            self::Transferred => 'Transferred',
            self::Deceased    => 'Deceased',
        };
    }

    public function getColor(): string | array | null
    {
        return match($this) {
            self::Active      => 'success',
            self::Inactive    => 'warning',
            self::Transferred => 'info',
            self::Deceased    => 'gray',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
