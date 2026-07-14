<?php

namespace App\Services;

use App\Models\User;
use App\Models\HomeGroup;
use Illuminate\Support\Facades\DB;

class HomeGroupRecommendationService
{
    private const EARTH_RADIUS_KM = 6371;

    /**
     * Best single match by raw proximity (used by the lightweight
     * "Recommended for you" card). Independent of region tiers.
     */
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

    /**
     * Recommend a single primary home group for the member, localized to the
     * geographic profile they are registered under (zone, then province).
     *
     * Localization is driven by the member's registered zone/province and does
     * NOT require GPS coordinates — suggestions appear as soon as the member
     * belongs to a zone. When coordinates are available they are used purely as
     * a tie-breaker (nearest within the tier); otherwise the most active group
     * in the tier is preferred.
     *
     * Priority tiers: (1) a group in the member's own zone, (2) a group in the
     * same province. Returns null only when the member has neither a zone nor a
     * province, or no eligible groups exist.
     */
    public function suggestForUser(User $user): ?array
    {
        // Localization needs at least a registered zone (which yields the
        // region) or a province — GPS coordinates are optional.
        if (!$user->zone_id && !$user->province) {
            return null;
        }

        // The member's region is derived from their registered zone
        // (User has no direct region column; Zone belongsTo Region).
        $userRegionId = $user->zone?->region_id;

        $hasCoords = $user->latitude !== null && $user->longitude !== null;
        $lat = $hasCoords ? (float) $user->latitude : null;
        $lng = $hasCoords ? (float) $user->longitude : null;

        $query = HomeGroup::query()
            ->select(
                'home_groups.id',
                'home_groups.name',
                'home_groups.location',
                'home_groups.province',
                'home_groups.zone_id',
                'home_groups.meeting_day',
                'home_groups.meeting_time',
                'home_groups.leader_id',
            )
            ->with(['zone:id,name,region_id', 'leader:id,name'])
            ->withCount('users')
            // Join zones so we can rank by the member's broader region.
            ->leftJoin('zones', 'home_groups.zone_id', '=', 'zones.id')
            ->when($user->home_group_id, fn ($q) => $q->where('home_groups.id', '!=', $user->home_group_id));

        if ($hasCoords) {
            $query->selectRaw($this->haversineSql(), [$lat, $lng, $lat]);
        }

        // Tier 1 — exact zone (sub-region).
        $query->when($user->zone_id, fn ($q, $zoneId) =>
            $q->orderByRaw('CASE WHEN home_groups.zone_id = ? THEN 0 ELSE 1 END', [$zoneId]));
        // Tier 2 — same broader region (any zone in the member's region).
        $query->when($userRegionId, fn ($q, $regionId) =>
            $q->orderByRaw('CASE WHEN zones.region_id = ? THEN 0 ELSE 1 END', [$regionId]));
        // Tier 3 — same province (coarser region).
        $query->when($user->province, fn ($q, $province) =>
            $q->orderByRaw('CASE WHEN home_groups.province IS NOT NULL AND home_groups.province = ? THEN 0 ELSE 1 END', [$province]));
        // Tie-breaker — proximity when known, otherwise most active group.
        if ($hasCoords) {
            $query->orderBy('distance');
        } else {
            $query->orderByDesc('users_count');
        }

        $group = $query->first();

        return $group ? $this->toSuggestion($group, $user, $hasCoords, $userRegionId) : null;
    }

    /**
     * Great-circle distance (km) from the member to each group, computed in SQL
     * so ranking happens at the database level.
     */
    private function haversineSql(): string
    {
        return sprintf(
            '(%1$d * acos(cos(radians(?)) * cos(radians(latitude)) * '
                . 'cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) AS distance',
            self::EARTH_RADIUS_KM,
        );
    }

    /**
     * Shape the matched group into a presentable suggestion payload.
     */
    private function toSuggestion(HomeGroup $group, User $user, bool $hasCoords, ?int $userRegionId): array
    {
        $sameZone = $user->zone_id && $group->zone_id === $user->zone_id;
        $sameRegion = $userRegionId && $group->zone && $group->zone->region_id === $userRegionId;
        $sameProvince = $user->province && $group->province
            && strcasecmp($group->province, $user->province) === 0;

        $reason = $sameZone ? 'same_zone'
            : ($sameRegion ? 'same_region'
            : ($sameProvince ? 'same_province' : 'nearest_group'));

        return [
            'id'            => $group->id,
            'name'          => $group->name,
            'location'      => $group->location,
            'province'      => $group->province,
            'zone'          => $group->zone?->name,
            'region_id'     => $group->zone?->region_id,
            'leader'        => $group->leader?->name,
            'member_count'  => $group->users_count,
            'meeting_day'   => $group->meeting_day,
            'meeting_time'  => $group->meeting_time?->format('H:i'),
            'distance_km'   => $hasCoords ? round((float) $group->distance, 1) : null,
            'match_reason'  => $reason,
        ];
    }
}
