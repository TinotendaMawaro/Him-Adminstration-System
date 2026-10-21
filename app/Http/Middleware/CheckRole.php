<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * CheckRole Middleware
 *
 * Verifies the authenticated user has one of the required roles.
 * Usage: Route::middleware(['role:pastor,hod'])->group(...)
 *
 * Laravel splits "role:pastor,hod" into separate arguments, so the roles arrive as a variadic list.
 */
class CheckRole
{
    public function handle(Request $request, Closure $next, string ...$roles): mixed
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated',
            ], 401);
        }

        // Accept both "role:a,b" (variadic) and a single comma-joined string, trimmed.
        $allowedRoles = collect($roles)
            ->flatMap(fn ($r) => explode(',', $r))
            ->map(fn ($r) => trim($r))
            ->filter()
            ->values()
            ->all();

        $userRole      = $user->role;
        $userRoleValue = $userRole instanceof \App\Enums\UserRole ? $userRole->value : $userRole;

        if (!in_array($userRoleValue, $allowedRoles, true)) {
            \Log::warning('Role check failed', [
                'user_id'        => $user->id,
                'user_role'      => $userRoleValue,
                'required_roles' => $allowedRoles,
                'path'           => $request->path(),
                'ip'             => $request->ip(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Insufficient permissions',
            ], 403);
        }

        return $next($request);
    }
}
