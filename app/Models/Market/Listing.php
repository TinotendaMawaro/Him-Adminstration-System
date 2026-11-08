<?php

namespace App\Models\Market;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Listing extends Model
{
    use SoftDeletes;

    protected $table = 'market_listings';

    protected $fillable = ['seller_id', 'title', 'description', 'category', 'price', 'currency', 'price_type', 'stock', 'images', 'location', 'status', 'views_count', 'orders_count'];

    protected function casts(): array
    {
        return ['images' => 'array', 'price' => 'decimal:2'];
    }

    public function seller() { return $this->belongsTo(\App\Models\User::class, 'seller_id'); }
}
