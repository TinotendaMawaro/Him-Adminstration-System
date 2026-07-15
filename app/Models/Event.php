<?php

namespace App\Models;

use App\Enums\EventStatus;
use App\Enums\EventType;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Event extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'title', 'description', 'type', 'starts_at', 'ends_at',
        'venue_name', 'venue_address', 'zone_id', 'scope',
        'requires_registration', 'requires_payment',
        'registration_fee', 'currency', 'capacity',
        'registration_closes_at', 'status', 'is_public',
        'created_by', 'banner_image',
        'category', 'image',
        'host', 'theme', 'is_featured', 'is_livestream',
        'livestream_url', 'target_demographics', 'requires_checkin',
    ];

    protected function casts(): array
    {
        return [
            'status'                 => EventStatus::class,  // ← enum cast
            'starts_at'              => 'datetime',
            'ends_at'                => 'datetime',
            'registration_closes_at' => 'datetime',
            'requires_registration'  => 'boolean',
            'requires_payment'       => 'boolean',
            'is_public'              => 'boolean',
            'is_featured'            => 'boolean',
            'is_livestream'          => 'boolean',
            'requires_checkin'       => 'boolean',
            'registration_fee'       => 'decimal:2',
            'target_demographics'    => 'array',
        ];
    }

    // ─── Scopes ───────────────────────────────────────────────────────────────

    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', EventStatus::Published);
    }

    public function scopeUpcoming(Builder $query): Builder
    {
        return $query->where('starts_at', '>', now())->published();
    }

    public function scopeOpen(Builder $query): Builder
    {
        return $query->upcoming()
            ->where(function ($q) {
                $q->whereNull('registration_closes_at')
                    ->orWhere('registration_closes_at', '>', now());
            });
    }

    // ─── Relationships ────────────────────────────────────────────────────────

    public function zone(): BelongsTo      { return $this->belongsTo(Zone::class); }
    public function createdBy(): BelongsTo { return $this->belongsTo(User::class, 'created_by'); }

    public function registrations(): HasMany
    {
        return $this->hasMany(EventRegistration::class);
    }

    public function confirmedRegistrations(): HasMany
    {
        return $this->registrations()->where('status', \App\Enums\RegistrationStatus::Confirmed);
    }

    // ─── Accessors ────────────────────────────────────────────────────────────

    public function getRegistrationCountAttribute(): int
    {
        return $this->registrations()->count();
    }

    public function getSpotsRemainingAttribute(): ?int
    {
        if (!$this->capacity) return null;
        return max(0, $this->capacity - $this->registrations()->count());
    }

    public function getIsFullAttribute(): bool
    {
        if (!$this->capacity) return false;
        return $this->registrations()->count() >= $this->capacity;
    }

    public function getRegistrationOpenAttribute(): bool
    {
        if (!$this->requires_registration) return false;
        if ($this->status !== EventStatus::Published) return false;
        if ($this->registration_closes_at && now()->isAfter($this->registration_closes_at)) return false;
        if ($this->is_full) return false;
        return true;
    }
}
