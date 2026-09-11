<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * DEVELOPMENT / DEMO DATA ONLY.
 *
 * Creates one Super Administrator account so the platform can be logged
 * into immediately after migrating. Change or remove this before any
 * production deployment — see Phase 25 (Production Deployment).
 */
class DevSuperAdminSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::updateOrCreate(
            ['email' => 'superadmin@gdcollegewase.test'],
            [
                'name' => 'Dev Super Administrator',
                'password' => Hash::make('ChangeMe!12345'),
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );

        $role = Role::where('slug', 'super_administrator')->first();

        if ($role) {
            $user->roles()->syncWithoutDetaching([$role->id]);
        }
    }
}
