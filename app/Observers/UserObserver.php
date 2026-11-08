<?php

namespace App\Observers;

use App\Enums\UserRole;
use App\Mail\AccountChangedMail;
use App\Mail\SecurityAlertMail;
use App\Mail\WelcomeMail;
use App\Models\Department;
use App\Models\User;
use App\Models\Zone;
use App\Services\BadgeAwardService;
use App\Services\MilestoneDispatcher;
use App\Support\Mailing;
use Illuminate\Support\Str;

class UserObserver
{
    /** Account fields worth telling the person about. Routine profile edits (phone, photo, tour…) stay quiet. */
    private const NOTIFY_ON = ['name', 'role', 'is_active', 'zone_id', 'department_id'];

    public function __construct(
        protected MilestoneDispatcher $milestones,
        protected BadgeAwardService   $badges,
    ) {}

    public function created(User $user): void
    {
        // Everyone gets a community identity (handle) the moment they have an account.
        try {
            app(\App\Services\Community\CommunityService::class)->profile($user);
        } catch (\Throwable) {
            // never block account creation on this; the profile is also created lazily on first use
        }

        if ($user->is_active === false) {
            return;
        }

        Mailing::to($user, new WelcomeMail($user));
    }

    public function updated(User $user): void
    {
        \App\Support\PeopleSync::fromUser($user);

        $changes = $user->getChanges();
        unset($changes['updated_at']);

        if (!$changes) {
            return;
        }

        $ip     = request()?->ip();
        $device = request()?->userAgent() ? Str::limit(request()->userAgent(), 90, '…') : null;

        if (array_key_exists('password', $changes)) {
            Mailing::to($user, new SecurityAlertMail($user, 'password_changed', null, $ip, $device));
        }

        if (array_key_exists('email', $changes)) {
            $old = (string) $user->getRawOriginal('email');
            if ($old !== '') {
                Mailing::to($old, new SecurityAlertMail($user, 'email_changed_old', $user->email, $ip, $device));
            }
            Mailing::to($user, new SecurityAlertMail($user, 'email_changed_new', $old ?: null, $ip, $device));
        }

        $rows = $this->describeChanges($user, array_intersect_key($changes, array_flip(self::NOTIFY_ON)));
        if ($rows) {
            $actor = auth()->user();
            Mailing::to($user, new AccountChangedMail($user, $rows, $actor && $actor->id !== $user->id ? $actor->name : null));
        }
    }

    /** @return array<int, array{0:string,1:?string,2:?string}> */
    private function describeChanges(User $user, array $changes): array
    {
        $rows = [];

        foreach ($changes as $field => $new) {
            $old = $user->getRawOriginal($field);

            $rows[] = match ($field) {
                'name'          => ['Name', $old, $new],
                'role'          => ['Account type', UserRole::tryFrom((string) $old)?->getLabel() ?? $old, UserRole::tryFrom((string) $new)?->getLabel() ?? $new],
                'is_active'     => ['Account status', $old ? 'Active' : 'Deactivated', $new ? 'Active' : 'Deactivated'],
                'zone_id'       => ['Zone', $old ? Zone::find($old)?->name : null, $new ? Zone::find($new)?->name : null],
                'department_id' => ['Department', $old ? Department::find($old)?->name : null, $new ? Department::find($new)?->name : null],
                default         => [Str::headline($field), $old, $new],
            };
        }

        return $rows;
    }

    public function saved(User $user): void
    {
        if (!$user->member) {
            return;
        }

        // First home group
        if ($user->wasChanged('home_group_id') && $user->home_group_id) {
            $this->badges->awardIfEligible($user, 'first_homegroup');
            $this->milestones->dispatch('leadership', $user, [
                'title' => 'Joined a Home Group',
            ]);
        }

        // First department
        if ($user->wasChanged('department_id') && $user->department_id) {
            $this->badges->awardIfEligible($user, 'first_department');
        }
    }
}
