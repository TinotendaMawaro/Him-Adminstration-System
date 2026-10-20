<?php

namespace Database\Seeders;

use App\Enums\PaymentStatus;
use App\Models\Event;
use App\Models\EventRegistration;
use App\Models\Member;
use App\Models\Payment;
use App\Models\Report;
use App\Models\User;
use App\Models\Zone;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

/**
 * OPT-IN sample activity so the Master / Finance / Events dashboards have something to show
 * in a development database. Never part of DatabaseSeeder.
 *
 *   php artisan db:seed --class=DemoPortalDataSeeder
 *   php artisan tinker --execute="Database\Seeders\DemoPortalDataSeeder::purge();"
 *
 * Everything it creates is tagged ("[DEMO]" / @demo.heartfelt.test) so purge() removes exactly it.
 */
class DemoPortalDataSeeder extends Seeder
{
    private const TAG = '[DEMO]';
    private const DOMAIN = '@demo.heartfelt.test';

    public function run(): void
    {
        if (app()->isProduction()) {
            $this->command?->error('Refusing to seed demo data in production.');

            return;
        }

        mt_srand(2026);
        $zones   = Zone::whereNotNull('region_id')->pluck('id')->all();
        $finance = User::where('role', 'finance')->value('id') ?? User::where('role', 'master')->value('id');
        $pastors = User::where('role', 'pastor')->whereNotNull('zone_id')->pluck('id', 'zone_id')->all();

        DB::transaction(function () use ($zones, $finance, $pastors) {
            $members = $this->members($zones);
            $this->payments($members, $zones, $finance);
            $this->reports($zones, $pastors);
            $this->events($members, $finance);
        });

        $this->command?->info('Demo data created. Remove it with DemoPortalDataSeeder::purge().');
    }

    private function members(array $zones): array
    {
        $users = [];
        $hash  = Hash::make('demo-' . bin2hex(random_bytes(6)));

        for ($i = 1; $i <= 90; $i++) {
            $zoneId = $zones[array_rand($zones)];
            $since  = now()->subMonths(mt_rand(0, 13))->subDays(mt_rand(0, 27));
            $user   = User::create([
                'name' => "Demo Member {$i}", 'email' => "demo.member{$i}" . self::DOMAIN, 'password' => $hash,
                'role' => 'member', 'is_active' => true, 'zone_id' => $zoneId, 'terms_accepted' => true, 'completed_tour' => true,
            ]);
            Member::create([
                'user_id' => $user->id, 'name' => 'Demo', 'surname' => "Member {$i}", 'member_number' => 'DEMO-' . str_pad((string) $i, 4, '0', STR_PAD_LEFT),
                'zone_id' => $zoneId, 'status' => 'active', 'membership_date' => $since->toDateString(), 'is_baptised' => (bool) mt_rand(0, 1),
            ]);
            $users[] = $user;
        }

        return $users;
    }

    private function payments(array $members, array $zones, ?int $financeId): void
    {
        $types   = array_merge(array_fill(0, 45, 'tithe'), array_fill(0, 25, 'offering'), array_fill(0, 10, 'seed'),
            array_fill(0, 8, 'building_fund'), array_fill(0, 7, 'missions'), array_fill(0, 5, 'partnership'));
        $methods = ['cash', 'cash', 'mobile_money', 'bank_transfer', 'online'];

        foreach (range(11, 0) as $monthsAgo) {
            $count = mt_rand(28, 46) + (11 - $monthsAgo) * 2;        // gentle growth over the year
            for ($i = 0; $i < $count; $i++) {
                $payer = $members[array_rand($members)];
                $when  = now()->subMonths($monthsAgo)->startOfMonth()->addDays(mt_rand(0, 26))->setTime(mt_rand(8, 18), mt_rand(0, 59));
                if ($when->isFuture()) {
                    $when = now()->subHours(mt_rand(1, 48));
                }
                $type = $types[array_rand($types)];

                Payment::create([
                    'user_id' => $payer->id, 'zone_id' => $payer->zone_id, 'type' => $type,
                    'amount' => round(mt_rand(500, 25000) / 100 * ($type === 'partnership' ? 4 : 1), 2), 'currency' => 'USD',
                    'status' => PaymentStatus::Completed, 'method' => $methods[array_rand($methods)],
                    'paid_at' => $when, 'confirmed_at' => $when, 'confirmed_by' => $financeId, 'recorded_by' => $financeId,
                    'notes' => self::TAG, 'created_at' => $when, 'updated_at' => $when,
                ]);
            }
        }

        // Self-submitted payments waiting for finance to verify.
        for ($i = 0; $i < 9; $i++) {
            $payer = $members[array_rand($members)];
            Payment::create([
                'user_id' => $payer->id, 'zone_id' => $payer->zone_id, 'type' => ['tithe', 'offering', 'seed'][mt_rand(0, 2)],
                'amount' => mt_rand(20, 250), 'currency' => 'USD', 'status' => PaymentStatus::Pending,
                'method' => ['mobile_money', 'bank_transfer'][mt_rand(0, 1)], 'transaction_id' => 'DEMO' . mt_rand(100000, 999999),
                'notes' => self::TAG, 'created_at' => now()->subHours(mt_rand(1, 70)),
            ]);
        }
    }

