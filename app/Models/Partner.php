<?php

namespace App\Models;

use App\Enums\ContributionType;
use App\Enums\PartnerStatus;
use App\Enums\PartnerTier;
use App\Enums\PledgeFrequency;
use App\Models\PartnershipPackage;
use App\Models\PartnerPoint;
use App\Models\PartnerRedemption;
use App\Models\PartnerStatement;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Partner extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id', 'member_id', 'name', 'surname', 'partner_number',
        'tier', 'pledge_amount', 'pledge_frequency', 'contribution_type',
        'partnership_date', 'tier_updated_at', 'status', 'zone_id',
        'next_tier_reminder_at', 'last_benefit_unlock_at',
        'package_id', 'renewal_date', 'cancelled_at', 'suspended_at',
        'notes', 'points_earned', 'payment_method', 'payment_reference', 'payment_notes',
        'renewal_terms', 'payment_proof_path',
    ];

    protected function casts(): array
    {
        return [
            'tier'             => PartnerTier::class,
            'status'           => PartnerStatus::class,
            'pledge_frequency' => PledgeFrequency::class,
            'contribution_type'=> ContributionType::class,
            'partnership_date' => 'date',
            'tier_updated_at'  => 'date',
            'next_tier_reminder_at' => 'date',
            'last_benefit_unlock_at' => 'datetime',
            'renewal_date'     => 'date',
            'cancelled_at'     => 'date',
            'suspended_at'     => 'date',
            'pledge_amount'    => 'decimal:2',
            'points_earned'    => 'integer',
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

    public function scopePending(Builder $query): Builder
    {
        return $query->where('status', PartnerStatus::Pending);
    }

    public static function generatePartnerNumber(string $zoneCode): string
    {
        $prefix = 'PT-' . $zoneCode . '-';
        $last = static::where('partner_number', 'LIKE', $prefix . '%')
            ->orderByDesc('partner_number')
            ->first();

        $next = $last
            ? ((int) substr(strrchr($last->partner_number, '-'), 1)) + 1
            : 1;

        return $prefix . str_pad((string) $next, 4, '0', STR_PAD_LEFT);
    }

    public function user(): BelongsTo   { return $this->belongsTo(User::class); }
    public function member(): BelongsTo { return $this->belongsTo(Member::class); }
    public function zone(): BelongsTo   { return $this->belongsTo(Zone::class); }
    public function package(): BelongsTo { return $this->belongsTo(PartnershipPackage::class, 'package_id'); }

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

    public function points(): HasMany
    {
        return $this->hasMany(PartnerPoint::class);
    }

    public function statements(): HasMany
    {
        return $this->hasMany(PartnerStatement::class);
    }

    public function redemptions(): HasMany
    {
        return $this->hasMany(PartnerRedemption::class);
    }

    public function getFullNameAttribute(): string { return "{$this->name} {$this->surname}"; }

    public function getTotalGivingAttribute(): float
    {
        return $this->payments()->where('status', \App\Enums\PaymentStatus::Completed)->sum('amount');
    }

    protected static function booted(): void
    {
        static::creating(function (self $partner) {
            if (empty($partner->partner_number) && $partner->zone_id) {
                $zone = \App\Models\Zone::find($partner->zone_id);
                $zoneCode = $zone ? $zone->code : 'GENERAL';
                $partner->partner_number = static::generatePartnerNumber($zoneCode);
            }
        });
    }
}
