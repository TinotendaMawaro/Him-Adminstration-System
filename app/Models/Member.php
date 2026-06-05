<?php

namespace App\Models;

use App\Enums\MemberStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Member extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id', 'name', 'surname', 'member_number', 'member_code',
        'zone_id', 'home_group_id', 'department_id',
        'gender_id', 'demography_id',
        'date_of_birth', 'membership_date',
        'status', 'is_baptised', 'can_be_partner',
    ];

    protected function casts(): array
    {
        return [
            'status'          => MemberStatus::class,  // ← enum cast
            'date_of_birth'   => 'date',
            'membership_date' => 'date',
            'is_baptised'     => 'boolean',
            'can_be_partner'  => 'boolean',
        ];
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', MemberStatus::Active);
    }

    public function scopeInZone(Builder $query, int $zoneId): Builder
    {
        return $query->where('zone_id', $zoneId);
    }

    public function user(): BelongsTo       { return $this->belongsTo(User::class); }
    public function zone(): BelongsTo       { return $this->belongsTo(Zone::class); }
    public function homeGroup(): BelongsTo  { return $this->belongsTo(HomeGroup::class); }
    public function department(): BelongsTo { return $this->belongsTo(Department::class); }
    public function gender(): BelongsTo     { return $this->belongsTo(Gender::class); }
    public function demography(): BelongsTo { return $this->belongsTo(Demography::class); }
    public function partner(): HasOne       { return $this->hasOne(Partner::class); }

    public function getFullNameAttribute(): string
    {
        return "{$this->name} {$this->surname}";
    }
}
