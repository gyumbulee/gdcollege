<?php

namespace App\Policies\Concerns;

use App\Models\User;

/**
 * Shared by CourseRegistrationPolicy and ResultPolicy: enforces the
 * spec's "an HOD should only manage their own department" rule (§4/§17)
 * using the role_user.scope_type/scope_id columns from Phase 1.
 *
 * This was a documented gap through Phase 8 — the scope columns existed
 * but nothing read them, so any account holding the relevant permission
 * (course_registrations.approve, results.review) could act on any
 * department. Wired up in Phase 9.
 */
trait ChecksDepartmentScope
{
    /**
     * True if the user is allowed to act on a record belonging to
     * $departmentId, given their department scope(s).
     *
     * Deliberately permissive when the user has no department scope
     * configured at all: the route's permission middleware already
     * decided this user may hold this ability, and not every
     * institution will have back-filled role_user scoping immediately.
     * Once a scope IS configured for a user, it is strictly enforced.
     */
    private function departmentScopeAllows(User $user, ?int $departmentId): bool
    {
        $scopeIds = $user->departmentScopeIds();

        if (empty($scopeIds)) {
            return true;
        }

        return $departmentId !== null && in_array($departmentId, $scopeIds, true);
    }
}
