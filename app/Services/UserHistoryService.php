<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\Member;
use App\Models\Pastor;
use App\Models\User;
use App\Models\ZoneHistory;

/**
 * The "history" card that appears when someone hovers a member or user: when they joined, every zone move, appointments,
 * sign-in detail resets and status changes, newest first. Shown only to people who may already see that person.
 */
class UserHistoryService
{
    private const TITLES = [
        'member.created' => ['Joined the church', 'user-plus'],
        'member.transferred' => ['Moved zone', 'arrows'],
        'pastor.transferred' => ['Transferred to a new zone', 'arrows'],
        'pastor.created' => ['Became a pastor', 'user-plus'],
        'credentials.issued' => ['New sign-in details issued', 'key'],
        'user.activated' => ['Account activated', 'check'],
        'user.deactivated' => ['Account deactivated', 'lock'],
        'staff.appointed' => ['Appointed to staff', 'badge'],
        'zone.pic_set' => ['Appointed pastor in charge', 'badge'],
        'zone.admin_set' => ['Made zone administrator', 'badge'],
        'zone.admin_removed' => ['Zone administrator role removed', 'badge'],
        'department.hod_appointed' => ['Appointed head of department', 'badge'],
        'homegroup.leader_set' => ['Appointed home group leader', 'badge'],
        'auth.logout_all' => ['Signed out of all devices', 'lock'],
    ];

    public function canView(User $viewer, User $subject): bool
    {
        return $viewer->isMaster()
            || $viewer->id === $subject->id
            || ($viewer->isPastor() && $viewer->zone_id && (int) $viewer->zone_id === (int) $subject->zone_id)
            || ($viewer->isHOD() && $viewer->department_id && (int) $viewer->department_id === (int) $subject->department_id);
    }

    public function timeline(User $subject, User $viewer, int $limit = 12): array
    {
        abort_unless($this->canView($viewer, $subject), 403, 'You cannot view this person\'s history.');

        $events = [];

        foreach (AuditLog::where(fn ($q) => $q->where('user_id', $subject->id)->orWhere(fn ($w) => $w->where('subject_type', User::class)->where('subject_id', $subject->id)))
            ->whereIn('action', array_keys(self::TITLES))->orderByDesc('occurred_at')->limit(40)->get() as $a) {
            [$title, $kind] = self::TITLES[$a->action];
            $d = (array) $a->details;
            $detail = match (true) {
                isset($d['from_zone'], $d['to_zone']) => ($d['from_zone']['name'] ?? '?') . ' → ' . ($d['to_zone']['name'] ?? '?'),
                isset($d['to_zone']['name']) => 'To ' . $d['to_zone']['name'],
                !empty($d['new_code']) && $viewer->isMaster() => 'New code ' . $d['new_code'],
                default => null,
            };
            if (!empty($d['reason'])) {
                $detail = trim(($detail ? $detail . ' · ' : '') . $d['reason']);
            }
            $events[] = ['at' => $a->occurred_at?->toIso8601String(), 'title' => $title, 'detail' => $detail, 'kind' => $kind];
        }

        if ($subject->isPastor()) {
            foreach (ZoneHistory::with('zone:id,name')->where('pastor_id', $subject->id)->orderByDesc('start_date')->limit(10)->get() as $h) {
                $events[] = ['at' => $h->start_date?->toIso8601String(), 'title' => 'In ' . ($h->zone?->name ?? 'a zone'), 'detail' => $h->notes, 'kind' => 'pin'];
            }
        }

        $events[] = ['at' => $subject->created_at?->toIso8601String(), 'title' => 'Account created', 'detail' => null, 'kind' => 'user-plus'];

        usort($events, fn ($a, $b) => strcmp((string) $b['at'], (string) $a['at']));

        $member = Member::where('user_id', $subject->id)->first();
        $pastor = Pastor::where('user_id', $subject->id)->first();

        return [
            'person' => [
                'id' => $subject->id, 'name' => $subject->name, 'role' => $subject->role->getLabel(),
                'zone' => $subject->zone?->name, 'photo' => $subject->profile_photo,
                'code' => $pastor?->code ?? $member?->member_code ?? $member?->member_number,
                'since' => $subject->created_at?->format('M Y'),
                'last_sign_in' => $subject->last_login_at ? \Carbon\Carbon::parse($subject->last_login_at)->diffForHumans() : null,
                'active' => (bool) $subject->is_active,
            ],
            'events' => array_slice($events, 0, $limit),
        ];
    }
}
