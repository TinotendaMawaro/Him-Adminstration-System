<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'unique_code',
        'zone_id',
        'home_group_id',
        'department_id',
        'gender_id',
        'demography_id',
        'phone',
        'address',
        'date_of_birth',
        'is_active',
        'terms_accepted',
        'terms_accepted_at',
        'first_login_at',
        'completed_tour',
        'profile_photo',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'date_of_birth' => 'date',
            'terms_accepted' => 'boolean',
            'is_active' => 'boolean',
            'completed_tour' => 'boolean',
            'terms_accepted_at' => 'datetime',
            'first_login_at' => 'datetime',
        ];
    }

    // Role checking methods
    public function isPastor(): bool
    {
        return $this->role === 'pastor';
    }

    public function isMember(): bool
    {
        return $this->role === 'member';
    }

    public function isPartner(): bool
    {
        return $this->role === 'partner';
    }

    public function isHOD(): bool
    {
        return $this->role === 'hod';
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function hasRole(string $role): bool
    {
        return $this->role === $role;
    }

    public function hasAnyRole(array $roles): bool
    {
        return in_array($this->role, $roles);
    }

    // Check if first time login
    public function isFirstTimeLogin(): bool
    {
        return $this->first_login_at === null;
    }

    // Check if terms not accepted
    public function needsToAcceptTerms(): bool
    {
        return !$this->terms_accepted;
    }

    // Gender relationship
    public function gender()
    {
        return $this->belongsTo(Gender::class);
    }

    // Demography relationship
    public function demography()
    {
        return $this->belongsTo(Demography::class);
    }

    // Zone relationship
    public function zone()
    {
        return $this->belongsTo(Zone::class);
    }

    // Home group relationship
    public function home_group()
    {
        return $this->belongsTo(HomeGroup::class);
    }

    // Department relationship
    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    // Zone history relationship (as pastor)
    public function zoneHistories()
    {
        return $this->hasMany(ZoneHistory::class, 'pastor_id');
    }

    // Reports created by user
    public function reports()
    {
        return $this->hasMany(Report::class);
    }

    // Notifications received
    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    // Unread notifications
    public function unreadNotifications()
    {
        return $this->notifications()->where('is_read', false);
    }

    // Appointments (as the appointed person)
    public function appointments()
    {
        return $this->hasMany(Appointment::class, 'user_id');
    }

    // Appointments made by user
    public function appointedUsers()
    {
        return $this->hasMany(Appointment::class, 'appointed_by');
    }

    // Active appointment
    public function activeAppointment()
    {
        return $this->appointments()->where('status', 'active')->first();
    }

    // Wedding as groom
    public function weddingsAsGroom()
    {
        return $this->hasMany(Wedding::class, 'groom_id');
    }

    // Wedding as bride
    public function weddingsAsBride()
    {
        return $this->hasMany(Wedding::class, 'bride_id');
    }

    // Wedding as officiating pastor
    public function weddingsOfficiated()
    {
        return $this->hasMany(Wedding::class, 'officiating_pastor_id');
    }
}
