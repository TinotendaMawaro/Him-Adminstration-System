<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SpiritualMilestone extends Model
{
    protected $fillable = [
        'user_id', 'member_id', 'milestone_type', 'title', 'subtitle',
        'description', 'icon', 'color', 'metadata', 'achieved_at',
    ];

    protected function casts(): array
    {
        return [
            'achieved_at' => 'datetime',
            'metadata'    => 'array',
        ];
    }

    public function user(): BelongsTo    { return $this->belongsTo(User::class); }
    public function member(): BelongsTo  { return $this->belongsTo(Member::class); }
}
