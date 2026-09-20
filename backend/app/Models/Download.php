<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class Download extends Model
{
    protected $fillable = ['title', 'category', 'file_path', 'original_filename', 'uploaded_by'];
    protected $appends = ['file_url'];

    protected function fileUrl(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->file_path ? Storage::disk(config('filesystems.uploads_disk'))->url($this->file_path) : null,
        );
    }

    public function uploadedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
