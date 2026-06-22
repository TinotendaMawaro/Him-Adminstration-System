<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class PartnerBenefitCatalog extends Model
{
    use SoftDeletes;

    protected $table = 'partner_benefit_catalog';

    protected $fillable = [
        'key', 'label', 'description', 'icon', 'min_package_order', 'sort_order', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'min_package_order' => 'integer',
            'sort_order'        => 'integer',
            'is_active'         => 'boolean',
        ];
    }

    public function partnerBenefits(): HasMany
    {
        return $this->hasMany(PartnerBenefit::class, 'catalog_id');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered($query)
    {
        return $query->orderBy('sort_order')->orderBy('min_package_order');
    }
}
