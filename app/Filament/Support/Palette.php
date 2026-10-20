<?php

namespace App\Filament\Support;

/** Consistent chart colours across all portals (brand navy + gold first). */
class Palette
{
    private const COLORS = [
        '#1e3a5f', '#c9a84c', '#2e8b8b', '#7c5cbf', '#d9534f',
        '#4f9d69', '#e08e45', '#3d7ab8', '#a85c8c', '#8a8d93',
    ];

    public static function at(int $i): string
    {
        return self::COLORS[$i % count(self::COLORS)];
    }

    /** @return string[] */
    public static function take(int $n): array
    {
        return array_map(fn ($i) => self::at($i), range(0, max(0, $n - 1)));
    }

    public static function alpha(string $hex, float $alpha): string
    {
        [$r, $g, $b] = sscanf($hex, '#%02x%02x%02x');

        return "rgba({$r}, {$g}, {$b}, {$alpha})";
    }
}
