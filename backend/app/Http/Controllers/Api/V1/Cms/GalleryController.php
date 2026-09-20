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

    public function publicIndex()
    {
        return $this->success(Gallery::where('status', Gallery::STATUS_PUBLISHED)->orderByDesc('created_at')->get());
    }

    public function publicShow(string $slug)
    {
        $gallery = Gallery::where('slug', $slug)->where('status', Gallery::STATUS_PUBLISHED)->with('items')->first();

        if (! $gallery) {
            return $this->fail('Gallery not found.', [], 404);
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
        $gallery = Gallery::create([
            ...$request->validated(),
            'slug' => $this->uniqueSlug(Gallery::class, $request->string('title')),
        ]);

        $audit->log('cms.galleries.create', $gallery, null, $gallery->only(['title']));

        return $this->success($gallery, 'Gallery created.', 201);
    }

    public function update(GalleryRequest $request, Gallery $gallery, AuditLogger $audit)
    {
        $old = $gallery->only(['title', 'status']);
        $gallery->update($request->validated());
        $audit->log('cms.galleries.update', $gallery, $old, $gallery->only(['title', 'status']));

        return $this->success($gallery, 'Gallery updated.');
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
