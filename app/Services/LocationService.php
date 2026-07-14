<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Http;

class LocationService
{
    public function haversineDistance(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $R = 6371;
        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);
        $a = sin($dLat / 2) * sin($dLat / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($dLon / 2) * sin($dLon / 2);
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        return $R * $c;
    }

    public function reverseGeocode(float $lat, float $lon): array
    {
        $response = Http::timeout(5)->get('https://nominatim.openstreetmap.org/reverse', [
            'lat' => $lat,
            'lon' => $lon,
            'format' => 'json',
        ]);

        if ($response->successful()) {
            $data = $response->json('address') ?? [];
            return [
                'address_line_1' => $data['road'] ?? $data['suburb'] ?? '',
                'city'           => $data['city'] ?? $data['town'] ?? $data['village'] ?? '',
                'province'       => $data['state'] ?? '',
                'country'        => $data['country'] ?? '',
                'postal_code'    => $data['postcode'] ?? '',
            ];
        }

        return [];
    }
}
