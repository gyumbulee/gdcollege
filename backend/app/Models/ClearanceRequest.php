<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ClearanceRequest extends Model
{
    public const STATUS_PENDING = 'PENDING';
    public const STATUS_IN_PROGRESS = 'IN_PROGRESS';
    public const STATUS_COMPLETED = 'COMPLETED';
    public const STATUS_REJECTED = 'REJECTED';

    /** §23's fixed pipeline order — every clearance request gets exactly these five items. */
    public const STAGES = ['DEPARTMENT', 'LIBRARY', 'BURSARY', 'REGISTRY', 'EXAMINATION'];

    protected $fillable = ['student_id', 'academic_session_id', 'status', 'completed_at'];

    protected function casts(): array
    {
        return ['completed_at' => 'datetime'];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function academicSession(): BelongsTo
    {
        return $this->belongsTo(AcademicSession::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(ClearanceItem::class);
    }

    /**
     * Recomputes status from the items — the request never has its
     * status set directly by a controller (other than REJECTED, which a
     * rejected item forces via ClearanceService), so it can never drift
     * out of sync with its own items.
     */
    public function recomputeStatus(): void
    {
        $statuses = $this->items()->pluck('status');

        if ($statuses->contains(ClearanceItem::STATUS_REJECTED)) {
            $this->update(['status' => self::STATUS_REJECTED]);
        } elseif ($statuses->every(fn ($s) => $s === ClearanceItem::STATUS_APPROVED)) {
            $this->update(['status' => self::STATUS_COMPLETED, 'completed_at' => now()]);
        } elseif ($statuses->contains(ClearanceItem::STATUS_APPROVED)) {
            $this->update(['status' => self::STATUS_IN_PROGRESS]);
        } else {
            $this->update(['status' => self::STATUS_PENDING]);
        }
    }
}
