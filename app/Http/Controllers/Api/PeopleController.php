<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\CredentialService;
use App\Services\UserHistoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class PeopleController extends Controller
{
    /** GET /api/people/{user}/history: the hover card (who may see whom is decided by UserHistoryService). */
    public function history(Request $request, User $user, UserHistoryService $history): JsonResponse
    {
        return response()->json(['success' => true, 'data' => $history->timeline($user, $request->user())])
            ->header('Cache-Control', 'no-store');
    }

    /**
     * POST /api/credentials/pdf: the credentials that were just shown to a pastor / head office, as a watermarked PDF.
     * Nothing is stored; the caller sends back exactly what the server issued a moment ago.
     */
    public function credentialsPdf(Request $request, CredentialService $credentials): Response
    {
        $d = $request->validate([
            'name' => ['required', 'string', 'max:120'], 'role' => ['required', 'string', 'max:60'], 'zone' => ['nullable', 'string', 'max:120'],
            'login_label' => ['required', 'string', 'max:80'], 'login' => ['required', 'string', 'max:160'], 'code' => ['nullable', 'string', 'max:40'],
            'password' => ['required', 'string', 'max:60'], 'issued_at' => ['required', 'string', 'max:40'], 'issued_by' => ['nullable', 'string', 'max:120'],
            'reason' => ['nullable', 'string', 'max:300'],
        ]);

        return response($credentials->pdf($d), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="heartfelt-credentials.pdf"',
            'Cache-Control' => 'no-store, private',
        ]);
    }
}
