<?php

namespace App\Providers;

use App\Models\Application;
use App\Models\CourseOffering;
use App\Models\CourseRegistration;
use App\Models\Result;
use App\Policies\ApplicationPolicy;
use App\Policies\CourseOfferingPolicy;
use App\Policies\CourseRegistrationPolicy;
use App\Policies\ResultPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    protected $policies = [
        Application::class => ApplicationPolicy::class,
        CourseRegistration::class => CourseRegistrationPolicy::class,
        CourseOffering::class => CourseOfferingPolicy::class,
        Result::class => ResultPolicy::class,
    ];

    public function boot(): void
    {
        /**
         * Super Administrator bypasses every permission check. This is the
         * ONLY blanket bypass in the system — ICT/System Administrator is
         * deliberately NOT included here, per the spec's rule that
         * technical admin access must not imply academic/financial
         * authority.
         */
        Gate::before(function ($user, $ability) {
            return $user->hasRole('super_administrator') ? true : null;
        });
    }
}
