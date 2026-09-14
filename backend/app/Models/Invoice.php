<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Invoice extends Model
{
    use HasFactory;

    public const STATUS_PENDING = 'PENDING';
    public const STATUS_PARTIALLY_PAID = 'PARTIALLY_PAID';
    public const STATUS_PAID = 'PAID';
    public const STATUS_VOID = 'VOID';

    protected $fillable = [
        'invoice_number', 'student_id', 'academic_session_id', 'semester_id', 'fee_structure_id',
        'status', 'total_amount', 'amount_paid', 'balance', 'due_date', 'generated_by',
        'voided_at', 'void_reason',
    ];

    protected function casts(): array
    {
        return [
            'total_amount' => 'decimal:2',
            'amount_paid' => 'decimal:2',
            'balance' => 'decimal:2',
            'due_date' => 'date',
            'voided_at' => 'datetime',
        ];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function academicSession(): BelongsTo
    {
        return $this->belongsTo(AcademicSession::class);
    }

    public function semester(): BelongsTo
    {
        return $this->belongsTo(Semester::class);
    }

    public function feeStructure(): BelongsTo
    {
        return $this->belongsTo(FeeStructure::class);
    }

    public function generatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'generated_by');
    }

    public function items(): HasMany
    {
        return $this->hasMany(InvoiceItem::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function isSettled(): bool
    {
        return in_array($this->status, [self::STATUS_PAID, self::STATUS_VOID], true);
    }
}
