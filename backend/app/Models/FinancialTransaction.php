<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FinancialTransaction extends Model
{
    use HasFactory;

    public const TYPE_PAYMENT = 'PAYMENT';
    public const TYPE_REFUND = 'REFUND';
    public const TYPE_ADJUSTMENT = 'ADJUSTMENT';
    public const TYPE_WAIVER = 'WAIVER';
    public const TYPE_DISCOUNT = 'DISCOUNT';
    public const TYPE_PENALTY = 'PENALTY';

    public const DIRECTION_CREDIT = 'CREDIT';
    public const DIRECTION_DEBIT = 'DEBIT';

    protected $fillable = [
        'invoice_id', 'payment_id', 'student_id', 'type', 'direction', 'amount',
        'description', 'performed_by',
    ];

    protected function casts(): array
    {
        return ['amount' => 'decimal:2'];
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function performedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'performed_by');
    }
}
