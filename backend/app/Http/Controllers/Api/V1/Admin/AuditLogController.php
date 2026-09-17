<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Resources\Admin\AuditLogResource;
use App\Http\Responses\ApiResponse;
use App\Models\AuditLog;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

/**
 * Genuinely missing before Phase 21: `audit_logs.view` has been defined
 * and granted to `management` and `ict_administrator` since Phase 1, and
 * every phase since has dutifully written rows into audit_logs via
 * AuditLogger — but nothing anywhere ever read them back. §35's entire
 * "every critical action must be traceable" requirement had no way to
 * actually trace anything until now.
 */
class AuditLogController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $query = AuditLog::with('user')->orderByDesc('created_at');

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->input('user_id'));
        }

        if ($request->filled('action')) {
            $query->where('action', 'like', $request->input('action').'%');
        }

        if ($request->filled('target_type')) {
            $query->where('target_type', 'App\\Models\\'.$request->input('target_type'));
        }

        if ($request->filled('from')) {
            $query->whereDate('created_at', '>=', $request->date('from'));
        }

        if ($request->filled('to')) {
            $query->whereDate('created_at', '<=', $request->date('to'));
        }

        return $this->success(
            AuditLogResource::collection($query->paginate($request->integer('per_page', 50)))
        );
    }

    public function show(AuditLog $auditLog)
    {
        return $this->success(new AuditLogResource($auditLog->load('user')));
    }
}
