<?php

namespace App\Http\Controllers\Api\V1\Cms;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cms\AnnouncementRequest;
use App\Http\Responses\ApiResponse;
use App\Models\Announcement;
use App\Services\AuditLogger;
use App\Services\NotificationDispatcher;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * §26. `index`/`store`/`update`/`publish`/`archive` are the authoring
 * side, gated by `cms.manage`. `mine()` is what every signed-in user's
 * portal actually reads from — it resolves the announcement's audience
 * against the CURRENT user (their programme/department/school/level if
 * they're a student, "staff" if they hold any staff role), not a
 * generic public list, so a Level II Computer Science student never sees
 * an announcement targeted at Level I Mass Communication.
 */
class AnnouncementController extends Controller
{
    use ApiResponse;

    /** Public homepage "important notices" (§5) — ALL-audience only, since there's no visitor identity to target anything narrower against. */
    public function publicIndex()
    {
        $announcements = Announcement::query()
            ->where('status', Announcement::STATUS_PUBLISHED)
            ->where('audience_type', Announcement::AUDIENCE_ALL)
            ->where(fn ($q) => $q->whereNull('publish_at')->orWhere('publish_at', '<=', now()))
            ->where(fn ($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>=', now()))
            ->orderByDesc('publish_at')
            ->limit(10)
            ->get();

        return $this->success($announcements);
    }

    public function index(Request $request)
    {
        $query = Announcement::with('author')->orderByDesc('created_at');

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        return $this->success($query->paginate($request->integer('per_page', 25)));
    }

    public function store(AnnouncementRequest $request, AuditLogger $audit)
    {
        $announcement = Announcement::create([
            ...$request->validated(),
            'author_id' => Auth::id(),
            'status' => Announcement::STATUS_DRAFT,
        ]);

        $audit->log('announcements.create', $announcement, null, $announcement->only(['title', 'audience_type']));

        return $this->success($announcement, 'Announcement created as a draft.', 201);
    }

    public function update(AnnouncementRequest $request, Announcement $announcement, AuditLogger $audit)
    {
        $old = $announcement->only(['title', 'content', 'audience_type', 'audience_id']);
        $announcement->update($request->validated());
        $audit->log('announcements.update', $announcement, $old, $announcement->only(['title', 'content', 'audience_type', 'audience_id']));

        return $this->success($announcement, 'Announcement updated.');
    }

    /** Publishing is the one action that actually notifies anyone — a draft never does. */
    public function publish(Announcement $announcement, AuditLogger $audit, NotificationDispatcher $notifications)
    {
        $announcement->update([
            'status' => Announcement::STATUS_PUBLISHED,
            'publish_at' => $announcement->publish_at ?? now(),
        ]);

        $audit->log('announcements.publish', $announcement);
        $notifications->fanOutAnnouncement($announcement);

        return $this->success($announcement, 'Announcement published and users notified.');
    }

    public function archive(Announcement $announcement, AuditLogger $audit)
    {
        $announcement->update(['status' => Announcement::STATUS_ARCHIVED]);
        $audit->log('announcements.archive', $announcement);

        return $this->success($announcement, 'Announcement archived.');
    }

    public function mine(Request $request)
    {
        $user = $request->user();
        $student = $user->student;

        $query = Announcement::query()
            ->where('status', Announcement::STATUS_PUBLISHED)
            ->where(fn ($q) => $q->whereNull('publish_at')->orWhere('publish_at', '<=', now()))
            ->where(fn ($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>=', now()))
            ->where(function ($q) use ($user, $student) {
                $q->where('audience_type', Announcement::AUDIENCE_ALL);

                if ($student) {
                    $q->orWhere('audience_type', Announcement::AUDIENCE_STUDENTS)
                        ->orWhere(fn ($qq) => $qq->where('audience_type', Announcement::AUDIENCE_PROGRAMME)->where('audience_id', $student->programme_id))
                        ->orWhere(fn ($qq) => $qq->where('audience_type', Announcement::AUDIENCE_LEVEL)->where('audience_id', $student->current_level_id))
                        ->orWhere(fn ($qq) => $qq->where('audience_type', Announcement::AUDIENCE_DEPARTMENT)->where('audience_id', $student->programme?->department_id))
                        ->orWhere(fn ($qq) => $qq->where('audience_type', Announcement::AUDIENCE_SCHOOL)->where('audience_id', $student->programme?->department?->school_id));
                } elseif (! $user->roles->pluck('slug')->intersect(['applicant', 'student'])->isNotEmpty()) {
                    $q->orWhere('audience_type', Announcement::AUDIENCE_STAFF);
                }
            })
            ->orderByDesc('publish_at');

        return $this->success($query->limit(20)->get());
    }
}
