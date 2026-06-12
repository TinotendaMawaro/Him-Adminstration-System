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

class Partner extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id', 'member_id', 'name', 'surname', 'partner_number',
        'tier', 'pledge_amount', 'pledge_frequency',
        'partnership_date', 'tier_updated_at', 'status', 'zone_id',
        'next_tier_reminder_at', 'last_benefit_unlock_at',
    ];

    protected function casts(): array
    {
        return [
            'tier'             => PartnerTier::class,     // ← enum cast
            'status'           => PartnerStatus::class,   // ← enum cast
            'pledge_frequency' => PledgeFrequency::class, // ← enum cast
            'partnership_date' => 'date',
            'tier_updated_at'  => 'date',
            'next_tier_reminder_at' => 'date',
            'last_benefit_unlock_at' => 'datetime',
            'pledge_amount'    => 'decimal:2',
        ];
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', PartnerStatus::Active);
    }

    public function scopeByTier(Builder $query, PartnerTier $tier): Builder
    {
        return $query->where('tier', $tier);
    }

    public function user(): BelongsTo   { return $this->belongsTo(User::class); }
    public function member(): BelongsTo { return $this->belongsTo(Member::class); }
    public function zone(): BelongsTo   { return $this->belongsTo(Zone::class); }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class, 'user_id', 'user_id')
            ->where('type', \App\Enums\PaymentType::Partnership);
    }

    public function benefits(): HasMany
    {
        return $this->hasMany(PartnerBenefit::class);
    }

    public function assets(): HasMany
    {
        return $this->hasMany(Asset::class, 'assigned_to_partner_id');
    }

    public function getFullNameAttribute(): string { return "{$this->name} {$this->surname}"; }

    public function getTotalGivingAttribute(): float
    {
        return $this->payments()->where('status', \App\Enums\PaymentStatus::Completed)->sum('amount');
    }
}
