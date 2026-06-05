<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Zone extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'code',
        'address',
        'phone',
        'region_id',
    ];

    public function region(): BelongsTo
    {
        return $this->belongsTo(Region::class);
    }

    public function home_groups(): HasMany
    {
        return $this->hasMany(HomeGroup::class);
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function pastors(): HasMany
    {
        return $this->users()->where('role', 'pastor');
    }

    public function members(): HasMany
    {
        return $this->users()->where('role', 'member');
    }

    public function partners(): HasMany
    {
        return $this->users()->where('role', 'partner');
    }

    public function hods(): HasMany
    {
        return $this->users()->where('role', 'hod');
    }

    public function zoneHistories(): HasMany
    {
        return $this->hasMany(ZoneHistory::class);
    }

    public function weddings(): HasMany
    {
        return $this->hasMany(Wedding::class);
    }

    public function reports(): HasMany
    {
        return $this->hasMany(Report::class);
    }

    public function departments()
    {
        return $this->belongsToMany(Department::class, 'zone_departments');
    }
}