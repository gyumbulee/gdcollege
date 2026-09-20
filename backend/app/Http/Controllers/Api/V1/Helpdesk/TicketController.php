<?php

namespace App\Http\Controllers\Api\V1\Helpdesk;

use App\Http\Controllers\Concerns\UsesUploadsDisk;
use App\Http\Controllers\Controller;
use App\Http\Requests\Helpdesk\TicketCreateRequest;
use App\Http\Requests\Helpdesk\TicketReplyRequest;
use App\Http\Resources\TicketResource;
use App\Http\Responses\ApiResponse;
use App\Models\SupportTicket;
use App\Services\AuditLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * A single controller for both sides of the helpdesk (§28: "Students/
 * applicants should be able to create tickets... Staff can reply and
 * resolve tickets") — ownership is checked inline (isStaff()) rather
 * than split into two controllers, since almost every action (view,
 * reply) is the same operation with a different authorization source
 * (own the ticket vs. hold `helpdesk.manage`).
 */
class TicketController extends Controller
{
    use ApiResponse, UsesUploadsDisk;

    private const WITH = ['user', 'assignedTo', 'messages.user'];

    private function isStaff(): bool
    {
        $user = Auth::user();

        return $user->hasPermission('helpdesk.view') || $user->hasPermission('helpdesk.manage') || Gate::allows('super-admin-bypass');
    }

    private function canManage(): bool
    {
        $user = Auth::user();

        return $user->hasPermission('helpdesk.manage') || Gate::allows('super-admin-bypass');
    }

    public function index(Request $request)
    {
        $query = SupportTicket::with(['user', 'assignedTo']);

        if ($this->isStaff()) {
            if ($request->filled('status')) {
                $query->where('status', $request->input('status'));
            }
            if ($request->filled('assigned_to')) {
                $query->where('assigned_to', $request->input('assigned_to'));
            }
        } else {
            $query->where('user_id', Auth::id());
        }

        return $this->success(TicketResource::collection(
            $query->orderByDesc('id')->paginate($request->integer('per_page', 25))
        ));
    }

    public function store(TicketCreateRequest $request, AuditLogger $audit)
    {
        $ticket = SupportTicket::create([
            ...$request->validated(),
            'user_id' => Auth::id(),
            'status' => SupportTicket::STATUS_OPEN,
        ]);

        $audit->log('helpdesk.ticket.create', $ticket);

        return $this->success(new TicketResource($ticket->load(['user', 'assignedTo'])), 'Ticket created.', 201);
    }

    public function show(SupportTicket $ticket)
    {
        abort_unless($ticket->user_id === Auth::id() || $this->isStaff(), 403);

        return $this->success(new TicketResource($ticket->load(self::WITH)));
    }

    public function reply(TicketReplyRequest $request, SupportTicket $ticket, AuditLogger $audit)
    {
        $isOwner = $ticket->user_id === Auth::id();
        $isStaffReply = $this->canManage();
        abort_unless($isOwner || $isStaffReply, 403);

        $attachmentPath = null;
        $attachmentName = null;
        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $attachmentPath = $file->store("tickets/{$ticket->id}", $this->privateUploadsDisk());
            $attachmentName = $file->getClientOriginalName();
        }

        $message = $ticket->messages()->create([
            'user_id' => Auth::id(),
            'is_staff_reply' => $isStaffReply,
            'message' => $request->validated('message'),
            'attachment_path' => $attachmentPath,
            'attachment_name' => $attachmentName,
        ]);

        // A staff reply moves an OPEN ticket forward; a requester reply to
        // a ticket staff had marked WAITING (on them) brings it back to
        // OPEN — neither touches a ticket already RESOLVED/CLOSED, which
        // only an explicit status change (updateStatus) can reopen.
        if ($isStaffReply && $ticket->status === SupportTicket::STATUS_OPEN) {
            $ticket->update(['status' => SupportTicket::STATUS_IN_PROGRESS]);
        } elseif (! $isStaffReply && $ticket->status === SupportTicket::STATUS_WAITING) {
            $ticket->update(['status' => SupportTicket::STATUS_OPEN]);
        }

        $audit->log('helpdesk.ticket.reply', $message);

        return $this->success(new TicketResource($ticket->fresh(self::WITH)), 'Reply added.', 201);
    }

    public function updateStatus(Request $request, SupportTicket $ticket, AuditLogger $audit)
    {
        abort_unless($this->canManage(), 403);

        $validated = $request->validate([
            'status' => ['required', Rule::in([
                SupportTicket::STATUS_OPEN, SupportTicket::STATUS_IN_PROGRESS, SupportTicket::STATUS_WAITING,
                SupportTicket::STATUS_RESOLVED, SupportTicket::STATUS_CLOSED,
            ])],
            'assigned_to' => ['nullable', 'exists:users,id'],
        ]);

        $old = $ticket->only(['status', 'assigned_to']);
        $ticket->update($validated);

        $audit->log('helpdesk.ticket.status', $ticket, $old, $ticket->only(['status', 'assigned_to']));

        return $this->success(new TicketResource($ticket->fresh(self::WITH)), 'Ticket updated.');
    }

    public function downloadAttachment(SupportTicket $ticket, int $messageId): StreamedResponse
    {
        abort_unless($ticket->user_id === Auth::id() || $this->isStaff(), 403);

        $message = $ticket->messages()->findOrFail($messageId);
        abort_if(! $message->attachment_path, 404);

        return Storage::disk($this->privateUploadsDisk())->download($message->attachment_path, $message->attachment_name);
    }
}
