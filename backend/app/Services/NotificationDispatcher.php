<?php

namespace App\Services;

use App\Models\Announcement;
use App\Models\Notification;
use App\Models\Student;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

/**
 * §25: in-app notifications, initially — the spec explicitly scopes
 * Phase 17 to in-app only, with "Email architecture" and "SMS-ready
 * architecture" as separate line items, so this dispatches to the
 * `notifications` table only. Email/SMS delivery is a real, deliberate
 * gap, not an oversight — wiring in a mail/SMS driver here later doesn't
 * change this service's interface, only what it does in addition to the
 * in-app row.
 *
 * All eight of §25's listed trigger events are wired: admission decision
 * (StaffApplicationController), payment confirmed (PaymentVerificationService,
 * both invoice and application-fee paths), result published
 * (StaffResultReviewController), course registration approved/returned
 * (StaffCourseRegistrationController), clearance stage updated
 * (ClearanceService), document ready (DocumentIssuanceService — one
 * choke point covers every document type), announcement published
 * (AnnouncementController -> fanOutAnnouncement() below), and course
 * registration opened — the one genuinely date-driven trigger, fired by
 * a scheduled command rather than inside a request; see
 * App\Console\Commands\NotifyRegistrationOpened and backend/README.md's
 * "Scheduled tasks" section for the real cron requirement that makes it
 * actually run.
 */
class NotificationDispatcher
{
    public function toUser(int $userId, string $type, string $title, ?string $body = null, ?string $link = null): Notification
    {
        return Notification::create([
            'user_id' => $userId,
            'type' => $type,
            'title' => $title,
            'body' => $body,
            'link' => $link,
        ]);
    }

    /** @param  iterable<int>  $userIds */
    public function toUsers(iterable $userIds, string $type, string $title, ?string $body = null, ?string $link = null): void
    {
        foreach ($userIds as $userId) {
            $this->toUser($userId, $type, $title, $body, $link);
        }
    }

    /**
     * Fans an announcement out to every matching user's in-app
     * notification list at the moment it's published. §26's audience
     * types: ALL, STUDENTS, STAFF, SCHOOL, DEPARTMENT, PROGRAMME, LEVEL.
     */
    public function fanOutAnnouncement(Announcement $announcement): void
    {
        $userIds = $this->resolveAudience($announcement->audience_type, $announcement->audience_id);

        $this->toUsers(
            $userIds,
            'announcement.published',
            $announcement->title,
            Str::limit(strip_tags($announcement->content), 200),
            '/portal'
        );
    }

    /** @return Collection<int,int> user IDs */
    private function resolveAudience(string $audienceType, ?int $audienceId): Collection
    {
        return match ($audienceType) {
            Announcement::AUDIENCE_ALL => User::pluck('id'),
            Announcement::AUDIENCE_STUDENTS => User::whereHas('roles', fn ($q) => $q->where('slug', 'student'))->pluck('id'),
            Announcement::AUDIENCE_STAFF => User::whereHas('roles', fn ($q) => $q->whereNotIn('slug', ['applicant', 'student']))->pluck('id'),
            Announcement::AUDIENCE_SCHOOL => Student::whereHas('programme.department', fn ($q) => $q->where('school_id', $audienceId))->pluck('user_id'),
            Announcement::AUDIENCE_DEPARTMENT => Student::whereHas('programme', fn ($q) => $q->where('department_id', $audienceId))->pluck('user_id'),
            Announcement::AUDIENCE_PROGRAMME => Student::where('programme_id', $audienceId)->pluck('user_id'),
            Announcement::AUDIENCE_LEVEL => Student::where('current_level_id', $audienceId)->pluck('user_id'),
            default => collect(),
        };
    }
}
