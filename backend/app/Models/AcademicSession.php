<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AcademicSession extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'start_date', 'end_date', 'is_current',
        'admissions_open_at', 'admissions_close_at',
    ];

    protected function casts(): array
    {
        return [
            'is_current' => 'boolean',
            'start_date' => 'date',
            'end_date' => 'date',
            'admissions_open_at' => 'datetime',
            'admissions_close_at' => 'datetime',
        ];
    }

    public function semesters(): HasMany
    {
        return $this->hasMany(Semester::class);
    }

    public static function current(): ?self
    {
        return static::where('is_current', true)->first();
    }

    /**
     * Whether NEW applications can be started against this session right
     * now. A null bound means "no restriction on that side" — a session
     * with both columns null behaves exactly like today's plain
     * `is_current` check (so existing/seeded sessions are unaffected
     * until an admin actually sets a window). Deliberately does NOT gate
     * `is_current` itself — that flag answers a different question
     * (which session the institution is currently running) and other
     * modules (course registration, results) depend on it unchanged.
     *
     * Scope: this only gates *starting* a new application
     * (ApplicationController::store()). An application already in
     * progress (DRAFT/PAYMENT_PENDING/PAYMENT_CONFIRMED) when the window
     * closes can still be completed, paid for, and submitted — closing a
     * window mid-form isn't the same institutional policy as refusing to
     * accept new applicants, and the spec doesn't say otherwise. If the
     * institution wants submission itself blocked after close too, that
     * would need to be a separate, explicit decision.
     */
    public function isAcceptingApplications(): bool
    {
        $now = now();

        if ($this->admissions_open_at && $now->lt($this->admissions_open_at)) {
            return false;
        }

        if ($this->admissions_close_at && $now->gt($this->admissions_close_at)) {
            return false;
        }

        return true;
    }

    /** The current session, but only if it's also inside its own admissions window — see isAcceptingApplications(). Null covers both "no current session" and "current session isn't accepting applications right now". */
    public static function currentlyAcceptingApplications(): ?self
    {
        $session = static::current();

        return $session?->isAcceptingApplications() ? $session : null;
    }
}
