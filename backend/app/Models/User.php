<?php

namespace App\Models;

// Note: this file assumes the standard Laravel 11 skeleton's User model as
// a starting point (Authenticatable, Notifiable, HasApiTokens). Merge this
// on top of that file rather than dropping it in blind if the skeleton's
// version has diverged.

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name', 'email', 'phone', 'password', 'status',
    ];

    protected $hidden = [
        'password', 'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class)->withTimestamps();
    }

    public function auditLogs(): HasMany
    {
        return $this->hasMany(AuditLog::class);
    }

    public function student(): HasOne
    {
        return $this->hasOne(Student::class);
    }

    /** True if the user holds a role with the given slug (any scope). */
    public function hasRole(string $slug): bool
    {
        return $this->roles->contains(fn (Role $role) => $role->slug === $slug);
    }

    /**
     * True if any of the user's roles carry the given permission slug.
     * "super_administrator" bypasses this check entirely via
     * AuthServiceProvider's Gate::before — do not special-case it here too.
     */
    public function hasPermission(string $slug): bool
    {
        return $this->roles
            ->loadMissing('permissions')
            ->pluck('permissions')
            ->flatten()
            ->pluck('slug')
            ->contains($slug);
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }
}
