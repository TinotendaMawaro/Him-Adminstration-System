<?php

namespace App\Enums;

use Filament\Support\Contracts\HasColor;
use Filament\Support\Contracts\HasLabel;

enum RegistrationStatus: string implements HasLabel, HasColor
{
    case Pending   = 'pending';
    case Confirmed = 'confirmed';
    case Cancelled = 'cancelled';
    case Attended  = 'attended';

    public function getLabel(): string
    {
        return match($this) {
            self::Pending   => 'Pending',
            self::Confirmed => 'Confirmed',
            self::Cancelled => 'Cancelled',
            self::Attended  => 'Attended',
        };
    }

    public function getColor(): string | array | null
    {
        return match($this) {
            self::Pending   => 'warning',
            self::Confirmed => 'success',
            self::Cancelled => 'danger',
            self::Attended  => 'gray',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
