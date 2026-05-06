<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HomeGroupInvitation extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'user_id',
        'home_group_id',
        'requested_by',
        'approved_by',
        'status',
        'notes',
        'requested_at',
        'approved_at',
    ];

    /**
     * The attributes that should be cast.
     */
    protected function casts(): array
    {
        return [
            'requested_at' => 'datetime',
            'approved_at' => 'datetime',
        ];
    }

    /**
     * Get the user who made the request
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the home group being requested
     */
    public function homeGroup()
    {
        return $this->belongsTo(HomeGroup::class);
    }

    /**
     * Get the user who requested (if different from user)
     */
    public function requester()
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    /**
     * Get the pastor who approved/rejected the request
     */
    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Check if request is pending
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    /**
     * Check if request is approved
     */
    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    /**
     * Check if request is rejected
     */
    public function isRejected(): bool
    {
        return $this->status === 'rejected';
    }

    /**
     * Approve the request
     */
    public function approve(User $approver, ?string $notes = null): void
    {
        $this->update([
            'status' => 'approved',
            'approved_by' => $approver->id,
            'approved_at' => now(),
            'notes' => $notes,
        ]);

        // Update user's home group
        $this->user->update([
            'home_group_id' => $this->home_group_id,
        ]);
    }

    /**
     * Reject the request
     */
    public function reject(User $approver, ?string $notes = null): void
    {
        $this->update([
            'status' => 'rejected',
            'approved_by' => $approver->id,
            'approved_at' => now(),
            'notes' => $notes,
        ]);
    }
}
