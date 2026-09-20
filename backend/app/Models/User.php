<?php

namespace App\Models;

// Note: this file assumes the standard Laravel skeleton's User model (the
// streamlined 11+ skeleton structure, unchanged through Laravel 13) as
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
use Illuminate\Support\Facades\DB;
use App\Notifications\ResetPasswordNotification;
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
        return $this->belongsToMany(Role::class)->withTimestamps()->withPivot('scope_type', 'scope_id');
    }

    public function auditLogs(): HasMany
    {
        return $this->hasMany(AuditLog::class);
    }

    public function applicant(): HasOne
    {
        return $this->hasOne(Applicant::class);
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

    /**
     * Department IDs this user's role assignments are scoped to (Phase 1's
     * role_user.scope_type/scope_id — e.g. an HOD's role_user row scoped
     * scope_type='department', scope_id=<department id>). Wired up in
     * Phase 9 for department-scoped policy checks (CourseRegistrationPolicy,
     * ResultPolicy) — see docs/PROJECT_STATUS.md for background.
     *
     * An empty return means "no department scope configured for this
     * user" — callers should treat that as unrestricted-by-scope (the
     * permission check already gated the ability) rather than as "scoped
     * to nothing", so existing accounts without a scope assigned yet
     * aren't silently locked out.
     *
     * @return int[]
     */
    public function departmentScopeIds(): array
    {
        return DB::table('role_user')
            ->where('user_id', $this->id)
            ->where('scope_type', 'department')
            ->pluck('scope_id')
            ->filter()
            ->map(fn ($id) => (int) $id)
            ->values()
            ->all();
    }

    /**
     * Overrides CanResetPassword's default, which links to a Laravel Blade
     * route this API-only app doesn't have. Sends App\Notifications\
     * ResetPasswordNotification instead, which links to the Next.js
     * frontend's /reset-password page (Phase 14). Delivery still goes
     * through whatever MAIL_MAILER is configured — 'log' in local/dev
     * until Phase 17's real notification/email infrastructure exists.
     */
    public function sendPasswordResetNotification($token): void
    {
        $this->notify(new ResetPasswordNotification($token));
    }
}

