<?php

namespace App\Enums;

use Filament\Support\Contracts\HasIcon;
use Filament\Support\Contracts\HasLabel;

enum EventType: string implements HasLabel, HasIcon
{
    case Conference     = 'conference';
    case Forum          = 'forum';
    case Seminar        = 'seminar';
    case YouthCamp      = 'youth_camp';
    case Retreat        = 'retreat';
    case SpecialService = 'special_service';
    case Fundraiser     = 'fundraiser';
    case Other          = 'other';

    public function getLabel(): string
    {
        return match($this) {
            self::Conference     => 'Conference',
            self::Forum          => 'Forum',
            self::Seminar        => 'Seminar',
            self::YouthCamp      => 'Youth Camp',
            self::Retreat        => 'Retreat',
            self::SpecialService => 'Special Service',
            self::Fundraiser     => 'Fundraiser',
            self::Other          => 'Other',
        };
    }

    public function getIcon(): ?string
    {
        return match($this) {
            self::Conference     => 'heroicon-o-megaphone',
            self::Forum          => 'heroicon-o-chat-bubble-left-right',
            self::Seminar        => 'heroicon-o-academic-cap',
            self::YouthCamp      => 'heroicon-o-sun',
            self::Retreat        => 'heroicon-o-map',
            self::SpecialService => 'heroicon-o-star',
            self::Fundraiser     => 'heroicon-o-heart',
            self::Other          => 'heroicon-o-calendar',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
