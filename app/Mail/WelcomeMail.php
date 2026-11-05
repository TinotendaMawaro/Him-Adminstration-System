<?php

namespace App\Mail;

use App\Models\Pastor;
use App\Models\User;

/** Sent once when an account is created (self-registration or created by head office). */
class WelcomeMail extends BrandedMail
{
    public function __construct(public User $user)
    {
        parent::__construct();
    }

    protected function compose(): array
    {
        $u    = $this->user->loadMissing(['member', 'zone.region', 'department']);
        $role = $u->role->value;
        $first = trim(explode(' ', $u->name)[0]) ?: 'friend';

        $leadPastor = $u->zone_id
            ? Pastor::where('zone_id', $u->zone_id)->where('is_zone_pastor', true)->first()
            : null;

        $facts = array_filter([
            'Name'        => $u->name,
            'Email'       => $u->email,
            'Account'     => $u->role->getLabel(),
            'Member code' => $u->member?->member_code,
            'Your sign-in code' => $role === 'pastor' ? $u->unique_code : null,
            'Zone'        => $u->zone ? "{$u->zone->name} ({$u->zone->code})" : null,
            'Region'      => $u->zone?->region?->name,
            'Zone pastor' => $leadPastor?->full_name,
            'Department'  => $u->department?->name,
        ]);

        [$intro, $ctaLabel, $ctaUrl] = match (true) {
            in_array($role, ['master'], true)  => [['Your master administrator account is ready. From the Master console you can oversee members, pastors, zones, finance and events.'], 'Open the Master console', self::portalUrl('/admin')],
            $role === 'finance'                => [['Your finance account is ready. You can receive and verify payments, issue receipts and follow giving by zone and region.'], 'Open the Finance portal', self::portalUrl('/finance')],
            $role === 'event'                  => [['Your events account is ready. You can create events, manage registrations and follow attendance.'], 'Open the Events portal', self::portalUrl('/events')],
            $role === 'pastor'                 => [['Your pastor account is ready. Sign in with the unique pastor code issued to you by head office to see your zone, members, reports and prayer requests.'], 'Open my portal', self::portalUrl()],
            $role === 'partner'                => [['Thank you for partnering with us. Your partner portal shows your partnership, giving history, statements and benefits.'], 'Open my partner portal', self::portalUrl()],
            $role === 'hod'                    => [['Your Head of Department account is ready. You can manage your department\'s members, activities and reports.'], 'Open my portal', self::portalUrl()],
            default                            => [['We are so glad you joined us. Your membership account gives you your zone, home groups, events, prayer requests and giving, all in one place.'], 'Open my portal', self::portalUrl()],
        };

        return [
            'subject'   => "Welcome to {$this->brandShort()}, {$first}",
            'preheader' => 'Your account is ready. Here is how to get started.',
            'tone'      => 'success',
            'title'     => "Welcome, {$first}!",
            'greeting'  => "Hello {$first},",
            'intro'     => $intro,
            'facts'     => $facts,
            'cta'       => ['label' => $ctaLabel, 'url' => $ctaUrl],
            'notice'    => $role === 'pastor'
                ? 'For your security we never email your pastor code. If you have not received it, please contact head office.'
                : 'New to the portal or forgot your password? Choose "Forgot password?" on the sign-in page and we will email you a secure link to set it.',
            'outro'     => ['If you did not expect this email, you can safely ignore it or reply to let us know.'],
        ];
    }

    private function brandShort(): string
    {
        return (string) config('mailing.brand.short');
    }
}
