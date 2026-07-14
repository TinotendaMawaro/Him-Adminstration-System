<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserInterest extends Model
{
    protected $fillable = ['user_id', 'interest_type', 'interest_value', 'score', 'last_triggered_at'];

    protected function casts(): array
    {
        return ['last_triggered_at' => 'datetime'];
    }

    public function user(): BelongsTo { return $this->belongsTo(User::class); }
}
