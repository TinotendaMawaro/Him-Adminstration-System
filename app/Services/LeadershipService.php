<?php

namespace App\Services;

use App\Enums\UserRole;
use App\Models\Department;
use App\Models\HomeGroup;
use App\Models\Notification;
use App\Models\Pastor;
use App\Models\User;
use App\Models\Zone;
use App\Models\ZoneHistory;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;

/**
 * Head office decides who leads what, zone by zone:
 *   - the pastor in charge (PC) of a zone and its zone administrator,
 *   - the head of a department in a zone,
 *   - the leader of a home group in a zone.
 * Everything is master-only, validated against the zone it concerns (nobody can lead something in a zone they do not belong
 * to), applied atomically, audited and notified.
 */
class LeadershipService
{
    private function master(User $actor): void
    {
        abort_unless($actor->isMaster(), 403, 'Only head office can make these appointments.');
    }

    public function setPastorInCharge(Zone $zone, Pastor $pastor, User $actor): void
    {
        $this->master($actor);
        if ((int) $pastor->zone_id !== (int) $zone->id) {
            throw ValidationException::withMessages(['pastor' => "{$pastor->name} is not a pastor of {$zone->name}. Transfer them to this zone first."]);
        }

        DB::transaction(function () use ($zone, $pastor, $actor) {
            $previous = Pastor::where('zone_id', $zone->id)->where('is_zone_pastor', true)->whereKeyNot($pastor->getKey())->get();
            Pastor::where('zone_id', $zone->id)->update(['is_zone_pastor' => false]);
            $pastor->update(['is_zone_pastor' => true]);

            foreach ($previous as $p) {
                if ($p->user_id) {
                    ZoneHistory::where('zone_id', $zone->id)->where('pastor_id', $p->user_id)->whereNull('end_date')->update(['end_date' => now()->toDateString()]);
                }
            }
            if ($pastor->user_id) {
                ZoneHistory::create(['zone_id' => $zone->id, 'pastor_id' => $pastor->user_id, 'start_date' => now()->toDateString(), 'notes' => 'Appointed pastor in charge by head office']);
                $this->tell($pastor->user_id, 'You are now Pastor in Charge', "Head office appointed you pastor in charge of {$zone->name} ({$zone->code}).");
            }
            foreach ($previous as $p) {
                $p->user_id && $this->tell($p->user_id, 'Zone leadership changed', "{$pastor->name} {$pastor->surname} is now pastor in charge of {$zone->name}.");
            }
            AuditTrail::record('zone.pic_set', $actor, $zone, ['pastor_id' => $pastor->id, 'name' => trim("{$pastor->name} {$pastor->surname}")], $pastor->user_id);
        });

        $this->forget($zone->id);
    }

    public function hasZoneAdminSupport(): bool
    {
        return Schema::hasColumn('pastors', 'is_zone_admin');
    }

    public function setZoneAdmin(Zone $zone, Pastor $pastor, bool $on, User $actor): void
    {
        $this->master($actor);
        abort_unless($this->hasZoneAdminSupport(), 422, 'Run the latest database update first (php artisan migrate).');
        if ((int) $pastor->zone_id !== (int) $zone->id) {
            throw ValidationException::withMessages(['pastor' => "{$pastor->name} is not a pastor of {$zone->name}."]);
        }

        $pastor->update(['is_zone_admin' => $on]);
        if ($pastor->user_id) {
            $this->tell($pastor->user_id, $on ? 'You are now Zone Administrator' : 'Zone administrator role removed', ($on ? "You were made administrator of {$zone->name} ({$zone->code})." : "You are no longer administrator of {$zone->name}."));
        }
        AuditTrail::record($on ? 'zone.admin_set' : 'zone.admin_removed', $actor, $zone, ['pastor_id' => $pastor->id], $pastor->user_id);
        $this->forget($zone->id);
    }

