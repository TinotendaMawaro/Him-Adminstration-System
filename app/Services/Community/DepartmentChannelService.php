<?php

namespace App\Services\Community;

use App\Models\Community\Channel;
use App\Models\Community\ChannelMember;
use App\Models\Department;
use App\Models\Pastor;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * A department lives in its own private channel, run by its head of department (HOD): the HOD is just a member of the church
 * who was given this responsibility, so they lead from the same app, posting and scheduling meetings in the channel.
 * Kept in step automatically from the model events in AppServiceProvider.
 */
class DepartmentChannelService
{
    public function channelFor(Department $department): Channel
    {
        $existing = Channel::where('department_id', $department->id)->first();
        if ($existing) {
            return $existing;
        }

        $ownerId = $department->hod_id
            ?: ($department->zone_id ? Pastor::where('zone_id', $department->zone_id)->orderByDesc('is_zone_pastor')->value('user_id') : null)
            ?: User::where('role', 'master')->value('id');

        return DB::transaction(function () use ($department, $ownerId) {
            $name = "{$department->name} department";
            $channel = Channel::create([
                'owner_id' => $ownerId, 'name' => $name, 'slug' => $this->slug($name), 'category' => 'Zone', 'is_private' => true, 'is_official' => true,
                'description' => "Updates and meetings for the {$department->name} department.", 'members_count' => 1,
            ]);
            DB::table('channels')->where('id', $channel->id)->update(['department_id' => $department->id]);
            ChannelMember::create(['channel_id' => $channel->id, 'user_id' => $ownerId, 'role' => 'owner', 'status' => 'active', 'joined_at' => now()]);

            return $channel->refresh();
        });
    }

    public function add(Department $department, User $user): void
    {
        $channel = $this->channelFor($department);
        $isHead = (int) $department->hod_id === (int) $user->id;
        $member = ChannelMember::where('channel_id', $channel->id)->where('user_id', $user->id)->first();
        if ($member) {
            $member->update(['status' => 'active', 'joined_at' => $member->joined_at ?? now(), 'role' => $member->role === 'owner' ? 'owner' : ($isHead ? 'moderator' : $member->role)]);
        } else {
            ChannelMember::create(['channel_id' => $channel->id, 'user_id' => $user->id, 'role' => $isHead ? 'moderator' : 'member', 'status' => 'active', 'joined_at' => now()]);
        }
        $this->recount($channel);
    }

    public function remove(int $departmentId, User $user): void
    {
        $channel = Channel::where('department_id', $departmentId)->first();
        if (!$channel) {
            return;
        }
        ChannelMember::where('channel_id', $channel->id)->where('user_id', $user->id)->where('role', '!=', 'owner')->delete();
        $this->recount($channel);
    }

    /** The head of department becomes the owner of the channel (the old owner stays on as a moderator). */
    public function syncHead(Department $department): void
    {
        $channel = $this->channelFor($department);
        if (!$department->hod_id) {
            return;
        }
        DB::transaction(function () use ($channel, $department) {
            ChannelMember::where('channel_id', $channel->id)->where('role', 'owner')->where('user_id', '!=', $department->hod_id)->update(['role' => 'moderator']);
            $head = ChannelMember::where('channel_id', $channel->id)->where('user_id', $department->hod_id)->first();
            if ($head) {
                $head->update(['role' => 'owner', 'status' => 'active', 'joined_at' => $head->joined_at ?? now()]);
            } else {
                ChannelMember::create(['channel_id' => $channel->id, 'user_id' => $department->hod_id, 'role' => 'owner', 'status' => 'active', 'joined_at' => now()]);
            }
            DB::table('channels')->where('id', $channel->id)->update(['owner_id' => $department->hod_id]);
        });
        $this->recount($channel);
    }

    /** Run a sync step without ever letting a channel hiccup break the department change that triggered it. */
    public static function safely(callable $step): void
    {
        try {
            $step(app(self::class));
        } catch (\Throwable $e) {
            Log::warning('Department channel sync failed', ['error' => $e->getMessage()]);
        }
    }

    private function recount(Channel $channel): void
    {
        DB::table('channels')->where('id', $channel->id)->update([
            'members_count' => ChannelMember::where('channel_id', $channel->id)->where('status', 'active')->count(),
        ]);
    }

    private function slug(string $name): string
    {
        $base = Str::slug($name) ?: 'department';
        $slug = $base;
        for ($i = 2; Channel::withTrashed()->where('slug', $slug)->exists(); $i++) {
            $slug = "{$base}-{$i}";
        }

        return $slug;
    }
}
