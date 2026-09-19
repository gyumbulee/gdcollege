<?php

namespace App\Http\Controllers\Api\V1\Notifications;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * Every authenticated user's own notifications — applicant, student, or
 * staff alike. Always scoped to `Auth::id()`, never a route parameter, so
 * cross-user access isn't structurally possible here, same reasoning as
 * StudentResultController's "only ever reachable for your own records"
 * pattern from Phase 8.
 */
class NotificationController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $query = Notification::where('user_id', Auth::id())->orderByDesc('created_at');

        if ($request->boolean('unread_only')) {
            $query->whereNull('read_at');
        }

        return $this->success([
            'items' => $query->limit(50)->get(),
            'unread_count' => Notification::where('user_id', Auth::id())->whereNull('read_at')->count(),
        ]);
    }

    public function markRead(Notification $notification)
    {
        if ($notification->user_id !== Auth::id()) {
            return $this->fail('Not found.', [], 404);
        }

        if (! $notification->read_at) {
            $notification->update(['read_at' => now()]);
        }

        return $this->success($notification);
    }

    public function markAllRead()
    {
        Notification::where('user_id', Auth::id())->whereNull('read_at')->update(['read_at' => now()]);

        return $this->success([], 'All notifications marked as read.');
    }
}
