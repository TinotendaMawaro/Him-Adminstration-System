<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Country extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name',
        'country_code'
    ];

    public function cities()
    {
        return $this->hasMany(City::class);
    }

    public function regions()
    {
        return $this->hasMany(Region::class);
    }
}
