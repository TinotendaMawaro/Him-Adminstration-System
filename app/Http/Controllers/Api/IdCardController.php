<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\IdCardService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class IdCardController extends Controller
{
    /** GET /api/id-card: the signed-in person's own ID card data. */
    public function show(Request $request, IdCardService $cards): JsonResponse
    {
        return response()->json(['success' => true, 'data' => $cards->forUser($request->user())]);
    }
}
