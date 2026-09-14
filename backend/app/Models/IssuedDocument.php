<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IssuedDocument extends Model
{
    public const STATUS_ACTIVE = 'ACTIVE';
    public const STATUS_REVOKED = 'REVOKED';

    protected $fillable = [
        'document_number', 'verification_code', 'type', 'student_id', 'document_request_id',
        'issued_by', 'issued_at', 'status', 'revoked_reason', 'content',
    ];

    protected function casts(): array
    {
        return ['issued_at' => 'datetime', 'content' => 'array'];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function documentRequest(): BelongsTo
    {
        return $this->belongsTo(DocumentRequest::class);
    }

    public function issuedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'issued_by');
    }

    /**
     * §22: "Do not expose private files publicly." What the public
     * /verify/{code} page is allowed to show — enough to confirm
     * authenticity, nothing from `content` that would let a stranger
     * read the document's substance (scores, amounts, full names of
     * third parties, etc.).
     */
    public function toPublicArray(): array
    {
        return [
            'valid' => $this->status === self::STATUS_ACTIVE,
            'status' => $this->status,
            'type' => $this->type,
            'document_number' => $this->document_number,
            'issued_at' => $this->issued_at,
            'student_name' => $this->student?->user?->name,
            'programme' => $this->student?->programme?->name,
            'revoked_reason' => $this->status === self::STATUS_REVOKED ? $this->revoked_reason : null,
        ];
    }
}
