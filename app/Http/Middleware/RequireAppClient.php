<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/** Joining the church (and member sign-in) happens in the mobile app only; the website sends people to download it. */
class RequireAppClient
{
    public static function isApp(Request $request): bool
    {
        return $request->header('X-HIM-Client') === 'app';
    }

    public static function refusal(): array
    {
        return ['success' => false, 'app_only' => true, 'redirect' => '/download', 'message' => 'Members and partners use the Heartfelt mobile app. Please download and install it to continue.'];
    }

    public function handle(Request $request, Closure $next): Response
    {
        return self::isApp($request) ? $next($request) : response()->json(self::refusal(), 403);
    }
}
