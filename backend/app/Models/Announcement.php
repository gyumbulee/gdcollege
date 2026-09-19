<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Announcement extends Model
{
    public const STATUS_DRAFT = 'DRAFT';
    public const STATUS_PUBLISHED = 'PUBLISHED';
    public const STATUS_ARCHIVED = 'ARCHIVED';

    public const AUDIENCE_ALL = 'ALL';
    public const AUDIENCE_STUDENTS = 'STUDENTS';
    public const AUDIENCE_STAFF = 'STAFF';
    public const AUDIENCE_SCHOOL = 'SCHOOL';
    public const AUDIENCE_DEPARTMENT = 'DEPARTMENT';
    public const AUDIENCE_PROGRAMME = 'PROGRAMME';
    public const AUDIENCE_LEVEL = 'LEVEL';

    protected $fillable = ['title', 'content', 'audience_type', 'audience_id', 'author_id', 'publish_at', 'expires_at', 'status'];

    protected function casts(): array
    {
        return ['publish_at' => 'datetime', 'expires_at' => 'datetime'];
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }
}
