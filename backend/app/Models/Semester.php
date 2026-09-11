<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Semester extends Model
{
    use HasFactory;

    protected $fillable = [
        'academic_session_id', 'name', 'sort_order',
        'start_date', 'end_date', 'is_current',
    ];

    protected function casts(): array
    {
        return ['is_current' => 'boolean', 'start_date' => 'date', 'end_date' => 'date'];
    }

    public function academicSession(): BelongsTo
    {
        return $this->belongsTo(AcademicSession::class);
    }
}
