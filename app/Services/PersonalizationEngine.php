<?php

namespace App\Services;

use App\Models\User;
use App\Models\SermonView;
use App\Models\UserInterest;
use App\Models\Event;
use App\Models\HomeGroup;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class PersonalizationEngine
{
    public function getSermonRecommendations(User $user, int $limit = 5): Collection
    {
        $interests = UserInterest::where('user_id', $user->id)
            ->where('interest_type', 'sermon_category')
            ->orderByDesc('score')
            ->limit($limit)
            ->get();

        if ($interests->isEmpty() && $user->member?->department) {
            $interests = collect([
                (object)['interest_value' => $user->member->department->name],
            ]);
        }

        $watchedIds = SermonView::where('user_id', $user->id)->pluck('sermon_id');

        try {
            $query = \App\Models\Asset::query()
                ->whereIn('category', $interests->pluck('interest_value'))
                ->whereNotIn('id', $watchedIds)
                ->orderByDesc('created_at')
                ->limit($limit);

            if (!\Schema::hasTable('assets')) {
                return collect();
            }

            return $query->get();
        } catch (\Throwable $e) {
            return collect();
        }
    }

    public function getEventRecommendations(User $user, int $limit = 5): Collection
    {
        $query = Event::published()->upcoming()->open();

        if ($user->zone_id) {
            $query->orWhere('zone_id', $user->zone_id);
        }

        $ministryInterests = UserInterest::where('user_id', $user->id)
            ->where('interest_type', 'ministry')
            ->orderByDesc('score')
            ->limit(3)
            ->pluck('interest_value');

        if ($ministryInterests->isNotEmpty()) {
            $query->orWhereIn('category', $ministryInterests);
        }

        return $query->orderBy('starts_at')->limit($limit)->get();
    }

    protected function getTopInterests(User $user, string $type, int $limit): Collection
    {
        return UserInterest::where('user_id', $user->id)
            ->where('interest_type', $type)
            ->orderByDesc('score')
            ->limit($limit)
            ->get();
    }
}
