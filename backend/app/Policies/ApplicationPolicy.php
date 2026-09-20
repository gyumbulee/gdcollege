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
        return $this->owns($user, $application) && in_array($application->status, Application::EDITABLE_STATUSES, true);
    }

    /** Paying is allowed while still editable, or already sitting at PAYMENT_PENDING from a prior attempt — never after the fee is already confirmed paid. */
    public function pay(User $user, Application $application): bool
    {
        return $this->owns($user, $application)
            && ! $application->fee_paid
            && in_array($application->status, [Application::STATUS_DRAFT, Application::STATUS_PAYMENT_PENDING], true);
    }

    public function manageDocuments(User $user, Application $application): bool
    {
        return $this->owns($user, $application) && $application->isEditableByApplicant();
    }
}
