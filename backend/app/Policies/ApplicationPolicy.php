<?php

namespace App\Policies;

use App\Models\Application;
use App\Models\User;

class ApplicationPolicy
{
    private function owns(User $user, Application $application): bool
    {
        return $application->applicant->user_id === $user->id;
    }

    public function view(User $user, Application $application): bool
    {
        return $this->owns($user, $application);
    }

    public function update(User $user, Application $application): bool
    {
        return $this->owns($user, $application) && $application->isEditableByApplicant();
    }

    public function submit(User $user, Application $application): bool
    {
        return $this->owns($user, $application) && $application->status === Application::STATUS_DRAFT;
    }

    public function manageDocuments(User $user, Application $application): bool
    {
        return $this->owns($user, $application) && $application->isEditableByApplicant();
    }
}
