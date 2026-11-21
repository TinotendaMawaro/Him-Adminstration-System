<?php

namespace App\Providers;

use App\Mail\Transport\ResendTransport;
use App\Models\EventRegistration;
use App\Models\Member;
use App\Models\Notification;
use App\Models\Payment;
use App\Models\User;
use App\Observers\EventRegistrationObserver;
use App\Observers\MemberObserver;
use App\Observers\NotificationObserver;
use App\Observers\PaymentObserver;
use App\Observers\UserObserver;
use Illuminate\Mail\Events\MessageSent;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Behind a TLS-terminating proxy (Vercel) every generated link, asset and redirect must be https.
        if ($this->app->environment('production')) {
            \Illuminate\Support\Facades\URL::forceScheme('https');
        }

        Member::observe(MemberObserver::class);
        User::observe(UserObserver::class);
        Payment::observe(PaymentObserver::class);
        EventRegistration::observe(EventRegistrationObserver::class);
        Notification::observe(NotificationObserver::class);

        // Home groups live in their own channel: joining or leaving a group (by any route) moves the person in or out of it,
        // and the leader runs it.
        $moved = [];
        User::updating(function (User $u) use (&$moved) {
            if ($u->isDirty('home_group_id')) {
                $moved[$u->id] = $u->getOriginal('home_group_id');
            }
        });
        User::saved(function (User $u) use (&$moved) {
            if (!array_key_exists($u->id, $moved)) {
                return;
            }
            $old = $moved[$u->id];
            unset($moved[$u->id]);
            \App\Services\Community\HomeGroupChannelService::safely(function ($svc) use ($u, $old) {
                if ($old) {
                    $svc->remove((int) $old, $u);
                }
                if ($u->home_group_id && ($group = \App\Models\HomeGroup::find($u->home_group_id))) {
                    $svc->add($group, $u);
                }
            });
        });
        // Departments work the same way: a department's channel holds its people and is run by its head.
        $deptMoved = [];
        User::updating(function (User $u) use (&$deptMoved) {
            if ($u->isDirty('department_id')) {
                $deptMoved[$u->id] = $u->getOriginal('department_id');
            }
        });
        User::saved(function (User $u) use (&$deptMoved) {
            if (!array_key_exists($u->id, $deptMoved)) {
                return;
            }
            $old = $deptMoved[$u->id];
            unset($deptMoved[$u->id]);
            \App\Services\Community\DepartmentChannelService::safely(function ($svc) use ($u, $old) {
                if ($old) {
                    $svc->remove((int) $old, $u);
                }
                if ($u->department_id && ($dept = \App\Models\Department::find($u->department_id))) {
                    $svc->add($dept, $u);
                }
            });
        });
        \App\Models\Department::saved(function (\App\Models\Department $d) {
            $changed = $d->wasChanged('hod_id') || $d->wasChanged('hod_status');
            if ($changed && $d->hod_id && $d->hod_status === 'accepted') {
                \App\Services\Community\DepartmentChannelService::safely(fn ($svc) => $svc->syncHead($d));
            }
        });
        \App\Models\HomeGroup::saved(function (\App\Models\HomeGroup $g) {
            if ($g->wasChanged('leader_id') && $g->leader_id) {
                \App\Services\Community\HomeGroupChannelService::safely(fn ($svc) => $svc->syncLeader($g));
            }
        });

        // Resend over HTTPS (no extra Composer package).
        Mail::extend('resend', fn (array $config) => new ResendTransport($config['key'] ?? null, $config['base_url'] ?? 'https://api.resend.com'));

        // Every email that leaves the app updates its row in email_logs with the provider's id.
        Event::listen(MessageSent::class, function (MessageSent $event) {
            $headers = $event->sent->getOriginalMessage()->getHeaders();
            $logId   = $headers->has('X-HIM-Log') ? (int) $headers->get('X-HIM-Log')->getBodyAsString() : null;

            if ($logId && ($log = \App\Models\EmailLog::find($logId))) {
                $log->forceFill(['status' => 'sent', 'provider_id' => $event->sent->getMessageId(), 'sent_at' => now(), 'error' => null])->save();
            }
        });
    }
}
