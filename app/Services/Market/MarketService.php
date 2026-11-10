<?php

namespace App\Services\Market;

use App\Models\Community\Profile;
use App\Models\Market\Listing;
use App\Models\Market\Order;
use App\Models\Market\Quote;
use App\Models\Notification;
use App\Models\Partner;
use App\Models\User;
use App\Services\Community\CommunityService;
use App\Support\MediaLinks;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * The partners-only marketplace. Only ACTIVE PARTNERS can list products or services; every member can browse, order
 * or ask a seller for a quote. Orders and quotes are tracked here (status, notes, notifications); payment is arranged
 * between buyer and seller, so the platform never holds anyone's money.
 */
class MarketService
{
    public const CATEGORIES = ['Food & groceries', 'Clothing & fashion', 'Beauty & health', 'Books & media', 'Electronics', 'Home & garden', 'Services', 'Education & training', 'Agriculture', 'Events & catering', 'Art & crafts', 'Other'];
    public const CURRENCIES = ['USD', 'ZWG', 'ZAR'];
    public const MAX_ACTIVE_LISTINGS = 40;

    public function __construct(private CommunityService $community) {}

    // ── Who may sell ──────────────────────────────────────────────────────────────────────────────

    public function canSell(User $u): bool
    {
        return $u->is_active && app(\App\Services\PartnershipService::class)->inGoodStanding($u);
    }

    public function assertCanSell(User $u): void
    {
        abort_unless($this->canSell($u), 403, 'Only active partners can sell in the marketplace. Join the partnership programme to open your shop.');
        $this->community->assertCanContribute($u);
    }

    // ── Presenting ────────────────────────────────────────────────────────────────────────────────

    public function listing(Listing $l, ?User $viewer = null): array
    {
        $seller = $l->relationLoaded('seller') ? $l->seller : $l->seller()->with('zone:id,name')->first();

        return [
            'id' => $l->id, 'title' => $l->title, 'description' => $l->description, 'category' => $l->category,
            'price' => $l->price !== null ? (float) $l->price : null, 'currency' => $l->currency, 'price_type' => $l->price_type,
            'stock' => $l->stock, 'in_stock' => $l->stock === null || $l->stock > 0, 'images' => $l->images ?? [], 'location' => $l->location,
            'status' => $l->status, 'views' => $l->views_count, 'orders' => $l->orders_count, 'created_at' => $l->created_at?->toIso8601String(),
            'seller' => $seller ? $this->community->userMini($seller) : null,
            'mine' => $viewer && $l->seller_id === $viewer->id,
        ];
    }

    public function browse(User $viewer, array $f): array
    {
        $hidden = $this->community->hiddenAuthorIds($viewer);
        $q = Listing::with('seller.zone:id,name')->where('status', 'active');

        if ($hidden) {
            $q->whereNotIn('seller_id', $hidden);
        }
        if (!empty($f['category']) && in_array($f['category'], self::CATEGORIES, true)) {
            $q->where('category', $f['category']);
        }
        if (!empty($f['seller_id'])) {
            $q->where('seller_id', (int) $f['seller_id']);
        }
        if (($f['q'] ?? '') !== '') {
            $like = '%' . addcslashes(trim($f['q']), '%_\\') . '%';
            $q->where(fn ($w) => $w->where('title', 'like', $like)->orWhere('description', 'like', $like));
        }
        match ($f['sort'] ?? 'new') {
            'price_low' => $q->orderByRaw('price is null, price asc'),
            'price_high' => $q->orderByRaw('price is null, price desc'),
            'popular' => $q->orderByDesc('orders_count')->orderByDesc('views_count'),
            default => $q->latest('id'),
        };

        $page = max(1, (int) ($f['page'] ?? 1));
        $rows = $q->forPage($page, 21)->get();

        return ['items' => $rows->take(20)->map(fn ($l) => $this->listing($l, $viewer))->all(), 'next_page' => $rows->count() > 20 ? $page + 1 : null];
    }

