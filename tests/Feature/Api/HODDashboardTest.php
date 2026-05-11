<?php

namespace Tests\Feature\Api;

use App\Models\Department;
use App\Models\Member;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class HODDashboardTest extends TestCase
{
    use RefreshDatabase;

    protected ?Department $department = null;

    protected ?\App\Models\Zone $zone = null;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed basic data
        $this->seed(\Database\Seeders\DatabaseSeeder::class);

        // Create hierarchy: country -> region -> zone
        $country = \App\Models\Country::create(['name' => 'Test Country', 'country_code' => 'TC']);
        $region = \App\Models\Region::create(['name' => 'Test Region', 'country_id' => $country->id]);
        $this->zone = \App\Models\Zone::create(['name' => 'Test Zone', 'region_id' => $region->id]);

        // Create a department
        $this->department = Department::create([
            'name' => 'Worship',
            'zone_id' => $this->zone->id,
        ]);
    }

    /** Test that unauthenticated requests are rejected */
    public function test_unauthenticated_request_is_rejected(): void
    {
        $response = $this->getJson('/api/hod/dashboard');
        $response->assertStatus(401);
    }

    /** Test that non-HOD users are forbidden */
    public function test_non_hod_user_is_forbidden(): void
    {
        $user = User::factory()->create([
            'role' => 'member',
            'zone_id' => $this->zone->id,
        ]);

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/hod/dashboard');
        $response->assertStatus(403);
    }

    /** Test that HOD without department is forbidden */
    public function test_hod_without_department_is_forbidden(): void
    {
        $user = User::factory()->create([
            'role' => 'hod',
            'zone_id' => $this->zone->id,
            'department_id' => null,
        ]);

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/hod/dashboard');
        $response->assertStatus(403);
    }

    /** Test HOD dashboard returns expected structure with zero data */
    public function test_returns_expected_structure_with_zero_data(): void
    {
        $hod = User::factory()->create([
            'role' => 'hod',
            'zone_id' => $this->zone->id,
            'department_id' => $this->department->id,
        ]);

        $response = $this->actingAs($hod, 'sanctum')->getJson('/api/hod/dashboard');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
            ])
            ->assertJsonStructure([
                'success',
                'data' => [
                    'my_department_members',
                    'active_members_this_month',
                    'department_groups',
                    'groups_with_active_members',
                    'pending_approvals',
                    'attendance_rate_avg',
                    'last_updated',
                ],
            ]);

        // All numeric values should be zero initially
        $data = $response->json('data');
        $this->assertEquals(0, $data['my_department_members']);
        $this->assertEquals(0, $data['active_members_this_month']);
        $this->assertEquals(0, $data['department_groups']);
        $this->assertEquals(0, $data['groups_with_active_members']);
        $this->assertEquals(0, $data['pending_approvals']);
        $this->assertEquals(0, $data['attendance_rate_avg']);
    }

    /** Test HOD dashboard counts department members correctly */
    public function test_counts_department_members(): void
    {
        $hod = User::factory()->create([
            'role' => 'hod',
            'zone_id' => $this->zone->id,
            'department_id' => $this->department->id,
        ]);

        // Create 3 members in this department
        for ($i = 0; $i < 3; $i++) {
            $user = User::factory()->create([
                'zone_id' => $this->zone->id,
                'is_active' => true,
            ]);
            Member::create([
                'user_id' => $user->id,
                'name' => "Member $i",
                'surname' => 'Test',
                'department_id' => $this->department->id,
                'zone_id' => $this->zone->id,
                'status' => 'active',
            ]);
        }

        // Create a member in another department (should not count)
        $otherDept = Department::create(['name' => 'Other', 'zone_id' => $this->zone->id]);
        $otherUser = User::factory()->create(['zone_id' => $this->zone->id]);
        Member::create([
            'user_id' => $otherUser->id,
            'name' => 'Other',
            'surname' => 'Dept',
            'department_id' => $otherDept->id,
            'zone_id' => $this->zone->id,
            'status' => 'active',
        ]);

        $response = $this->actingAs($hod, 'sanctum')->getJson('/api/hod/dashboard');
        $response->assertStatus(200);
        $this->assertEquals(3, $response->json('data.my_department_members'));
    }

    /** Test HOD dashboard counts active members this month */
    public function test_counts_active_members_this_month(): void
    {
        $hod = User::factory()->create([
            'role' => 'hod',
            'zone_id' => $this->zone->id,
            'department_id' => $this->department->id,
        ]);

        // Create active member this month
        $user1 = User::factory()->create(['zone_id' => $this->zone->id, 'is_active' => true]);
        Member::create([
            'user_id' => $user1->id,
            'name' => 'New',
            'surname' => 'Member',
            'department_id' => $this->department->id,
            'zone_id' => $this->zone->id,
            'status' => 'active',
            'created_at' => now(),
        ]);

        $response = $this->actingAs($hod, 'sanctum')->getJson('/api/hod/dashboard');
        $response->assertStatus(200);
        $this->assertEquals(1, $response->json('data.active_members_this_month'));
    }

    /** Test HOD dashboard counts pending approvals */
    public function test_counts_pending_approvals(): void
    {
        $hod = User::factory()->create([
            'role' => 'hod',
            'zone_id' => $this->zone->id,
            'department_id' => $this->department->id,
        ]);

        // Create a second user to avoid unique constraint on (user_id, department_id)
        $user2 = User::factory()->create([
            'zone_id' => $this->zone->id,
        ]);

        // Create two pending department requests for this department
        \App\Models\DepartmentRequest::create([
            'user_id' => $hod->id,
            'department_id' => $this->department->id,
            'zone_id' => $this->zone->id,
            'status' => 'pending',
        ]);
        \App\Models\DepartmentRequest::create([
            'user_id' => $user2->id,
            'department_id' => $this->department->id,
            'zone_id' => $this->zone->id,
            'status' => 'pending',
        ]);

        $response = $this->actingAs($hod, 'sanctum')->getJson('/api/hod/dashboard');
        $response->assertStatus(200);
        $this->assertEquals(2, $response->json('data.pending_approvals'));
    }
}
