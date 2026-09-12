<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CourseRegistrationItem extends Model
{
    use HasFactory;

    protected $fillable = ['course_registration_id', 'course_offering_id', 'is_carryover'];

    protected function casts(): array
    {
        return ['is_carryover' => 'boolean'];
    }

    public function courseRegistration(): BelongsTo
    {
        return $this->belongsTo(CourseRegistration::class);
    }

    public function courseOffering(): BelongsTo
    {
        return $this->belongsTo(CourseOffering::class);
    }
}
