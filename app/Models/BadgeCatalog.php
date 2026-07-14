<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BadgeCatalog extends Model
{
    protected $fillable = ['slug', 'name', 'description', 'icon', 'tier', 'color', 'sort_order'];
}
