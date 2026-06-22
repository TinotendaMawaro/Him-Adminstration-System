<?php

namespace App\Enums;

use Filament\Support\Contracts\HasColor;
use Filament\Support\Contracts\HasIcon;
use Filament\Support\Contracts\HasLabel;

enum PartnerStatus: string implements HasLabel, HasColor
{
    case Pending   = 'pending';
    case Active    = 'active';
    case Expired   = 'expired';
    case Suspended = 'suspended';
    case Cancelled = 'cancelled';
    case Inactive  = 'inactive';

    public function getLabel(): string
    {
        return match($this) {
            self::Pending   => 'Pending',
            self::Active    => 'Active',
            self::Expired   => 'Expired',
            self::Suspended => 'Suspended',
            self::Cancelled => 'Cancelled',
            self::Inactive  => 'Inactive',
        };
    }

    public function getColor(): string | array | null
    {
        return match($this) {
            self::Pending   => 'warning',
            self::Active    => 'success',
            self::Expired   => 'gray',
            self::Suspended => 'danger',
            self::Cancelled => 'danger',
            self::Inactive  => 'gray',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
