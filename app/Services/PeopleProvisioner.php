<?php

namespace App\Services;

use App\Enums\UserRole;
use App\Mail\ResetPasswordMail;
use App\Models\HomeGroup;
use App\Models\Member;
use App\Models\Pastor;
use App\Models\User;
use App\Models\Zone;
use App\Support\Mailing;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * How head office adds, edits and removes people. A person is always a LOGIN ACCOUNT plus a matching record
 * (member or pastor), created, changed and retired together so the two can never disagree. New people get a welcome
 * email and a secure link to choose their own password (nobody is ever emailed a password).
 */
class PeopleProvisioner
{
    // ── Members ──────────────────────────────────────────────────────────────────────────────────────

    public function createMember(array $d, User $actor): Member
    {
        $this->master($actor);
        $zone = Zone::findOrFail($d['zone_id']);

        $member = DB::transaction(function () use ($d, $zone, $actor) {
            $user = User::create([
                'name' => trim("{$d['name']} {$d['surname']}"), 'email' => Str::lower($d['email']), 'password' => Str::random(40),
                'role' => UserRole::Member, 'phone' => $d['phone'] ?? null, 'date_of_birth' => $d['date_of_birth'] ?? null,
                'zone_id' => $zone->id, 'is_active' => true,
            ]);

            $code = $this->nextMemberCode($zone);

            $member = Member::create([
                'user_id' => $user->id, 'name' => $d['name'], 'surname' => $d['surname'], 'member_number' => $code, 'member_code' => $code,
                'zone_id' => $zone->id, 'date_of_birth' => $d['date_of_birth'] ?? null, 'gender_id' => $d['gender_id'] ?? null,
                'status' => $d['status'] ?? 'active', 'is_baptised' => (bool) ($d['is_baptised'] ?? false), 'membership_date' => now(),
            ]);

            AuditTrail::record('member.created', $actor, $member, ['zone' => $zone->code, 'member_code' => $code], $user->id);

            return $member;
        });

        $this->inviteToSetPassword($member->user);

        return $member;
    }

    public function updateMember(Member $member, array $d, User $actor): Member
    {
        $this->master($actor);

        return DB::transaction(function () use ($member, $d, $actor) {
            $member->update(collect($d)->only(['name', 'surname', 'date_of_birth', 'gender_id', 'status', 'is_baptised', 'can_be_partner'])->all());

            if ($member->user) {
                $account = collect($d)->only(['email', 'phone'])->all();
                if (isset($account['email'])) {
                    $account['email'] = Str::lower($account['email']);
                }
                $member->user->update($account + ['name' => trim("{$member->name} {$member->surname}")]);
            }

            AuditTrail::record('member.updated', $actor, $member, ['fields' => array_keys($d)], $member->user_id);

            return $member->refresh();
        });
    }

    /** Retire a member: the record is kept (history, payments), the login stops working at once. */
    public function removeMember(Member $member, User $actor): void
    {
        $this->master($actor);

        if ($member->user_id && HomeGroup::where('leader_id', $member->user_id)->exists()) {
            throw ValidationException::withMessages(['member' => 'This member leads a home group. Appoint another leader first.']);
        }

        DB::transaction(function () use ($member, $actor) {
            $this->retireAccount($member->user);
            $member->delete();
            AuditTrail::record('member.removed', $actor, $member, ['member_code' => $member->member_code], $member->user_id);
        });
    }

    // ── Pastors ──────────────────────────────────────────────────────────────────────────────────────

