<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Mail\SecurityAlertMail;
use App\Models\User;
use App\Services\AuditTrail;
use App\Support\Mailing;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Laravel\Sanctum\PersonalAccessToken;

/**
 * Sign-in for the member, partner, HOD and pastor portals.
 *
 *  - Members / partners / HODs: email + password            POST /api/login
 *  - Pastors:                   pastor code (+ password if the policy requires it)   POST /api/login/code
 *  - Staff (master / finance / events) use their own portals (/admin, /finance, /events), not this API.
 *
 * Failures are counted per account and per IP and lock out for a while; every sign-in is recorded; a person's
 * deactivation takes effect at once (see EnsureUserIsActive); old devices are signed out beyond a limit.
 */
class AuthController extends Controller
{
    /** GET /api/auth/policy — public: tells the sign-in screen what to ask for. */
    public function policy(): JsonResponse
    {
        return response()->json(['success' => true, 'data' => [
            'pastor_password_required' => (bool) config('portal.pastor_password_required'),
        ]]);
    }

    /** POST /api/login/code — pastors */
    public function loginWithCode(Request $request): JsonResponse
    {
        $data = $request->validate([
            'unique_code' => ['required', 'string', 'max:20'],
            'password'    => ['nullable', 'string', 'max:200'],
        ]);

        $code  = strtoupper(trim($data['unique_code']));
        $ipKey = 'login-code:ip:' . $request->ip();

        if ($response = $this->lockedOut($ipKey, (int) config('portal.code_failures_per_ip'))) {
            return $response;
        }

        $user = User::where('unique_code', $code)->where('role', UserRole::Pastor)->first();

        // The code alone is a weak secret (it follows a fixed pattern); when the policy asks, the password is required too.
        if ($user && $user->is_active && config('portal.pastor_password_required')) {
            if (blank($data['password'] ?? null)) {
                return response()->json(['success' => false, 'requires_password' => true, 'message' => 'Please enter your password as well.'], 422);
            }
            if (!Hash::check($data['password'], $user->password)) {
                return $this->failed($request, $ipKey, $user, 'code+password', 'Invalid code or password.');
            }
        }

        if (!$user || !$user->is_active) {
            return $this->failed($request, $ipKey, null, 'code', 'Invalid code or unauthorised.');
        }

        RateLimiter::clear($ipKey);

        return $this->issueToken($request, $user, 'code');
    }

