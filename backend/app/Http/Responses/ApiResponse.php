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
    protected function success(
        mixed $data = [],
        string $message = 'Operation completed successfully.',
        int $status = 200
    ): JsonResponse {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $this->normalizeData($data),
        ], $status);
    }

    protected function fail(
        string $message = 'The given data was invalid.',
        array $errors = [],
        int $status = 422
    ): JsonResponse {
        return response()->json([
            'success' => false,
            'message' => $message,
            'errors' => $errors,
        ], $status);
    }

    /**
     * Normalize all supported Laravel pagination shapes into the platform's
     * standard frontend contract:
     *
     * {
     *     items: [...],
     *     pagination: {
     *         current_page: number,
     *         per_page: number,
     *         has_more_pages: boolean,
     *         total: number|null,
     *         last_page: number|null
     *     }
     * }
     *
     * This handles both:
     *
     * 1. ResourceCollection wrapping a paginator.
     * 2. A paginator passed directly to success().
     */
    private function normalizeData(mixed $data): mixed
    {
        /*
         * Case 1:
         * A ResourceCollection wrapping a paginator.
         */
        if (
            $data instanceof ResourceCollection
            && $data->resource instanceof Paginator
        ) {
            $paginator = $data->resource;

            return [
                'items' => $data->collection
                    ->map(fn ($item) => $item->toArray(request()))
                    ->all(),

                'pagination' => $this->paginationMeta($paginator),
            ];
        }

        /*
         * Case 2:
         * A paginator passed directly to success().
         *
         * This is the shape used by controllers such as:
         *
         * return $this->success(
         *     Post::query()->paginate(...)
         * );
         */
        if ($data instanceof Paginator) {
            return [
                'items' => collect($data->items())
                    ->map(function ($item) {
                        if (is_object($item) && method_exists($item, 'toArray')) {
                            return $item->toArray(request());
                        }

                        return $item;
                    })
                    ->all(),

                'pagination' => $this->paginationMeta($data),
            ];
        }

        return $data;
    }

    /**
     * Build the platform-standard pagination metadata.
     */
    private function paginationMeta(Paginator $paginator): array
    {
        return [
            'current_page' => $paginator->currentPage(),
            'per_page' => $paginator->perPage(),
            'has_more_pages' => $paginator->hasMorePages(),
            'total' => $paginator instanceof LengthAwarePaginator
                ? $paginator->total()
                : null,
            'last_page' => $paginator instanceof LengthAwarePaginator
                ? $paginator->lastPage()
                : null,
        ];
    }
}