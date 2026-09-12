<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Application extends Model
{
    use HasFactory;

    public const STATUS_DRAFT = 'DRAFT';
    public const STATUS_PAYMENT_PENDING = 'PAYMENT_PENDING';
    public const STATUS_PAYMENT_CONFIRMED = 'PAYMENT_CONFIRMED';
    public const STATUS_SUBMITTED = 'SUBMITTED';
    public const STATUS_UNDER_REVIEW = 'UNDER_REVIEW';
    public const STATUS_SHORTLISTED = 'SHORTLISTED';
    public const STATUS_ADMITTED = 'ADMITTED';
    public const STATUS_REJECTED = 'REJECTED';
    public const STATUS_ON_HOLD = 'ON_HOLD';
    public const STATUS_WITHDRAWN = 'WITHDRAWN';

    /** Statuses the applicant may still edit their own application in. */
    public const EDITABLE_STATUSES = [self::STATUS_DRAFT];

    protected $fillable = [
        'applicant_id', 'academic_session_id', 'programme_id',
        'application_number', 'status', 'fee_paid', 'submitted_at',
    ];

    protected function casts(): array
    {
        return ['fee_paid' => 'boolean', 'submitted_at' => 'datetime'];
    }

    public function applicant(): BelongsTo
    {
        return $this->belongsTo(Applicant::class);
    }

    public function academicSession(): BelongsTo
    {
        return $this->belongsTo(AcademicSession::class);
    }

    public function programme(): BelongsTo
    {
        return $this->belongsTo(Programme::class);
    }

    public function educationRecords(): HasMany
    {
        return $this->hasMany(ApplicationEducationRecord::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(ApplicationDocument::class);
    }

    public function admission(): HasOne
    {
        return $this->hasOne(Admission::class);
    }

    public function student(): HasOne
    {
        return $this->hasOne(Student::class);
    }

    public function isEditableByApplicant(): bool
    {
        return in_array($this->status, self::EDITABLE_STATUSES, true);
    }
}
