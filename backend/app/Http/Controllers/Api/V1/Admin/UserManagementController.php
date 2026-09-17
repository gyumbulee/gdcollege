<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UserRoleAssignRequest;
use App\Http\Requests\Admin\UserStoreRequest;
use App\Http\Requests\Admin\UserUpdateRequest;
use App\Http\Resources\Admin\UserResource;
use App\Http\Responses\ApiResponse;
use App\Models\Role;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * Genuinely missing before Phase 21: the ONLY way to create a staff
 * account anywhere in this codebase was DatabaseSeeder — there was no
 * `users.manage`-gated endpoint at all, despite that permission being
 * defined since Phase 1 and granted to `ict_administrator` from the
 * start. Applicants and students create their own accounts at
 * registration; staff never had an onboarding path.
 *
 * New staff accounts get a random, never-exposed initial password and
 * must set their own via Phase 14's password-reset flow — the admin who
 * creates the account never knows the new user's password, which is the
 * same reasoning `forgot()` in PasswordController already uses (no
 * account-enumeration/shared-secret path). This also means staff
 * onboarding didn't need a `send-invite` email flow of its own: it just
 * reuses `forgot-password` (send an admin a "created" response, tell them
 * to point the new hire at the login page's "Forgot your password?" link).
 */
class UserManagementController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $query = User::with('roles')->whereDoesntHave('roles', fn ($q) => $q->whereIn('slug', ['applicant', 'student']));

        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('role')) {
            $query->whereHas('roles', fn ($q) => $q->where('slug', $request->input('role')));
        }

        if ($request->filled('search')) {
            $term = '%'.$request->input('search').'%';
            $query->where(fn ($q) => $q->where('name', 'like', $term)->orWhere('email', 'like', $term));
        }

        return $this->success(
            UserResource::collection($query->orderBy('name')->paginate($request->integer('per_page', 25)))
        );
    }

    public function store(UserStoreRequest $request, AuditLogger $audit)
    {
        $user = User::create([
            'name' => $request->string('name'),
            'email' => $request->string('email'),
            'phone' => $request->input('phone'),
            'password' => Hash::make(Str::random(40)),
            'status' => 'active',
        ]);

        foreach ($request->input('role_slugs') as $roleSlug) {
            $role = Role::where('slug', $roleSlug)->firstOrFail();
            $user->roles()->attach($role->id, [
                'scope_type' => $request->filled('department_id') ? 'department' : null,
                'scope_id' => $request->input('department_id'),
            ]);
        }

        $audit->log('users.create', $user, null, $user->only(['name', 'email', 'status']));

        return $this->success(
            new UserResource($user->load('roles')),
            'Staff account created. The new user should use "Forgot your password?" on the login page to set their own password.',
            201
        );
    }

    public function show(User $user)
    {
        return $this->success(new UserResource($user->load('roles')));
    }

    public function update(UserUpdateRequest $request, User $user, AuditLogger $audit)
    {
        $old = $user->only(['name', 'email', 'phone', 'status']);
        $user->update($request->validated());

        // Suspending/deactivating an account should also cut off any
        // active sessions immediately — mirrors PasswordController's
        // reasoning for token revocation elsewhere.
        if ($request->input('status') && $request->input('status') !== 'active') {
            $user->tokens()->delete();
        }

        $audit->log('users.update', $user, $old, $user->only(['name', 'email', 'phone', 'status']));

        return $this->success(new UserResource($user->load('roles')), 'User updated.');
    }

    public function assignRole(UserRoleAssignRequest $request, User $user, AuditLogger $audit)
    {
        $role = Role::where('slug', $request->string('role_slug'))->firstOrFail();

        $user->roles()->syncWithoutDetaching([
            $role->id => [
                'scope_type' => $request->filled('department_id') ? 'department' : null,
                'scope_id' => $request->input('department_id'),
            ],
        ]);

        $audit->log('users.role.assign', $user, null, ['role' => $role->slug, 'department_id' => $request->input('department_id')]);

        return $this->success(new UserResource($user->load('roles')), 'Role assigned.');
    }

    public function removeRole(User $user, Role $role, AuditLogger $audit)
    {
        $user->roles()->detach($role->id);
        $audit->log('users.role.remove', $user, ['role' => $role->slug], null);

        return $this->success(new UserResource($user->load('roles')), 'Role removed.');
    }
}
