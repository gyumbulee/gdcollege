<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Route middleware enforcing a single permission slug, e.g.:
 *
 *   Route::post('/results/{id}/publish', ...)->middleware('permission:results.publish');
 *
 * This is the ONLY place authorization for a permission-gated route should
 * be decided — never trust a role/permission claim sent by the frontend.
 * Registered as the 'permission' alias in bootstrap/app.php.
 */
class EnsurePermission
{
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        $user = $request->user();

        if (! $user || ! $user->isActive()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
                'errors' => [],
            ], 401);
        }

        if (! $user->hasPermission($permission) && ! \Gate::allows('super-admin-bypass')) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to perform this action.',
                'errors' => [],
            ], 403);
        }

        return $next($request);
    }
}
