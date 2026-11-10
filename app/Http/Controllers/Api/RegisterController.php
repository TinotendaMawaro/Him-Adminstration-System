<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\Member;
use App\Models\User;
use App\Models\Zone;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;

class RegisterController extends Controller
{
    /**
     * POST /api/register
     *
     * Public endpoint — new members must supply a valid zone_code.
     * Creates both the User row and the Member profile row atomically.
     * The member is automatically associated with the identified Zone and
     * its currently assigned Pastor (via the User->zone_id relationship).
     * A standardized member code is generated: R[RegionCode][ZoneCode]M-[Serial]
     * e.g. R0101M-0001.
     */
    public function __invoke(Request $request): JsonResponse
    {
        // Normalize zone code BEFORE validation to accept both "0101" and "R0101"
        $zoneCodeInput = strtoupper(trim($request->input('zone_code', '')));
        $zoneCodeNormalized = preg_replace('/^R/', '', $zoneCodeInput);
        $zoneCodeNormalized = 'R' . str_pad($zoneCodeNormalized, 4, '0', STR_PAD_LEFT);

        // Validate all fields
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'password' => ['required', 'confirmed', Password::min(10)->mixedCase()->numbers()],
            'phone'    => 'nullable|string|max:20',
            'address'  => 'nullable|string|max:500',
            'zone_code' => 'required|string',
        ]);

        // Find zone by normalized code
        $zone = Zone::where('code', $zoneCodeNormalized)->first();

        if (!$zone) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid Zone Code. Please contact your Zone Pastor or Administrator for assistance.',
                'errors'  => ['zone_code' => ['Invalid zone code.']],
            ], 422);
        }

        DB::beginTransaction();

        try {
            // 1. Create user account — zone assigned directly; pastor linkage comes
            //    from the User->zone_id relationship (no separate pastor.user_id needed here)
            $user = User::create([
                'name'     => $validated['name'],
                'email'    => $validated['email'],
                'password' => $validated['password'],
                'role'     => UserRole::Member,
                'phone'    => $validated['phone'] ?? null,
                'address'  => $validated['address'] ?? null,
                'is_active'=> true,
                'zone_id'  => $zone->id,
            ]);

            // 2. Create member profile with auto-generated member code
            $nameParts = explode(' ', $validated['name'], 2);
            $firstName = $nameParts[0];
            $lastName  = $nameParts[1] ?? '';

            Member::create([
                'user_id'         => $user->id,
                'name'            => $firstName,
                'surname'         => $lastName,
                'member_number'   => 'MEM-' . strtoupper(Str::random(6)),
                'member_code'     => $this->generateMemberCode($zone),
                'status'          => 'active',
                'membership_date' => now(),
                'zone_id'         => $zone->id,
            ]);

            $member = $user->member;
            if ($member && $validated['phone'] ?? null) {
                $member->phone = $validated['phone'];
            }
            if ($member) {
                $member->save();
            }

            // 3. Associate zone is already set on both User and Member above; no separate counter update needed

            DB::commit();

            $user->load(['member.zone.region', 'zone.region', 'zone.pastors']);
            $token = $user->createToken('auth-token')->plainTextToken;

            return response()->json([
                'success'                => true,
                'token'                  => $token,
                'user'                   => new UserResource($user),
                'needs_terms_acceptance' => true,
            ], 201);

        } catch (ValidationException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'errors'  => $e->errors(),
            ], 422);
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('Registration error: '.$e->getMessage(), [
                'exception' => $e,
                'zone_code' => $validated['zone_code'] ?? null,
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Registration failed. Please try again.',
            ], 500);
        }
    }

    /**
     * Generate standardized member code: R0101M-0001
     * Zone code is already in format R0101 (region+zone), so prefix = R0101M-
     * Serial is zero-padded to 4 digits and auto-incremented per zone.
     */
    private function generateMemberCode(Zone $zone): string
    {
        $prefix = rtrim($zone->code, 'M') . 'M-';

        $lastMember = Member::where('member_code', 'LIKE', $prefix.'%')
            ->orderByDesc('member_code')
            ->first();

        $nextSerial = $lastMember
            ? ((int) substr(strrchr($lastMember->member_code, '-'), 1)) + 1
            : 1;

        return $prefix . str_pad((string) $nextSerial, 4, '0', STR_PAD_LEFT);
    }
}
