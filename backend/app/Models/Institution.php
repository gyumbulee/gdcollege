<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Institution configuration — see Phase 0/1 docs. There should normally be
 * exactly one row; application code should fetch it via
 * Institution::first() rather than assuming an id.
 */
class Institution extends Model
{
    use HasFactory;

    protected $fillable = [
        'formal_name', 'short_name', 'motto', 'address', 'city', 'state',
        'country', 'phone', 'email', 'logo_path', 'banner_path',
    ];
}
