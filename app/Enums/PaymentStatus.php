<?php

namespace App\Enums;

use Filament\Support\Contracts\HasColor;
use Filament\Support\Contracts\HasLabel;

enum PaymentStatus: string implements HasLabel, HasColor
{
    case Pending   = 'pending';
    case Completed = 'completed';
    case Failed    = 'failed';
    case Refunded  = 'refunded';
    case Voided    = 'voided';

    public function getLabel(): string
    {
        return match($this) {
            self::Pending   => 'Pending',
            self::Completed => 'Completed',
            self::Failed    => 'Failed',
            self::Refunded  => 'Refunded',
            self::Voided    => 'Voided',
        };
    }

    public function getColor(): string | array | null
    {
        return match($this) {
            self::Pending   => 'warning',
            self::Completed => 'success',
            self::Failed    => 'danger',
            self::Refunded  => 'gray',
            self::Voided    => 'danger',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
