<?php

namespace App\Enums;

use Filament\Support\Contracts\HasIcon;
use Filament\Support\Contracts\HasLabel;

enum PaymentMethod: string implements HasLabel, HasIcon
{
    case Cash         = 'cash';
    case BankTransfer = 'bank_transfer';
    case Card         = 'card';
    case MobileMoney  = 'mobile_money';
    case Online       = 'online';

    public function getLabel(): string
    {
        return match($this) {
            self::Cash         => 'Cash',
            self::BankTransfer => 'Bank Transfer',
            self::Card         => 'Card',
            self::MobileMoney  => 'Mobile Money',
            self::Online       => 'Online',
        };
    }

    public function getIcon(): ?string
    {
        return match($this) {
            self::Cash         => 'heroicon-o-banknotes',
            self::BankTransfer => 'heroicon-o-building-library',
            self::Card         => 'heroicon-o-credit-card',
            self::MobileMoney  => 'heroicon-o-device-phone-mobile',
            self::Online       => 'heroicon-o-globe-alt',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
