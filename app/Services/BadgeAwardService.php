<?php

namespace App\Services;

use App\Models\User;
use App\Models\BadgeCatalog;
use App\Models\UserBadge;

class BadgeAwardService
{
    public function awardIfEligible(User $user, string $slug): ?UserBadge
    {
        $badge = BadgeCatalog::where('slug', $slug)->first();
        if (!$badge) {
            return null;
        }

        $existing = UserBadge::where('user_id', $user->id)
            ->where('badge_catalog_id', $badge->id)
            ->first();

        if ($existing) {
            return null;
        }

        return UserBadge::create([
            'user_id'         => $user->id,
            'badge_catalog_id'=> $badge->id,
            'earned_at'       => now(),
        ]);
    }

    public function getEarnedBadges(User $user)
    {
        return UserBadge::where('user_id', $user->id)
            ->with('badgeCatalog')
            ->orderByDesc('earned_at')
            ->get();
    }
}
