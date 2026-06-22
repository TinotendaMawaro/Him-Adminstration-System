<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class PartnerStatement extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'partner_id', 'statement_number', 'period_start', 'period_end',
        'opening_balance', 'total_contributions', 'total_redemptions',
        'closing_balance', 'format', 'file_path', 'generated_by',
    ];

    protected function casts(): array
    {
        return [
            'period_start'   => 'date',
            'period_end'     => 'date',
            'opening_balance'  => 'decimal:2',
            'total_contributions' => 'decimal:2',
            'total_redemptions'   => 'decimal:2',
            'closing_balance'     => 'decimal:2',
        ];
    }

    public function partner(): BelongsTo
    {
        return $this->belongsTo(Partner::class);
    }

    public function generatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'generated_by');
    }
}