    // ── Listings (partners only) ──────────────────────────────────────────────────────────────────

    public function saveListing(User $seller, array $d, ?Listing $existing = null): Listing
    {
        $this->assertCanSell($seller);
        abort_if($existing && $existing->seller_id !== $seller->id, 403, 'This is not your listing.');

        $title = $this->community->clean($d['title'] ?? '', 120);
        $description = $this->community->clean($d['description'] ?? '', 2000);
        if (mb_strlen($title) < 3 || mb_strlen($description) < 10) {
            throw ValidationException::withMessages(['title' => 'Add a title and a description (at least 10 characters).']);
        }

        $category = in_array($d['category'] ?? '', self::CATEGORIES, true) ? $d['category'] : throw ValidationException::withMessages(['category' => 'Choose a category.']);
        $type = ($d['price_type'] ?? 'fixed') === 'quote' ? 'quote' : 'fixed';
        $price = null;
        if ($type === 'fixed') {
            $price = is_numeric($d['price'] ?? null) ? round((float) $d['price'], 2) : throw ValidationException::withMessages(['price' => 'Enter a price, or choose "Request a quote".']);
            if ($price <= 0 || $price > 1000000) {
                throw ValidationException::withMessages(['price' => 'Enter a sensible price.']);
            }
        }

        $images = [];
        foreach (array_slice((array) ($d['images'] ?? []), 0, 6) as $url) {
            if ($i = MediaLinks::image((string) $url)) {
                $images[] = $i['url'];
            } else {
                throw ValidationException::withMessages(['images' => 'Photos must be https image links.']);
            }
        }

        $currency = in_array($d['currency'] ?? 'USD', self::CURRENCIES, true) ? ($d['currency'] ?? 'USD') : 'USD';
        $stock = isset($d['stock']) && $d['stock'] !== '' ? max(0, (int) $d['stock']) : null;

        if (!$existing && Listing::where('seller_id', $seller->id)->whereIn('status', ['active', 'paused'])->count() >= self::MAX_ACTIVE_LISTINGS) {
            throw ValidationException::withMessages(['title' => 'You have reached the limit of ' . self::MAX_ACTIVE_LISTINGS . ' listings.']);
        }

        $attrs = [
            'title' => $title, 'description' => $description, 'category' => $category, 'price' => $price, 'currency' => $currency, 'price_type' => $type,
            'stock' => $stock, 'images' => $images ?: null, 'location' => $this->community->clean($d['location'] ?? '', 120) ?: null,
        ];

        if ($existing) {
            if ($existing->status === 'suspended') {
                abort(403, 'This listing was suspended by head office.');
            }
            $attrs['status'] = $stock === 0 ? 'sold_out' : (in_array($d['status'] ?? '', ['active', 'paused'], true) ? $d['status'] : ($existing->status === 'sold_out' && $stock !== 0 ? 'active' : $existing->status));
            $existing->update($attrs);

            return $existing->refresh();
        }

        return Listing::create($attrs + ['seller_id' => $seller->id, 'status' => $stock === 0 ? 'sold_out' : 'active']);
    }

    public function removeListing(Listing $l, User $actor): void
    {
        abort_unless($l->seller_id === $actor->id || $actor->isMaster(), 403);
        $l->delete();
    }

    // ── Orders ────────────────────────────────────────────────────────────────────────────────────

    private function ref(string $prefix): string
    {
        return $prefix . '-' . strtoupper(Str::random(6));
    }

