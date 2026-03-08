<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    use HasFactory;

    protected $fillable = [
        'zone_id',
        'user_id',
        'type',
        'report_date',
        'week_number',
        'year',
        'total_income',
        'total_expenses',
        'balance',
        'new_members',
        'attendance',
        'first_timers',
        'conversions',
        'notes',
        'status',
        'reviewed_by',
        'reviewed_at',
    ];

    protected $casts = [
        'report_date' => 'date',
        'reviewed_at' => 'datetime',
        'total_income' => 'decimal:2',
        'total_expenses' => 'decimal:2',
        'balance' => 'decimal:2',
    ];

    public function zone()
    {
        return $this->belongsTo(Zone::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
