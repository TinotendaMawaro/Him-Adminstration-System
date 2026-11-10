<?php

namespace App\Services;

use App\Enums\UserRole;
use App\Models\Member;
use App\Models\Notification;
use App\Models\Pastor;
use App\Models\User;
use App\Models\Zone;
use App\Support\CredentialsPdf;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Fresh sign-in details for someone who has just moved zone or been appointed to a staff role:
 *   - a pastor gets a new pastor code for the new zone (R0101P02 ...), a member a new member code,
 *   - everyone gets a new strong temporary password and every other signed-in device is signed out.
 * The plain-text password exists only in the returned array (shown once in a modal and in the PDF). It is hashed in the
 * database, never logged, and the audit trail records THAT credentials were issued, not what they were.
 */
class CredentialService
{
    public function __construct(private readonly PeopleProvisioner $people) {}

    /** @return array{name: string, role: string, zone: ?string, login_label: string, login: string, code: ?string, password: string, issued_at: string, issued_by: ?string, reason: ?string} */
    public function issue(User $user, ?Zone $zone, User $actor, string $reason): array
    {
        abort_unless($actor->isMaster() || $actor->isPastor(), 403, 'Only a pastor or head office can issue credentials.');

        $password = $this->password();

        $code = DB::transaction(function () use ($user, $zone, $password) {
            $code = null;

            if ($user->isPastor() && $zone) {
                $code = $this->people->nextPastorCode($zone);
                $user->forceFill(['unique_code' => $code]);
                Pastor::where('user_id', $user->id)->update(['code' => $code]);
            } elseif (in_array($user->role, [UserRole::Member, UserRole::Partner, UserRole::HOD], true) && $zone) {
                $code = $this->people->nextMemberCode($zone);
                Member::where('user_id', $user->id)->update(['member_code' => $code, 'member_number' => $code]);
            }

            $user->forceFill(['password' => $password])->save();     // hashed by the model cast
            $user->tokens()->delete();                               // every other device must sign in again

            return $code;
        });

        AuditTrail::record('credentials.issued', $actor, $user, ['new_code' => $code, 'zone' => $zone?->code], $user->id);

        Notification::create([
            'user_id' => $user->id, 'type' => 'warning', 'category' => 'security', 'is_read' => false,
            'title' => 'You have new sign-in details',
            'message' => 'Your sign-in details were reset' . ($code ? " and your code is now {$code}" : '') . '. Use the new temporary password, then change it straight away.',
        ]);

        return $this->describe($user->fresh(), $zone, $code, $password, $actor, $reason);
    }

    /** Credentials for a brand-new staff account (finance, events): the same shape and the same PDF. */
    public function describe(User $user, ?Zone $zone, ?string $code, string $password, ?User $actor, ?string $reason): array
    {
        $isPastor = $user->isPastor();

        return [
            'name'        => $user->name,
            'role'        => $user->role->getLabel(),
            'zone'        => $zone ? "{$zone->name} ({$zone->code})" : ($user->zone?->name),
            'login_label' => $isPastor ? 'Pastor code (sign in with this)' : 'Email (sign in with this)',
            'login'       => $isPastor ? (string) ($code ?? $user->unique_code) : (string) $user->email,
            'code'        => $code,
            'password'    => $password,
            'issued_at'   => now()->format('d M Y, H:i'),
            'issued_by'   => $actor?->name,
            'reason'      => $reason,
        ];
    }

    public function pdf(array $credentials): string
    {
        return CredentialsPdf::render($credentials);
    }

    /** 14 characters, guaranteed upper, lower, digit and symbol, no look-alikes (0/O, 1/l/I). */
    public function password(): string
    {
        $pick = fn (string $set, int $n) => collect(range(1, $n))->map(fn () => $set[random_int(0, strlen($set) - 1)])->implode('');
        $chars = $pick('ABCDEFGHJKLMNPQRSTUVWXYZ', 4) . $pick('abcdefghjkmnpqrstuvwxyz', 5) . $pick('23456789', 3) . $pick('#$%&*+=?', 2);

        return str_shuffle($chars);
    }
}
