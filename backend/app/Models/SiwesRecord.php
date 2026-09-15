<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SiwesRecord extends Model
{
    public const STATUS_PENDING = 'PENDING';
    public const STATUS_ACTIVE = 'ACTIVE';
    public const STATUS_COMPLETED = 'COMPLETED';
    public const STATUS_TERMINATED = 'TERMINATED';

    protected $fillable = [
        'student_id', 'organization_name', 'organization_address',
        'supervisor_name', 'supervisor_phone', 'supervisor_email',
        'start_date', 'end_date', 'status',
        'assessment_score', 'assessment_remark', 'assessed_by', 'assessed_at',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
            'assessed_at' => 'datetime',
        ];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function assessedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assessed_by');
    }
}
