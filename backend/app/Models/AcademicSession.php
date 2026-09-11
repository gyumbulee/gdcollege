<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AcademicSession extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'start_date', 'end_date', 'is_current'];

    protected function casts(): array
    {
        return ['is_current' => 'boolean', 'start_date' => 'date', 'end_date' => 'date'];
    }

    public function semesters(): HasMany
    {
        return $this->hasMany(Semester::class);
    }

    public static function current(): ?self
    {
        return static::where('is_current', true)->first();
    }
}