    public function createPastor(array $d, User $actor): Pastor
    {
        $this->master($actor);
        $zone = Zone::findOrFail($d['zone_id']);

        $pastor = DB::transaction(function () use ($d, $zone, $actor) {
            $code     = $this->nextPastorCode($zone);
            $hasLead  = Pastor::where('zone_id', $zone->id)->where('is_zone_pastor', true)->exists();

            $user = User::create([
                'name' => trim("{$d['name']} {$d['surname']}"), 'email' => Str::lower($d['email']), 'password' => Str::random(40),
                'role' => UserRole::Pastor, 'unique_code' => $code, 'phone' => $d['phone'] ?? null, 'date_of_birth' => $d['date_of_birth'] ?? null,
                'zone_id' => $zone->id, 'is_active' => true,
            ]);

            $pastor = Pastor::create([
                'user_id' => $user->id, 'name' => $d['name'], 'surname' => $d['surname'], 'code' => $code, 'zone_id' => $zone->id,
                'region_id' => $zone->region_id, 'title' => $d['title'] ?? null, 'ordained_date' => $d['ordained_date'] ?? null,
                'is_zone_pastor' => !$hasLead,
            ]);

            AuditTrail::record('pastor.created', $actor, $pastor, ['zone' => $zone->code, 'code' => $code, 'lead' => !$hasLead], $user->id);

            return $pastor;
        });

        $this->inviteToSetPassword($pastor->user);

        return $pastor;
    }

    /** Retire a pastor: record kept, login stops at once. If they led the zone, the zone is left without a lead to be reassigned. */
    public function removePastor(Pastor $pastor, User $actor): void
    {
        $this->master($actor);

        DB::transaction(function () use ($pastor, $actor) {
            $this->retireAccount($pastor->user);
            $wasLead = $pastor->is_zone_pastor;
            $pastor->update(['is_zone_pastor' => false]);
            $pastor->delete();
            AuditTrail::record('pastor.removed', $actor, $pastor, ['code' => $pastor->code, 'was_zone_lead' => $wasLead, 'zone_id' => $pastor->zone_id], $pastor->user_id);
        });
    }

    // ── Shared ───────────────────────────────────────────────────────────────────────────────────────

    public function nextMemberCode(Zone $zone): string
    {
        // Older members carry this format in member_number, newer ones in member_code: continue after the highest of both.
        $prefix = rtrim($zone->code, 'M') . 'M-';
        $next   = 1 + (int) Member::withTrashed()
            ->where(fn ($q) => $q->where('member_code', 'LIKE', $prefix . '%')->orWhere('member_number', 'LIKE', $prefix . '%'))
            ->get(['member_code', 'member_number'])
            ->map(fn ($m) => max((int) substr((string) strrchr((string) $m->member_code, '-'), 1), (int) substr((string) strrchr((string) $m->member_number, '-'), 1)))
            ->max();

        return $prefix . str_pad((string) $next, 4, '0', STR_PAD_LEFT);
    }

    /** R0101 -> R0101P01, R0101P02 ... (the code a pastor signs in with). */
    public function nextPastorCode(Zone $zone): string
    {
        $prefix = $zone->code . 'P';
        $last   = User::where('unique_code', 'LIKE', $prefix . '%')->orderByDesc('unique_code')->value('unique_code');
        $next   = $last ? ((int) substr($last, strlen($prefix))) + 1 : 1;

        return $prefix . str_pad((string) $next, 2, '0', STR_PAD_LEFT);
    }

    /** Email an existing person a secure link to choose (or reset) their own password. */
    public function sendPasswordLink(User $user, User $actor): void
    {
        $this->master($actor);

        if (!$user->is_active) {
            throw ValidationException::withMessages(['user' => 'This account is deactivated.']);
        }

        if (!$this->inviteToSetPassword($user)) {
            throw ValidationException::withMessages(['user' => "No email was sent: {$user->email} cannot receive email (a demo or invalid address, or the person opted out). Correct the address first."]);
        }

        AuditTrail::record('user.password_link_sent', $actor, $user, ['email' => $user->email], $user->id);
    }

    /** @return bool whether an email was actually queued (false when the address cannot receive email) */
    private function inviteToSetPassword(User $user): bool
    {
        $token = Password::broker()->createToken($user);
        $url   = route('password.reset.form', ['token' => $token, 'email' => $user->email]);

        return Mailing::to($user, new ResetPasswordMail($user, $url, (int) config('auth.passwords.users.expire', 60))) !== null;
    }

    private function retireAccount(?User $user): void
    {
        if (!$user) {
            return;
        }

        $user->forceFill(['is_active' => false])->save();
        $user->tokens()->delete();
    }

    private function master(User $actor): void
    {
        abort_unless($actor->isMaster(), 403, 'Only the master console can do this.');
    }
}
