<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Zone extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name',
        'region_id',
    ];

    public function region()
    {
        return $this->belongsTo(Region::class);
    }

    public function home_groups()
    {
        return $this->hasMany(HomeGroup::class);
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function pastors()
    {
        return $this->users()->where('role', 'pastor');
    }

    public function members()
    {
        return $this->users()->where('role', 'member');
    }

    public function partners()
    {
        return $this->users()->where('role', 'partner');
    }

    public function hods()
    {
        return $this->users()->where('role', 'hod');
    }

    public function zoneHistories()
    {
        return $this->hasMany(ZoneHistory::class);
    }

    public function currentPastor()
    {
        return $this->zoneHistories()
            ->where('end_date', null)
            ->with('pastor')
            ->first()?->pastor;
    }

    public function weddings()
    {
        return $this->hasMany(Wedding::class);
    }

    public function reports()
    {
        return $this->hasMany(Report::class);
    }

    public function departments()
    {
        return $this->belongsToMany(Department::class, 'zone_departments');
    }
}