    public function order(Order $o, User $viewer): array
    {
        $o->loadMissing(['listing', 'buyer.zone:id,name', 'seller.zone:id,name']);

        return [
            'id' => $o->id, 'reference' => $o->reference, 'status' => $o->status, 'quantity' => $o->quantity,
            'unit_price' => (float) $o->unit_price, 'total' => (float) $o->total, 'currency' => $o->currency,
            'buyer_note' => $o->buyer_note, 'seller_note' => $o->seller_note, 'contact_phone' => $o->contact_phone, 'delivery_address' => $o->delivery_address,
            'listing' => $o->listing ? ['id' => $o->listing->id, 'title' => $o->listing->title, 'image' => ($o->listing->images[0] ?? null)] : null,
            'buyer' => $this->community->userMini($o->buyer), 'seller' => $this->community->userMini($o->seller),
            'role' => $o->buyer_id === $viewer->id ? 'buyer' : 'seller', 'created_at' => $o->created_at->toIso8601String(), 'updated_at' => $o->updated_at->toIso8601String(),
        ];
    }

    public function placeOrder(User $buyer, Listing $l, array $d): Order
    {
        $this->community->assertCanContribute($buyer);
        abort_unless($l->status === 'active', 422, 'This item is not available.');
        abort_if($l->seller_id === $buyer->id, 422, 'You cannot order your own listing.');
        abort_if($l->price_type === 'quote' || $l->price === null, 422, 'This item is sold by quote. Request a quote instead.');
        abort_if(in_array($l->seller_id, $this->community->hiddenAuthorIds($buyer), true), 403);

        $qty = max(1, min(999, (int) ($d['quantity'] ?? 1)));
        if ($l->stock !== null && $qty > $l->stock) {
            throw ValidationException::withMessages(['quantity' => "Only {$l->stock} left."]);
        }
        if (Order::where('buyer_id', $buyer->id)->where('status', 'pending')->where('created_at', '>=', now()->subHour())->count() >= 10) {
            throw ValidationException::withMessages(['quantity' => 'You have several orders waiting for sellers. Please wait for replies.']);
        }

        return $this->makeOrder($buyer, $l, $qty, (float) $l->price, $d);
    }

    private function makeOrder(User $buyer, Listing $l, int $qty, float $unit, array $d): Order
    {
        $order = Order::create([
            'reference' => $this->ref('ORD'), 'listing_id' => $l->id, 'buyer_id' => $buyer->id, 'seller_id' => $l->seller_id, 'quantity' => $qty,
            'unit_price' => $unit, 'total' => round($unit * $qty, 2), 'currency' => $l->currency, 'status' => 'pending',
            'buyer_note' => $this->community->clean($d['note'] ?? '', 500) ?: null,
            'contact_phone' => Str::limit(preg_replace('/[^0-9+ ]/', '', (string) ($d['contact_phone'] ?? '')), 30, '') ?: null,
            'delivery_address' => $this->community->clean($d['delivery_address'] ?? '', 300) ?: null,
        ]);

        $this->tell($l->seller_id, "New order {$order->reference}", "{$buyer->name} ordered {$qty} × {$l->title} (" . number_format($order->total, 2) . " {$l->currency})");

        return $order;
    }

