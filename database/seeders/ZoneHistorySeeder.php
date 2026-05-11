<?php

namespace Database\Seeders;

use App\Models\Zone;
use App\Models\User;
use App\Models\ZoneHistory;
use App\Models\Pastor;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ZoneHistorySeeder extends Seeder
{
    /**
     * Seed zone history records linking zones to pastors over time.
     * Aligns with ChurchStructureSeeder zones and pastors.
     */
    public function run(): void
    {
        // Get all zones and pastors with relationships
        $zones = Zone::all();
        $pastors = User::where('role', 'pastor')->with('pastor')->get();

        if ($zones->isEmpty() || $pastors->isEmpty()) {
            $this->command->warn('Zones or pastors not found. Run ChurchStructureSeeder first.');
            return;
        }

        $historyData = [];

        foreach ($zones as $zone) {
            // Find pastors assigned to this zone via the Pastor model
            $zonePastors = $pastors->filter(function ($pastor) use ($zone) {
                return $pastor->pastor && $pastor->pastor->zone_id == $zone->id;
            });

            if ($zonePastors->isEmpty()) {
                continue;
            }

            // Take first pastor as current
            $currentPastor = $zonePastors->first();
            $otherPastors = $zonePastors->slice(1);

            // Current pastor - started at beginning of current year or zone creation
            $startYear = $zone->created_at ? $zone->created_at->year : now()->year;
            $historyData[] = [
                'zone_id' => $zone->id,
                'pastor_id' => $currentPastor->id,
                'start_date' => Carbon::create($startYear, 1, 1)->toDateString(),
                'end_date' => null,
                'notes' => 'Current zone pastor',
                'created_at' => now(),
                'updated_at' => now(),
            ];

            // Previous pastors - create 1-2 historical assignments
            $pastorCount = 0;
            foreach ($otherPastors as $pastor) {
                if ($pastorCount >= 2) break;

                $startYearPast = rand(max(2018, $startYear - 3), $startYear - 1);
                $endYear = $startYearPast + rand(1, 2);

                $historyData[] = [
                    'zone_id' => $zone->id,
                    'pastor_id' => $pastor->id,
                    'start_date' => Carbon::create($startYearPast, rand(1, 6), 1)->toDateString(),
                    'end_date' => Carbon::create(min($endYear, $startYear - 1), rand(7, 12), 31)->toDateString(),
                    'notes' => 'Previous zone pastor',
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
                $pastorCount++;
            }

            // Add zone creation event for the first few zones as special history
            if ($zone->id <= 3) {
                $historyData[] = [
                    'zone_id' => $zone->id,
                    'pastor_id' => $currentPastor->id,
                    'start_date' => $zone->created_at?->toDateString() ?? Carbon::create(2017, 1, 1)->toDateString(),
                    'end_date' => $startYear > 2018 ? Carbon::create($startYear - 1, 12, 31)->toDateString() : null,
                    'notes' => 'Zone established',
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }

            // ── Additional timeline events (achievement, event, growth) ──────────────
            // Generic events to populate timeline beyond pastor changes
            $extraEvents = [
                ['month' => 4, 'notes' => 'Zone Achievement: Reached 250 members milestone', 'type_hint' => 'achievement'],
                ['month' => 8, 'notes' => 'Zone Conference: Annual zone conference held with 180 attendees', 'type_hint' => 'event'],
                ['month' => 11, 'notes' => 'Home Group Expansion: Opened 3 new home groups in the region', 'type_hint' => 'growth'],
            ];

            // Choose a pastor for these events: preferably current pastor, else any assigned pastor
            $eventPastor = $currentPastor;

            foreach ($extraEvents as $ev) {
                // Ensure month is valid for the year; use same year as current pastor start, or previous year
                $eventYear = $startYear;
                // If the month would be after current date in that year, use previous year
                $eventDate = Carbon::create($eventYear, $ev['month'], 1);
                if ($eventDate->isFuture()) {
                    $eventDate = $eventDate->subYear();
                }

                $historyData[] = [
                    'zone_id' => $zone->id,
                    'pastor_id' => $eventPastor->id,
                    'start_date' => $eventDate->toDateString(),
                    'end_date' => null,
                    'notes' => $ev['notes'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        }

        // Bulk upsert
        foreach ($historyData as $record) {
            ZoneHistory::updateOrCreate(
                [
                    'zone_id' => $record['zone_id'],
                    'pastor_id' => $record['pastor_id'],
                    'start_date' => $record['start_date'],
                ],
                [
                    'end_date' => $record['end_date'],
                    'notes' => $record['notes'],
                    'created_at' => $record['created_at'],
                    'updated_at' => $record['updated_at'],
                ]
            );
        }

        $this->command->info('Zone history seeded: ' . count($historyData) . ' records');
    }
}
