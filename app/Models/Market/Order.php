<?php

namespace App\Models\Market;

use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    protected $table = 'market_orders';

    protected $fillable = ['reference', 'listing_id', 'buyer_id', 'seller_id', 'quantity', 'unit_price', 'total', 'currency', 'status', 'buyer_note', 'seller_note', 'contact_phone', 'delivery_address'];

    protected function casts(): array
    {
        return ['unit_price' => 'decimal:2', 'total' => 'decimal:2'];
    }

    public function listing() { return $this->belongsTo(\App\Models\Market\Listing::class, 'listing_id')->withTrashed(); }
    public function buyer() { return $this->belongsTo(\App\Models\User::class, 'buyer_id'); }
    public function seller() { return $this->belongsTo(\App\Models\User::class, 'seller_id'); }
}
