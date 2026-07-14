<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\LocationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LocationController extends Controller
{
    public function __construct(protected LocationService $location) {}

    public function reverseGeocode(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'latitude'  => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
        ]);

        $data = $this->location->reverseGeocode(
            (float) $validated['latitude'],
            (float) $validated['longitude']
        );

        return response()->json([
            'success' => true,
            'data'    => $data,
        ]);
    }
}
