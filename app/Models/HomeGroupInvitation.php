<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HomeGroupInvitation extends Model
{
    use HasFactory;

    protected $table = 'homegroup_invitations';

    protected $fillable = [
        'homegroup_id',
        'member_id',
        'requested_by',
        'pastor_id',
        'status',
        'invited_at',
        'responded_at',
        'response_note',
        'message',
        'is_request',
    ];

    protected function casts(): array
    {
        return [
            'invited_at' => 'datetime',
            'responded_at' => 'datetime',
        ];
    }

    public function member()
    {
        return $this->belongsTo(User::class, 'member_id');
    }

    public function homeGroup()
    {
        return $this->belongsTo(HomeGroup::class, 'homegroup_id');
    }

    public function requester()
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function pastor()
    {
        return $this->belongsTo(User::class, 'pastor_id');
    }

    public function approve(User $approver, ?string $notes = null): void
    {
        $this->update([
            'status' => 'accepted',
            'responded_at' => now(),
            'response_note' => $notes,
        ]);

        if ($this->member) {
            $this->member->update([
                'home_group_id' => $this->homegroup_id,
            ]);
        }
    }

    public function reject(User $approver, ?string $notes = null): void
    {
        $this->update([
            'status' => 'declined',
            'responded_at' => now(),
            'response_note' => $notes,
        ]);
    }
}