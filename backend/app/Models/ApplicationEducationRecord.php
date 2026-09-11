<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApplicationEducationRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'application_id', 'exam_body', 'exam_number', 'exam_year',
        'school_attended', 'subjects',
    ];

    protected function casts(): array
    {
        return ['subjects' => 'array'];
    }

    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class);
    }
}
