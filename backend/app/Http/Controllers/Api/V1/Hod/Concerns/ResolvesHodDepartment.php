<?php

namespace App\Http\Controllers\Api\V1\Hod\Concerns;

use App\Models\Department;
use Illuminate\Http\Request;

/**
 * Every HOD-portal endpoint needs to know "which department is this HOD
 * looking at" before it can answer anything. Unlike the approve/review
 * actions on an already-identified record (CourseRegistrationPolicy,
 * ResultPolicy — permissive when unscoped, since the record itself
 * proves what's being acted on), a dashboard has no record to fall back
 * on, so an HOD account must have exactly one department scope
 * configured (role_user.scope_type='department') to use it.
 *
 * Requires the using class to `use ApiResponse;` (for $this->fail()).
 */
trait ResolvesHodDepartment
{
    /**
     * Returns the resolved Department, or null with $error set to a
     * ready-to-return API envelope response. Callers:
     *
     *   $department = $this->resolveHodDepartment($request, $error);
     *   if (! $department) return $error;
     */
    protected function resolveHodDepartment(Request $request, &$error = null): ?Department
    {
        $scopeIds = $request->user()->departmentScopeIds();

        if (count($scopeIds) === 0) {
            $error = $this->fail('Your HOD account is not yet scoped to a department. Contact ICT/System Administration to configure it.', [], 422);

            return null;
        }

        if (count($scopeIds) > 1) {
            $error = $this->fail('Your HOD account is scoped to more than one department — the HOD portal expects exactly one. Contact ICT/System Administration.', [], 422);

            return null;
        }

        return Department::with('school')->find($scopeIds[0]);
    }
}
