<?php

namespace App\Models\Community;

use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    protected $table = 'community_reports';

    protected $fillable = ['reporter_id', 'subject_type', 'subject_id', 'reason', 'details', 'status', 'handled_by', 'handled_at'];

    protected function casts(): array
    {
        return ['handled_at' => 'datetime'];
    }

    public function reporter() { return $this->belongsTo(\App\Models\User::class, 'reporter_id'); }
    public function handler() { return $this->belongsTo(\App\Models\User::class, 'handled_by'); }
}
