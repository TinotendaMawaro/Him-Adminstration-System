<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LeaderPromotionRequest extends Model
{
    use HasFactory;

    protected $table = 'leader_promotion_requests';

    protected $fillable = [
        'user_id',
        'home_group_id',
        'pastor_id',
        'status',
        'message',
        'responded_at',
        'responded_by',
    ];

    protected function casts(): array
    {
        return [
            'responded_at' => 'datetime',
        ];
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function homeGroup(): BelongsTo
    {
        return $this->belongsTo(HomeGroup::class);
    }

    public function pastor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'pastor_id');
    }

    public function responder(): BelongsTo
    {
        return $this->belongsTo(User::class, 'responded_by');
    }
}
