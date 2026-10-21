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
        Member::observe(MemberObserver::class);
        User::observe(UserObserver::class);
        Payment::observe(PaymentObserver::class);
        EventRegistration::observe(EventRegistrationObserver::class);
        Notification::observe(NotificationObserver::class);

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
