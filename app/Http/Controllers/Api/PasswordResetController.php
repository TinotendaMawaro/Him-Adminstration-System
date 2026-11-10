<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Mail\ResetPasswordMail;
use App\Models\User;
use App\Support\Mailing;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password as PasswordRule;

/**
 * Forgot / reset password for the member portals (members, partners, HODs).
 * Staff use the same flow built into their own portals (/admin, /finance, /events).
 * Pastors sign in with a code, not a password, so they are not part of this flow.
 */
class PasswordResetController extends Controller
{
    /** POST /api/forgot-password — always answers the same way, so it cannot be used to discover who has an account. */
    public function forgot(Request $request): JsonResponse
    {
        $data = $request->validate(['email' => ['required', 'email', 'max:255']]);

        Password::sendResetLink(['email' => $data['email']], function (User $user, string $token) {
            if (!$user->is_active) {
                return;
            }

            $url = route('password.reset.form', ['token' => $token, 'email' => $user->email]);
            Mailing::to($user, new ResetPasswordMail($user, $url, (int) config('auth.passwords.users.expire', 60)));
        });

        return response()->json([
            'success' => true,
            'message' => 'If that email belongs to an account, a reset link is on its way. Check your inbox (and spam folder).',
        ]);
    }

    /** POST /api/reset-password */
    public function reset(Request $request): JsonResponse
    {
        $data = $request->validate([
            'token'    => ['required', 'string'],
            'email'    => ['required', 'email'],
            'password' => ['required', 'confirmed', PasswordRule::min(10)->mixedCase()->numbers()],
        ]);

        $status = Password::reset($data, function (User $user, string $password) {
            $user->forceFill(['password' => $password, 'remember_token' => Str::random(60)])->save();
            $user->tokens()->delete();   // sign out every device: a reset is also the recovery from a stolen session
            event(new PasswordReset($user));
        });

        if ($status !== Password::PASSWORD_RESET) {
            return response()->json(['success' => false, 'message' => 'This reset link is invalid or has expired. Please request a new one.'], 422);
        }

        return response()->json(['success' => true, 'message' => 'Your password has been changed. You can now sign in.']);
    }
}
