<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HomeGroupInvitation extends Model
{
    use HasFactory;

    protected $fillable = [
        'homegroup_id',
        'member_id',
        'pastor_id',
        'status',
        'invited_at',
        'responded_at',
        'response_note',
    ];

    protected $casts = [
        'invited_at' => 'datetime',
        'responded_at' => 'datetime',
    ];

    public function homegroup()
    {
        return $this->belongsTo(HomeGroup::class);
    }

    public function member()
    {
        return $this->belongsTo(User::class, 'member_id');
    }

    public function pastor()
    {
        return $this->belongsTo(User::class, 'pastor_id');
    }
}
