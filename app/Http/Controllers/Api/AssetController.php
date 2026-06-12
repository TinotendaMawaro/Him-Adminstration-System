<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Asset;
use App\Models\Partner;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class AssetController extends Controller
{
    /** GET /api/assets */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Asset::with(['zone', 'partner.user']);

        if ($user->isPastor() && $user->zone_id) {
            $query->where(function ($q) use ($user) {
                $q->where('zone_id', $user->zone_id)
                  ->orWhereHas('partner', function ($q2) use ($user) {
                      $q2->where('zone_id', $user->zone_id);
                  });
            });
        } elseif ($user->isMember() || $user->isPartner()) {
            $partner = $user->partner;
            if ($partner) {
                $query->where(function ($q) use ($partner, $user) {
                    $q->where('assigned_to_partner_id', $partner->id)
                      ->orWhere('zone_id', $user->zone_id);
                });
            } else {
                $query->where('zone_id', $user->zone_id);
            }
        }

        $assets = $query->orderByDesc('created_at')->paginate(25);

        return response()->json([
            'success' => true,
            'data' => $assets->items(),
            'meta' => [
                'current_page' => $assets->currentPage(),
                'last_page' => $assets->lastPage(),
                'total' => $assets->total(),
            ],
        ]);
    }

    /** GET /api/assets/options */
    public function options(Request $request): JsonResponse
    {
        $user = $request->user();

        $zones = [];
        if ($user->isPastor() || $user->isFinance() || $user->isMaster()) {
            $zones = \App\Models\Zone::orderBy('name')->get(['id', 'name']);
        } else {
            $zones = \App\Models\Zone::where('id', $user->zone_id)->get(['id', 'name']);
        }

        $partners = [];
        if ($user->zone_id) {
            $partners = Partner::with('user')
                ->where('zone_id', $user->zone_id)
                ->get()
                ->map(fn($p) => [
                    'id' => $p->id,
                    'label' => $p->full_name . ' (' . $p->tier->getLabel() . ')',
                ]);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'zones' => $zones,
                'partners' => $partners,
                'categories' => ['equipment', 'vehicle', 'furniture', 'electronics', 'other'],
                'conditions' => ['new', 'good', 'fair', 'poor'],
                'statuses' => ['available', 'assigned', 'donated', 'disposed'],
            ],
        ]);
    }

    /** POST /api/assets */
    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', Asset::class);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'category' => ['required', 'string', Rule::in(['equipment', 'vehicle', 'furniture', 'electronics', 'other'])],
            'condition' => ['required', 'string', Rule::in(['new', 'good', 'fair', 'poor'])],
            'value' => ['nullable', 'numeric', 'min:0'],
            'zone_id' => ['nullable', 'exists:zones,id'],
            'assigned_to_partner_id' => ['nullable', 'exists:partners,id'],
            'status' => ['required', 'string', Rule::In(['available', 'assigned', 'donated', 'disposed'])],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $validated['assigned_to_partner_id'] = $validated['assigned_to_partner_id'] ?? null;
        $asset = Asset::create($validated);

        return response()->json([
            'success' => true,
            'data' => $asset->load(['zone', 'partner.user']),
        ], 201);
    }

    /** GET /api/assets/{id} */
    public function show(int $id): JsonResponse
    {
        $asset = Asset::with(['zone', 'partner.user'])->findOrFail($id);
        $this->authorize('view', $asset);

        return response()->json(['success' => true, 'data' => $asset]);
    }

    /** PUT /api/assets/{id} */
    public function update(Request $request, int $id): JsonResponse
    {
        $asset = Asset::findOrFail($id);
        $this->authorize('update', $asset);

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'category' => ['sometimes', 'string', Rule::in(['equipment', 'vehicle', 'furniture', 'electronics', 'other'])],
            'condition' => ['sometimes', 'string', Rule::in(['new', 'good', 'fair', 'poor'])],
            'value' => ['nullable', 'numeric', 'min:0'],
            'zone_id' => ['nullable', 'exists:zones,id'],
            'assigned_to_partner_id' => ['nullable', 'exists:partners,id'],
            'status' => ['sometimes', 'string', Rule::In(['available', 'assigned', 'donated', 'disposed'])],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $asset->update($validated);

        return response()->json([
            'success' => true,
            'data' => $asset->load(['zone', 'partner.user']),
        ]);
    }

    /** DELETE /api/assets/{id} */
    public function destroy(int $id): JsonResponse
    {
        $asset = Asset::findOrFail($id);
        $this->authorize('delete', $asset);
        $asset->delete();

        return response()->json(['success' => true, 'message' => 'Asset deleted.']);
    }
}