    /** Appoint a head of department. $immediate skips the "accept / decline" step. */
    public function appointHod(Department $department, User $candidate, User $actor, bool $immediate = true, ?string $notes = null): void
    {
        $this->master($actor);
        // A department tied to a zone needs a head from that zone; a church-wide department takes a head from any zone (the zone chosen at appointment).
        if ($department->zone_id && (int) $candidate->zone_id !== (int) $department->zone_id) {
            throw ValidationException::withMessages(['user' => "{$candidate->name} is not in {$department->zone?->name}. A head of department must belong to the department's zone."]);
        }
        if (!$candidate->zone_id) {
            throw ValidationException::withMessages(['user' => "{$candidate->name} has no zone yet."]);
        }
        if (!in_array($candidate->role, [UserRole::Member, UserRole::Partner, UserRole::HOD, UserRole::Pastor], true) || !$candidate->is_active) {
            throw ValidationException::withMessages(['user' => 'That person cannot be appointed (inactive or not a church member).']);
        }

        DB::transaction(function () use ($department, $candidate, $actor, $immediate, $notes) {
            $department->assignHod($candidate, $notes);
            if ($immediate) {
                $department->acceptHod();
                if ($candidate->role !== UserRole::Pastor) {
                    $candidate->forceFill(['role' => UserRole::HOD, 'department_id' => $department->id])->save();
                }
            }
            $this->tell($candidate->id, $immediate ? 'You are now Head of Department' : 'HOD appointment invitation', "Head office appointed you head of {$department->name}" . ($immediate ? '.' : '. Please accept or decline.'));
            AuditTrail::record('department.hod_appointed', $actor, $department, ['immediate' => $immediate], $candidate->id);
        });
    }

    public function assignHomeGroupLeader(HomeGroup $group, User $candidate, User $actor): void
    {
        $this->master($actor);
        if ((int) $candidate->zone_id !== (int) $group->zone_id) {
            throw ValidationException::withMessages(['user' => "{$candidate->name} is not in this home group's zone."]);
        }
        if (!$candidate->is_active) {
            throw ValidationException::withMessages(['user' => 'That person is not active.']);
        }

        DB::transaction(function () use ($group, $candidate, $actor) {
            $candidate->update(['home_group_id' => $group->id]);
            $group->update(['leader_id' => $candidate->id]);
            $this->tell($candidate->id, 'You now lead a home group', "Head office appointed you leader of {$group->name}.");
            AuditTrail::record('homegroup.leader_set', $actor, $group, [], $candidate->id);
        });

        Cache::forget("homegroups_zone_{$group->zone_id}");
    }

    /** Create a finance / events login for a person and hand back credentials (see CredentialService). */
    public function appointStaff(string $name, string $email, UserRole $role, User $actor): array
    {
        $this->master($actor);
        abort_unless(in_array($role, [UserRole::Finance, UserRole::Event], true), 422, 'Staff roles are Finance or Events.');
        if (User::where('email', strtolower($email))->exists()) {
            throw ValidationException::withMessages(['email' => 'An account with this email already exists. Change that account\'s role from the Users list instead.']);
        }

        $creds = app(CredentialService::class);
        $password = $creds->password();
        $user = User::create([
            'name' => $name, 'email' => strtolower($email), 'password' => $password, 'role' => $role, 'is_active' => true,
            'terms_accepted' => true, 'terms_accepted_at' => now(), 'completed_tour' => true,
        ]);
        AuditTrail::record('staff.appointed', $actor, $user, ['role' => $role->value], $user->id);

        return $creds->describe($user, null, null, $password, $actor, 'New ' . $role->getLabel() . ' account');
    }

    private function tell(int $userId, string $title, string $message): void
    {
        Notification::create(['user_id' => $userId, 'type' => 'info', 'category' => 'system', 'is_read' => false, 'title' => $title, 'message' => $message]);
    }

    private function forget(int $zoneId): void
    {
        foreach (["zone_summary_{$zoneId}", "dashboard_{$zoneId}", "member_zone_summary_{$zoneId}"] as $k) {
            Cache::forget($k);
        }
    }
}
