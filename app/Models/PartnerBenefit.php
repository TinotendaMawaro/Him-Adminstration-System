<?php

namespace App\Models;

use App\Enums\PartnerTier;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class PartnerBenefit extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'partner_id',
        'tier',
        'benefit_key',
        'unlocked_at',
        'unlocked_by_payment_id',
    ];

    protected function casts(): array
    {
        return [
            'unlocked_at' => 'datetime',
            'tier'        => PartnerTier::class,
        ];
    }

    public function partner(): BelongsTo
    {
        return $this->belongsTo(Partner::class);
    }

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class, 'unlocked_by_payment_id');
    }
}
