<?php

namespace App\Services;

use App\Models\PrayerCenterMessage;

class ContentModerator
{
    private array $profanityList;
    private array $severityWeights = [
        'mild'      => 1,
        'moderate'  => 3,
        'severe'    => 6,
    ];

    public function __construct()
    {
        $this->profanityList = config('prayer-center.moderation.words', []);
    }

    public function moderate(string $subject, string $message): array
    {
        $combined = strtolower($subject . ' ' . $message);
        $violations = [];
        $score = 0;

        foreach ($this->profanityList['exact'] ?? [] as $word => $severity) {
            if (preg_match('/\b' . preg_quote($word, '/') . '\b/i', $combined)) {
                $violations[] = ['word' => $word, 'severity' => $severity];
                $score += $this->severityWeights[$severity] ?? 1;
            }
        }

        $normalized = $this->normalizeLeet($combined);
        foreach ($this->profanityList['patterns'] ?? [] as $pattern => $severity) {
            if (preg_match($pattern, $normalized)) {
                $violations[] = ['pattern' => $pattern, 'severity' => $severity];
                $score += $this->severityWeights[$severity] ?? 2;
            }
        }

        $urlCount = preg_match_all('/https?:\/\/[^\s]+/i', $message, $matches);
        if ($urlCount > 2) {
            $violations[] = ['type' => 'excess_urls', 'count' => $urlCount];
            $score += 2;
        }

        if (preg_match('/(.)\1{10,}/', $message)) {
            $violations[] = ['type' => 'repeated_chars'];
            $score += 1;
        }

        return [
            'score'            => $score,
            'violations'       => $violations,
            'status'           => $this->determineStatus($score),
            'original_message' => $message,
        ];
    }

    public function determineStatus(int $score): string
    {
        if ($score >= 6) return PrayerCenterMessage::STATUS_REJECTED;
        if ($score >= 3) return PrayerCenterMessage::STATUS_FLAGGED;
        return PrayerCenterMessage::STATUS_APPROVED;
    }

    private function normalizeLeet(string $text): string
    {
        $leetMap = ['@' => 'a', '4' => 'a', '3' => 'e', '1' => 'i', '!' => 'i', '0' => 'o', '5' => 's'];
        return str_replace(array_keys($leetMap), array_values($leetMap), $text);
    }
}
