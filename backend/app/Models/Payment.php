<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Payment extends Model
{
    use HasFactory;

    public const STATUS_PENDING = 'PENDING';
    public const STATUS_SUCCESSFUL = 'SUCCESSFUL';
    public const STATUS_FAILED = 'FAILED';
    public const STATUS_REFUNDED = 'REFUNDED';

    protected $fillable = [
        'reference', 'invoice_id', 'student_id', 'gateway', 'gateway_reference',
        'amount', 'status', 'paid_at', 'verified_at', 'gateway_response',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'paid_at' => 'datetime',
            'verified_at' => 'datetime',
            'gateway_response' => 'array',
        ];
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function financialTransactions(): HasMany
    {
        return $this->hasMany(FinancialTransaction::class);
    }
}
