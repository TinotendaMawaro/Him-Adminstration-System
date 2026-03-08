<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Appointment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'appointed_by',
        'appointment_type',
        'department_id',
        'home_group_id',
        'zone_id',
        'start_date',
        'end_date',
        'status',
        'notes',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function appointedBy()
    {
        return $this->belongsTo(User::class, 'appointed_by');
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function homeGroup()
    {
        return $this->belongsTo(HomeGroup::class);
    }

    public function zone()
    {
        return $this->belongsTo(Zone::class);
    }

    public function terminate()
    {
        $this->update([
            'status' => 'terminated',
            'end_date' => now()->toDateString(),
        ]);
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }
}
