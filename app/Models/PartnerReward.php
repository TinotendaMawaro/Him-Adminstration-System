<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class PartnerReward extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name', 'description', 'category', 'points_required',
        'monetary_value', 'image', 'stock', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'points_required'  => 'integer',
            'monetary_value'   => 'decimal:2',
            'stock'            => 'integer',
            'is_active'        => 'boolean',
        ];
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('points_required');
    }

    public function redemptions(): HasMany
    {
        return $this->hasMany(PartnerRedemption::class);
    }
}
