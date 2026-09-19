<?php

namespace App\Http\Controllers\Api\V1\Cms;

use App\Http\Controllers\Api\V1\Cms\Concerns\GeneratesUniqueSlug;
use App\Http\Controllers\Controller;
use App\Http\Requests\Cms\PageRequest;
use App\Http\Responses\ApiResponse;
use App\Models\Page;
use App\Services\AuditLogger;
use Illuminate\Support\Facades\Auth;

class PageController extends Controller
{
    use ApiResponse, GeneratesUniqueSlug;

    /** Public — published only. §27: "Public content should not require developer intervention for normal updates." */
    public function publicShow(string $slug)
    {
        $page = Page::where('slug', $slug)->where('status', Page::STATUS_PUBLISHED)->first();

        if (! $page) {
            return $this->fail('Page not found.', [], 404);
        }

        return $this->success($page);
    }

    /** Staff — every status, for the admin list. */
    public function index()
    {
        return $this->success(Page::with('author')->orderBy('title')->get());
    }

    public function show(Page $page)
    {
        return $this->success($page->load('author'));
    }

    public function store(PageRequest $request, AuditLogger $audit)
    {
        $page = Page::create([
            ...$request->validated(),
            'slug' => $this->uniqueSlug(Page::class, $request->string('title')),
            'author_id' => Auth::id(),
        ]);

        $audit->log('cms.pages.create', $page, null, $page->only(['title', 'status']));

        return $this->success($page, 'Page created.', 201);
    }

    public function update(PageRequest $request, Page $page, AuditLogger $audit)
    {
        $old = $page->only(['title', 'content', 'status']);
        $page->update($request->validated());
        $audit->log('cms.pages.update', $page, $old, $page->only(['title', 'content', 'status']));

        return $this->success($page, 'Page updated.');
    }

    public function destroy(Page $page, AuditLogger $audit)
    {
        $audit->log('cms.pages.delete', $page, $page->only(['title', 'slug']), null);
        $page->delete();

        return $this->success([], 'Page deleted.');
    }
}
