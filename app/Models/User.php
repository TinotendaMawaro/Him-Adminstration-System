<?php

namespace App\Models;

use App\Enums\UserRole;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Facades\Storage;

// FilamentUser is REQUIRED: outside APP_ENV=local Filament refuses (403) every user whose model does not implement it.
class User extends Authenticatable implements \Filament\Models\Contracts\FilamentUser
{
    use HasApiTokens, HasFactory;
    use Notifiable { notify as protected laravelNotify; }

    protected $fillable = [
        'name', 'email', 'password',
        'role', 'unique_code', 'hod_code',
        'is_active', 'terms_accepted', 'terms_accepted_at',
        'first_login_at', 'completed_tour', 'profile_photo',
        'zone_id', 'phone', 'address', 'date_of_birth',
        'home_group_id', 'department_id',
        'address_line_1', 'address_line_2', 'city', 'province', 'country', 'postal_code',
        'latitude', 'longitude', 'location_captured', 'location_captured_at',
    ];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'role'              => UserRole::class,   // ← enum cast
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
            'date_of_birth'     => 'date',
            'terms_accepted'    => 'boolean',
            'is_active'         => 'boolean',
            'completed_tour'    => 'boolean',
            'email_notifications' => 'boolean',
            'email_suppressed_at' => 'datetime',
            'terms_accepted_at' => 'datetime',
            'first_login_at'    => 'datetime',
        ];
    }

    /**
     * Filament's password-reset notification is intercepted so staff get the same branded,
     * queued, logged email as everyone else. Any other notification behaves as normal.
     */
    public function notify($instance)
    {
        if ($instance instanceof \Filament\Notifications\Auth\ResetPassword) {
            \App\Support\Mailing::to($this, new \App\Mail\ResetPasswordMail($this, $instance->url, (int) config('auth.passwords.users.expire', 60)));

            return;
        }

        $this->laravelNotify($instance);
    }

    // ─── Role helpers ─────────────────────────────────────────────────────────

    public function hasRole(UserRole|string $role): bool
    {
        $role = $role instanceof UserRole ? $role : UserRole::from($role);
        return $this->role === $role;
    }

    public function hasAnyRole(array $roles): bool
    {
        $roles = array_map(
            fn ($r) => $r instanceof UserRole ? $r : UserRole::from($r),
            $roles
        );
        return in_array($this->role, $roles);
    }

    public function isMaster(): bool    { return $this->role === UserRole::Master; }
    public function isHOD(): bool       { return $this->role === UserRole::HOD; }
    public function isFinance(): bool   { return $this->role === UserRole::Finance; }
    public function isEventRole(): bool { return $this->role === UserRole::Event; }
    public function isPastor(): bool    { return $this->role === UserRole::Pastor; }
    public function isPartner(): bool   { return $this->role === UserRole::Partner; }
    public function isMember(): bool    { return $this->role === UserRole::Member; }

    public function isFilamentUser(): bool { return $this->role->isFilamentRole(); }
    public function isPortalUser(): bool   { return $this->role->isPortalRole(); }

    public function isFirstTimeLogin(): bool   { return $this->first_login_at === null; }
    public function needsToAcceptTerms(): bool { return !$this->terms_accepted; }

    // ─── Zone accessor with fallback ──────────────────────────────────────────
    /**
     * Get the user's zone ID.
     * For pastors with null user.zone_id, fallback to the related pastor record's zone_id.
     *
     * @param  mixed  $value  The raw attribute value from DB.
     * @return int|null
     */
    public function getZoneIdAttribute($value)
    {
        if (!is_null($value)) {
            return $value;
        }
        // If the user is a pastor and has a related pastor record with a zone, use that zone_id.
        if ($this->isPastor()) {
            if (!$this->relationLoaded('pastor')) {
                $this->load('pastor');
            }
            return $this->pastor?->zone_id;
        }
        return $value;
    }

    // ─── Relationships ────────────────────────────────────────────────────────

    public function gender(): BelongsTo     { return $this->belongsTo(Gender::class); }
    public function demography(): BelongsTo { return $this->belongsTo(Demography::class); }
    public function zone(): BelongsTo       { return $this->belongsTo(Zone::class); }
    public function homeGroup(): BelongsTo  { return $this->belongsTo(HomeGroup::class); }
    public function department(): BelongsTo { return $this->belongsTo(Department::class); }

    // Many-to-many relationship through pivot table
    public function departments()
    {
        return $this->belongsToMany(Department::class, 'department_members')
            ->withPivot(['role', 'status', 'joined_at', 'left_at'])
            ->withTimestamps();
    }

    // Get HOD departments
    public function hodDepartments()
    {
        return $this->departments()
            ->wherePivot('role', 'hod')
            ->wherePivot('status', 'active');
    }

    // Get member departments
    public function memberDepartments()
    {
        return $this->departments()
            ->wherePivot('role', 'member')
            ->wherePivot('status', 'active');
    }

    public function contact(): HasOne  { return $this->hasOne(Contact::class); }
    public function pastor(): HasOne   { return $this->hasOne(Pastor::class); }
    public function member(): HasOne   { return $this->hasOne(Member::class); }
    public function partner(): HasOne  { return $this->hasOne(Partner::class); }

    public function zoneHistories(): HasMany      { return $this->hasMany(ZoneHistory::class, 'pastor_id'); }
    public function reports(): HasMany            { return $this->hasMany(Report::class); }
    public function notifications(): HasMany      { return $this->hasMany(Notification::class); }
    public function unreadNotifications(): HasMany { return $this->notifications()->where('is_read', false); }
    public function appointments(): HasMany       { return $this->hasMany(Appointment::class, 'user_id'); }
    public function payments(): HasMany           { return $this->hasMany(Payment::class); }
    public function recordedPayments(): HasMany   { return $this->hasMany(Payment::class, 'recorded_by'); }
    public function createdEvents(): HasMany      { return $this->hasMany(Event::class, 'created_by'); }
    public function eventRegistrations(): HasMany { return $this->hasMany(EventRegistration::class); }

    // ─── Filament access gate ─────────────────────────────────────────────────

    /**
     * Each staff portal is its own panel. Master may enter all of them; Finance and
     * Events staff are confined to their own portal.
     */
    public function canAccessPanel(\Filament\Panel $panel): bool
    {
        if (!$this->is_active || !$this->role->isFilamentRole()) {
            return false;
        }

        return match ($panel->getId()) {
            'admin'   => $this->isMaster(),
            'finance' => $this->hasAnyRole(['master', 'finance']),
            'events'  => $this->hasAnyRole(['master', 'event']),
            default   => false,
        };
    }

    /**
     * Get the profile photo URL with storage path.
     * Returns full URL if profile_photo is set, otherwise null.
     */
    public function getProfilePhotoAttribute($value)
    {
        if (!$value) {
            return null;
        }

        // Photos uploaded from the apps live in cloud storage (a full https URL); older ones are paths on the public disk.
        return str_starts_with($value, 'http') ? $value : Storage::url($value);
    }
}