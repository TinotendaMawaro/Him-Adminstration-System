<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\Member;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;

class RegisterController extends Controller
{
    /**
     * POST /api/register
     *
     * Public endpoint — anyone can self-register as a Member.
     * Creates both the User row and the Member profile row atomically.
     * The member is placed without a zone/homegroup until a pastor assigns them.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'password' => ['required', 'confirmed', Password::min(6)],
            'phone'    => 'nullable|string|max:20',
            'address'  => 'nullable|string|max:500',
        ]);

        DB::beginTransaction();

        try {
            // 1. Create user account
            $user = User::create([
                'name'     => $validated['name'],
                'email'    => $validated['email'],
                'password' => $validated['password'],
                'role'     => UserRole::Member,
                'phone'    => $validated['phone'] ?? null,
                'address'  => $validated['address'] ?? null,
                'is_active'=> true,
            ]);

            // 2. Create member profile
            $nameParts = explode(' ', $validated['name'], 2);
            $firstName = $nameParts[0];
            $lastName   = $nameParts[1] ?? '';

            Member::create([
                'user_id'         => $user->id,
                'name'            => $firstName,
                'surname'         => $lastName,
                'member_number'   => 'MEM-' . strtoupper(Str::random(6)),
                'status'          => 'active',
                'membership_date' => now(),
            ]);

            DB::commit();

            $user->load(['member']);
            $token = $user->createToken('auth-token')->plainTextToken;

            return response()->json([
                'success'                => true,
                'token'                  => $token,
                'user'                   => new UserResource($user),
                'needs_terms_acceptance' => true,
            ], 201);

        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Registration failed. Please try again.',
            ], 500);
        }
    }
}
