<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        apiPrefix: 'api',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Behind Vercel's (or any) HTTPS proxy: trust the forwarded scheme/host so links, cookies and redirects use https.
        $middleware->trustProxies(at: '*');

        $middleware->statefulApi();
        $middleware->validateCsrfTokens(except: ['email/unsubscribe/*']);

        $middleware->web(append: [
            \App\Http\Middleware\BaselineHeaders::class,
        ]);

        $middleware->api(append: [
            \App\Http\Middleware\SecureApiMiddleware::class,
        ]);

        $middleware->alias([
            'auth' => \Illuminate\Auth\Middleware\Authenticate::class,
            'role' => \App\Http\Middleware\CheckRole::class,
            'active' => \App\Http\Middleware\EnsureUserIsActive::class,
            'partnership' => \App\Http\Middleware\RequiresPartnership::class,
            'secure.api' => \App\Http\Middleware\SecureApiMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->render(function (Throwable $e, Request $request) {
            if ($request->expectsJson() || $request->is('api/*')) {
                if ($e instanceof \Illuminate\Auth\AuthenticationException) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Unauthenticated'
                    ], 401);
                }
                if ($e instanceof \Symfony\Component\Routing\Exception\RouteNotFoundException) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Route not found'
                    ], 404);
                }
            }
        });
    })->create();
