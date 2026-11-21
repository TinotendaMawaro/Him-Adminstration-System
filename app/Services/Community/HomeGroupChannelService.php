<?php

namespace App\Services\Community;

use App\Models\Community\Channel;
use App\Models\Community\ChannelMember;
use App\Models\HomeGroup;
use App\Models\Pastor;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * A home group lives in its own private channel: whoever joins the group is put into the channel, whoever leaves is taken out,
 * and the group's leader runs it (posts, schedules the meetings). Kept in step automatically from the model events in
 * AppServiceProvider, so every way of joining a group (invitation, request, pastor, head office) lands in the channel.
 */
class HomeGroupChannelService
{
    public function channelFor(HomeGroup $group): Channel
    {
        $existing = Channel::where('home_group_id', $group->id)->first();
        if ($existing) {
            return $existing;
        }

        $ownerId = $group->leader_id
            ?: Pastor::where('zone_id', $group->zone_id)->orderByDesc('is_zone_pastor')->value('user_id')
            ?: User::where('role', 'master')->value('id');

        return DB::transaction(function () use ($group, $ownerId) {
            $name = "{$group->name} home group";
            $channel = Channel::create([
                'owner_id' => $ownerId, 'name' => $name, 'slug' => $this->slug($name), 'category' => 'Zone', 'is_private' => true, 'is_official' => true,
                'description' => "The conversation for {$group->name}: updates and meetings from your leader.", 'members_count' => 1,
            ]);
            DB::table('channels')->where('id', $channel->id)->update(['home_group_id' => $group->id]);
            ChannelMember::create(['channel_id' => $channel->id, 'user_id' => $ownerId, 'role' => 'owner', 'status' => 'active', 'joined_at' => now()]);

            return $channel->refresh();
        });
    }

    public function add(HomeGroup $group, User $user): void
    {
        $channel = $this->channelFor($group);
        $isLeader = (int) $group->leader_id === (int) $user->id;
        $member = ChannelMember::where('channel_id', $channel->id)->where('user_id', $user->id)->first();
        if ($member) {
            $member->update(['status' => 'active', 'joined_at' => $member->joined_at ?? now(), 'role' => $member->role === 'owner' ? 'owner' : ($isLeader ? 'moderator' : $member->role)]);
        } else {
            ChannelMember::create(['channel_id' => $channel->id, 'user_id' => $user->id, 'role' => $isLeader ? 'moderator' : 'member', 'status' => 'active', 'joined_at' => now()]);
        }
        $this->recount($channel);
    }

    public function remove(int $groupId, User $user): void
    {
        $channel = Channel::where('home_group_id', $groupId)->first();
        if (!$channel) {
            return;
        }
        ChannelMember::where('channel_id', $channel->id)->where('user_id', $user->id)->where('role', '!=', 'owner')->delete();
        $this->recount($channel);
    }

    /** The group's leader becomes the owner of its channel (the old owner stays on as a moderator). */
    public function syncLeader(HomeGroup $group): void
    {
        $channel = $this->channelFor($group);
        if (!$group->leader_id) {
            return;
        }
        DB::transaction(function () use ($channel, $group) {
            ChannelMember::where('channel_id', $channel->id)->where('role', 'owner')->where('user_id', '!=', $group->leader_id)->update(['role' => 'moderator']);
            $leader = ChannelMember::where('channel_id', $channel->id)->where('user_id', $group->leader_id)->first();
            if ($leader) {
                $leader->update(['role' => 'owner', 'status' => 'active', 'joined_at' => $leader->joined_at ?? now()]);
            } else {
                ChannelMember::create(['channel_id' => $channel->id, 'user_id' => $group->leader_id, 'role' => 'owner', 'status' => 'active', 'joined_at' => now()]);
            }
            DB::table('channels')->where('id', $channel->id)->update(['owner_id' => $group->leader_id]);
        });
        $this->recount($channel);
    }

    /** Run a sync step without ever letting a channel hiccup undo or break the home group change that triggered it. */
    public static function safely(callable $step): void
    {
        try {
            $step(app(self::class));
        } catch (\Throwable $e) {
            Log::warning('Home group channel sync failed', ['error' => $e->getMessage()]);
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
        $base = Str::slug($name) ?: 'home-group';
        $slug = $base;
        for ($i = 2; Channel::withTrashed()->where('slug', $slug)->exists(); $i++) {
            $slug = "{$base}-{$i}";
        }

        return $slug;
    }
}
