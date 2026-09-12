<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Student extends Model
{
    use HasFactory;

    public const STATUS_ACTIVE = 'ACTIVE';
    public const STATUS_DEFERRED = 'DEFERRED';
    public const STATUS_SUSPENDED = 'SUSPENDED';
    public const STATUS_WITHDRAWN = 'WITHDRAWN';
    public const STATUS_EXPELLED = 'EXPELLED';
    public const STATUS_GRADUATED = 'GRADUATED';

    protected $fillable = [
        'user_id', 'application_id', 'matric_number', 'programme_id', 'current_level_id',
        'admission_academic_session_id', 'status',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class);
    }

    public function programme(): BelongsTo
    {
        return $this->belongsTo(Programme::class);
    }

    public function currentLevel(): BelongsTo
    {
        return $this->belongsTo(Level::class, 'current_level_id');
    }

    public function admissionSession(): BelongsTo
    {
        return $this->belongsTo(AcademicSession::class, 'admission_academic_session_id');
    }

    public function enrolments(): HasMany
    {
        return $this->hasMany(StudentEnrolment::class);
    }

    public function programmeHistories(): HasMany
    {
        return $this->hasMany(StudentProgrammeHistory::class);
    }

    public function courseRegistrations(): HasMany
    {
        return $this->hasMany(CourseRegistration::class);
    }

    public function results(): HasMany
    {
        return $this->hasMany(Result::class);
    }
}
