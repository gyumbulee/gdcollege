<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\Permission;
use App\Models\Role;
use App\Services\AuditLogger;
use Illuminate\Http\Request;

/**
 * Genuinely missing before Phase 21: `roles.manage` and `permissions.manage`
 * have been defined and granted to `ict_administrator` since Phase 1, with
 * no endpoint anywhere that used them — the entire RBAC matrix has only
 * ever been editable by hand-editing RolePermissionSeeder.php and
 * re-running it.
 *
 * Deliberately does NOT support creating/deleting roles or permissions —
 * the role and permission set comes from the platform specification
 * itself (§4/§7), not something an institution administrator should be
 * able to invent through a UI. What this DOES let ICT Administrator do is
 * toggle which of the spec-defined permissions a spec-defined role
 * currently holds — the one part of the RBAC matrix that's legitimately
 * an institutional configuration choice (e.g. an institution might choose
 * to let its Registrar also verify documents, or not).
 */
class RoleController extends Controller
{
    use ApiResponse;

    public function index()
    {
        return $this->success(
            Role::with('permissions')->orderBy('name')->get()->map(fn (Role $role) => $this->present($role))
        );
    }

    public function show(Role $role)
    {
        return $this->success($this->present($role->load('permissions')));
    }

    public function permissions()
    {
        return $this->success(
            Permission::orderBy('slug')->get(['id', 'slug', 'description'])
        );
    }

    /**
     * Toggling `super_administrator`'s permission set would be
     * meaningless (it bypasses the permission table entirely via
     * `Gate::before` — see AuthServiceProvider) and toggling it here
     * would just create a confusing, inert UI state, so it's explicitly
     * blocked rather than silently accepted.
     */
    public function togglePermission(Request $request, Role $role, Permission $permission, AuditLogger $audit)
    {
        if ($role->slug === 'super_administrator') {
            return $this->fail('Super Administrator bypasses the permission table entirely and cannot be edited here.', [], 422);
        }

        $hasIt = $role->permissions()->where('permissions.id', $permission->id)->exists();

        if ($hasIt) {
            $role->permissions()->detach($permission->id);
            $audit->log('roles.permission.remove', $role, ['permission' => $permission->slug], null);
        } else {
            $role->permissions()->attach($permission->id);
            $audit->log('roles.permission.grant', $role, null, ['permission' => $permission->slug]);
        }

        return $this->success($this->present($role->load('permissions')), $hasIt ? 'Permission removed.' : 'Permission granted.');
    }

    private function present(Role $role): array
    {
        return [
            'id' => $role->id,
            'slug' => $role->slug,
            'name' => $role->name,
            'description' => $role->description,
            'permissions' => $role->permissions->pluck('slug'),
        ];
    }
}
