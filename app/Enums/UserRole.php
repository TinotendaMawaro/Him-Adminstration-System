<?php

namespace App\Enums;

use Filament\Support\Contracts\HasColor;
use Filament\Support\Contracts\HasIcon;
use Filament\Support\Contracts\HasLabel;

enum UserRole: string implements HasLabel, HasColor, HasIcon
{
    // ── Filament (admin panel) roles ──────────────────────────────────────────
    case Master  = 'master';
    case Finance = 'finance';
    case Event   = 'event';

    // ── React portal roles ────────────────────────────────────────────────────
    case Pastor  = 'pastor';
    case Partner = 'partner';
    case Member  = 'member';
    case HOD     = 'hod';

    // ─── Filament display ─────────────────────────────────────────────────────

    public function getLabel(): string
    {
        return match($this) {
            self::Master  => 'Master Admin',
            self::Finance => 'Finance',
            self::Event   => 'Events Coordinator',
            self::Pastor  => 'Pastor',
            self::Partner => 'Partner',
            self::Member  => 'Member',
            self::HOD     => 'Head of Department',
        };
    }

    public function getColor(): string | array | null
    {
        return match($this) {
            self::Master  => 'danger',
            self::Finance => 'success',
            self::Event   => 'info',
            self::Pastor  => 'primary',
            self::Partner => 'gray',
            self::Member  => 'gray',
            self::HOD     => 'warning',
        };
    }

    public function getIcon(): ?string
    {
        return match($this) {
            self::Master  => 'heroicon-o-shield-exclamation',
            self::Finance => 'heroicon-o-banknotes',
            self::Event   => 'heroicon-o-calendar-days',
            self::Pastor  => 'heroicon-o-user-circle',
            self::Partner => 'heroicon-o-heart',
            self::Member  => 'heroicon-o-user',
            self::HOD     => 'heroicon-o-building-office',
        };
    }

    // ─── Grouping helpers ─────────────────────────────────────────────────────

    /** Roles that log in via the Filament admin panel */
    public static function filamentRoles(): array
    {
        return [self::Master, self::Finance, self::Event];
    }

    /** Roles that log in via the React portal */
    public static function portalRoles(): array
    {
        return [self::Pastor, self::Partner, self::Member, self::HOD];
    }

    /** Roles that use unique-code login */
    public static function codeLoginRoles(): array
    {
        return [self::Pastor];
    }

    /** Roles that use email + password login */
    public static function emailLoginRoles(): array
    {
        return [self::Member, self::Partner, self::HOD];
    }

    public function isFilamentRole(): bool
    {
        return in_array($this, self::filamentRoles());
    }

    public function isPortalRole(): bool
    {
        return in_array($this, self::portalRoles());
    }

    // ─── Validation helper — use in rules ────────────────────────────────────
    // 'role' => ['required', Rule::enum(UserRole::class)]

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
