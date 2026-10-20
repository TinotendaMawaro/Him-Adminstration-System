<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

/**
 * Single place for writing security/finance relevant events to audit_logs.
 */
class AuditTrail
{
    public static function record(string $action, ?User $actor, ?Model $subject = null, array $details = [], ?int $aboutUserId = null): AuditLog
    {
        return AuditLog::create([
            'user_id'      => $aboutUserId ?? $actor?->id,
            'actor_id'     => $actor?->id,
            'action'       => $action,
            'details'      => $details,
            'subject_type' => $subject ? $subject::class : null,
            'subject_id'   => $subject?->getKey(),
            'occurred_at'  => now(),
        ]);
    }
}
