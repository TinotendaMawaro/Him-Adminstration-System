<?php

namespace Database\Seeders;

use App\Models\Event;
use App\Models\User;
use App\Models\Zone;
use Illuminate\Database\Seeder;

class EventSeeder extends Seeder
{
    public function run(): void
    {
        $eventCoordinator = User::where('role', 'event')->first();
        if (!$eventCoordinator) {
            $eventCoordinator = User::where('email', 'events@heartfelt.church')->first();
        }
        if (!$eventCoordinator) {
            $eventCoordinator = User::first();
        }

        $iocZone = Zone::where('code', 'R0101')->first();
        $glenviewZone = Zone::where('code', 'R0801')->first();
        $afdisZone = Zone::where('code', 'R0103')->first();
        $richlandZone = Zone::where('code', 'R0804')->first();

        $events = [
            ['21 Days of Prayer and Fasting', '2026-01-11', '2026-01-31', 'IOC and Zones', 'International', $iocZone?->id],
            ['Anointing Night', '2026-01-30', null, 'IOC', 'International', $iocZone?->id],
            ['Operation Come and See', '2026-01-18', null, 'All Zones', 'Events', null],

            ['Homegroup Opening', '2026-02-03', null, 'All Zones', 'Events', null],
            ['International Day of Fruitfulness', '2026-02-07', null, 'IOC', 'International', $iocZone?->id],
            ['Mega Worship', '2026-02-11', '2026-02-14', 'Richland', 'International', $richlandZone?->id],
            ['Operation Come and See', '2026-02-15', null, 'All Zones', 'Events', null],
            ['Kingdom Service Conference', '2026-02-26', '2026-02-28', 'Richland', 'International', $richlandZone?->id],
            ['Anointing Night', '2026-02-27', null, 'Richland', 'International', $richlandZone?->id],

            ['Intercessors Conference', '2026-03-11', '2026-03-14', 'Richland', 'International', $richlandZone?->id],
            ['Helpers Day', '2026-03-15', null, 'IOC and Zones', 'International', null],
            ['Festival Of Joy', '2026-03-21', null, 'Zones', 'International', null],
            ['Super Sunday', '2026-03-22', null, 'IOC', 'International', $iocZone?->id],
            ['Operation Come and See', '2026-03-22', null, 'All Zones', 'Events', null],

            ['Anointing Night', '2026-04-03', null, 'IOC', 'International', $iocZone?->id],
            ['Regional Passover', '2026-04-03', '2026-04-05', 'IOC and Zones', 'International', null],
            ['Children\'s Church Revival', '2026-04-12', '2026-04-14', 'IOC and Zones', 'International', null],
            ['Shine Camp', '2026-04-15', '2026-04-18', 'Richland', 'International', $richlandZone?->id],
            ['Operation Come and See', '2026-04-19', null, 'All Zones', 'Events', null],

            ['Anointing Night – Pastors', '2026-05-01', null, 'Richland', 'International', $richlandZone?->id],
            ['Super Singles', '2026-05-07', '2026-05-09', 'Richland', 'International', $richlandZone?->id],
            ['Operation Come and See', '2026-05-17', null, 'All Zones', 'Events', null],
            ['Marketplace Breakthrough Summit', '2026-05-27', '2026-05-30', 'IOC', 'International', $iocZone?->id],

            ['Covenant Days Of Blessing', '2026-06-07', null, 'IOC', 'International', $iocZone?->id],
            ['Marriages Conference', '2026-06-18', '2026-06-20', 'IOC', 'International', $iocZone?->id],
            ['Operation Come and See', '2026-06-21', null, 'All Zones', 'Events', null],
            ['Liberation Night', '2026-06-26', null, 'IOC', 'International', $iocZone?->id],

            ['Women on Fire Conference', '2026-07-01', '2026-07-04', 'Richland', 'International', $richlandZone?->id],
            ['Operation Come and See', '2026-07-19', null, 'All Zones', 'Events', null],
            ['Empowerment Summit SA', '2026-07-23', '2026-07-25', 'South Africa', 'International', null],
            ['Anointing Night – Men on Fire', '2026-07-30', null, 'IOC', 'International', $iocZone?->id],

            ['Pastors Prayer Outing', '2026-08-03', '2026-08-05', 'Richland', 'International', $richlandZone?->id],
            ['Operation Come and See', '2026-08-16', null, 'All Zones', 'Events', null],
            ['Gideon Prayer Army', '2026-08-19', '2026-08-21', 'Richland', 'International', $richlandZone?->id],
            ['Catch The Fire Conference', '2026-08-24', '2026-08-30', 'Richland', 'International', $richlandZone?->id],

            ['Operation Come and See', '2026-09-20', null, 'All Zones', 'Events', null],

            ['Anointing Night – Night to Remember', '2026-10-02', null, 'IOC', 'International', $iocZone?->id],
            ['Parents Day', '2026-10-04', null, 'All Zones', 'Events', null],
            ['Dubai Apostolic Visit (Fresh Oil)', '2026-10-08', '2026-10-10', 'UAE', 'International', null],
            ['Men on Fire', '2026-10-14', '2026-10-17', 'Richland', 'International', $richlandZone?->id],
            ['International Sports Day', '2026-10-17', null, 'Richland', 'International', $richlandZone?->id],
            ['Operation Come and See', '2026-10-18', null, 'All Zones', 'Events', null],
            ['Super Sunday', '2026-10-18', null, 'Richland', 'International', $richlandZone?->id],
            ['White Sunday', '2026-10-25', null, 'All Zones', 'Events', null],
            ['Success Night', '2026-10-30', null, 'IOC', 'International', $iocZone?->id],

            ['Interdenominational Ministers and Leaders Conference', '2026-11-12', '2026-11-14', 'Richland', 'International', $richlandZone?->id],
            ['Spiritual Heritage Week', '2026-11-16', '2026-11-22', 'IOC and Zones', 'International', null],
            ['Operation Come and See', '2026-11-22', null, 'All Zones', 'Events', null],
            ['Anointing Night – Children\'s Ministry', '2026-11-27', null, 'IOC', 'International', $iocZone?->id],

            ['Day of Honor', '2026-12-06', null, 'All Zones', 'Events', null],
            ['Pastor\'s Seminar', '2026-12-07', '2026-12-09', 'IOC', 'International', $iocZone?->id],
            ['Home Groups Close', '2026-12-08', null, 'All Zones', 'Events', null],
            ['Operation Come and See & Welfare Day & Children\'s Church Service', '2026-12-13', null, 'All Zones', 'Events', null],
            ['Success Camp', '2026-12-16', '2026-12-19', 'Richland', 'International', $richlandZone?->id],
            ['Absolute Fasting', '2026-12-28', '2026-12-29', 'IOC and Zones', 'International', null],
            ['Marchover Night & Thanksgiving Service', '2026-12-31', null, 'Richland', 'International', $richlandZone?->id],
        ];

        foreach ($events as $event) {
            Event::updateOrCreate(
                ['title' => $event[0], 'starts_at' => $event[1]],
                [
                    'title' => $event[0],
                    'description' => $event[0],
                    'starts_at' => $event[1] . ' 00:00:00',
                    'ends_at' => $event[2] ? $event[2] . ' 23:59:59' : null,
                    'venue_name' => $event[3],
                    'category' => $event[4],
                    'zone_id' => $event[5],
                    'status' => 'published',
                    'is_public' => true,
                    'created_by' => $eventCoordinator?->id ?? 1,
                ]
            );
        }
    }
}