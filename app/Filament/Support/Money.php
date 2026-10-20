<?php

namespace App\Filament\Support;

class Money
{
    public static function fmt(float|int|string|null $v): string
    {
        return '$' . number_format((float) $v, 2);
    }

    public static function short(float|int $v): string
    {
        $v = (float) $v;

        return match (true) {
            $v >= 1_000_000 => '$' . round($v / 1_000_000, 2) . 'M',
            $v >= 1_000     => '$' . round($v / 1_000, 1) . 'k',
            default         => '$' . number_format($v, 0),
        };
    }
}
