<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * Central helper for writing audit_logs rows. Use this instead of writing
 * to the AuditLog model directly, so every critical action is recorded in
 * a consistent shape (see Master Implementation Brief §35 for the list of
 * actions that must be logged).
 *
 * Usage:
 *   app(AuditLogger::class)->log('login');
 *   app(AuditLogger::class)->log('results.publish', $result, $old, $new);
 */
class AuditLogger
{
    public function __construct(private readonly Request $request)
    {
    }

    public function log(
        string $action,
        ?object $target = null,
        ?array $oldValues = null,
        ?array $newValues = null,
    ): AuditLog {
        return AuditLog::create([
            'user_id' => Auth::id(),
            'action' => $action,
            'target_type' => $target ? get_class($target) : null,
            'target_id' => $target?->id,
            'old_values' => $oldValues,
            'new_values' => $newValues,
            'ip_address' => $this->request->ip(),
            'user_agent' => $this->request->userAgent(),
        ]);
    }
}
