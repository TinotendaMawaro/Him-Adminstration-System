<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * A deactivated account must stop working immediately, not when its token happens to expire.
 * Runs after authentication: if the account is inactive the token is revoked and the client is signed out (401).
 */
class EnsureUserIsActive
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && !$user->is_active) {
            $token = method_exists($user, 'currentAccessToken') ? $user->currentAccessToken() : null;
            if ($token && method_exists($token, 'delete')) {
                $token->delete();
            }

            return response()->json([
                'success' => false,
                'message' => 'This account has been deactivated. Please contact your pastor or head office.',
            ], 401);
        }

        return $next($request);
    }
}
