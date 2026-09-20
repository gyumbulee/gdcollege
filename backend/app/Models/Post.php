<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class Post extends Model
{
    public const STATUS_DRAFT = 'DRAFT';
    public const STATUS_PUBLISHED = 'PUBLISHED';

    protected $fillable = ['slug', 'title', 'excerpt', 'content', 'cover_image_path', 'status', 'published_at', 'author_id'];
    protected $appends = ['cover_image_url'];

    protected function casts(): array
    {
        return ['published_at' => 'datetime'];
    }

    protected function coverImageUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->cover_image_path ? Storage::disk(config('filesystems.uploads_disk'))->url($this->cover_image_path) : null,
        );
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }
}
