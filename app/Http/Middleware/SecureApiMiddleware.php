<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * SecureApiMiddleware
 *
 * Applies security hardening to API requests:
 * - Validates request size limits
 * - Adds security headers
 * - Blocks common attack patterns
 * - Logs suspicious activity
 */
class SecureApiMiddleware
{
    /**
     * Maximum allowed request size (2MB)
     */
    const MAX_REQUEST_SIZE = 4.5 * 1024 * 1024;   // photos are shrunk on the device; Vercel itself caps a request at 4.5 MB

    /**
     * Blocked user agents (common scanners/bots)
     */
    const BLOCKED_AGENTS = [
        'sqlmap',
        'nikto',
        'wpscan',
        'acunetix',
        'nessus',
        'nmap',
        'masscan',
    ];

    /**
     * Handle incoming request
     */
    public function handle(Request $request, Closure $next)
    {
        // 1️⃣ Content-Length check (prevent large payload DoS)
        $contentLength = $request->server('CONTENT_LENGTH', 0);
        if ($contentLength > self::MAX_REQUEST_SIZE) {
            Log::warning('Oversized request blocked', [
                'ip' => $request->ip(),
                'content_length' => $contentLength,
                'path' => $request->path(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Request too large',
            ], 413);
        }

        // 2️⃣ User-Agent validation
        $userAgent = $request->userAgent() ?? '';
        foreach (self::BLOCKED_AGENTS as $agent) {
            if (stripos($userAgent, $agent) !== false) {
                Log::notice('Blocked user agent', [
                    'agent' => $userAgent,
                    'ip' => $request->ip(),
                ]);
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied',
                ], 403);
            }
        }

        // 3️⃣ SQL injection pattern detection (basic, for logging only)
        $queryString = $request->getQueryString() ?? '';
        $dangerous = ['UNION SELECT', '--', ';--', '/*', '*/', 'DROP ', 'TRUNCATE '];
        foreach ($dangerous as $pattern) {
            if (stripos($queryString, $pattern) !== false) {
                Log::alert('Potential SQL injection attempt', [
                    'ip' => $request->ip(),
                    'query' => $queryString,
                    'user_id' => optional($request->user())->id,
                ]);
                // Still process request (Laravel handles sanitization), but log it
                break;
            }
        }

        // 4️⃣ Process request
        $response = $next($request);

        // 5️⃣ Add security headers to response
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'DENY');
        $response->headers->set('X-XSS-Protection', '1; mode=block');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

        // 6️⃣ Remove server signature
        $response->headers->set('X-Powered-By', '');

        return $response;
    }
}
