<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DocumentTemplate extends Model
{
    public const TYPE_ADMISSION_LETTER = 'ADMISSION_LETTER';
    public const TYPE_COURSE_REG_SLIP = 'COURSE_REG_SLIP';
    public const TYPE_RESULT_SLIP = 'RESULT_SLIP';
    public const TYPE_PAYMENT_RECEIPT = 'PAYMENT_RECEIPT';
    public const TYPE_STATEMENT_OF_RESULT = 'STATEMENT_OF_RESULT';
    public const TYPE_TRANSCRIPT = 'TRANSCRIPT';
    public const TYPE_CLEARANCE_CERTIFICATE = 'CLEARANCE_CERTIFICATE';

    /** Instant types need no DocumentRequest — see DocumentIssuanceService. */
    public const INSTANT_TYPES = [
        self::TYPE_ADMISSION_LETTER, self::TYPE_COURSE_REG_SLIP,
        self::TYPE_RESULT_SLIP, self::TYPE_PAYMENT_RECEIPT,
    ];

    protected $fillable = [
        'type', 'name', 'description', 'is_active', 'requires_request',
        'file_path', 'original_filename', 'uploaded_by', 'uploaded_at',
    ];

    protected function casts(): array
    {
        return ['is_active' => 'boolean', 'requires_request' => 'boolean', 'uploaded_at' => 'datetime'];
    }
}
