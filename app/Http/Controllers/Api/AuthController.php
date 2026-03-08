<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * Login with unique code (for Pastors and HODs)
     */
    public function loginWithCode(Request $request): JsonResponse
    {
        $request->validate([
            'unique_code' => 'required|string',
        ]);

        $user = User::where('unique_code', $request->unique_code)
            ->whereIn('role', ['pastor', 'hod'])
            ->where('is_active', true)
            ->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid code or user not authorized',
            ], 401);
        }

        // Load zone relationship before returning user
        $user->load('zone');

        // Debug: Log the user zone info
        \Log::info('Login attempt - User zone info', [
            'user_id' => $user->id,
            'user_name' => $user->name,
            'zone_id' => $user->zone_id,
            'zone_loaded' => $user->relationLoaded('zone'),
            'zone_name' => $user->zone?->name,
        ]);

        // Check if first time login
        $isFirstTime = $user->first_login_at === null;

        // Generate token
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'user' => $user,
            'token' => $token,
            'is_first_time' => $isFirstTime,
            'needs_terms_acceptance' => !$user->terms_accepted,
        ]);
    }

    /**
     * Accept terms and conditions
     */
    public function acceptTerms(Request $request): JsonResponse
    {
        $user = $request->user();

        $user->update([
            'terms_accepted' => true,
            'terms_accepted_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Terms accepted successfully',
            'user' => $user,
        ]);
    }

    /**
     * Complete first login setup
     */
    public function completeFirstLogin(Request $request): JsonResponse
    {
        $user = $request->user();

        $user->update([
            'first_login_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'First login completed',
            'user' => $user,
        ]);
    }

    /**
     * Complete tour
     */
    public function completeTour(Request $request): JsonResponse
    {
        $user = $request->user();

        $user->update([
            'completed_tour' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Tour completed',
            'user' => $user,
        ]);
    }

    /**
     * Skip tour
     */
    public function skipTour(Request $request): JsonResponse
    {
        $user = $request->user();

        $user->update([
            'completed_tour' => true,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Tour skipped',
            'user' => $user,
        ]);
    }

    /**
     * Get current user info
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load(['zone', 'department', 'homeGroup', 'gender', 'demography']);

        return response()->json([
            'success' => true,
            'user' => $user,
        ]);
    }

    /**
     * Logout user
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully',
        ]);
    }

    /**
     * Update user profile
     */
    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|max:20',
            'address' => 'sometimes|string|max:500',
            'date_of_birth' => 'sometimes|date',
            'profile_photo' => 'sometimes|string',
        ]);

        $user->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'user' => $user->fresh(),
        ]);
    }
}
