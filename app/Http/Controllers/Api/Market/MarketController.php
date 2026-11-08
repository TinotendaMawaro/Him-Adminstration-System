<?php

namespace App\Http\Controllers\Api\Market;

use App\Http\Controllers\Controller;
use App\Models\Market\Listing;
use App\Models\Market\Order;
use App\Models\Market\Quote;
use App\Services\Market\MarketService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/** The partners-only marketplace API. Anyone signed in can browse, order and ask for quotes; only active partners can sell. */
class MarketController extends Controller
{
    public function __construct(private MarketService $market) {}

    public function meta(Request $r): JsonResponse
    {
        return response()->json(['success' => true, 'data' => [
            'can_sell' => $this->market->canSell($r->user()), 'categories' => MarketService::CATEGORIES, 'currencies' => MarketService::CURRENCIES,
            'seller_rule' => 'Only active partners can sell. Join the partnership programme to open your shop.',
        ]]);
    }

    public function index(Request $r): JsonResponse
    {
        $f = $r->validate(['q' => ['nullable', 'string', 'max:60'], 'category' => ['nullable', 'string', 'max:40'], 'seller_id' => ['nullable', 'integer'], 'sort' => ['nullable', Rule::in(['new', 'price_low', 'price_high', 'popular'])], 'page' => ['nullable', 'integer', 'min:1', 'max:200']]);

        return response()->json(['success' => true] + $this->market->browse($r->user(), $f));
    }

    public function show(Request $r, int $id): JsonResponse
    {
        $l = Listing::with('seller.zone:id,name')->whereIn('status', ['active', 'sold_out', 'paused'])->findOrFail($id);
        abort_if($l->status === 'paused' && $l->seller_id !== $r->user()->id, 404);
        if ($l->seller_id !== $r->user()->id) {
            $l->increment('views_count');
        }

        return response()->json(['success' => true, 'data' => $this->market->listing($l, $r->user())]);
    }

    public function mine(Request $r): JsonResponse
    {
        $rows = Listing::with('seller.zone:id,name')->where('seller_id', $r->user()->id)->latest('id')->limit(100)->get();

        return response()->json(['success' => true, 'data' => $rows->map(fn ($l) => $this->market->listing($l, $r->user()))->values()]);
    }

    private function listingRules(): array
    {
        return [
            'title' => ['required', 'string', 'max:200'], 'description' => ['required', 'string', 'max:4000'], 'category' => ['required', 'string', 'max:40'],
            'price' => ['nullable', 'numeric', 'min:0'], 'currency' => ['nullable', 'string', 'size:3'], 'price_type' => ['nullable', Rule::in(['fixed', 'quote'])],
            'stock' => ['nullable', 'integer', 'min:0', 'max:1000000'], 'images' => ['nullable', 'array', 'max:6'], 'images.*' => ['string', 'max:500'],
            'location' => ['nullable', 'string', 'max:160'], 'status' => ['nullable', Rule::in(['active', 'paused'])],
        ];
    }

    public function store(Request $r): JsonResponse
    {
        $l = $this->market->saveListing($r->user(), $r->validate($this->listingRules()));

        return response()->json(['success' => true, 'data' => $this->market->listing($l->load('seller.zone:id,name'), $r->user())], 201);
    }

    public function update(Request $r, int $id): JsonResponse
    {
        $l = $this->market->saveListing($r->user(), $r->validate($this->listingRules()), Listing::findOrFail($id));

        return response()->json(['success' => true, 'data' => $this->market->listing($l->load('seller.zone:id,name'), $r->user())]);
    }

    public function destroy(Request $r, int $id): JsonResponse
    {
        $this->market->removeListing(Listing::findOrFail($id), $r->user());

        return response()->json(['success' => true]);
    }

    // ── Orders ────────────────────────────────────────────────────────────────────────────────────

    public function order(Request $r, int $id): JsonResponse
    {
        $d = $r->validate(['quantity' => ['nullable', 'integer', 'min:1', 'max:999'], 'note' => ['nullable', 'string', 'max:600'], 'contact_phone' => ['nullable', 'string', 'max:30'], 'delivery_address' => ['nullable', 'string', 'max:400']]);
        $o = $this->market->placeOrder($r->user(), Listing::findOrFail($id), $d);

        return response()->json(['success' => true, 'data' => $this->market->order($o, $r->user())], 201);
    }

    public function orders(Request $r): JsonResponse
    {
        $as = $r->query('as') === 'seller' ? 'seller' : 'buyer';
        abort_if($as === 'seller' && !$this->market->canSell($r->user()) && !Order::where('seller_id', $r->user()->id)->exists(), 403, 'You have no shop.');

        return response()->json(['success' => true, 'data' => $this->market->orders($r->user(), $as, $r->query('status'))]);
    }

    public function updateOrder(Request $r, int $id): JsonResponse
    {
        $v = $r->validate(['status' => ['required', Rule::in(['accepted', 'rejected', 'paid', 'shipped', 'completed', 'cancelled'])], 'note' => ['nullable', 'string', 'max:500']]);
        $o = $this->market->transition(Order::findOrFail($id), $r->user(), $v['status'], $v['note'] ?? null);

        return response()->json(['success' => true, 'data' => $this->market->order($o, $r->user())]);
    }

    // ── Quotes ────────────────────────────────────────────────────────────────────────────────────

    public function requestQuote(Request $r, int $id): JsonResponse
    {
        $d = $r->validate(['message' => ['required', 'string', 'max:1000'], 'quantity' => ['nullable', 'integer', 'min:1', 'max:9999']]);
        $q = $this->market->requestQuote($r->user(), Listing::findOrFail($id), $d);

        return response()->json(['success' => true, 'data' => $this->market->quote($q, $r->user())], 201);
    }

    public function quotes(Request $r): JsonResponse
    {
        return response()->json(['success' => true, 'data' => $this->market->quotes($r->user(), $r->query('as') === 'seller' ? 'seller' : 'buyer')]);
    }

    public function respondQuote(Request $r, int $id): JsonResponse
    {
        $d = $r->validate(['action' => ['required', Rule::in(['quote', 'decline', 'accept', 'cancel'])], 'price' => ['nullable', 'numeric', 'min:0.01'], 'reply' => ['nullable', 'string', 'max:600'], 'valid_days' => ['nullable', 'integer', 'min:1', 'max:60']]);

        return response()->json(['success' => true] + $this->market->respondQuote(Quote::findOrFail($id), $r->user(), $d));
    }
}
