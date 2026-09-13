<?php

namespace App\Policies;

use App\Models\Result;
use App\Models\User;
use App\Policies\Concerns\ChecksDepartmentScope;

/**
 * Only `review` (the HOD stage of the results pipeline, §12/§17) is
 * department-scoped. verify/approve/publish belong to the Academic/
 * Examination Officer, an institution-wide role in RolePermissionSeeder,
 * so they are intentionally left unscoped here.
 */
class ResultPolicy
{
    use ChecksDepartmentScope;

    public function review(User $user, Result $result): bool
    {
        $departmentId = $result->courseOffering?->programme?->department_id;

        return $this->departmentScopeAllows($user, $departmentId);
    }
}
