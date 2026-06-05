<?php

namespace Tests\Feature\Auth;

use App\Models\Country;
use App\Models\Region;
use App\Models\Zone;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    private ?int $regionId = null;
    private ?int $countryId = null;

    protected function setUp(): void
    {
        parent::setUp();
        $this->countryId = Country::create(['name' => 'Zimbabwe', 'country_code' => 'ZW'])->id;
        $this->regionId  = Region::create(['name' => 'Region 01', 'code' => '01', 'country_id' => $this->countryId])->id;
    }

    public function test_registration_screen_can_be_rendered(): void
    {
        $response = $this->get('/login');

        $response->assertStatus(200);
    }

    public function test_new_users_can_register_with_zone_code(): void
    {
        $zone = Zone::create(['code' => 'R0101', 'name' => 'Test Zone 01', 'region_id' => $this->regionId]);

        $response = $this->postJson('/api/register', [
            'name'                  => 'Test User',
            'email'                 => 'test@example.com',
            'password'              => 'password',
            'password_confirmation' => 'password',
            'phone'                 => '07771234567',
            'address'               => '123 Main St, Harare',
            'zone_code'             => 'R0101',
        ]);

        $decoded = json_decode((string) $response->getContent(), true);

        if (($decoded['success'] ?? false) === false) {
            file_put_contents(
                sys_get_temp_dir() . '/register_debug.json',
                json_encode([
                    'status' => $response->getStatusCode(),
                    'content' => $decoded,
                ], JSON_PRETTY_PRINT)
            );
        }

        $this->assertTrue((bool) ($decoded['success'] ?? false), $decoded['message'] ?? 'Registration did not report success');
        $this->assertArrayHasKey('token', $decoded);
        $this->assertArrayHasKey('user', $decoded);
        $this->assertSame(201, $response->getStatusCode());

        if (isset($decoded['user']['zone_id'])) {
            $this->assertSame($zone->id, (int) $decoded['user']['zone_id']);
        } else {
            $this->assertSame($zone->id, (int) $decoded['user']['zone']['id']);
        }

        $this->assertArrayHasKey('member', $decoded['user']);
        $this->assertNotEmpty($decoded['user']['member']['member_code'] ?? '');

        $this->assertDatabaseHas('users', [
            'email'   => 'test@example.com',
            'zone_id' => $zone->id,
            'role'    => 'member',
        ]);

        $user = \App\Models\User::where('email', 'test@example.com')->first();
        $this->assertNotNull($user->member->member_code);
        $this->assertStringStartsWith('R0101M-', $user->member->member_code);
    }

    public function test_registration_rejects_invalid_zone_code(): void
    {
        $response = $this->postJson('/api/register', [
            'name'                  => 'Test User',
            'email'                 => 'test@example.com',
            'password'              => 'password',
            'password_confirmation' => 'password',
            'zone_code'             => 'R9999',
        ]);

        $response->assertStatus(422);
        $decoded = $response->json();
        $this->assertTrue($decoded['success'] === false);
        $this->assertArrayHasKey('zone_code', $decoded['errors'] ?? []);
    }

    public function test_registration_accepts_zone_code_without_r_prefix(): void
    {
        $zone = Zone::create(['code' => 'R0101', 'name' => 'Test Zone 01', 'region_id' => $this->regionId]);

        $response = $this->postJson('/api/register', [
            'name'                  => 'Test User',
            'email'                 => 'test2@example.com',
            'password'              => 'password',
            'password_confirmation' => 'password',
            'zone_code'             => '0101', // Without R prefix
        ]);

        $decoded = json_decode((string) $response->getContent(), true);

        $this->assertTrue((bool) ($decoded['success'] ?? false), $decoded['message'] ?? 'Registration did not report success');
        $this->assertSame(201, $response->getStatusCode());

        // Verify the user was assigned to the correct zone
        $user = \App\Models\User::where('email', 'test2@example.com')->first();
        $this->assertSame($zone->id, $user->zone_id);
        $this->assertStringStartsWith('R0101M-', $user->member->member_code);
    }

    public function test_member_code_auto_increments_per_zone(): void
    {
        $zone = Zone::create(['code' => 'R0102', 'name' => 'Test Zone 02', 'region_id' => $this->regionId]);

        $this->postJson('/api/register', [
            'name' => 'First Member', 'email' => 'first@example.com',
            'password' => 'password', 'password_confirmation' => 'password',
            'zone_code' => 'R0102',
        ]);

        $this->postJson('/api/register', [
            'name' => 'Second Member', 'email' => 'second@example.com',
            'password' => 'password', 'password_confirmation' => 'password',
            'zone_code' => 'R0102',
        ]);

        $codes = \App\Models\Member::whereHas('user', fn ($q) => $q->whereIn('email', [
            'first@example.com', 'second@example.com',
        ]))->orderBy('id')->pluck('member_code')->all();

        $this->assertEquals(['R0102M-0001', 'R0102M-0002'], $codes);
    }
}
