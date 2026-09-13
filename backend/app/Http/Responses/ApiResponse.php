<?php

namespace App\Http\Responses;

use Illuminate\Contracts\Pagination\Paginator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\ResourceCollection;
use Illuminate\Pagination\LengthAwarePaginator;

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
            'data' => $this->normalizeData($data),
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

    /**
     * Bug fix (discovered building Phase 9's frontend, the first real
     * consumer of a paginated staff listing): `SomeResource::collection($paginator)`
     * only attaches pagination meta (current_page/last_page/total/links)
     * when Laravel's router calls its `toResponse()` directly — e.g.
     * `return SomeResource::collection(...)` as the whole response. Every
     * staff index() in this codebase instead nests it inside
     * `['data' => ...]` via `success()`, which only ever triggers plain
     * `jsonSerialize()` — silently dropping all pagination metadata down
     * to a flat item array. Restore it explicitly here, once, so every
     * paginated success() response (existing and future) carries usable
     * `items` + `pagination` instead of losing it. No existing frontend
     * consumed the flat-array shape yet, so this isn't a breaking change
     * in practice — see docs/PROJECT_STATUS.md.
     */
    private function normalizeData(mixed $data): mixed
    {
        if (! $data instanceof ResourceCollection || ! $data->resource instanceof Paginator) {
            return $data;
        }

        $paginator = $data->resource;

        return [
            'items' => $data->collection->map(fn ($item) => $item->toArray(request()))->all(),
            'pagination' => [
                'current_page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'has_more_pages' => $paginator->hasMorePages(),
                'total' => $paginator instanceof LengthAwarePaginator ? $paginator->total() : null,
                'last_page' => $paginator instanceof LengthAwarePaginator ? $paginator->lastPage() : null,
            ],
        ];
    }
}
