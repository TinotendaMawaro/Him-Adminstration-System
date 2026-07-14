<?php

namespace App\Listeners;

use App\Models\UserInterest;
use App\Models\SermonView;
use Illuminate\Support\Facades\DB;

class TrackSermonView
{
    public function handle($event): void
    {
        $user  = $event->user;
        $sermon = $event->sermon;

        SermonView::updateOrCreate(
            ['user_id' => $user->id, 'sermon_id' => $sermon->id],
            ['watch_percentage' => $event->watchPercentage ?? 100, 'watched_at' => now()]
        );

        if (!empty($sermon->category)) {
            UserInterest::updateOrCreate(
                ['user_id' => $user->id, 'interest_type' => 'sermon_category', 'interest_value' => $sermon->category],
                ['score' => DB::raw('score + 1'), 'last_triggered_at' => now()]
            );
        }
    }
}
