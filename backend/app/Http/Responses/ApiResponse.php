<?php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;

/**
 * Shared helper for the platform's standard response envelope (see the
 * platform spec §API conventions). Use in controllers via `use ApiResponse;`
 * instead of hand-writing the envelope each time.
 */
trait ApiResponse
{
    protected function success(mixed $data = [], string $message = 'Operation completed successfully.', int $status = 200): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], $status);
    }

    protected function fail(string $message = 'The given data was invalid.', array $errors = [], int $status = 422): JsonResponse
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'errors' => $errors,
        ], $status);
    }
}
