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

        // Generate and assign HOD code if user doesn't have one
        if (empty($user->hod_code)) {
            $zone = $this->zone;
            if ($zone && $zone->region) {
                $regionId = $zone->region_id;
                $zoneId = $zone->id;

                // Format: R{region_id:2d}{zone_id:2d}H{sequence:2d}
                $prefix = 'R' . str_pad($regionId, 2, '0', STR_PAD_LEFT) . str_pad($zoneId, 2, '0', STR_PAD_LEFT) . 'H';

                // Count existing HODs with this prefix to determine sequence
                $existingCount = self::whereHas('zone', function($q) use ($zoneId) {
                        $q->where('zones.id', $zoneId);
                    })
                    ->whereHas('hodUser', function($q) use ($prefix) {
                        $q->where('hod_code', 'like', $prefix . '%');
                    })
                    ->count();
                // Alternative simpler: count users with hod_code like prefix
                $existingCount = \App\Models\User::where('hod_code', 'like', $prefix . '%')->count();
                $sequence = $existingCount + 1;
                $hodCode = $prefix . str_pad($sequence, 2, '0', STR_PAD_LEFT);

                $user->hod_code = $hodCode;
                $user->save();

                \Illuminate\Support\Facades\Log::info('HOD code assigned (on assign)', [
                    'user_id' => $user->id,
                    'hod_code' => $hodCode,
                    'department_id' => $this->id,
                    'zone_id' => $zoneId,
                    'region_id' => $regionId,
                ]);
            }
        }
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

        // Generate and assign HOD code if not already set
        $hodUser = $this->hodUser;
        if ($hodUser && empty($hodUser->hod_code)) {
            $zone = $this->zone;
            if ($zone && $zone->region) {
                $regionId = $zone->region_id;
                $zoneId = $zone->id;

                // Format: R{region_id:2d}{zone_id:2d}H{sequence:2d}
                $prefix = 'R' . str_pad($regionId, 2, '0', STR_PAD_LEFT) . str_pad($zoneId, 2, '0', STR_PAD_LEFT) . 'H';

                // Count existing HODs with this prefix to determine sequence
                $existingCount = \App\Models\User::where('hod_code', 'like', $prefix . '%')->count();
                $sequence = $existingCount + 1;
                $hodCode = $prefix . str_pad($sequence, 2, '0', STR_PAD_LEFT);

                $hodUser->hod_code = $hodCode;
                $hodUser->save();

                \Illuminate\Support\Facades\Log::info('HOD code assigned', [
                    'user_id' => $hodUser->id,
                    'hod_code' => $hodCode,
                    'department_id' => $this->id,
                    'zone_id' => $zoneId,
                    'region_id' => $regionId,
                ]);
            }
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
