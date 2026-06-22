<?php

namespace App\Models;

use App\Enums\PartnerTier;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class PartnerPoint extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'partner_id', 'payment_id', 'points', 'source', 'description', 'balance_after',
    ];

    protected function casts(): array
    {
        return [
            'points'      => 'integer',
            'balance_after' => 'integer',
            'tier'        => PartnerTier::class,
        ];
    }

    public function partner(): BelongsTo { return $this->belongsTo(Partner::class); }
    public function payment(): BelongsTo { return $this->belongsTo(Payment::class); }
}
