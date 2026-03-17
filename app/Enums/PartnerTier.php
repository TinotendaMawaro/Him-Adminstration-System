<?php

namespace App\Enums;

use Filament\Support\Contracts\HasColor;
use Filament\Support\Contracts\HasIcon;
use Filament\Support\Contracts\HasLabel;

enum PartnerTier: string implements HasLabel, HasColor, HasIcon
{
    case Gold     = 'gold';
    case Platinum = 'platinum';
    case Jubilee   = 'jubilee';
    case GameChanger   = 'game_changer';
    case Diamond  = 'diamond';
    case Executive  = 'executive';
    case FinancialApostle  = 'financial_apostle';

    public function getLabel(): string
    {
        return match($this) {
            self::Gold     => 'Gold',
            self::Platinum => 'Platinum',
            self::Jubilee  => 'Jubilee',
            self::GameChanger   => 'GameChanger',
            self::Diamond   => 'Diamond',
            self::Executive   => 'Executive',
            self::FinancialApostle   => 'FinancialApostle',
        };
    }

    public function getColor(): string | array | null
    {
        return match($this) {
            self::Gold     => 'warning',   // gold badge
            self::Platinum => 'success',
            self::Jubilee  => 'success',
            self::GameChanger   => 'gray',
            self::Diamond   => 'gray',
            self::Executive   => 'primary',
            self::FinancialApostle   => 'primary',
        };
    }

    public function getIcon(): ?string
    {
        return match($this) {
            self::Gold     => 'heroicon-o-star',
            self::Platinum => 'heroicon-o-sparkles',
            self::Jubilee   => 'heroicon-o-trophy',
            self::GameChanger   => 'heroicon-o-trophy',
            self::Diamond   => 'heroicon-o-trophy',
            self::Executive   => 'heroicon-o-crown',
            self::FinancialApostle  => 'heroicon-o-crown',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
