<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class PartnerRedemption extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'partner_id', 'reward_id', 'points_transaction_id', 'points_used',
        'status', 'notes', 'approved_by', 'approved_at',
    ];

    protected function casts(): array
    {
        return [
            'points_used' => 'integer',
            'approved_at' => 'datetime',
        ];
    }

    public function partner(): BelongsTo
    {
        return $this->belongsTo(Partner::class);
    }

    public function reward(): BelongsTo
    {
        return $this->belongsTo(PartnerReward::class);
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function pointsTransaction(): BelongsTo
    {
        return $this->belongsTo(PartnerPoint::class, 'points_transaction_id');
    }
}
