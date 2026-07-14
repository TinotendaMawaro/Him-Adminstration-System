<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SermonView extends Model
{
    protected $fillable = ['user_id', 'sermon_id', 'category', 'watch_percentage', 'watched_at'];

    protected function casts(): array
    {
        return ['watched_at' => 'datetime'];
    }

    public function user(): BelongsTo   { return $this->belongsTo(User::class); }
    public function sermon(): BelongsTo { return $this->belongsTo(Asset::class, 'sermon_id'); }
}
