<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HomeGroupInvitation extends Model
{
    use HasFactory;

    protected $table = 'homegroup_invitations';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'homegroup_id',
        'member_id',
        'pastor_id',
        'status',
        'invited_at',
        'responded_at',
        'response_note',
        'message',
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
     * Get the member being invited
     */
    public function member()
    {
        return $this->belongsTo(User::class, 'member_id');
    }

    /**
     * Get the home group being invited to
     */
    public function homeGroup()
    {
        return $this->belongsTo(HomeGroup::class, 'homegroup_id');
    }

    /**
     * Get the user who requested the invitation
     */
    public function requester()
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    /**
     * Get the pastor who sent the invitation
     */
    public function pastor()
    {
        return $this->belongsTo(User::class, 'pastor_id');
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
