<?php

namespace App\Models;

use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Enums\PaymentType;
use App\Services\AuditTrail;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class Payment extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'reference', 'receipt_number', 'user_id', 'zone_id', 'event_registration_id',
        'type', 'amount', 'currency',
        'status', 'method', 'transaction_id',
        'notes', 'paid_at', 'recorded_by',
        'confirmed_at', 'confirmed_by', 'voided_at', 'voided_by', 'void_reason',
        'client_reference', 'gateway', 'gateway_order_id', 'gateway_url', 'gateway_status', 'gateway_payload', 'gateway_checked_at',
    ];

    protected function casts(): array
    {
        return [
            'type'         => PaymentType::class,
            'status'       => PaymentStatus::class,
            'method'       => PaymentMethod::class,
            'amount'       => 'decimal:2',
            'paid_at'      => 'datetime',
            'confirmed_at' => 'datetime',
            'voided_at'    => 'datetime',
            'gateway_payload'    => 'array',
            'gateway_checked_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (self $payment) {
            if (empty($payment->reference)) {
                $payment->reference = strtoupper('PAY-' . Str::random(10));
            }

            // Every payment is attributed to the payer's zone, which is what rolls up to regions.
            if (empty($payment->zone_id) && $payment->user_id) {
                $payment->zone_id = User::whereKey($payment->user_id)->value('zone_id');
            }
        });

        // A receipt is issued once, the moment a payment becomes completed.
        static::saving(function (self $payment) {
            if ($payment->status === PaymentStatus::Completed && empty($payment->receipt_number)) {
                $payment->receipt_number = static::nextReceiptNumber();
                $payment->paid_at ??= now();
            }
        });
    }

    /**
     * Gap-free sequential receipt number (REC-2026-000042), safe under concurrent requests.
     */
    public static function nextReceiptNumber(): string
    {
        $year = (int) now()->format('Y');

        return DB::transaction(function () use ($year) {
            DB::table('receipt_counters')->insertOrIgnore(['year' => $year, 'last_number' => 0]);

            $last = DB::table('receipt_counters')->where('year', $year)->lockForUpdate()->value('last_number');
            $next = $last + 1;
            DB::table('receipt_counters')->where('year', $year)->update(['last_number' => $next]);

            return sprintf('REC-%d-%06d', $year, $next);
        });
    }

    // ─── Workflow ─────────────────────────────────────────────────────────────

    public function isPending(): bool   { return $this->status === PaymentStatus::Pending; }
    public function isOnline(): bool    { return $this->gateway !== null && $this->client_reference !== null; }
    public function isFinal(): bool     { return in_array($this->status, [PaymentStatus::Completed, PaymentStatus::Voided, PaymentStatus::Refunded], true); }

    public function confirm(User $by): void
    {
        abort_unless($this->isPending(), 422, 'Only pending payments can be confirmed.');

        $this->forceFill([
            'status'       => PaymentStatus::Completed,
            'paid_at'      => $this->paid_at ?? now(),
            'confirmed_at' => now(),
            'confirmed_by' => $by->id,
        ])->save();

        $this->syncEventRegistration();

        AuditTrail::record('payment.confirmed', $by, $this, [
            'receipt' => $this->receipt_number, 'amount' => (string) $this->amount, 'type' => $this->type?->value,
        ], $this->user_id);
    }

    public function void(User $by, string $reason): void
    {
        abort_if($this->status === PaymentStatus::Voided, 422, 'Payment is already voided.');

        $wasCompleted = $this->status === PaymentStatus::Completed;

        $this->forceFill([
            'status'      => PaymentStatus::Voided,
            'voided_at'   => now(),
            'voided_by'   => $by->id,
            'void_reason' => $reason,
        ])->save();

        if ($wasCompleted) {
            $this->syncEventRegistration();
        }

        AuditTrail::record('payment.voided', $by, $this, [
            'receipt' => $this->receipt_number, 'amount' => (string) $this->amount, 'reason' => $reason,
        ], $this->user_id);
    }

    /** Keep an event registration's paid amount in step with its completed payments. */
    public function syncEventRegistration(): void
    {
        if (!$this->event_registration_id) {
            return;
        }

        $reg = EventRegistration::find($this->event_registration_id);
        if (!$reg) {
            return;
        }

        $paid = $reg->payments()->where('status', PaymentStatus::Completed->value)->sum('amount');
        $update = ['amount_paid' => $paid];
        if ($paid >= $reg->amount_due && $reg->amount_due > 0 && $reg->status?->value === 'pending') {
            $update['status'] = 'confirmed';
        }
        $reg->update($update);
    }

    // ─── Scopes ───────────────────────────────────────────────────────────────

    public function scopeCompleted(Builder $query): Builder
    {
        return $query->where('payments.status', PaymentStatus::Completed->value);
    }

    /** Pending payments a person at the finance desk must act on (online attempts are settled by the gateway, not by hand). */
    public function scopeNeedsManualVerification(Builder $query): Builder
    {
        return $query->where('payments.status', PaymentStatus::Pending->value)
            ->where(fn ($q) => $q->whereNull('payments.gateway')->orWhere('payments.gateway_status', 'SUCCESS_MISMATCH'));
    }

    public function scopeOnline(Builder $query): Builder
    {
        return $query->whereNotNull('payments.gateway');
    }

    public function scopeByType(Builder $query, PaymentType|string $type): Builder
    {
        return $query->where('payments.type', $type instanceof PaymentType ? $type->value : $type);
    }

    public function scopeForEvent(Builder $query): Builder
    {
        return $query->whereNotNull('event_registration_id');
    }

    public function scopeNonEvent(Builder $query): Builder
    {
        return $query->whereNull('event_registration_id');
    }

    // ─── Relationships ────────────────────────────────────────────────────────

    public function user(): BelongsTo              { return $this->belongsTo(User::class); }
    public function zone(): BelongsTo              { return $this->belongsTo(Zone::class); }
    public function eventRegistration(): BelongsTo { return $this->belongsTo(EventRegistration::class); }
    public function recordedBy(): BelongsTo        { return $this->belongsTo(User::class, 'recorded_by'); }
    public function confirmedBy(): BelongsTo       { return $this->belongsTo(User::class, 'confirmed_by'); }
    public function voidedBy(): BelongsTo          { return $this->belongsTo(User::class, 'voided_by'); }
}
