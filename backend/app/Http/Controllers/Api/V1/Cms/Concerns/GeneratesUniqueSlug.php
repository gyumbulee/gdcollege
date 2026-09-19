<?php

namespace App\Http\Controllers\Api\V1\Cms\Concerns;

use Illuminate\Support\Str;

/**
 * Shared by every CMS controller that has a slug column (Page/Post/Event/
 * Gallery) — admins type a title, not a URL slug; this generates one and
 * de-duplicates it, so two "Matriculation Ceremony" posts don't collide.
 */
trait GeneratesUniqueSlug
{
    private function uniqueSlug(string $model, string $title, ?int $ignoreId = null): string
    {
        $base = Str::slug($title) ?: 'item';
        $slug = $base;
        $suffix = 1;

        while ($model::where('slug', $slug)->when($ignoreId, fn ($q) => $q->where('id', '!=', $ignoreId))->exists()) {
            $slug = $base.'-'.(++$suffix);
        }

        return $slug;
    }
}
