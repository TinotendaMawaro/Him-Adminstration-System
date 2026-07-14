<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Models\Partner;
use App\Models\Event;
use App\Models\Notification;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class SendSmartNotifications extends Command
{
    protected $signature = 'notifications:send-smart';
    protected $description = 'Send smart engagement notifications';

    public function handle(): void
    {
        $this->sendMissedServiceReminders();
        $this->sendPartnershipRenewals();
        $this->sendUpcomingEventReminders();
        $this->info('Smart notifications sent successfully.');
    }

    protected function sendMissedServiceReminders(): void
    {
        $inactiveMembers = User::whereHas('member', fn($q) => $q->where('status', 'active'))
            ->whereDoesntHave('eventRegistrations', fn($q) => $q->where('registered_at', '>', now()->subWeeks(2)))
            ->get();

        foreach ($inactiveMembers as $member) {
            $suggestedEvent = Event::upcoming()->first();

            Notification::create([
                'user_id' => $member->id,
                'type'    => 'missed_service',
                'title'   => 'We Missed You!',
                'message' => "We haven't seen you at a service recently. We'd love to see you this Sunday!",
                'data'    => $suggestedEvent ? ['suggested_event_id' => $suggestedEvent->id] : null,
            ]);
        }
    }

    protected function sendPartnershipRenewals(): void
    {
        $expiringPartners = Partner::where('status', 'active')
            ->where('expires_at', '<=', now()->addDays(30))
            ->where('expires_at', '>', now())
            ->get();

        foreach ($expiringPartners as $partner) {
            Notification::create([
                'user_id' => $partner->user_id,
                'type'    => 'partnership_renewal',
                'title'   => 'Partnership Renewal Reminder',
                'message' => "Your partnership expires in {$partner->expires_at->diffInDays(now())} days. Renew today!",
            ]);
        }
    }

    protected function sendUpcomingEventReminders(): void
    {
        $upcomingEvents = Event::upcoming()
            ->where('starts_at', '<=', now()->addDays(2))
            ->get();

        foreach ($upcomingEvents as $event) {
            $registrations = $event->registrations()->where('status', 'confirmed')->get();

            foreach ($registrations as $registration) {
                Notification::create([
                    'user_id' => $registration->user_id,
                    'type'    => 'upcoming_event',
                    'title'   => 'Upcoming Event Reminder',
                    'message' => "Reminder: {$event->title} starts in 48 hours at {$event->venue_name}.",
                    'data'    => ['event_id' => $event->id],
                ]);
            }
        }
    }
}
