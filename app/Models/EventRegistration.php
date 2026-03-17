<?php

namespace App\Models;

use App\Enums\RegistrationStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class EventRegistration extends Model
{
    protected $fillable = [
        'event_id', 'user_id', 'reference_number',
        'status', 'amount_due', 'amount_paid', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'status'      => RegistrationStatus::class,  // ← enum cast
            'amount_due'  => 'decimal:2',
            'amount_paid' => 'decimal:2',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (self $r) {
            if (empty($r->reference_number)) {
                $r->reference_number = strtoupper('REG-' . Str::random(8));
            }
        });
    }

    public function event(): BelongsTo    { return $this->belongsTo(Event::class); }
    public function user(): BelongsTo     { return $this->belongsTo(User::class); }
    public function payments(): HasMany   { return $this->hasMany(Payment::class); }

    public function getBalanceDueAttribute(): float
    {
        return max(0, $this->amount_due - $this->amount_paid);
    }

    public function getIsFullyPaidAttribute(): bool
    {
        return $this->amount_due > 0 && $this->amount_paid >= $this->amount_due;
    }
}