    private function reports(array $zones, array $pastors): void
    {
        $sample = array_slice($zones, 0, min(18, count($zones)));
        foreach ($sample as $zoneId) {
            for ($w = 0; $w < 24; $w++) {
                $date = now()->startOfWeek(0)->subWeeks($w);
                $tithes = mt_rand(300, 3500);
                $off    = mt_rand(100, 1500);
                $sent   = $w > 1 || mt_rand(0, 3) > 0;

                Report::create([
                    'zone_id' => $zoneId, 'user_id' => $pastors[$zoneId] ?? User::where('role', 'master')->value('id'),
                    'type' => 'weekly', 'service_type' => 'sunday_service', 'report_date' => $date->toDateString(),
                    'week_number' => (int) $date->format('W'), 'year' => (int) $date->format('o'),
                    'tithes' => $tithes, 'offerings' => $off, 'building_fund' => mt_rand(0, 400), 'missions' => mt_rand(0, 300),
                    'cash_collection' => $tithes + $off, 'total_income' => $tithes + $off,
                    'attendance' => mt_rand(60, 420), 'adults' => mt_rand(40, 260), 'children' => mt_rand(10, 120),
                    'remittance_submitted' => $sent, 'remittance_amount' => $sent ? round(($tithes + $off) * .3, 2) : 0,
                    'remittance_date' => $sent ? $date->copy()->addDays(2)->toDateString() : null,
                    'status' => 'submitted', 'submitted_at' => $date->copy()->addDay(), 'is_late' => (bool) (mt_rand(0, 9) === 0),
                    'notes' => self::TAG,
                ]);
            }
        }
    }

    private function events(array $members, ?int $creatorId): void
    {
        $defs = [
            ['Annual Leaders Conference', 'conference', -75, 40, 150, 100], ['Youth Camp 2026', 'youth_camp', -30, 30, 80, 60],
            ['Marriage Seminar', 'seminar', -9, 0, 60, 25], ['Prayer & Fasting Retreat', 'retreat', 12, 20, 70, 40],
            ['Partners Appreciation Dinner', 'special_service', 25, 50, 120, 75], ['Missions Fundraiser', 'fundraiser', 48, 10, 200, 20],
        ];

        foreach ($defs as [$title, $type, $offset, $fee, $cap, $targetRegs]) {
            $event = Event::create([
                'title' => $title, 'description' => self::TAG . ' sample event', 'type' => $type, 'status' => $offset < 0 ? 'completed' : 'published',
                'starts_at' => now()->addDays($offset)->setTime(9, 0), 'ends_at' => now()->addDays($offset)->setTime(16, 0),
                'venue_name' => 'Main Auditorium', 'requires_registration' => true, 'requires_payment' => $fee > 0, 'registration_fee' => $fee,
                'currency' => 'USD', 'capacity' => $cap, 'is_public' => true, 'created_by' => $creatorId, 'is_featured' => $offset > 0 && $offset < 30,
            ]);

            foreach (collect($members)->shuffle()->take($targetRegs) as $m) {
                $past   = $offset < 0;
                $status = $past ? (mt_rand(0, 9) < 7 ? 'attended' : (mt_rand(0, 1) ? 'confirmed' : 'cancelled'))
                                : ['pending', 'confirmed', 'confirmed', 'confirmed', 'cancelled'][mt_rand(0, 4)];
                $paid   = $status === 'cancelled' ? 0 : ($fee && mt_rand(0, 9) < 8 ? $fee : 0);

                EventRegistration::create([
                    'event_id' => $event->id, 'user_id' => $m->id, 'status' => $status, 'amount_due' => $fee, 'amount_paid' => $paid,
                    'notes' => self::TAG, 'created_at' => now()->addDays($offset)->subDays(mt_rand(3, 40)),
                ]);
            }
        }
    }

    /** Remove exactly what this seeder created. */
    public static function purge(): void
    {
        DB::transaction(function () {
            $demoEvents = Event::withTrashed()->where('description', 'like', self::TAG . '%')->pluck('id');
            EventRegistration::whereIn('event_id', $demoEvents)->delete();
            Event::withTrashed()->whereIn('id', $demoEvents)->forceDelete();

            Payment::withTrashed()->where('notes', self::TAG)->forceDelete();
            Report::where('notes', self::TAG)->delete();

            $userIds = User::where('email', 'like', '%' . self::DOMAIN)->pluck('id');
            Member::withTrashed()->whereIn('user_id', $userIds)->forceDelete();
            User::whereIn('id', $userIds)->delete();
        });
    }
}
