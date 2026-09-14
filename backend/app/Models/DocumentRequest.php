<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class DocumentRequest extends Model
{
    public const STATUS_REQUESTED = 'REQUESTED';
    public const STATUS_PROCESSING = 'PROCESSING';
    public const STATUS_READY = 'READY';
    public const STATUS_ISSUED = 'ISSUED';
    public const STATUS_REJECTED = 'REJECTED';

    protected $fillable = [
        'student_id', 'type', 'status', 'notes', 'rejection_reason',
        'requested_by', 'processed_by', 'processed_at',
    ];

    protected function casts(): array
    {
        return ['processed_at' => 'datetime'];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function requestedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    public function processedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'processed_by');
    }

    public function issuedDocument(): HasOne
    {
        return $this->hasOne(IssuedDocument::class);
    }
}
