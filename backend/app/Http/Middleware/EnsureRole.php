<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Route middleware enforcing that the authenticated user holds a given
 * role, e.g. `->middleware('role:applicant')`. Complements
 * EnsurePermission for the (rarer) cases where a route is scoped to a
 * whole role rather than a specific permission — applicant self-service
 * endpoints being the main example, since "own an application" isn't a
 * permission, it's an identity check plus this role gate.
 */
class EnsureRole
{
    public function handle(Request $request, Closure $next, string $role): Response
    {
        $user = $request->user();

        if (! $user || ! $user->isActive() || ! $user->hasRole($role)) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have access to this resource.',
                'errors' => [],
            ], 403);
        }

        return $next($request);
    }
}
