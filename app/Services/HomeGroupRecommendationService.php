<?php

namespace App\Services;

use App\Models\User;
use App\Models\HomeGroup;
use Illuminate\Support\Facades\DB;

class HomeGroupRecommendationService
{
    public function getBestMatchForUser(User $user): ?array
    {
        if (!$user->location_captured || !$user->latitude || !$user->longitude) {
            return null;
        }

        $lat = (float) $user->latitude;
        $lng = (float) $user->longitude;

        $homeGroup = HomeGroup::select('id', 'name', 'location', 'meeting_day', 'meeting_time', 'zone_id',
            DB::raw("
                (6371 * acos(cos(radians(?)) * cos(radians(latitude)) *
                cos(radians(longitude) - radians(?)) +
                sin(radians(?)) * sin(radians(latitude))))
                AS distance
            "))
            ->having('distance', '<', 20)
            ->orderBy('distance')
            ->setBindings([$lat, $lng, $lat])
            ->first();

        if (!$homeGroup) {
            return null;
        }

        return [
            'id'            => $homeGroup->id,
            'name'          => $homeGroup->name,
            'location'      => $homeGroup->location,
            'meeting_day'   => $homeGroup->meeting_day,
            'meeting_time'  => $homeGroup->meeting_time?->format('H:i'),
            'distance_km'   => round($homeGroup->distance, 1),
            'match_reason'  => 'nearest_group',
        ];
    }
}
