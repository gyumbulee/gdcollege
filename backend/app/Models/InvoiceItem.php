<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InvoiceItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'invoice_id', 'fee_item_id', 'name', 'amount', 'discount_amount', 'waived_amount',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'waived_amount' => 'decimal:2',
        ];
    }

    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class);
    }

    public function feeItem(): BelongsTo
    {
        return $this->belongsTo(FeeItem::class);
    }

    /** What the student actually owes for this line, after discount/waiver. */
    public function netAmount(): float
    {
        return (float) $this->amount - (float) $this->discount_amount - (float) $this->waived_amount;
    }
}
