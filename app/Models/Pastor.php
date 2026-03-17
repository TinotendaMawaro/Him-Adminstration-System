<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Pastor extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'user_id',
        'name',
        'surname',
        'code',
        'zone_id',
        'ordained_date',
        'title',
        'is_zone_pastor',
    ];

    protected function casts(): array
    {
        return [
            'ordained_date'  => 'date',
            'is_zone_pastor' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function zone(): BelongsTo
    {
        return $this->belongsTo(Zone::class);
    }

    public function getFullNameAttribute(): string
    {
        return "{$this->title} {$this->name} {$this->surname}";
    }
}
