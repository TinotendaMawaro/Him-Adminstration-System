<?php

namespace App\Services;

use App\Models\User;
use App\Models\SpiritualMilestone;

class MilestoneDispatcher
{
    public function dispatch(string $type, User $user, array $payload = []): SpiritualMilestone
    {
        $config = match ($type) {
            'membership' => [
                'title' => 'Became a Member',
                'icon'  => '🎉',
                'color' => '#d4af37',
            ],
            'baptism' => [
                'title' => 'Water Baptism',
                'icon'  => '💧',
                'color' => '#0ea5e9',
            ],
            'partnership' => [
                'title' => 'Partnership Enrolled',
                'icon'  => '💝',
                'color' => '#f43f5e',
            ],
            'leadership' => [
                'title' => 'Leadership Appointment',
                'icon'  => '⭐',
                'color' => '#8b5cf6',
            ],
            'course_completion' => [
                'title' => 'Course Completed',
                'icon'  => '📚',
                'color' => '#10b981',
            ],
            'ministry_achievement' => [
                'title' => 'Ministry Achievement',
                'icon'  => '🏆',
                'color' => '#f59e0b',
            ],
            default => [
                'title' => ucfirst(str_replace('_', ' ', $type)),
                'icon'  => '🌟',
                'color' => '#d4af37',
            ],
        };

        return SpiritualMilestone::create([
            'user_id'       => $user->id,
            'member_id'     => $user->member?->id,
            'milestone_type' => $type,
            'title'         => $config['title'],
            'subtitle'      => $payload['subtitle'] ?? null,
            'description'   => $payload['description'] ?? null,
            'achieved_at'   => $payload['achieved_at'] ?? now(),
            'icon'          => $config['icon'],
            'color'         => $config['color'],
            'metadata'      => $payload['metadata'] ?? null,
        ]);
    }
}
