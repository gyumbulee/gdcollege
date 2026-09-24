<?php

namespace App\Http\Controllers\Api\V1\Cms;

use App\Http\Controllers\Api\V1\Cms\Concerns\GeneratesUniqueSlug;
use App\Http\Controllers\Concerns\UsesUploadsDisk;
use App\Http\Controllers\Controller;
use App\Http\Requests\Cms\GalleryRequest;
use App\Http\Responses\ApiResponse;
use App\Models\Gallery;
use App\Models\GalleryItem;
use App\Services\AuditLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class GalleryController extends Controller
{
    use ApiResponse, GeneratesUniqueSlug, UsesUploadsDisk;

    /** Excludes the FEATURED homepage carousel — that album is never listed in the public gallery, only surfaced via publicFeatured() on the homepage. */
    public function publicIndex()
    {
        return $this->success(
            Gallery::where('status', Gallery::STATUS_PUBLISHED)
                ->where('type', Gallery::TYPE_STANDARD)
                ->orderByDesc('created_at')
                ->get()
        );
    }

    public function publicShow(string $slug)
    {
        $gallery = Gallery::where('slug', $slug)
            ->where('status', Gallery::STATUS_PUBLISHED)
            ->where('type', Gallery::TYPE_STANDARD)
            ->with('items')
            ->first();

        if (! $gallery) {
            return $this->fail('Gallery not found.', [], 404);
        }

        return $this->success($gallery);
    }

    /** The homepage carousel's data source — the single published FEATURED gallery, with its items. Not found is a normal, expected state (no carousel configured yet), not an error. */
    public function publicFeatured()
    {
        $gallery = Gallery::where('status', Gallery::STATUS_PUBLISHED)
            ->where('type', Gallery::TYPE_FEATURED)
            ->with('items')
            ->first();

        if (! $gallery) {
            return $this->fail('No featured gallery configured.', [], 404);
        }

        return $this->success($gallery);
    }

    public function index()
    {
        return $this->success(Gallery::withCount('items')->orderByDesc('created_at')->get());
    }

    public function show(Gallery $gallery)
    {
        return $this->success($gallery->load('items'));
    }

    public function store(GalleryRequest $request, AuditLogger $audit)
    {
        $data = $request->validated();

        if (($data['type'] ?? Gallery::TYPE_STANDARD) === Gallery::TYPE_FEATURED && $this->featuredExists()) {
            return $this->fail('A homepage carousel gallery already exists. Edit that one instead of creating a second.', [], 422);
        }

        $gallery = Gallery::create([
            ...$data,
            'slug' => $this->uniqueSlug(Gallery::class, $request->string('title')),
        ]);

        $audit->log('cms.galleries.create', $gallery, null, $gallery->only(['title', 'type']));

        return $this->success($gallery, 'Gallery created.', 201);
    }

    public function update(GalleryRequest $request, Gallery $gallery, AuditLogger $audit)
    {
        $data = $request->validated();

        if (($data['type'] ?? $gallery->type) === Gallery::TYPE_FEATURED && $this->featuredExists($gallery->id)) {
            return $this->fail('A homepage carousel gallery already exists. Edit that one instead of creating a second.', [], 422);
        }

        $old = $gallery->only(['title', 'status', 'type']);
        $gallery->update($data);
        $audit->log('cms.galleries.update', $gallery, $old, $gallery->only(['title', 'status', 'type']));

        return $this->success($gallery, 'Gallery updated.');
    }

    private function featuredExists(?int $excludingId = null): bool
    {
        return Gallery::where('type', Gallery::TYPE_FEATURED)
            ->when($excludingId, fn ($q) => $q->where('id', '!=', $excludingId))
            ->exists();
    }

    public function destroy(Gallery $gallery, AuditLogger $audit)
    {
        foreach ($gallery->items as $item) {
            Storage::disk($this->uploadsDisk())->delete($item->image_path);
        }

        $audit->log('cms.galleries.delete', $gallery, $gallery->only(['title']), null);
        $gallery->delete();

        return $this->success([], 'Gallery deleted.');
    }

    public function addItem(Request $request, Gallery $gallery, AuditLogger $audit)
    {
        $request->validate(['image' => ['required', 'image', 'max:4096'], 'caption' => ['sometimes', 'nullable', 'string', 'max:255']]);

        $item = GalleryItem::create([
            'gallery_id' => $gallery->id,
            'image_path' => $request->file('image')->store('cms/gallery', $this->uploadsDisk()),
            'caption' => $request->input('caption'),
            'sort_order' => $gallery->items()->max('sort_order') + 1,
        ]);

        $audit->log('cms.galleries.item.add', $gallery, null, ['item_id' => $item->id]);

        return $this->success($item, 'Image added.', 201);
    }

    public function removeItem(Gallery $gallery, GalleryItem $item, AuditLogger $audit)
    {
        if ($item->gallery_id !== $gallery->id) {
            return $this->fail('Not found.', [], 404);
        }

        Storage::disk($this->uploadsDisk())->delete($item->image_path);
        $audit->log('cms.galleries.item.remove', $gallery, ['item_id' => $item->id], null);
        $item->delete();

        return $this->success([], 'Image removed.');
    }
}
