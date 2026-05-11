<?php

namespace App\Console\Commands;

use App\Models\User;
use App\Models\Member;
use Illuminate\Console\Command;
use Illuminate\Http\Request;

class TestMembersApi extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'test:members-api {user_id?} {--create-token : Create and display API token}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Test the members API endpoint for a given user';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $userId = $this->argument('user_id') ?? 291; // Default to current user

        $user = User::find($userId);
        if (!$user) {
            $this->error("User {$userId} not found");
            return 1;
        }

        $this->info("Testing members API for user: {$user->name} (ID: {$user->id}, Role: {$user->role->value})");

        // Check user zone info
        $this->info("User zone_id: " . ($user->zone_id ?? 'null'));
        $this->info("User isPastor(): " . ($user->isPastor() ? 'true' : 'false'));

        // Create token if requested
        if ($this->option('create-token')) {
            $token = $user->createToken('test-token');
            $this->info("🔑 API Token: {$token->plainTextToken}");
            $this->warn("Copy this token and set it in browser localStorage as 'him_token'");
            return 0;
        }

        // Test the query logic directly
        $query = Member::with([
            'zone:id,name',
            'homeGroup:id,name',
            'department:id,name',
            'gender:id,name'
        ]);

        // Apply member filtering logic
        if ($user->isPastor() && $user->zone_id) {
            $query->where('zone_id', $user->zone_id);
            $this->info("Applying zone filter: zone_id = {$user->zone_id}");
        } elseif ($user->isMember()) {
            if ($user->zone_id) {
                $query->where('zone_id', $user->zone_id);
                $this->info("Member with zone filter: zone_id = {$user->zone_id}");
            } else {
                $query->where('user_id', $user->id);
                $this->info("Member with user filter: user_id = {$user->id}");
            }
        }

        $members = $query->get();

        $this->info("✅ Query executed successfully");
        $this->info("Total members returned: " . $members->count());

        if ($members->count() > 0) {
            $this->info("Members found:");
            foreach ($members as $member) {
                $this->line("  - ID: {$member->id}, Name: {$member->name} {$member->surname}, Zone: " . ($member->zone_id ?? 'null'));
            }
        } else {
            $this->warn("No members found for this user");
        }

        // Check user zone
        $this->info("User zone_id: " . ($user->zone_id ?? 'null'));
        $this->info("Filter applied: " . ($user->zone_id ? "zone_id = {$user->zone_id}" : "user_id = {$user->id}"));

        return 0;
    }
}
