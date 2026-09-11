<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ApplicationNumberCounter extends Model
{
    protected $fillable = ['academic_session_id', 'next_sequence'];
}