    /** seller: pending→accepted|rejected, accepted→paid|shipped, paid→shipped, shipped→completed. buyer: cancel while pending/accepted; confirm receipt. */
    public function transition(Order $o, User $actor, string $to, ?string $note = null): Order
    {
        $isSeller = $o->seller_id === $actor->id;
        $isBuyer = $o->buyer_id === $actor->id;
        abort_unless($isSeller || $isBuyer || $actor->isMaster(), 403);

        $sellerMoves = ['pending' => ['accepted', 'rejected'], 'accepted' => ['paid', 'shipped', 'cancelled'], 'paid' => ['shipped'], 'shipped' => ['completed']];
        $buyerMoves = ['pending' => ['cancelled'], 'accepted' => ['cancelled'], 'shipped' => ['completed']];
        $allowed = $isSeller ? ($sellerMoves[$o->status] ?? []) : ($buyerMoves[$o->status] ?? []);
        if ($actor->isMaster() && !$isSeller && !$isBuyer) {
            $allowed = ['cancelled'];
        }
        if (!in_array($to, $allowed, true)) {
            throw ValidationException::withMessages(['status' => "This order cannot go from {$o->status} to {$to}."]);
        }

        return DB::transaction(function () use ($o, $actor, $to, $note, $isSeller) {
            $o = Order::whereKey($o->id)->lockForUpdate()->firstOrFail();
            $listing = Listing::withTrashed()->whereKey($o->listing_id)->lockForUpdate()->first();

            if ($to === 'accepted' && $listing && $listing->stock !== null) {
                if ($listing->stock < $o->quantity) {
                    throw ValidationException::withMessages(['status' => "Not enough stock (only {$listing->stock} left)."]);
                }
                $listing->decrement('stock', $o->quantity);
                if ($listing->fresh()->stock === 0) {
                    $listing->update(['status' => 'sold_out']);
                }
            }
            // Cancelling after acceptance gives the stock back.
            if ($to === 'cancelled' && in_array($o->status, ['accepted', 'paid'], true) && $listing && $listing->stock !== null) {
                $listing->increment('stock', $o->quantity);
                if ($listing->status === 'sold_out') {
                    $listing->update(['status' => 'active']);
                }
            }
            if ($to === 'accepted') {
                Listing::whereKey($o->listing_id)->increment('orders_count');
            }

            $o->update(['status' => $to] + ($isSeller && $note ? ['seller_note' => $this->community->clean($note, 500)] : []));

            $other = $isSeller ? $o->buyer_id : $o->seller_id;
            $this->tell($other, "Order {$o->reference}: {$to}", $note ? $this->community->clean($note, 120) : 'Open the order for details.');

            return $o;
        });
    }

    public function orders(User $viewer, string $as = 'buyer', ?string $status = null): array
    {
        $q = Order::with(['listing', 'buyer.zone:id,name', 'seller.zone:id,name'])->where($as === 'seller' ? 'seller_id' : 'buyer_id', $viewer->id);
        if ($status) {
            $q->where('status', $status);
        }

        return $q->latest('id')->limit(100)->get()->map(fn ($o) => $this->order($o, $viewer))->all();
    }

    // ── Quotes ────────────────────────────────────────────────────────────────────────────────────

    public function quote(Quote $q, User $viewer): array
    {
        $q->loadMissing(['listing', 'buyer.zone:id,name', 'seller.zone:id,name']);

        return [
            'id' => $q->id, 'reference' => $q->reference, 'status' => $q->status, 'quantity' => $q->quantity, 'message' => $q->message,
            'quoted_price' => $q->quoted_price !== null ? (float) $q->quoted_price : null, 'seller_reply' => $q->seller_reply, 'valid_until' => $q->valid_until?->toDateString(),
            'expired' => $q->status === 'quoted' && $q->valid_until && $q->valid_until->isPast(),
            'listing' => $q->listing ? ['id' => $q->listing->id, 'title' => $q->listing->title, 'image' => ($q->listing->images[0] ?? null), 'currency' => $q->listing->currency] : null,
            'buyer' => $this->community->userMini($q->buyer), 'seller' => $this->community->userMini($q->seller),
            'role' => $q->buyer_id === $viewer->id ? 'buyer' : 'seller', 'created_at' => $q->created_at->toIso8601String(),
        ];
    }

    public function requestQuote(User $buyer, Listing $l, array $d): Quote
    {
        $this->community->assertCanContribute($buyer);
        abort_unless($l->status === 'active', 422, 'This item is not available.');
        abort_if($l->seller_id === $buyer->id, 422, 'You cannot request a quote on your own listing.');
        $message = $this->community->clean($d['message'] ?? '', 800);
        if (mb_strlen($message) < 5) {
            throw ValidationException::withMessages(['message' => 'Tell the seller what you need.']);
        }
        if (Quote::where('buyer_id', $buyer->id)->where('listing_id', $l->id)->whereIn('status', ['requested', 'quoted'])->exists()) {
            throw ValidationException::withMessages(['message' => 'You already have an open quote request for this item.']);
        }

        $q = Quote::create([
            'reference' => $this->ref('QTE'), 'listing_id' => $l->id, 'buyer_id' => $buyer->id, 'seller_id' => $l->seller_id,
            'quantity' => max(1, min(9999, (int) ($d['quantity'] ?? 1))), 'message' => $message, 'status' => 'requested',
        ]);
        $this->tell($l->seller_id, "Quote request {$q->reference}", "{$buyer->name} asks about {$l->title}");

        return $q;
    }

