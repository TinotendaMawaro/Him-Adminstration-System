<?php

namespace App\Enums;

use Filament\Support\Contracts\HasLabel;

enum PledgeFrequency: string implements HasLabel
{
    case Weekly    = 'weekly';
    case Monthly   = 'monthly';
    case Quarterly = 'quarterly';
    case Annually  = 'annually';

    public function getLabel(): string
    {
        return match($this) {
            self::Weekly    => 'Weekly',
            self::Monthly   => 'Monthly',
            self::Quarterly => 'Quarterly',
            self::Annually  => 'Annually',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
