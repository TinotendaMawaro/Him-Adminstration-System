<?php

namespace Tests\Feature\Api;

use App\Models\HomeGroup;
use App\Models\Member;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MemberDashboardTest extends TestCase
{
    use RefreshDatabase;

    protected ?\App\Models\Zone $zone = null;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(\Database\Seeders\DatabaseSeeder::class);

        $country = \App\Models\Country::create(['name' => 'Test Country', 'country_code' => 'TC']);
        $region = \App\Models\Region::create(['name' => 'Test Region', 'country_id' => $country->id]);
        $this->zone = \App\Models\Zone::create(['name' => 'Test Zone', 'region_id' => $region->id]);
    }

    /** Test unauthenticated requests are rejected */
    public function test_unauthenticated_request_is_rejected(): void
    {
        $response = $this->getJson('/api/member/dashboard');
        $response->assertStatus(401);
    }

    /** Test non-member users are forbidden */
    public function test_non_member_user_is_forbidden(): void
    {
        $user = User::factory()->create([
            'role' => 'pastor',
            'zone_id' => $this->zone->id,
        ]);

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/member/dashboard');
        $response->assertStatus(403);
    }

    /** Test member without profile returns 404 */
    public function test_member_without_profile_returns_404(): void
    {
        $user = User::factory()->create([
            'role' => 'member',
            'zone_id' => $this->zone->id,
        ]);
        // No associated Member record

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/member/dashboard');
        $response->assertStatus(404);
    }

    /** Test member dashboard returns expected structure */
    public function test_returns_expected_structure(): void
    {
        $user = User::factory()->create([
            'role' => 'member',
            'zone_id' => $this->zone->id,
        ]);

        $homeGroup = HomeGroup::create([
            'name' => 'Test Group',
            'zone_id' => $this->zone->id,
        ]);

        $member = Member::create([
            'user_id' => $user->id,
            'name' => $user->name,
            'surname' => 'Doe',
            'home_group_id' => $homeGroup->id,
            'zone_id' => $this->zone->id,
            'status' => 'active',
            'membership_date' => now(),
            // member_number is auto-generated or nullable; omit to avoid unique conflict
        ]);

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/member/dashboard');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ])
            ->assertJsonStructure([
                'success',
                'data' => [
                    'my_home_group' => [
                        'name',
                        'total_members',
                        'active_members',
                        'leader',
                    ],
                    'my_attendance_this_month',
                    'my_department',
                    'my_events_upcoming',
                    'member_since',
                    'member_number',
                    'last_updated',
                ],
            ]);
    }

    /** Test member home group data is populated correctly */
    public function test_home_group_data_populated(): void
    {
        $user = User::factory()->create([
            'role' => 'member',
            'zone_id' => $this->zone->id,
        ]);

        $homeGroup = HomeGroup::create([
            'name' => 'Alpha Group',
            'zone_id' => $this->zone->id,
        ]);

        // Add a leader to the home group
        $leader = User::factory()->create();
        $homeGroup->update(['leader_id' => $leader->id]);

        Member::create([
            'user_id' => $user->id,
            'name' => $user->name,
            'surname' => 'Test',
            'home_group_id' => $homeGroup->id,
            'zone_id' => $this->zone->id,
            'status' => 'active',
        ]);

        // Add another active member to group
        $otherUser = User::factory()->create();
        Member::create([
            'user_id' => $otherUser->id,
            'name' => 'Other',
            'surname' => 'Member',
            'home_group_id' => $homeGroup->id,
            'zone_id' => $this->zone->id,
            'status' => 'active',
        ]);

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/member/dashboard');
        $response->assertStatus(200);

        $hg = $response->json('data.my_home_group');
        $this->assertEquals('Alpha Group', $hg['name']);
        $this->assertEquals(2, $hg['total_members']);
        $this->assertEquals(2, $hg['active_members']);
        $this->assertEquals($leader->name, $hg['leader']);
    }

    /** Test member events upcoming count */
    public function test_upcoming_events_count(): void
    {
        $user = User::factory()->create([
            'role' => 'member',
            'zone_id' => $this->zone->id,
        ]);

        $homeGroup = HomeGroup::create(['name' => 'Group', 'zone_id' => $this->zone->id]);
        Member::create([
            'user_id' => $user->id,
            'name' => 'Test',
            'surname' => 'User',
            'home_group_id' => $homeGroup->id,
            'zone_id' => $this->zone->id,
        ]);

        // Create an upcoming event (created_by required)
        $event = \App\Models\Event::create([
            'title' => 'Sunday Service',
            'zone_id' => $this->zone->id,
            'starts_at' => now()->addDays(7),
            'ends_at' => now()->addDays(7)->addHours(2),
            'status' => 'published',
            'created_by' => $user->id, // required
        ]);
        // Register user for the event
        $event->registrations()->create([
            'user_id' => $user->id,
            'status' => 'confirmed',
        ]);

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/member/dashboard');
        $response->assertStatus(200);
        $this->assertEquals(1, $response->json('data.my_events_upcoming'));
    }
}
