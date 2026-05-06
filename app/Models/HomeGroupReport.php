<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HomeGroupReport extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'home_group_id',
        'leader_id',
        'approved_by',
        'title',
        'content',
        'report_date',
        'attendance_count',
        'challenges',
        'prayer_requests',
        'testimonies',
        'status',
        'submitted_at',
        'approved_at',
        'review_notes',
    ];

    /**
     * The attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'report_date' => 'date',
            'submitted_at' => 'datetime',
            'approved_at' => 'datetime',
        ];
    }

    /**
     * Get the home group this report belongs to
     */
    public function homeGroup()
    {
        return $this->belongsTo(HomeGroup::class);
    }

    /**
     * Get the leader who submitted this report
     */
    public function leader()
    {
        return $this->belongsTo(User::class, 'leader_id');
    }

    /**
     * Get the pastor who approved/rejected this report
     */
    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Submit the report
     */
    public function submit(): void
    {
        $this->update([
            'status' => 'submitted',
            'submitted_at' => now(),
        ]);
    }

    /**
     * Approve the report
     */
    public function approve(User $approver, ?string $notes = null): void
    {
        $this->update([
            'status' => 'approved',
            'approved_by' => $approver->id,
            'approved_at' => now(),
            'review_notes' => $notes,
        ]);
    }

    /**
     * Reject the report
     */
    public function reject(User $approver, ?string $notes = null): void
    {
        $this->update([
            'status' => 'rejected',
            'approved_by' => $approver->id,
            'approved_at' => now(),
            'review_notes' => $notes,
        ]);
    }
}
}