    /** POST /api/login — members, partners and HODs */
    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email'    => ['required', 'email', 'max:255'],
            'password' => ['required', 'string', 'max:200'],
        ]);

        $email   = Str::lower($data['email']);
        $acctKey = 'login:acct:' . $email;
        $ipKey   = 'login:ip:' . $request->ip();

        if (($response = $this->lockedOut($acctKey, (int) config('portal.max_failures_per_account')))
            || ($response = $this->lockedOut($ipKey, (int) config('portal.max_failures_per_ip')))) {
            return $response;
        }

        $user = User::where('email', $email)->first();

        // Always do one password check, so response time does not reveal whether the email exists.
        $valid = Hash::check($data['password'], $user?->password ?? '$2y$12$83sOrnpG3J/uBEc6Jgn3j.cbmW.jsDplLxmkuteZ8V2AnIDHPKAee');

        if (!$user || !$valid) {
            return $this->failed($request, $acctKey, $user, 'email', 'The provided credentials are incorrect.', $ipKey);
        }

        // From here the password was right, so it is safe to be specific about what is wrong with the account.
        if (!$user->is_active) {
            return response()->json(['success' => false, 'message' => 'This account has been deactivated. Please contact your pastor or head office.'], 403);
        }

        if ($user->isFilamentUser()) {
            $portal = config("portal.staff_portals.{$user->role->value}", '/admin');

            return response()->json([
                'success'  => false,
                'staff'    => true,
                'redirect' => $portal,
                'message'  => 'This is a staff account. Please sign in to the staff portal.',
            ], 403);
        }

        if ($user->isPastor()) {
            return response()->json(['success' => false, 'message' => 'Pastors sign in with their pastor code.'], 403);
        }

        RateLimiter::clear($acctKey);

        return $this->issueToken($request, $user, 'email');
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

    /** POST /api/logout — signs out this device only. */
    public function logout(Request $request): JsonResponse
    {
        $token = $request->user()->currentAccessToken();
        if ($token instanceof PersonalAccessToken) {
            $token->delete();
        }

        return response()->json(['success' => true, 'message' => 'Logged out successfully.']);
    }

    /** POST /api/logout-all — signs out every device (e.g. after losing a phone). */
    public function logoutAll(Request $request): JsonResponse
    {
        $request->user()->tokens()->delete();

        AuditTrail::record('auth.logout_all', $request->user(), null, ['ip' => $request->ip()]);

        return response()->json(['success' => true, 'message' => 'Signed out of all devices.']);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user      = $request->user();
        $validated = $request->validate([
            'name'          => ['sometimes', 'string', 'max:255'],
            'phone'         => ['sometimes', 'nullable', 'string', 'max:20'],
            'address'       => ['sometimes', 'nullable', 'string', 'max:500'],
            'date_of_birth' => ['sometimes', 'nullable', 'date', 'before:today'],
            // Only a path that came from our own upload endpoint: never an arbitrary URL or file path.
            'profile_photo' => ['sometimes', 'nullable', 'string', 'regex:#^profile-photos/[A-Za-z0-9._-]+$#'],
        ]);

        $user->update($validated);

        return response()->json([
            'success' => true,
            'user'    => new UserResource($user->fresh(['zone', 'department', 'homeGroup'])),
        ]);
    }

    /** POST /api/profile/photo */
    public function uploadProfilePhoto(Request $request): JsonResponse
    {
        $request->validate([
            'photo' => ['required', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:4096'],
        ]);

        $user = $request->user();
        // Content-checked and stored in cloud storage (the server's own disk is read-only in production).
        $stored = app(\App\Services\Community\MediaStore::class)->storeImage($request->file('photo'));

        $user->update(['profile_photo' => $stored['url']]);
        $user->load(['zone', 'department', 'homeGroup']);

        return response()->json(['success' => true, 'user' => new UserResource($user)]);
    }

    // ─── Private ──────────────────────────────────────────────────────────────

    /** @return JsonResponse|null a 429 when this key has failed too often recently */
    private function lockedOut(string $key, int $max): ?JsonResponse
    {
        if (!RateLimiter::tooManyAttempts($key, $max)) {
            return null;
        }

        $minutes = (int) ceil(RateLimiter::availableIn($key) / 60);

        return response()->json([
            'success' => false,
            'message' => "Too many sign-in attempts. Please try again in {$minutes} minute" . ($minutes === 1 ? '' : 's') . '.',
        ], 429)->header('Retry-After', (string) RateLimiter::availableIn($key));
    }

    /** Count a failure, record it, warn the account's owner after repeated failures, and answer with one generic message. */
    private function failed(Request $request, string $key, ?User $user, string $method, string $message, ?string $secondKey = null): JsonResponse
    {
        $decay = (int) config('portal.lockout_seconds');
        RateLimiter::hit($key, $decay);
        if ($secondKey) {
            RateLimiter::hit($secondKey, $decay);
        }

        Log::notice('Failed sign-in', ['method' => $method, 'ip' => $request->ip(), 'known_account' => (bool) $user]);

        if ($user) {
            AuditTrail::record('auth.failed', null, $user, ['method' => $method, 'ip' => $request->ip()], $user->id);

            // Tell the real owner once an hour when someone keeps failing against their account.
            $failures = RateLimiter::attempts($key);
            if ($failures === 5 && RateLimiter::attempt('login-alert:' . $user->id, 1, fn () => true, 3600)) {
                Mailing::to($user, new SecurityAlertMail($user, 'failed_logins', null, $request->ip(), Str::limit((string) $request->userAgent(), 90, '…')));
            }
        }

        return response()->json(['success' => false, 'message' => $message], 401);
    }

    private function issueToken(Request $request, User $user, string $method): JsonResponse
    {
        // Keep the newest sessions only (the one we are about to create makes it max).
        $keep = max(1, (int) config('portal.max_tokens_per_user') - 1);
        $stale = $user->tokens()->latest('id')->pluck('id')->slice($keep)->all();
        if ($stale) {
            PersonalAccessToken::whereIn('id', $stale)->delete();
        }

        $user->forceFill(['last_login_at' => now(), 'last_login_ip' => $request->ip()])->saveQuietly();
        AuditTrail::record('auth.login', $user, null, ['method' => $method, 'ip' => $request->ip()]);

        $user->load([
            'zone.region.country', 'department', 'homeGroup',
            'pastor.zone.region.country', 'member.zone.region.country', 'member.homeGroup', 'partner',
        ]);

        return response()->json([
            'success'                => true,
            'token'                  => $user->createToken('auth-token')->plainTextToken,
            'user'                   => new UserResource($user),
            'needs_terms_acceptance' => !$user->terms_accepted,
        ]);
    }
}
