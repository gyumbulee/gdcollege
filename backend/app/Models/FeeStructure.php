<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FeeStructure extends Model
{
    use HasFactory;

    protected $fillable = [
        'name', 'academic_session_id', 'programme_id', 'level_id', 'description', 'is_active',
    ];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    public function academicSession(): BelongsTo
    {
        return $this->belongsTo(AcademicSession::class);
    }

    public function programme(): BelongsTo
    {
        return $this->belongsTo(Programme::class);
    }

    public function level(): BelongsTo
    {
        return $this->belongsTo(Level::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(FeeItem::class);
    }

    /** Sum of active items' amounts — what a fresh invoice from this structure would total. */
    public function totalAmount(): float
    {
        return (float) $this->items()->where('is_active', true)->sum('amount');
    }

    /**
     * How well this structure matches a student's (session, programme,
     * level) — higher is more specific. Used by InvoiceGenerationService
     * to pick the best-matching structure when several could apply.
     */
    public function specificity(): int
    {
        return ($this->programme_id ? 1 : 0) + ($this->level_id ? 1 : 0);
    }
}
