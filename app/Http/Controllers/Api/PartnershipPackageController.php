<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\PartnershipPackageResource;
use App\Models\PartnershipPackage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PartnershipPackageController extends Controller
{
    public function index(): JsonResponse
    {
        $packages = PartnershipPackage::active()->ordered()->get();
        return response()->json(['success' => true, 'data' => PartnershipPackageResource::collection($packages)]);
    }

    public function show($id): JsonResponse
    {
        $package = PartnershipPackage::find($id);
        if (!$package) {
            return response()->json(['success' => false, 'message' => 'Package not found'], 404);
        }
        return response()->json(['success' => true, 'data' => new PartnershipPackageResource($package)]);
    }
}
