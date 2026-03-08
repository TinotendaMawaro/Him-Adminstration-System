<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ZoneHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'zone_id',
        'pastor_id',
        'start_date',
        'end_date',
        'notes',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function zone()
    {
        return $this->belongsTo(Zone::class);
    }

    public function pastor()
    {
        return $this->belongsTo(User::class, 'pastor_id');
    }
}
