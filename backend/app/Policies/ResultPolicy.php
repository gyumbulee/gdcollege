<?php

namespace App\Policies;

use App\Models\Result;
use App\Models\User;
use App\Policies\Concerns\ChecksDepartmentScope;

/**
 * `review` (the HOD stage) is department-scoped; verify/approve/publish
 * belong to the institution-wide Academic/Examination Officer role, so
 * they are intentionally left unscoped for department — see
 * StaffResultReviewController's docblock.
 *
 * Every stage, though, is blocked against the assigned lecturer approving
 * their own submission — a Phase 14 audit finding (§42 explicitly requires
 * verifying "Lecturer cannot approve their own submitted results"), and
 * nothing enforced it before this: `results.approve` etc. simply weren't
 * granted to the `lecturer` role in RolePermissionSeeder, which only
 * prevents it so long as no one is ever assigned a second role that also
 * carries those permissions — a real possibility at a small institution
 * where the same person might double as lecturer and exam officer. This
 * is now enforced structurally, not just by which roles happen to be
 * seeded.
 */
class ResultPolicy
{
    use ChecksDepartmentScope;

    public function review(User $user, Result $result): bool
    {
        if ($this->isOwnSubmission($user, $result)) {
            return false;
        }

        $departmentId = $result->courseOffering?->programme?->department_id;

        return $this->departmentScopeAllows($user, $departmentId);
    }

    public function verify(User $user, Result $result): bool
    {
        return ! $this->isOwnSubmission($user, $result);
    }

    public function approve(User $user, Result $result): bool
    {
        return ! $this->isOwnSubmission($user, $result);
    }

    public function publish(User $user, Result $result): bool
    {
        return ! $this->isOwnSubmission($user, $result);
    }

    private function isOwnSubmission(User $user, Result $result): bool
    {
        return $result->courseOffering?->lecturer_id === $user->id;
    }
}
