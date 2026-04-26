<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

/**
 * ApiExceptionHandler
 *
 * Catches all exceptions in API routes and returns sanitized error responses.
 * Prevents stack traces, file paths, and SQL queries from leaking.
 */
class ApiExceptionHandler
{
    /**
     * Handle an exception gracefully
     */
    public function handle(Request $request, Closure $next): Response
    {
        try {
            return $next($request);
        } catch (Throwable $e) {
            // Log full details for developers
            Log::error('API Exception', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
                'user_id' => optional($request->user())->id,
                'ip' => $request->ip(),
                'url' => $request->fullUrl(),
                'method' => $request->method(),
            ]);

            // Return generic error to client
            $statusCode = 500;
            $message = 'Internal server error';

            if (method_exists($e, 'getStatusCode')) {
                $statusCode = $e->getStatusCode();
            }

            // Custom messages for common errors
            if ($e instanceof \Illuminate\Database\QueryException) {
                $message = 'Database query failed';
            } elseif ($e instanceof \Illuminate\Auth\AuthenticationException) {
                $statusCode = 401;
                $message = 'Unauthenticated';
            } elseif ($e instanceof \Illuminate\Auth\Access\AuthorizationException) {
                $statusCode = 403;
                $message = 'Forbidden';
            } elseif ($e instanceof \Illuminate\Validation\ValidationException) {
                $statusCode = 422;
                $message = 'Validation failed';
            } elseif ($e instanceof \Symfony\Component\HttpKernel\Exception\NotFoundHttpException) {
                $statusCode = 404;
                $message = 'Resource not found';
            }

            // NEVER expose exception details in production
            $environment = config('app.env', 'production');
            if ($environment !== 'local') {
                $responseData = [
                    'success' => false,
                    'error' => $message,
                ];
            } else {
                // Development mode - slightly more detail
                $responseData = [
                    'success' => false,
                    'error' => $message,
                    'debug' => [
                        'file' => $e->getFile(),
                        'line' => $e->getLine(),
                    ],
                ];
            }

            return response()->json($responseData, $statusCode);
        }
    }
}
