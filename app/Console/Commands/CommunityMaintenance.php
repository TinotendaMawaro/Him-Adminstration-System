<?php

namespace App\Console\Commands;

use App\Models\Community\Profile;
use App\Models\User;
use App\Services\Community\CommunityService;
use App\Services\Community\WatchService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * Housekeeping for the community:
 *   php artisan community:maintain            send due reminders, clear expired stories, refresh counters
 *   php artisan community:maintain --profiles create a community profile (handle) for every active user
 */
class CommunityMaintenance extends Command
{
    protected $signature = 'community:maintain {--profiles : Create missing community profiles for all active users}';
    protected $description = 'Community reminders, expired stories, counters and profiles';

    public function handle(CommunityService $community, WatchService $watch): int
    {
        if ($this->option('profiles')) {
            $made = 0;
            User::where('is_active', true)->whereNotIn('id', Profile::select('user_id'))->orderBy('id')->chunkById(200, function ($users) use ($community, &$made) {
                foreach ($users as $u) {
                    $community->profile($u);
                    $made++;
                }
            });
            $this->info("Created {$made} profile(s).");

            return self::SUCCESS;
        }

        $sent = $watch->sendDueReminders();
        $stories = DB::table('community_stories')->where('expires_at', '<', now()->subDays(2))->delete();   // keep a short grace period for "seen by" counts
        $hidden = DB::table('community_posts')->where('status', 'removed')->where('updated_at', '<', now()->subDays(60))->count();

        $this->info("Reminders sent: live {$sent['live']}, meetings {$sent['meetings']} · expired stories cleared: {$stories} · removed posts older than 60 days: {$hidden}");

        return self::SUCCESS;
    }
}
