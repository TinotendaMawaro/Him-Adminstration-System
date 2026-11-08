<?php

namespace App\Models\Market;

use Illuminate\Database\Eloquent\Model;

class Quote extends Model
{
    protected $table = 'market_quotes';

    protected $fillable = ['reference', 'listing_id', 'buyer_id', 'seller_id', 'quantity', 'message', 'status', 'quoted_price', 'seller_reply', 'valid_until'];

    protected function casts(): array
    {
        return ['quoted_price' => 'decimal:2', 'valid_until' => 'date'];
    }

    public function listing() { return $this->belongsTo(\App\Models\Market\Listing::class, 'listing_id')->withTrashed(); }
    public function buyer() { return $this->belongsTo(\App\Models\User::class, 'buyer_id'); }
    public function seller() { return $this->belongsTo(\App\Models\User::class, 'seller_id'); }
}
