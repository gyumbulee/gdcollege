<?php

namespace App\Policies;

use App\Models\CourseOffering;
use App\Models\User;

class CourseOfferingPolicy
{
    /** True if the user is the lecturer assigned to this offering. */
    public function manageResults(User $user, CourseOffering $offering): bool
    {
        return $offering->lecturer_id === $user->id;
    }
}
