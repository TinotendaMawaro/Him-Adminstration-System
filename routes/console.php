<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote')->hourly();

// Schedule the report reminder check to run every hour
Schedule::command('reports:check-reminders')->hourly();

// Smart engagement notifications — Mondays at 08:00 and first of month at 09:00
Schedule::command('notifications:send-smart')->mondays()->at('08:00');
Schedule::command('notifications:send-smart')->monthlyOn(1, '09:00');

// Settle online payments whose customer never came back to the site
Schedule::command('payments:reconcile-online')->everyFiveMinutes()->withoutOverlapping()->runInBackground();

// Automated birthday greetings — daily at 07:00
Schedule::command('greetings:send-automated')->dailyAt('07:00');

// Community: live-session and meeting reminders, expired stories
Schedule::command('community:maintain')->everyFiveMinutes()->withoutOverlapping();
