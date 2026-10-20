<?php

namespace App\Enums;

use Filament\Support\Contracts\HasIcon;
use Filament\Support\Contracts\HasLabel;

enum PaymentMethod: string implements HasLabel, HasIcon
{
    case Cash         = 'cash';
    case MobileMoney  = 'mobile_money';
    case Card         = 'card';
    case Online       = 'online';
    case EcoCash      = 'ecocash';
    case OneMoney     = 'onemoney';
    case InnBucks     = 'innbucks';
    case Paynow       = 'paynow';
    case Visa         = 'visa';
    case Mastercard   = 'mastercard';
    case PayPal       = 'paypal';
    case BankTransfer = 'bank_transfer';

    public function getLabel(): string
    {
        return match($this) {
            self::Cash         => 'Cash',
            self::MobileMoney  => 'Mobile Money',
            self::Card         => 'Card',
            self::Online       => 'Online',
            self::EcoCash      => 'EcoCash',
            self::OneMoney     => 'OneMoney',
            self::InnBucks     => 'InnBucks',
            self::Paynow       => 'Paynow',
            self::Visa         => 'Visa',
            self::Mastercard   => 'Mastercard',
            self::PayPal       => 'PayPal',
            self::BankTransfer => 'Bank Transfer',
        };
    }

    public function getIcon(): ?string
    {
        return match($this) {
            self::Cash         => 'heroicon-o-banknotes',
            self::MobileMoney  => 'heroicon-o-device-phone-mobile',
            self::Card         => 'heroicon-o-credit-card',
            self::Online       => 'heroicon-o-globe-alt',
            self::EcoCash      => 'heroicon-o-device-phone-mobile',
            self::OneMoney     => 'heroicon-o-device-phone-mobile',
            self::InnBucks     => 'heroicon-o-device-phone-mobile',
            self::Paynow       => 'heroicon-o-globe-alt',
            self::Visa         => 'heroicon-o-credit-card',
            self::Mastercard   => 'heroicon-o-credit-card',
            self::PayPal       => 'heroicon-o-globe-alt',
            self::BankTransfer => 'heroicon-o-building-library',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
