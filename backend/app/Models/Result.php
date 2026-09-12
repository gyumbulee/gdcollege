<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Result extends Model
{
    use HasFactory;

    public const STATUS_DRAFT = 'DRAFT';
    public const STATUS_SUBMITTED = 'SUBMITTED';
    public const STATUS_REVIEWED = 'REVIEWED';
    public const STATUS_VERIFIED = 'VERIFIED';
    public const STATUS_APPROVED = 'APPROVED';
    public const STATUS_PUBLISHED = 'PUBLISHED';

    protected $fillable = [
        'course_offering_id', 'student_id', 'component_scores', 'total_score',
        'grade', 'grade_point', 'status', 'submitted_at',
        'reviewed_by', 'reviewed_at', 'verified_by', 'verified_at',
        'approved_by', 'approved_at', 'published_at',
    ];

    protected function casts(): array
    {
        return [
            'component_scores' => 'array',
            'submitted_at' => 'datetime', 'reviewed_at' => 'datetime',
            'verified_at' => 'datetime', 'approved_at' => 'datetime', 'published_at' => 'datetime',
        ];
    }

    public function courseOffering(): BelongsTo
    {
        return $this->belongsTo(CourseOffering::class);
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function isEditableByLecturer(): bool
    {
        return $this->status === self::STATUS_DRAFT;
    }
}
