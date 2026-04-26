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
 */
class CheckRole
{
    /**
     * Handle incoming request
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @param  string|array  $roles  Comma-separated or array of allowed roles
     * @return mixed
     */
    public function handle(Request $request, Closure $next, $roles): mixed
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated',
            ], 401);
        }

        // Convert string to array if needed
        $allowedRoles = is_array($roles) ? $roles : explode(',', $roles);
        $allowedRoles = array_map('trim', $allowedRoles);

        // Check user role
        $userRole = $user->role ?? $user->getRole();

        $hasRole = in_array($userRole, $allowedRoles, true);

        // Also allow super-admin
        if (method_exists($user, 'isAdmin') && $user->isAdmin()) {
            $hasRole = true;
        }

        if (!$hasRole) {
            \Log::warning('Role check failed', [
                'user_id' => $user->id,
                'user_role' => $userRole,
                'required_roles' => $allowedRoles,
                'path' => $request->path(),
                'ip' => $request->ip(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Insufficient permissions',
            ], 403);
        }

        return $next($request);
    }
}
