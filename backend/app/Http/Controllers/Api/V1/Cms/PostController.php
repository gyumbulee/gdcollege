<?php

namespace App\Http\Controllers\Api\V1\Cms;

use App\Http\Controllers\Api\V1\Cms\Concerns\GeneratesUniqueSlug;
use App\Http\Controllers\Controller;
use App\Http\Requests\Cms\PostRequest;
use App\Http\Responses\ApiResponse;
use App\Models\Post;
use App\Services\AuditLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class PostController extends Controller
{
    use ApiResponse, GeneratesUniqueSlug;

    private const DISK = 'public';

    public function publicIndex(Request $request)
    {
        $posts = Post::where('status', Post::STATUS_PUBLISHED)
            ->orderByDesc('published_at')
            ->paginate($request->integer('per_page', 12));

        return $this->success($posts);
    }

    public function publicShow(string $slug)
    {
        $post = Post::where('slug', $slug)->where('status', Post::STATUS_PUBLISHED)->first();

        if (! $post) {
            return $this->fail('Article not found.', [], 404);
        }

        return $this->success($post);
    }

    public function index(Request $request)
    {
        return $this->success(
            Post::with('author')->orderByDesc('created_at')->paginate($request->integer('per_page', 25))
        );
    }

    public function show(Post $post)
    {
        return $this->success($post->load('author'));
    }

    public function store(PostRequest $request, AuditLogger $audit)
    {
        $post = Post::create([
            ...$request->safe()->except('cover_image'),
            'slug' => $this->uniqueSlug(Post::class, $request->string('title')),
            'author_id' => Auth::id(),
            'status' => $request->input('status', Post::STATUS_DRAFT),
        ]);

        if ($request->hasFile('cover_image')) {
            $post->update(['cover_image_path' => $request->file('cover_image')->store('cms/posts', self::DISK)]);
        }

        if ($post->status === Post::STATUS_PUBLISHED && ! $post->published_at) {
            $post->update(['published_at' => now()]);
        }

        $audit->log('cms.posts.create', $post, null, $post->only(['title', 'status']));

        return $this->success($post, 'Post created.', 201);
    }

    public function update(PostRequest $request, Post $post, AuditLogger $audit)
    {
        $old = $post->only(['title', 'content', 'status']);
        $post->update($request->safe()->except('cover_image'));

        if ($request->hasFile('cover_image')) {
            if ($post->cover_image_path) {
                Storage::disk(self::DISK)->delete($post->cover_image_path);
            }
            $post->update(['cover_image_path' => $request->file('cover_image')->store('cms/posts', self::DISK)]);
        }

        if ($post->status === Post::STATUS_PUBLISHED && ! $post->published_at) {
            $post->update(['published_at' => now()]);
        }

        $audit->log('cms.posts.update', $post, $old, $post->only(['title', 'content', 'status']));

        return $this->success($post, 'Post updated.');
    }

    public function destroy(Post $post, AuditLogger $audit)
    {
        if ($post->cover_image_path) {
            Storage::disk(self::DISK)->delete($post->cover_image_path);
        }

        $audit->log('cms.posts.delete', $post, $post->only(['title', 'slug']), null);
        $post->delete();

        return $this->success([], 'Post deleted.');
    }
}
