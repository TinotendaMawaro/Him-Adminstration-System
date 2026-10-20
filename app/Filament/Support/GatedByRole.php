<?php

namespace App\Filament\Support;

/**
 * Defence in depth: even if a widget were registered on the wrong panel it
 * still renders only for the roles listed in $roles.
 */
trait GatedByRole
{
    public static function canView(): bool
    {
        return auth()->user()?->hasAnyRole(static::$roles ?? ['master']) ?? false;
    }
}
