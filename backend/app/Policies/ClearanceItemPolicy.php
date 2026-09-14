<?php

namespace App\Policies;

use App\Models\ClearanceItem;
use App\Models\User;
use App\Policies\Concerns\ChecksDepartmentScope;

/**
 * `clearance.approve` (route middleware) only proves a user holds SOME
 * clearance-deciding role — it says nothing about which stage. This is
 * the check that a Library Officer can't approve a BURSARY item, and
 * (via ChecksDepartmentScope, same as CourseRegistrationPolicy/
 * ResultPolicy) that a department-scoped HOD can only decide DEPARTMENT
 * items for their own department's students.
 */
class ClearanceItemPolicy
{
    use ChecksDepartmentScope;

    public function decide(User $user, ClearanceItem $item): bool
    {
        $requiredRole = ClearanceItem::STAGE_ROLES[$item->stage] ?? null;

        if (! $requiredRole || ! $user->roles->pluck('slug')->contains($requiredRole)) {
            return false;
        }

        if ($item->stage !== 'DEPARTMENT') {
            return true;
        }

        $departmentId = $item->clearanceRequest->student->programme?->department_id;

        return $this->departmentScopeAllows($user, $departmentId);
    }
}
