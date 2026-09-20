<?php

namespace App\Http\Controllers\Api\V1\Cms;

use App\Http\Controllers\Api\V1\Cms\Concerns\GeneratesUniqueSlug;
use App\Http\Controllers\Concerns\UsesUploadsDisk;
use App\Http\Controllers\Controller;
use App\Http\Requests\Cms\EventRequest;
use App\Http\Responses\ApiResponse;
use App\Models\Event;
use App\Services\AuditLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class EventController extends Controller
{
    use ApiResponse, GeneratesUniqueSlug, UsesUploadsDisk;

    public function publicIndex(Request $request)
    {
        $events = Event::where('status', Event::STATUS_PUBLISHED)
            ->when(! $request->boolean('include_past'), fn ($q) => $q->where('starts_at', '>=', now()->startOfDay()))
            ->orderBy('starts_at')
            ->paginate($request->integer('per_page', 12));

        return $this->success($events);
    }

    public function publicShow(string $slug)
    {
        $event = Event::where('slug', $slug)->where('status', Event::STATUS_PUBLISHED)->first();

        if (! $event) {
            return $this->fail('Event not found.', [], 404);
        }

        return $this->success($event);
    }

    public function index(Request $request)
    {
        return $this->success(
            Event::with('author')->orderByDesc('starts_at')->paginate($request->integer('per_page', 25))
        );
    }

    public function show(Event $event)
    {
        return $this->success($event->load('author'));
    }

    public function store(EventRequest $request, AuditLogger $audit)
    {
        $event = Event::create([
            ...$request->safe()->except('cover_image'),
            'slug' => $this->uniqueSlug(Event::class, $request->string('title')),
            'author_id' => Auth::id(),
            'status' => $request->input('status', Event::STATUS_DRAFT),
        ]);

        if ($request->hasFile('cover_image')) {
            $event->update(['cover_image_path' => $request->file('cover_image')->store('cms/events', $this->uploadsDisk())]);
        }

        $audit->log('cms.events.create', $event, null, $event->only(['title', 'starts_at', 'status']));

        return $this->success($event, 'Event created.', 201);
    }

    public function update(EventRequest $request, Event $event, AuditLogger $audit)
    {
        $old = $event->only(['title', 'starts_at', 'status']);
        $event->update($request->safe()->except('cover_image'));

        if ($request->hasFile('cover_image')) {
            if ($event->cover_image_path) {
                Storage::disk($this->uploadsDisk())->delete($event->cover_image_path);
            }
            $event->update(['cover_image_path' => $request->file('cover_image')->store('cms/events', $this->uploadsDisk())]);
        }

        $audit->log('cms.events.update', $event, $old, $event->only(['title', 'starts_at', 'status']));

        return $this->success($event, 'Event updated.');
    }

    public function destroy(Event $event, AuditLogger $audit)
    {
        if ($event->cover_image_path) {
            Storage::disk($this->uploadsDisk())->delete($event->cover_image_path);
        }

        $audit->log('cms.events.delete', $event, $event->only(['title', 'slug']), null);
        $event->delete();

        return $this->success([], 'Event deleted.');
    }
}
