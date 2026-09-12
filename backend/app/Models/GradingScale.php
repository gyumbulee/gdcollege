<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GradingScale extends Model
{
    use HasFactory;

    protected $fillable = ['min_score', 'max_score', 'grade', 'grade_point'];

    public static function forScore(float $score): ?self
    {
        return static::where('min_score', '<=', $score)->where('max_score', '>=', $score)->first();
    }
}
