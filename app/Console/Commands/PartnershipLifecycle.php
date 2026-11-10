<?php

namespace App\Console\Commands;

use App\Enums\PartnerStatus;
use App\Enums\UserRole;
use App\Models\Notification;
use App\Models\Partner;
use App\Models\User;
use App\Services\PartnershipService;
use Illuminate\Console\Command;

/**
 * Daily housekeeping for partnerships (safe to run any number of times a day; nobody is notified twice):
 *   1. partnerships whose renewal date has passed become "expired" (they lose the marketplace until they renew)
 *   2. active partners are reminded in the last week before their renewal date
 *   3. once a month, members who are not partners are invited to partner, and expired partners are asked to renew
 */
class PartnershipLifecycle extends Command
{
    protected $signature = 'partners:lifecycle';
    protected $description = 'Expire lapsed partnerships and send renewal and "become a partner" reminders';

    public function handle(): int
    {
        $expired = $this->expire();
        $reminded = $this->remindExpiring();
        [$invited, $renew] = $this->monthly();

        $this->info("Expired {$expired}; renewal reminders {$reminded}; monthly invitations {$invited}; monthly renewals {$renew}.");

        return self::SUCCESS;
    }

    private function expire(): int
    {
        $n = 0;
        Partner::where('status', PartnerStatus::Active->value)->whereNotNull('renewal_date')->whereDate('renewal_date', '<', now()->toDateString())
            ->chunkById(100, function ($partners) use (&$n) {
                foreach ($partners as $p) {
                    $p->forceFill(['status' => PartnerStatus::Expired])->save();
                    $this->tell($p->user_id, 'Your partnership has expired', 'Renew it to get the marketplace and partner content back. It only takes a minute in the app.', 'warning');
                    $n++;
                }
            });

        return $n;
    }

    private function remindExpiring(): int
    {
        $n = 0;
        Partner::with('package')->where('status', PartnerStatus::Active->value)->whereNotNull('renewal_date')
            ->whereDate('renewal_date', '>=', now()->toDateString())->whereDate('renewal_date', '<=', now()->addDays(PartnershipService::REMIND_DAYS)->toDateString())
            ->chunkById(100, function ($partners) use (&$n) {
                foreach ($partners as $p) {
                    $when = $p->renewal_date->format('j M');
                    if ($this->tell($p->user_id, 'Partnership renewal reminder', "Your partnership renews on {$when}. Renew now so you keep your benefits.", 'info', 6)) {
                        $n++;
                    }
                }
            });

        return $n;
    }

    /** @return array{int, int} */
    private function monthly(): array
    {
        $invited = $renew = 0;

        User::where('is_active', true)->whereIn('role', [UserRole::Member->value, UserRole::HOD->value])->whereDoesntHave('partner')
            ->chunkById(200, function ($users) use (&$invited) {
                foreach ($users as $u) {
                    if ($this->tell($u->id, 'Become a partner this month', 'Partners support the ministry and unlock the marketplace. Open Me → Partnership to join.', 'info', 28)) {
                        $invited++;
                    }
                }
            });

        Partner::where('status', PartnerStatus::Expired->value)->chunkById(200, function ($partners) use (&$renew) {
            foreach ($partners as $p) {
                if ($this->tell($p->user_id, 'Renew your partnership', 'Your partnership has expired. Renew it to use the marketplace and partner content again.', 'warning', 28)) {
                    $renew++;
                }
            }
        });

        return [$invited, $renew];
    }

    /** Create the notification unless the same one was already sent in the last $withinDays days. */
    private function tell(int $userId, string $title, string $message, string $type, int $withinDays = 0): bool
    {
        $q = Notification::where('user_id', $userId)->where('category', 'partnership')->where('title', $title);
        if ($withinDays > 0) {
            $q->where('created_at', '>=', now()->subDays($withinDays));
        } else {
            $q->where('created_at', '>=', now()->subDay());
        }
        if ($q->exists()) {
            return false;
        }

        Notification::create(['user_id' => $userId, 'title' => $title, 'message' => $message, 'type' => $type, 'category' => 'partnership', 'is_read' => false]);

        return true;
    }
}
