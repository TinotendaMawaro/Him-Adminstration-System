<?php

namespace App\Services;

use App\Enums\PartnerStatus;
use App\Enums\PaymentType;
use App\Models\Notification;
use App\Models\Partner;
use App\Models\Payment;
use App\Models\User;
use Carbon\Carbon;

/**
 * The one place that decides whether someone is a partner "in good standing".
 *
 *   none      never became a partner
 *   pending   enrolled, first payment not confirmed yet
 *   active    paid up (renewal date in the future, or no date set)
 *   expiring  active, but the renewal date is within 7 days
 *   expired   the renewal date has passed, or head office marked it expired / suspended / cancelled / inactive
 *
 * Active partners can use partner benefits (the marketplace, partner-only teachings). Expired partners lose them until they renew;
 * people who never partnered keep the ordinary member experience.
 */
class PartnershipService
{
    public const REMIND_DAYS = 7;

    public function partnerOf(User $user): ?Partner
    {
        return Partner::with('package')->where('user_id', $user->id)->first();
    }

    /** @return array{status: string, in_good_standing: bool, locked: bool, package: ?string, amount: ?float, renewal_date: ?string, days_left: ?int, frequency: ?string, message: string} */
    public function state(User $user): array
    {
        $partner = $this->partnerOf($user);

        if (!$partner) {
            return $this->shape('none', null, 'You are not a partner yet. Partners support the ministry and unlock the marketplace.');
        }

        $renewal = $partner->renewal_date ? Carbon::parse($partner->renewal_date)->startOfDay() : null;
        $days = $renewal ? (int) now()->startOfDay()->diffInDays($renewal, false) : null;
        $status = $partner->status instanceof PartnerStatus ? $partner->status : PartnerStatus::from((string) $partner->status);

        $key = match (true) {
            $status === PartnerStatus::Pending => 'pending',
            $status !== PartnerStatus::Active => 'expired',
            $days !== null && $days < 0 => 'expired',
            $days !== null && $days <= self::REMIND_DAYS => 'expiring',
            default => 'active',
        };

        $message = match ($key) {
            'pending' => 'Your partnership is waiting for your first payment to be confirmed.',
            'expiring' => $days === 0 ? 'Your partnership renews today.' : "Your partnership expires in {$days} day" . ($days === 1 ? '' : 's') . '. Renew to keep your benefits.',
            'expired' => 'Your partnership has expired. Renew to get the marketplace and partner content back.',
            default => 'Thank you for partnering with the ministry.',
        };

        return $this->shape($key, $partner, $message, $days);
    }

    public function inGoodStanding(User $user): bool
    {
        $s = $this->state($user)['status'];

        return in_array($s, ['active', 'expiring'], true);
    }

    /** Someone who partnered before and is no longer in good standing: they lose partner benefits. */
    public function isLockedOut(User $user): bool
    {
        return $this->state($user)['locked'];
    }

    /** A completed partnership payment keeps the partner active for another period. */
    public function recordPayment(Payment $payment): void
    {
        if ($payment->type !== PaymentType::Partnership) {
            return;
        }

        $partner = Partner::where('user_id', $payment->user_id)->first();
        if (!$partner) {
            return;
        }

        $base = $partner->renewal_date && Carbon::parse($partner->renewal_date)->isFuture() ? Carbon::parse($partner->renewal_date) : now();
        $freq = $partner->pledge_frequency?->value ?? $partner->contribution_type ?? 'monthly';
        $next = match ($freq) {
            'quarterly' => $base->copy()->addMonthsNoOverflow(3),
            'annually' => $base->copy()->addYear(),
            default => $base->copy()->addMonthNoOverflow(),
        };

        $partner->forceFill(['status' => PartnerStatus::Active, 'renewal_date' => $next->toDateString(), 'suspended_at' => null, 'cancelled_at' => null])->save();

        Notification::create([
            'user_id' => $partner->user_id, 'title' => 'Partnership renewed', 'message' => 'Thank you! Your partnership is active until ' . $next->format('j M Y') . '.',
            'type' => 'success', 'category' => 'partnership', 'is_read' => false,
        ]);
    }

    private function shape(string $key, ?Partner $p, string $message, ?int $days = null): array
    {
        return [
            'status' => $key,
            'in_good_standing' => in_array($key, ['active', 'expiring'], true),
            'locked' => $key === 'expired',
            'package' => $p?->package?->name,
            'amount' => $p ? (float) ($p->pledge_amount ?? $p->package?->monthly_amount ?? 0) : null,
            'renewal_date' => $p?->renewal_date ? Carbon::parse($p->renewal_date)->toDateString() : null,
            'days_left' => $days,
            'frequency' => $p ? ($p->pledge_frequency?->value ?? $p->contribution_type) : null,
            'message' => $message,
        ];
    }
}
