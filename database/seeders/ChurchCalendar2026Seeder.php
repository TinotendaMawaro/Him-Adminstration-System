<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * The church calendar for the rest of 2026. It used to be hard-coded inside the web app as "fallback" events; it lives in the
 * database now, so every portal and the mobile app show the same events and Events staff can edit them.
 * Safe to run more than once: an event that already exists (same title and start) is left alone.
 *
 *   php artisan db:seed --class=ChurchCalendar2026Seeder
 */
class ChurchCalendar2026Seeder extends Seeder
{
    public function run(): void
    {
        $now = now();
        $made = 0;
        $creator = DB::table('users')->where('role', 'master')->orderBy('id')->value('id') ?? DB::table('users')->orderBy('id')->value('id');

        // title, starts_at, ends_at, venue, scope, type, category, image, requires_registration, featured
        $events = [
            ['Operation Come and See', '2026-07-19 09:00:00', '2026-07-19 12:00:00', 'All Zones', 'zone', 'Conferences', 'Events', null, false, false],
            ['Empowerment Summit SA', '2026-07-23 09:00:00', '2026-07-25 18:00:00', 'South Africa', 'international', 'Conferences', 'International', null, true, false],
            ['Anointing Night – Men on Fire', '2026-07-30 18:00:00', '2026-07-30 21:00:00', 'IOC', 'international', 'Leadership', 'International', null, false, false],
            ['Pastors Prayer Outing', '2026-08-03 08:00:00', '2026-08-05 17:00:00', 'Richland', 'international', 'Prayer', 'International', null, true, false],
            ['Operation Come and See', '2026-08-16 09:00:00', '2026-08-16 12:00:00', 'All Zones', 'zone', 'Conferences', 'Events', null, false, false],
            ['Gideon Prayer Army', '2026-08-19 09:00:00', '2026-08-21 18:00:00', 'Richland', 'international', 'Prayer', 'International', null, true, false],
            ['Catch The Fire Conference', '2026-08-24 09:00:00', '2026-08-30 18:00:00', 'Richland', 'international', 'Conferences', 'International', '/images/ctf.jpeg', true, true],
            ['Operation Come and See', '2026-09-20 09:00:00', '2026-09-20 12:00:00', 'All Zones', 'zone', 'Conferences', 'Events', null, false, false],
            ['Anointing Night – Night to Remember', '2026-10-02 18:00:00', '2026-10-02 21:00:00', 'IOC', 'international', 'Conferences', 'International', null, false, false],
            ['Parents Day', '2026-10-04 10:00:00', '2026-10-04 15:00:00', 'All Zones', 'zone', 'Conferences', 'Events', null, false, false],
            ['Dubai Apostolic Visit (Fresh Oil)', '2026-10-08 09:00:00', '2026-10-10 18:00:00', 'UAE', 'international', 'Conferences', 'International', null, true, false],
            ['Men on Fire', '2026-10-14 09:00:00', '2026-10-17 18:00:00', 'Richland', 'international', 'Leadership', 'International', null, true, false],
            ['International Sports Day', '2026-10-17 10:00:00', '2026-10-17 17:00:00', 'Richland', 'international', 'Conferences', 'International', null, false, false],
            ['Operation Come and See', '2026-10-18 09:00:00', '2026-10-18 12:00:00', 'All Zones', 'zone', 'Conferences', 'Events', null, false, false],
            ['Super Sunday', '2026-10-18 10:00:00', '2026-10-18 13:00:00', 'Richland', 'international', 'Conferences', 'International', null, false, false],
            ['White Sunday', '2026-10-25 10:00:00', '2026-10-25 15:00:00', 'All Zones', 'zone', 'Conferences', 'Events', null, false, false],
            ['Success Night', '2026-10-30 18:00:00', '2026-10-30 21:00:00', 'IOC', 'international', 'Conferences', 'International', null, false, false],
            ['Interdenominational Ministers and Leaders Conference', '2026-11-12 09:00:00', '2026-11-14 18:00:00', 'Richland', 'international', 'Leadership', 'International', null, true, false],
            ['Spiritual Heritage Week', '2026-11-16 09:00:00', '2026-11-22 18:00:00', 'IOC and Zones', 'international', 'Conferences', 'International', null, false, false],
            ['Operation Come and See', '2026-11-22 09:00:00', '2026-11-22 12:00:00', 'All Zones', 'zone', 'Conferences', 'Events', null, false, false],
            ['Anointing Night – Children\'s Ministry', '2026-11-27 18:00:00', '2026-11-27 21:00:00', 'IOC', 'international', 'Conferences', 'International', null, false, false],
            ['Day of Honor', '2026-12-06 10:00:00', '2026-12-06 15:00:00', 'All Zones', 'zone', 'Conferences', 'Events', null, false, false],
            ['Pastor\'s Seminar', '2026-12-07 09:00:00', '2026-12-09 17:00:00', 'TBD', 'international', 'Training', 'International', null, true, false],
            ['Home Groups Close', '2026-12-08 17:00:00', '2026-12-08 19:00:00', 'All Zones', 'zone', 'Leadership', 'Events', null, false, false],
            ['Operation Come and See & Welfare Day & Children\'s Church Service', '2026-12-13 09:00:00', '2026-12-13 15:00:00', 'All Zones', 'zone', 'Conferences', 'Events', null, false, false],
            ['Success Camp', '2026-12-16 09:00:00', '2026-12-19 17:00:00', 'TBD', 'international', 'Training', 'International', '/images/Success.jpg', true, false],
            ['Absolute Fasting', '2026-12-28 09:00:00', '2026-12-29 18:00:00', 'IOC and Zones', 'international', 'Prayer', 'International', null, false, false],
            ['Marchover Night & Thanksgiving Service', '2026-12-31 18:00:00', '2026-12-31 21:00:00', 'Richland', 'international', 'Conferences', 'International', null, false, false],
        ];

        foreach ($events as [$title, $starts, $ends, $venue, $scope, $type, $category, $image, $requires, $featured]) {
            if (DB::table('events')->where('title', $title)->where('starts_at', $starts)->exists()) {
                continue;
            }

            DB::table('events')->insert([
                'title' => $title, 'starts_at' => $starts, 'ends_at' => $ends ?: $starts, 'venue_name' => $venue, 'scope' => $scope, 'type' => $type,
                'category' => $category, 'image' => $image, 'requires_registration' => $requires, 'requires_payment' => false, 'is_featured' => $featured,
                'status' => $starts > $now->toDateTimeString() ? 'published' : 'completed', 'is_public' => true, 'created_by' => $creator, 'created_at' => $now, 'updated_at' => $now,
            ]);
            $made++;
        }

        $this->command?->info("Church calendar: {$made} event(s) added.");
    }
}
