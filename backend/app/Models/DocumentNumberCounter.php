<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DocumentNumberCounter extends Model
{
    protected $fillable = ['type', 'next_sequence'];
}
