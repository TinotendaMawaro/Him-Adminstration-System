<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\PersonalizationEngine;
use App\Services\HomeGroupRecommendationService;
use App\Http\Resources\EventResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RecommendationController extends Controller
{
    public function __construct(
        protected PersonalizationEngine $personalization,
        protected HomeGroupRecommendationService $homeGroupService,
    ) {}

    public function sermons(Request $request): JsonResponse
    {
        $recommendations = $this->personalization->getSermonRecommendations($request->user(), 5);

        return response()->json([
            'success' => true,
            'data'    => $recommendations,
        ]);
    }

    public function events(Request $request): JsonResponse
    {
        $recommendations = $this->personalization->getEventRecommendations($request->user(), 5);

        return response()->json([
            'success' => true,
            'data'    => EventResource::collection($recommendations),
        ]);
    }

    public function homeGroups(Request $request): JsonResponse
    {
        $recommendation = $this->homeGroupService->getBestMatchForUser($request->user());

        return response()->json([
            'success' => true,
            'data'    => $recommendation,
        ]);
    }
}
