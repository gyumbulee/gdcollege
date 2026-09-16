<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     *
     * Rate limiters (§34 — "rate limiting" was listed as a security
     * requirement from the start but nothing here defined any until
     * Phase 14's audit found the gap):
     *
     *   - `api`           general default for every authenticated route —
     *                      keyed by user ID so one account can't starve
     *                      another, IP for guests.
     *   - `auth`          login/register/forgot-password — keyed by IP
     *                      *and* the submitted email, so throttling one
     *                      attacked account doesn't also lock out every
     *                      other user behind the same NAT/campus IP.
     *   - `public-lookup` admission-list search and public document
     *                      verification — unauthenticated and easy to
     *                      script for enumeration, so IP-keyed and looser
     *                      than `auth` but tighter than `api`.
     */
    public function boot(): void
    {
        RateLimiter::for('api', function ($request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        RateLimiter::for('auth', function ($request) {
            return Limit::perMinute(6)->by($request->ip().'|'.strtolower((string) $request->input('email')));
        });

        RateLimiter::for('public-lookup', function ($request) {
            return Limit::perMinute(30)->by($request->ip());
        });
    }
}
