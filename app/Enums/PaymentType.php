<?php

namespace App\Enums;

use Filament\Support\Contracts\HasColor;
use Filament\Support\Contracts\HasIcon;
use Filament\Support\Contracts\HasLabel;

enum PaymentType: string implements HasLabel, HasColor, HasIcon
{
    case Tithe             = 'tithe';
    case Offering          = 'offering';
    case FamilyAltar       = 'family_altar';
    case Partnership       = 'partnership';
    case EventRegistration = 'event_registration';
    case Seed              = 'seed';
    case BuildingFund      = 'building_fund';
    case Missions          = 'missions';
    case Other             = 'other';

    public function getLabel(): string
    {
        return match($this) {
            self::Tithe             => 'Tithe',
            self::Offering          => 'Offering',
            self::FamilyAltar       => 'Family Altar',
            self::Partnership       => 'Partnership',
            self::EventRegistration => 'Event Registration',
            self::Seed              => 'Seed',
            self::BuildingFund      => 'Building Fund',
            self::Missions          => 'Missions',
            self::Other             => 'Other',
        };
    }

    public function getColor(): string | array | null
    {
        return match($this) {
            self::Tithe             => 'success',
            self::Offering          => 'info',
            self::FamilyAltar       => 'warning',
            self::Partnership       => 'primary',
            self::EventRegistration => 'danger',
            self::Seed              => 'warning',
            self::BuildingFund      => 'primary',
            self::Missions          => 'info',
            self::Other             => 'gray',
        };
    }

    public function getIcon(): ?string
    {
        return match($this) {
            self::Tithe             => 'heroicon-o-arrow-trending-up',
            self::Offering          => 'heroicon-o-gift',
            self::FamilyAltar       => 'heroicon-o-home',
            self::Partnership       => 'heroicon-o-heart',
            self::EventRegistration => 'heroicon-o-ticket',
            self::Seed              => 'heroicon-o-sparkles',
            self::BuildingFund      => 'heroicon-o-building-office-2',
            self::Missions          => 'heroicon-o-globe-alt',
            self::Other             => 'heroicon-o-banknotes',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
