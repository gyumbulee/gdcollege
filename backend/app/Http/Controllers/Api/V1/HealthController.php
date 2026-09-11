<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

/**
 * Simple liveness/readiness check, and a reference implementation of the
 * platform's standard success response envelope:
 *
 *   { "success": true, "message": "...", "data": {} }
 *
 * Every API controller should return responses in this shape (see
 * App\Http\Responses\ApiResponse, added alongside the first real module in
 * Phase 1, for a shared helper rather than repeating this by hand).
 */
class HealthController extends Controller
{
    public function __invoke(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'GD College Wase API is running.',
            'data' => [
                'status' => 'ok',
                'timestamp' => now()->toIso8601String(),
            ],
        ]);
    }
}
