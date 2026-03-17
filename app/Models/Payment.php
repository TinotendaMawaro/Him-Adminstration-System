<?php

namespace App\Models;

use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Enums\PaymentType;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Payment extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'reference', 'user_id', 'event_registration_id',
        'type', 'amount', 'currency',
        'status', 'method', 'transaction_id',
        'notes', 'paid_at', 'recorded_by',
    ];

    protected function casts(): array
    {
        return [
            'type'    => PaymentType::class,    // ← enum cast
            'status'  => PaymentStatus::class,  // ← enum cast
            'method'  => PaymentMethod::class,  // ← enum cast
            'amount'  => 'decimal:2',
            'paid_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (self $payment) {
            if (empty($payment->reference)) {
                $payment->reference = strtoupper('PAY-' . Str::random(10));
            }
        });
    }

    public function scopeCompleted(Builder $query): Builder
    {
        return $query->where('status', PaymentStatus::Completed);
    }

    public function scopeByType(Builder $query, PaymentType|string $type): Builder
    {
        return $query->where('type', $type instanceof PaymentType ? $type : PaymentType::from($type));
    }

    public function scopeForEvent(Builder $query): Builder
    {
        return $query->whereNotNull('event_registration_id');
    }

    public function scopeNonEvent(Builder $query): Builder
    {
        return $query->whereNull('event_registration_id');
    }

    public function user(): BelongsTo             { return $this->belongsTo(User::class); }
    public function eventRegistration(): BelongsTo { return $this->belongsTo(EventRegistration::class); }
    public function recordedBy(): BelongsTo        { return $this->belongsTo(User::class, 'recorded_by'); }
}
