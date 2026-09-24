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

    /**
     * A single human-facing status for the public admissions grid
     * (§5/§12 of the spec) — every "what does this session's card say"
     * decision lives here, once, rather than being recomputed in the
     * frontend. `status` is a stable machine key the frontend can use
     * for badge colour; `label` is the display text.
     *
     * - is_current + isAcceptingApplications() → 'open'
     * - is_current + not yet open (admissions_open_at in the future) → 'scheduled'
     * - is_current + window already closed → 'closed'
     * - not current + start_date in the future → 'upcoming' (created ahead of time, hasn't become current yet)
     * - anything else not current → 'past' (the institution's only signal that a
     *   non-current session is "done" rather than "not started yet" is its own
     *   start_date; there's no separate "session lifecycle" field to check)
     */
    public function publicAdmissionStatus(): array
    {
        $now = now();

        if ($this->is_current) {
            if ($this->isAcceptingApplications()) {
                return ['status' => 'open', 'label' => 'Accepting applications'];
            }

            if ($this->admissions_open_at && $now->lt($this->admissions_open_at)) {
                return ['status' => 'scheduled', 'label' => 'Opens '.$this->admissions_open_at->format('j M Y')];
            }

            return ['status' => 'closed', 'label' => 'Applications closed'];
        }

        if ($this->start_date && $now->lt($this->start_date)) {
            return ['status' => 'upcoming', 'label' => 'Upcoming'];
        }

        return ['status' => 'past', 'label' => 'Closed'];
    }
}