    /** seller: requested→quoted|declined. buyer: quoted→accepted(creates the order)|declined; or cancel a request. */
    public function respondQuote(Quote $q, User $actor, array $d): array
    {
        $action = (string) ($d['action'] ?? '');
        $isSeller = $q->seller_id === $actor->id;
        $isBuyer = $q->buyer_id === $actor->id;
        abort_unless($isSeller || $isBuyer, 403);

        return DB::transaction(function () use ($q, $actor, $d, $action, $isSeller) {
            $q = Quote::whereKey($q->id)->lockForUpdate()->firstOrFail();
            $order = null;

            if ($isSeller && $q->status === 'requested' && $action === 'quote') {
                $price = is_numeric($d['price'] ?? null) && $d['price'] > 0 ? round((float) $d['price'], 2) : throw ValidationException::withMessages(['price' => 'Enter your price.']);
                $days = max(1, min(60, (int) ($d['valid_days'] ?? 7)));
                $q->update(['status' => 'quoted', 'quoted_price' => $price, 'seller_reply' => $this->community->clean($d['reply'] ?? '', 500) ?: null, 'valid_until' => now()->addDays($days)->toDateString()]);
                $this->tell($q->buyer_id, "Quote {$q->reference}: " . number_format($price, 2), 'The seller replied to your request.');
            } elseif ($isSeller && in_array($q->status, ['requested', 'quoted'], true) && $action === 'decline') {
                $q->update(['status' => 'declined', 'seller_reply' => $this->community->clean($d['reply'] ?? '', 500) ?: $q->seller_reply]);
                $this->tell($q->buyer_id, "Quote {$q->reference} declined", 'The seller cannot supply this right now.');
            } elseif (!$isSeller && $q->status === 'quoted' && $action === 'accept') {
                if ($q->valid_until && $q->valid_until->isPast()) {
                    throw ValidationException::withMessages(['action' => 'This quote has expired. Ask for a new one.']);
                }
                $listing = Listing::findOrFail($q->listing_id);
                $q->update(['status' => 'accepted']);
                $order = $this->makeOrder($actor, $listing, $q->quantity, (float) $q->quoted_price, ['note' => "From quote {$q->reference}"]);
            } elseif (!$isSeller && in_array($q->status, ['requested', 'quoted'], true) && in_array($action, ['decline', 'cancel'], true)) {
                $q->update(['status' => 'cancelled']);
                $this->tell($q->seller_id, "Quote {$q->reference} cancelled", 'The buyer withdrew the request.');
            } else {
                throw ValidationException::withMessages(['action' => 'That is not possible for this quote right now.']);
            }

            return ['quote' => $this->quote($q->fresh(), $actor), 'order' => $order ? $this->order($order, $actor) : null];
        });
    }

    public function quotes(User $viewer, string $as = 'buyer'): array
    {
        return Quote::with(['listing', 'buyer.zone:id,name', 'seller.zone:id,name'])->where($as === 'seller' ? 'seller_id' : 'buyer_id', $viewer->id)
            ->latest('id')->limit(100)->get()->map(fn ($q) => $this->quote($q, $viewer))->all();
    }

    private function tell(int $userId, string $title, string $text): void
    {
        // Category "market" IS emailed (orders are time-sensitive), unlike likes and follows.
        Notification::create(['user_id' => $userId, 'title' => $title, 'message' => $text, 'type' => 'info', 'category' => 'market', 'is_read' => false]);
    }
}
