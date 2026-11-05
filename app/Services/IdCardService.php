<?php

namespace App\Services;

use App\Models\Member;
use App\Models\Pastor;
use App\Models\User;

/**
 * The data printed on a person's ID card, from the one place each fact lives:
 *   members / partners / HODs -> their member record (full name, zone, date of birth, member number)
 *   pastors                   -> their pastor record (name, pastor code, zone)
 *   staff (master/finance/events) -> their user account (staff number)
 *
 * The QR code carries a signed verification link: anyone can scan it to see that the card is genuine and still
 * active, but the link reveals nothing private (no date of birth, phone or email) and cannot be forged or guessed.
 */
class IdCardService
{
    public function forUser(User $user): array
    {
        $user->loadMissing('zone.region');

        [$kind, $name, $number, $numberLabel, $dob, $zone] = match (true) {
            $user->isPastor() => $this->pastor($user),
            $user->isFilamentUser() => $this->staff($user),
            default => $this->member($user),
        };

        $roleLabel = match (true) {
            $kind === 'pastor'  => ($user->pastor?->is_zone_pastor ?? false) ? 'Zone Pastor' : 'Pastor',
            $kind === 'staff'   => ['master' => 'Master Admin', 'finance' => 'Finance', 'event' => 'Events'][$user->role->value] ?? 'Staff',
            $kind === 'hod'     => 'Department Head',
            $kind === 'partner' => 'Partner',
            default             => 'Member',
        };

        return [
            'kind'          => $kind,
            'role_label'    => $roleLabel,
            'full_name'     => $name,
            'zone'          => $zone ? "{$zone->name} ({$zone->code})" : ($kind === 'staff' ? 'Head Office' : null),
            'region'        => $zone?->region?->name,
            'dob'           => $dob?->format('d M Y'),
            'number'        => $number,
            'number_label'  => $numberLabel,
            'status'        => $user->is_active ? 'active' : 'inactive',
            'issued'        => now()->format('M Y'),
            'verify_url'    => url('/verify/' . $this->token($user)),
            'photo_url'     => $user->profile_photo ? '/storage/' . ltrim($user->profile_photo, '/') : null,
            'support_email' => config('mailing.support_email'),
        ];
    }

    /** What a scan of the QR code is allowed to reveal: public and minimal. */
    public function publicView(string $token): ?array
    {
        $user = $this->userFromToken($token);
        if (!$user) {
            return null;
        }

        $card = $this->forUser($user);

        return [
            'valid'        => (bool) $user->is_active,
            'name'         => $card['full_name'],
            'role_label'   => $card['role_label'],
            'number'       => $card['number'],
            'number_label' => $card['number_label'],
            'zone'         => $card['zone'],
        ];
    }

    public function token(User $user): string
    {
        $id = rtrim(strtr(base64_encode((string) $user->id), '+/', '-_'), '=');

        return $id . '.' . $this->signature($user->id);
    }

    public function userFromToken(string $token): ?User
    {
        [$encoded, $signature] = array_pad(explode('.', $token, 2), 2, '');
        $id = (int) base64_decode(strtr($encoded, '-_', '+/'), true);

        if ($id < 1 || !hash_equals($this->signature($id), $signature)) {
            return null;
        }

        return User::with('zone.region', 'member', 'pastor')->find($id);
    }

    private function signature(int $userId): string
    {
        return substr(hash_hmac('sha256', "idcard:{$userId}", (string) config('app.key')), 0, 16);
    }

    private function member(User $user): array
    {
        $member = Member::with('zone.region')->where('user_id', $user->id)->first();
        $kind   = $user->isHOD() ? 'hod' : ($user->isPartner() ? 'partner' : 'member');

        return [
            $kind,
            $member ? trim("{$member->name} {$member->surname}") : $user->name,
            $member?->member_code ?? $member?->member_number ?? $this->fallbackNumber($user),
            'Member No.',
            $member?->date_of_birth ?? $user->date_of_birth,
            $member?->zone ?? $user->zone,
        ];
    }

    private function pastor(User $user): array
    {
        $pastor = Pastor::with('zone.region')->where('user_id', $user->id)->first();

        return [
            'pastor',
            $pastor ? trim("{$pastor->name} {$pastor->surname}") : $user->name,
            $pastor?->code ?? $user->unique_code ?? $this->fallbackNumber($user),
            'Pastor Code',
            $user->date_of_birth,
            $pastor?->zone ?? $user->zone,
        ];
    }

    private function staff(User $user): array
    {
        return ['staff', $user->name, 'STF-' . str_pad((string) $user->id, 5, '0', STR_PAD_LEFT), 'Staff ID', $user->date_of_birth, $user->zone];
    }

    private function fallbackNumber(User $user): string
    {
        return 'HIM-' . str_pad((string) $user->id, 6, '0', STR_PAD_LEFT);
    }
}
