<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClearanceItem extends Model
{
    public const STATUS_PENDING = 'PENDING';
    public const STATUS_APPROVED = 'APPROVED';
    public const STATUS_REJECTED = 'REJECTED';

    /**
     * Which role slug may act on each stage. A department HOD signs off
     * DEPARTMENT (department-scoped, like their other approvals — see
     * ChecksDepartmentScope); the rest are institution-wide roles.
     */
    public const STAGE_ROLES = [
        'DEPARTMENT' => 'hod',
        'LIBRARY' => 'library_officer',
        'BURSARY' => 'bursary_officer',
        'REGISTRY' => 'registrar',
        'EXAMINATION' => 'academic_officer',
    ];

    protected $fillable = ['clearance_request_id', 'stage', 'status', 'remark', 'approved_by', 'approved_at'];

    protected function casts(): array
    {
        return ['approved_at' => 'datetime'];
    }

    public function clearanceRequest(): BelongsTo
    {
        return $this->belongsTo(ClearanceRequest::class);
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
