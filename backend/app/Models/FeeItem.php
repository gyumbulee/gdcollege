<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FeeItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'fee_structure_id', 'name', 'code', 'amount', 'is_mandatory', 'is_active', 'description',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'is_mandatory' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function feeStructure(): BelongsTo
    {
        return $this->belongsTo(FeeStructure::class);
    }
}
