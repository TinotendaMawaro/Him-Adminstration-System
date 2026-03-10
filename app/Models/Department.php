<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name',
        'zone_id',
        'color',
        'description',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function zone()
    {
        return $this->belongsTo(Zone::class);
    }

    /**
     * Get all activities for this department.
     */
    public function activities()
    {
        return $this->hasMany(Activity::class);
    }

    /**
     * Get the pastor in charge of this department
     */
    public function pastorInCharge()
    {
        return $this->users()->where('role', 'hod')->first();
    }

    /**
     * Get total members in this department
     */
    public function totalMembers()
    {
        return $this->users()->count();
    }
}
