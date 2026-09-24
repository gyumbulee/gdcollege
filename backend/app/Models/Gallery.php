<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Gallery extends Model
{
    public const STATUS_DRAFT = 'DRAFT';
    public const STATUS_PUBLISHED = 'PUBLISHED';

    /** STANDARD galleries list publicly at /gallery. FEATURED is the single, admin-curated homepage carousel — see the 2026_09_24 migration. */
    public const TYPE_STANDARD = 'STANDARD';
    public const TYPE_FEATURED = 'FEATURED';

    protected $fillable = ['slug', 'title', 'description', 'status', 'type'];

    public function items(): HasMany
    {
        return $this->hasMany(GalleryItem::class)->orderBy('sort_order');
    }
}
