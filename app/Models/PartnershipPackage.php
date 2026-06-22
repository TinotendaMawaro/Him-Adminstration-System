<?php

namespace App\Models;

use App\Enums\PartnerStatus;
use App\Enums\PartnerTier;
use App\Enums\PledgeFrequency;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class PartnershipPackage extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name', 'slug', 'monthly_amount', 'benefits', 'impact_description',
        'color', 'icon', 'sort_order', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'monthly_amount'  => 'decimal:2',
            'is_active'       => 'boolean',
            'sort_order'      => 'integer',
            'benefits'        => 'array',
            'impact_description' => 'array',
        ];
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('sort_order')->orderBy('monthly_amount');
    }

    public function partners(): HasMany
    {
        return $this->hasMany(Partner::class, 'package_id');
    }
}
