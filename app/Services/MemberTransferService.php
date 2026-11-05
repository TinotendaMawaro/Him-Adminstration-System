<?php

namespace App\Services;

use App\Models\HomeGroup;
use App\Models\Member;
use App\Models\Notification;
use App\Models\Pastor;
use App\Models\User;
use App\Models\Zone;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * Moves a member to another zone as one atomic change: the member record AND the login account move together, the old
 * home group is left, both zones' pastors and the member are told, and the audit trail records who did it and why.
 *
 *  - A master admin can move anyone.
 *  - A pastor can move members of their OWN zone to any other zone.
 * The member keeps their member number (it is their identity for life, not a zone label).
 */
class MemberTransferService
{
    public function transfer(Member $member, Zone $target, User $actor, string $reason): Member
    {
        $this->authorize($member, $actor);

        return DB::transaction(function () use ($member, $target, $actor, $reason) {
            // Re-read under lock so two people cannot move the same member at once.
            $member = Member::whereKey($member->getKey())->lockForUpdate()->firstOrFail();
            $this->authorize($member, $actor);   // the zone may have changed while we waited for the lock

            if ((int) $member->zone_id === (int) $target->id) {
                throw ValidationException::withMessages(['zone_id' => 'The member is already in this zone.']);
            }

            if ($member->user_id && HomeGroup::where('leader_id', $member->user_id)->exists()) {
                throw ValidationException::withMessages(['member' => 'This member leads a home group. Appoint another leader before moving them.']);
            }

            $fromZone = $member->zone_id ? Zone::find($member->zone_id) : null;

            $member->update(['zone_id' => $target->id, 'home_group_id' => null]);
            if ($member->user_id) {
                User::whereKey($member->user_id)->update(['zone_id' => $target->id, 'home_group_id' => null]);
            }

            AuditTrail::record('member.transferred', $actor, $member, [
                'from_zone' => $fromZone?->only(['id', 'code', 'name']),
                'to_zone'   => $target->only(['id', 'code', 'name']),
                'reason'    => $reason,
                'by_role'   => $actor->role->value,
            ], $member->user_id);

            $this->notify($member, $fromZone, $target, $actor, $reason);

            DB::afterCommit(function () use ($fromZone, $target) {
                foreach (array_filter([$fromZone?->id, $target->id]) as $zoneId) {
                    Cache::forget("zone_summary_{$zoneId}");
                    Cache::forget("dashboard_{$zoneId}");
                    Cache::forget("member_zone_summary_{$zoneId}");
                }
            });

            return $member->refresh();
        });
    }

    private function authorize(Member $member, User $actor): void
    {
        if ($actor->isMaster()) {
            return;
        }

        abort_unless(
            $actor->isPastor() && $actor->zone_id && (int) $actor->zone_id === (int) $member->zone_id,
            403,
            'You can only move members of your own zone.',
        );
    }

    private function notify(Member $member, ?Zone $from, Zone $to, User $actor, string $reason): void
    {
        $name = trim("{$member->name} {$member->surname}");

        if ($member->user_id) {
            Notification::create([
                'user_id' => $member->user_id, 'type' => 'info', 'category' => 'system', 'is_read' => false,
                'title'   => 'You have been moved to a new zone',
                'message' => "You are now part of {$to->name} ({$to->code})" . ($from ? ", moving from {$from->name}" : '') . ". Your member number stays {$member->member_number}.",
            ]);
        }

        // The pastors who receive them (and, when the master moved them, the pastors who lose them).
        $pastorIds = Pastor::where('zone_id', $to->id)->whereNotNull('user_id')->pluck('user_id')
            ->when($actor->isMaster() && $from, fn ($c) => $c->merge(Pastor::where('zone_id', $from->id)->whereNotNull('user_id')->pluck('user_id')))
            ->unique()->reject(fn ($id) => $id === $actor->id);

        foreach ($pastorIds as $id) {
            Notification::create([
                'user_id' => $id, 'type' => 'info', 'category' => 'system', 'is_read' => false,
                'title'   => 'A member changed zone',
                'message' => "{$name} ({$member->member_number}) moved" . ($from ? " from {$from->name}" : '') . " to {$to->name}. Reason: {$reason}",
            ]);
        }
    }
}
