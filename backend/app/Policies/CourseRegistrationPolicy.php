<?php

namespace App\Policies;

use App\Models\CourseRegistration;
use App\Models\User;

class CourseRegistrationPolicy
{
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
}
