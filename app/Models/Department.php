<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'name',
        'zone_id',
        'color',
        'description',
        'hod_id',
        'hod_status',
        'hod_assigned_at',
        'hod_accepted_at',
        'hod_notes',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'hod_assigned_at' => 'datetime',
        'hod_accepted_at' => 'datetime',
    ];

    /**
     * Get the users in this department through pivot table
     */
    public function members()
    {
        return $this->belongsToMany(User::class, 'department_members')
            ->withPivot(['role', 'status', 'joined_at', 'left_at'])
            ->withTimestamps();
    }

    /**
     * Legacy relationship for backward compatibility
     * Uses pivot table to get all users (deprecated - use members() instead)
     */
    public function users()
    {
        return $this->belongsToMany(User::class, 'department_members')
            ->withPivot(['role', 'status', 'joined_at', 'left_at'])
            ->withTimestamps();
    }

    /**
     * Get active members
     */
    public function activeMembers()
    {
        return $this->members()->wherePivot('status', 'active');
    }

    /**
     * Get HOD through pivot
     */
    public function hod()
    {
        return $this->belongsToMany(User::class, 'department_members')
            ->wherePivot('role', 'hod')
            ->wherePivot('status', 'active')
            ->withPivot(['joined_at'])
            ->withTimestamps();
    }

    /**
     * Get the zone this department belongs to
     */
    public function zone()
    {
        return $this->belongsTo(Zone::class);
    }

    /**
     * Get all activities for this department.
     */
    public function activities()
    {
        return $this->hasMany(Activity::class);
    }

    /**
     * Get recent activities (limited)
     */
    public function recentActivities($limit = 5)
    {
        return $this->activities()
            ->orderBy('created_at', 'desc')
            ->limit($limit);
    }

    /**
     * Get department requests
     */
    public function requests()
    {
        return $this->hasMany(DepartmentRequest::class);
    }

    /**
     * Check if department has a HOD
     */
    public function hasHod(): bool
    {
        return $this->hod_id !== null && $this->hod_status === 'accepted';
    }

    /**
     * Get HOD user model
     */
    public function hodUser()
    {
        return $this->belongsTo(User::class, 'hod_id');
    }

    /**
     * Get total active members count
     */
    public function getActiveMembersCountAttribute(): int
    {
        return $this->activeMembers()->count();
    }

    /**
     * Get total members count including inactive
     */
    public function getTotalMembersCountAttribute(): int
    {
        return $this->members()->count();
    }

    /**
     * Assign HOD to department
     */
    public function assignHod(User $user, ?string $notes = null): void
    {
        $this->update([
            'hod_id' => $user->id,
            'hod_status' => 'pending',
            'hod_assigned_at' => now(),
            'hod_accepted_at' => null,
            'hod_notes' => $notes,
        ]);

        // Add to department_members as HOD (pending)
        $this->members()->syncWithoutDetaching([
            $user->id => [
                'role' => 'hod',
                'status' => 'pending',
                'joined_at' => now(),
            ]
        ]);
    }

    /**
     * HOD accepts appointment
     */
    public function acceptHod(): void
    {
        $this->update([
            'hod_status' => 'accepted',
            'hod_accepted_at' => now(),
        ]);

        // Update pivot to active
        if ($this->hod_id) {
            $this->members()->updateExistingPivot($this->hod_id, [
                'role' => 'hod',
                'status' => 'active',
            ]);
        }
    }

    /**
     * HOD declines appointment
     */
    public function declineHod(): void
    {
        $this->update([
            'hod_status' => 'declined',
            'hod_accepted_at' => null,
        ]);

        // Remove from pivot
        if ($this->hod_id) {
            $this->members()->detach($this->hod_id);
        }

        // Reset hod_id
        $this->update(['hod_id' => null]);
    }

    /**
     * Remove HOD (demote)
     */
    public function removeHod(): void
    {
        if ($this->hod_id) {
            // Change pivot role from hod to member, keep active
            $this->members()->updateExistingPivot($this->hod_id, [
                'role' => 'member',
                'status' => 'active',
            ]);
        }

        $this->update([
            'hod_id' => null,
            'hod_status' => null,
            'hod_assigned_at' => null,
            'hod_accepted_at' => null,
            'hod_notes' => null,
        ]);
    }
}
