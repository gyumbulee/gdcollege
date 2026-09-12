<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StudentProgrammeHistory extends Model
{
    use HasFactory;

    protected $fillable = ['student_id', 'from_programme_id', 'to_programme_id', 'reason', 'changed_by', 'changed_at'];

    protected function casts(): array
    {
        return ['changed_at' => 'datetime'];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function fromProgramme(): BelongsTo
    {
        return $this->belongsTo(Programme::class, 'from_programme_id');
    }

    public function toProgramme(): BelongsTo
    {
        return $this->belongsTo(Programme::class, 'to_programme_id');
    }

    public function changedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}
