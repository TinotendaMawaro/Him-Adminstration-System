<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Storage;

class AuthController extends Controller
{
    /**
     * POST /api/login/code  — Pastors only
     */
    public function loginWithCode(Request $request): JsonResponse
    {
        $request->validate(['unique_code' => 'required|string']);

        $user = User::where('unique_code', $request->unique_code)
            ->where('role', UserRole::Pastor)
            ->where('is_active', true)
            ->first();

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Invalid code or unauthorised.'], 401);
        }

        return $this->issueToken($user);
    }

    /**
     * POST /api/login  — Members and Partners
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)
            ->whereIn('role', [UserRole::Member->value, UserRole::Partner->value, UserRole::HOD->value])
            ->where('is_active', true)
            ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'The provided credentials are incorrect.',
            ], 401);
        }

        return $this->issueToken($user);
    }

    public function acceptTerms(Request $request): JsonResponse
    {
        $request->user()->update(['terms_accepted' => true, 'terms_accepted_at' => now()]);
        return response()->json(['success' => true, 'user' => new UserResource($request->user())]);
    }

    public function completeFirstLogin(Request $request): JsonResponse
    {
        $request->user()->update(['first_login_at' => now()]);
        return response()->json(['success' => true, 'user' => new UserResource($request->user())]);
    }

    public function completeTour(Request $request): JsonResponse
    {
        $request->user()->update(['completed_tour' => true]);
        return response()->json(['success' => true]);
    }

    public function skipTour(Request $request): JsonResponse
    {
        $request->user()->update(['completed_tour' => true]);
        return response()->json(['success' => true]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load([
            'zone.region.country', 'zone.pastors', 'department', 'homeGroup', 'gender', 'demography',
            'contact.country', 'pastor.zone.region.country',
            'member.zone.pastors', 'member.zone.region.country', 'member.homeGroup', 'member.department',
            'partner',
        ]);

        return response()->json(['success' => true, 'user' => new UserResource($user)]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['success' => true, 'message' => 'Logged out successfully.']);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user      = $request->user();
        $validated = $request->validate([
            'name'          => 'sometimes|string|max:255',
            'phone'         => 'sometimes|string|max:20',
            'address'       => 'sometimes|string|max:500',
            'date_of_birth' => 'sometimes|date',
            'profile_photo' => 'sometimes|string',
        ]);

        $user->update($validated);

        return response()->json([
            'success' => true,
            'user'    => new UserResource($user->fresh(['zone', 'department', 'homeGroup'])),
        ]);
    }

    /**
     * Upload user profile photo.
     * POST /api/profile/photo
     */
    public function uploadProfilePhoto(Request $request): JsonResponse
    {
        $request->validate([
            'photo' => 'required|file|image|mimes:jpg,jpeg,png,webp|max:2048',
        ]);

        $user = $request->user();

        // Store the photo in 'profile-photos' directory on the public disk
        $path = $request->file('photo')->store('profile-photos', 'public');

        $user->update(['profile_photo' => $path]);

        // Load relationships for UserResource
        $user->load(['zone', 'department', 'homeGroup']);

        return response()->json([
            'success' => true,
            'user'    => new UserResource($user),
        ]);
    }

    // ─── Private ──────────────────────────────────────────────────────────────

    private function issueToken(User $user): JsonResponse
    {
        $user->load([
            'zone.region.country',
            'department',
            'homeGroup',
            'pastor.zone.region.country',
            'member.zone.region.country',
            'member.homeGroup',
            'partner'
        ]);
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'success'                => true,
            'token'                  => $token,
            'user'                   => new UserResource($user),
            'needs_terms_acceptance' => !$user->terms_accepted,
        ]);
    }
}
