<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Models\Pastor;
use App\Models\Notification;
use App\Models\Member;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class SendAutomatedGreetings extends Command
{
    protected $signature = 'greetings:send-automated';
    protected $description = 'Send automated birthday greetings from pastoral leadership';

    public function handle(): void
    {
        $today = now()->toDateString();

        $birthdayMembers = User::whereHas('member', fn($q) => $q->where('status', 'active'))
            ->whereDate('date_of_birth', $today)
            ->get();

        foreach ($birthdayMembers as $member) {
            $regionId = $member->member?->zone?->region_id;
            $zoneId   = $member->member?->zone_id;

            // Apostle
            $apostle = Pastor::where('is_general_overseer', true)->first();
            if ($apostle) {
                Notification::create([
                    'user_id'       => $member->id,
                    'type'          => 'automated_greeting',
                    'title'         => "Happy Birthday, {$member->name}!",
                    'message'       => "The Apostle sends you warm birthday wishes. May this year be your best yet!",
                    'data'          => [
                        'from_pastor_id'    => $apostle->id,
                        'from_pastor_title' => 'Apostle',
                    ],
                ]);
            }

            // Regional Leader
            if ($regionId) {
                $regionalLeader = Pastor::where('region_id', $regionId)
                    ->where('is_regional_leader', true)
                    ->first();

                if ($regionalLeader) {
                    Notification::create([
                        'user_id'       => $member->id,
                        'type'          => 'automated_greeting',
                        'title'         => "Happy Birthday, {$member->name}!",
                        'message'       => "Your Regional Leader wishes you a blessed birthday!",
                        'data'          => [
                            'from_pastor_id'    => $regionalLeader->id,
                            'from_pastor_title' => 'Regional Leader',
                        ],
                    ]);
                }
            }

            // Zone Pastor
            if ($zoneId) {
                $zonePastor = Pastor::where('zone_id', $zoneId)
                    ->where('is_zone_pastor', true)
                    ->first();

                if ($zonePastor) {
                    Notification::create([
                        'user_id'       => $member->id,
                        'type'          => 'automated_greeting',
                        'title'         => "Happy Birthday, {$member->name}!",
                        'message'       => "Your Zone Pastor is praying for you on your special day!",
                        'data'          => [
                            'from_pastor_id'    => $zonePastor->id,
                            'from_pastor_title' => 'Zone Pastor',
                        ],
                    ]);
                }
            }
        }

        $this->info("Sent birthday greetings to {$birthdayMembers->count()} members.");
    }
}
