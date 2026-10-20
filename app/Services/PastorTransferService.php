<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\Pastor;
use App\Models\User;
use App\Models\Zone;
use App\Models\ZoneHistory;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Moves a pastor to another zone (and therefore region) as a single atomic change,
 * keeping zone history, the linked user account, caches and the audit trail consistent.
 */
class PastorTransferService
{
    public function transfer(Pastor $pastor, Zone $target, User $actor, ?string $reason = null, ?string $effective = null): Pastor
    {
        if (!$actor->isMaster()) {
            abort(403, 'Only a master admin can transfer pastors.');
        }

        return DB::transaction(function () use ($pastor, $target, $actor, $reason, $effective) {
            // Re-read under lock so two admins cannot transfer the same pastor concurrently.
            $pastor = Pastor::whereKey($pastor->getKey())->lockForUpdate()->firstOrFail();

            if ((int) $pastor->zone_id === (int) $target->id) {
                throw ValidationException::withMessages(['zone_id' => 'The pastor is already assigned to this zone.']);
            }

            $fromZone  = $pastor->zone_id ? Zone::find($pastor->zone_id) : null;
            $date      = $effective ? \Carbon\Carbon::parse($effective)->toDateString() : now()->toDateString();

            // A zone has at most one lead (zone) pastor. Moving into an occupied zone makes this a supporting pastor.
            $targetHasLead = Pastor::where('zone_id', $target->id)->where('is_zone_pastor', true)
                ->whereKeyNot($pastor->getKey())->exists();
            $becomesLead   = $pastor->is_zone_pastor && !$targetHasLead;

            // Close the current assignment and open the new one.
            if ($pastor->user_id && $fromZone) {
                ZoneHistory::where('zone_id', $fromZone->id)->where('pastor_id', $pastor->user_id)
                    ->whereNull('end_date')->update(['end_date' => $date]);
            }
            if ($pastor->user_id) {
                ZoneHistory::create([
                    'zone_id'    => $target->id,
                    'pastor_id'  => $pastor->user_id,
                    'start_date' => $date,
                    'notes'      => trim('Transferred' . ($fromZone ? " from {$fromZone->name}" : '') . ($reason ? ": {$reason}" : '')),
                ]);
            }

            $pastor->update([
                'zone_id'        => $target->id,
                'region_id'      => $target->region_id,
                'is_zone_pastor' => $becomesLead,
            ]);

            if ($pastor->user_id) {
                User::whereKey($pastor->user_id)->update(['zone_id' => $target->id]);
            }

            AuditTrail::record('pastor.transferred', $actor, $pastor, [
                'from_zone' => $fromZone?->only(['id', 'code', 'name']),
                'to_zone'   => $target->only(['id', 'code', 'name']),
                'reason'    => $reason,
                'effective' => $date,
                'lead_pastor_after' => $becomesLead,
            ], $pastor->user_id);

            if ($pastor->user_id) {
                Notification::create([
                    'user_id'  => $pastor->user_id,
                    'title'    => 'You have been assigned to a new zone',
                    'message'  => "You are now assigned to {$target->name} ({$target->code})" . ($reason ? ". Note: {$reason}" : '.'),
                    'type'     => 'info',
                    'category' => 'system',
                    'is_read'  => false,
                ]);
            }

            DB::afterCommit(function () use ($fromZone, $target) {
                foreach (array_filter([$fromZone?->id, $target->id]) as $zoneId) {
                    Cache::forget("zone_summary_{$zoneId}");
                    Cache::forget("dashboard_{$zoneId}");
                }
            });

            return $pastor->refresh();
        });
    }
}
