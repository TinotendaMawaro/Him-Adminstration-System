<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HomeGroup extends Model
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
        'location',
        'meeting_day',
        'meeting_time',
        'leader_id'
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'meeting_time' => 'datetime:H:i',
    ];

    public function zone()
    {
        return $this->belongsTo(Zone::class);
    }

    public function leader()
    {
        return $this->belongsTo(User::class, 'leader_id');
    }

    public function users()
    {
        return $this->hasMany(User::class);
    }

    /**
     * Get members belonging to this home group
     */
    public function members()
    {
        return $this->hasMany(Member::class, 'home_group_id');
    }
}
