<?php

namespace Tests\Feature\Api;

use App\Models\User;
use App\Models\HomeGroup;
use App\Models\Member;
use App\Models\Department;
use App\Models\Zone;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardMetricsTest extends TestCase
{
    use RefreshDatabase;

    protected ?Zone $zone = null;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Seed the database with required data
        $this->seed(\Database\Seeders\DatabaseSeeder::class);
        
        // Create required hierarchy for testing (country -> region -> zone)
        $country = \App\Models\Country::create(['name' => 'Test Country', 'country_code' => 'TC']);
        $region = \App\Models\Region::create(['name' => 'Test Region', 'country_id' => $country->id]);
        $this->zone = Zone::create(['name' => 'Test Zone', 'region_id' => $region->id]);
    }

    /**
     * Test that unauthenticated requests are rejected
     */
    public function test_unauthenticated_request_is_rejected(): void
    {
        $response = $this->getJson('/api/dashboard/metrics');
        // Should be 401 or 403 for unauthenticated
        $response->assertStatus(401);
    }

    /**
     * Test dashboard metrics with no data (all zeros)
     */
    public function test_metrics_return_zero_when_no_data(): void
    {
        // Create a pastor user with zone
        $user = User::factory()->create([
            'role' => 'pastor',
            'zone_id' => $this->zone->id,
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/dashboard/metrics');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ])
            ->assertJsonStructure([
                'success',
                'data' => [
                    'total_active_members',
                    'total_home_groups',
                    'groups_with_active_members',
                    'total_departments',
                    'departments_with_hod',
                ],
                'timestamp',
            ]);

        // All values should be zero when no data exists
        $data = $response->json('data');
        $this->assertEquals(0, $data['total_active_members']);
        $this->assertEquals(0, $data['total_home_groups']);
        $this->assertEquals(0, $data['groups_with_active_members']);
        $this->assertEquals(0, $data['total_departments']);
        $this->assertEquals(0, $data['departments_with_hod']);
    }

    /**
     * Test metric: Total home groups count
     */
    public function test_total_home_groups_counts_all_groups(): void
    {
        $user = User::factory()->create([
            'role' => 'pastor',
            'zone_id' => $this->zone->id,
        ]);

        // Create 5 home groups in the zone
        HomeGroup::factory()->count(5)->create(['zone_id' => $this->zone->id]);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/dashboard/metrics');

        $response->assertStatus(200);
        $this->assertEquals(5, $response->json('data.total_home_groups'));
    }

    /**
     * Test metric: Groups with active members
     */
    public function test_groups_with_active_members_counts_only_active(): void
    {
        $user = User::factory()->create([
            'role' => 'pastor',
            'zone_id' => $this->zone->id,
        ]);

        // Create 3 home groups
        $group1 = HomeGroup::create(['name' => 'Group 1', 'zone_id' => $this->zone->id]);
        $group2 = HomeGroup::create(['name' => 'Group 2', 'zone_id' => $this->zone->id]);
        $group3 = HomeGroup::create(['name' => 'Group 3', 'zone_id' => $this->zone->id]);

        // Create active member in group 1
        $activeMember = User::factory()->create([
            'is_active' => true,
            'home_group_id' => $group1->id,
            'zone_id' => $this->zone->id,
        ]);
        Member::create([
            'user_id' => $activeMember->id,
            'name' => $activeMember->name,
            'surname' => $activeMember->surname,
            'status' => 'active',
            'zone_id' => $this->zone->id,
            'home_group_id' => $group1->id,
        ]);

        // Create inactive member in group 2
        $inactiveMember = User::factory()->create([
            'is_active' => false,
            'home_group_id' => $group2->id,
            'zone_id' => $this->zone->id,
        ]);
        Member::create([
            'user_id' => $inactiveMember->id,
            'name' => $inactiveMember->name,
            'surname' => $inactiveMember->surname,
            'status' => 'inactive',
            'zone_id' => $this->zone->id,
            'home_group_id' => $group2->id,
        ]);

        // Group 3 has no members

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/dashboard/metrics');

        $response->assertStatus(200);
        
        // Only 1 group should have active members
        $this->assertEquals(1, $response->json('data.groups_with_active_members'));
    }

    /**
     * Test metric: Departments with HOD assigned
     */
    public function test_departments_with_hod_counts_only_assigned(): void
    {
        $user = User::factory()->create([
            'role' => 'pastor',
            'zone_id' => $this->zone->id,
        ]);

        // Create 3 departments
        $dept1 = Department::create(['name' => 'Worship', 'zone_id' => $this->zone->id]);
        $dept2 = Department::create(['name' => 'Media', 'zone_id' => $this->zone->id]);
        $dept3 = Department::create(['name' => 'Ushering', 'zone_id' => $this->zone->id]);

        // Create HOD user for department 1 (active)
        $hod1 = User::factory()->create([
            'role' => 'hod',
            'department_id' => $dept1->id,
            'is_active' => true,
            'zone_id' => $this->zone->id,
        ]);

        // Create inactive HOD for department 2
        $hod2 = User::factory()->create([
            'role' => 'hod',
            'department_id' => $dept2->id,
            'is_active' => false,
            'zone_id' => $this->zone->id,
        ]);

        // Department 3 has no HOD

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/dashboard/metrics');

        $response->assertStatus(200);
        
        // Only 1 department should have active HOD
        $this->assertEquals(1, $response->json('data.departments_with_hod'));
    }

    /**
     * Test that deactivated users are excluded from active member count
     */
    public function test_excludes_deactivated_users_from_member_count(): void
    {
        $user = User::factory()->create([
            'role' => 'pastor',
            'zone_id' => $this->zone->id,
        ]);

        $group = HomeGroup::create(['name' => 'Test Group', 'zone_id' => $this->zone->id]);

        // Create active member
        $activeUser = User::factory()->create([
            'is_active' => true,
            'home_group_id' => $group->id,
            'zone_id' => $this->zone->id,
        ]);
        Member::create([
            'user_id' => $activeUser->id,
            'name' => $activeUser->name,
            'surname' => $activeUser->surname,
            'status' => 'active',
            'zone_id' => $this->zone->id,
            'home_group_id' => $group->id,
        ]);

        // Create deactivated member (is_active = false)
        $deactivatedUser = User::factory()->create([
            'is_active' => false,
            'home_group_id' => $group->id,
            'zone_id' => $this->zone->id,
        ]);
        Member::create([
            'user_id' => $deactivatedUser->id,
            'name' => $deactivatedUser->name,
            'surname' => $deactivatedUser->surname,
            'status' => 'active', // status is active but user is deactivated
            'zone_id' => $this->zone->id,
            'home_group_id' => $group->id,
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/dashboard/metrics');

        $response->assertStatus(200);
        
        // Should only count 1 active member (not the deactivated one)
        $this->assertEquals(1, $response->json('data.total_active_members'));
    }

    /**
     * Test NULL handling - results should never be NULL, always 0
     */
    public function test_null_results_are_replaced_with_zero(): void
    {
        $user = User::factory()->create([
            'role' => 'pastor',
            'zone_id' => $this->zone->id,
        ]);

        $response = $this->actingAs($user, 'sanctum')
            ->getJson('/api/dashboard/metrics');

        $response->assertStatus(200);
        
        // All values should be integers, not null
        $data = $response->json('data');
        $this->assertIsInt($data['total_active_members']);
        $this->assertIsInt($data['total_home_groups']);
        $this->assertIsInt($data['groups_with_active_members']);
        $this->assertIsInt($data['total_departments']);
        $this->assertIsInt($data['departments_with_hod']);
    }
}