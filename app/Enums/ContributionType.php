<?php

namespace App\Enums;

use Filament\Support\Contracts\HasLabel;

enum ContributionType: string implements HasLabel
{
    case Monthly   = 'monthly';
    case Quarterly = 'quarterly';
    case Annually  = 'annually';
    case OneTime   = 'one_time';

    public function getLabel(): string
    {
        return match($this) {
            self::Monthly   => 'Monthly Recurring',
            self::Quarterly => 'Quarterly',
            self::Annually  => 'Annually',
            self::OneTime   => 'One-Time Seed',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
