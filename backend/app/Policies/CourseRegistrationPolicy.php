<?php

namespace App\Policies;

use App\Models\CourseRegistration;
use App\Models\User;
use App\Policies\Concerns\ChecksDepartmentScope;

class CourseRegistrationPolicy
{
    use ChecksDepartmentScope;

    private function owns(User $user, CourseRegistration $registration): bool
    {
        return $registration->student->user_id === $user->id;
    }

    public function view(User $user, CourseRegistration $registration): bool
    {
        return $this->owns($user, $registration);
    }

    public function update(User $user, CourseRegistration $registration): bool
    {
        return $this->owns($user, $registration) && $registration->isEditableByStudent();
    }

    public function submit(User $user, CourseRegistration $registration): bool
    {
        return $this->owns($user, $registration) && $registration->status === CourseRegistration::STATUS_DRAFT;
    }

    /**
     * Staff decision on someone else's registration (route already
     * requires course_registrations.approve). Restricts an HOD to their
     * own department — see ChecksDepartmentScope.
     */
    public function approve(User $user, CourseRegistration $registration): bool
    {
        return $this->departmentScopeAllows($user, $registration->student->programme?->department_id);
    }

    public function reject(User $user, CourseRegistration $registration): bool
    {
        return $this->approve($user, $registration);
    }
}
