<?php

namespace App\Http\Middleware;

use App\Services\PartnershipService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Partner benefits (the marketplace, partner-only teachings) are closed to people whose partnership has expired.
 * Members who never partnered are not affected: they simply have no partnership to lose.
 */
class RequiresPartnership
{
    public function __construct(private readonly PartnershipService $partnership) {}

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $this->partnership->isLockedOut($user)) {
            return response()->json([
                'success' => false,
                'code' => 'partnership_expired',
                'message' => 'Your partnership has expired. Renew it to use the marketplace again.',
                'partnership' => $this->partnership->state($user),
            ], 403);
        }

        return $next($request);
    }
}
