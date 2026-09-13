<?php

namespace Database\Seeders;

use App\Models\CourseOffering;
use App\Models\Department;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

/**
 * DEVELOPMENT / DEMO DATA ONLY.
 *
 * Creates one sample HOD (scoped, via role_user.scope_type/scope_id, to
 * the sample Computer Science department from AcademicStructureSeeder)
 * and one sample lecturer assigned to that department's sample course
 * offerings. Exists so Phase 9's department-scoped HOD authorization
 * (CourseRegistrationPolicy@approve/reject, ResultPolicy@review) has a
 * real account to exercise/verify against, and so the platform has the
 * "sample HOD"/"sample lecturers" seed data the spec calls for (§43).
 *
 * Change or remove before production — see Phase 25.
 */
class DevSampleStaffSeeder extends Seeder
{
    public function run(): void
    {
        $department = Department::where('slug', 'computer-science-sample')->first();

        if (! $department) {
            // AcademicStructureSeeder hasn't run (or was changed) — nothing
            // sensible to scope a sample HOD to, so skip quietly.
            return;
        }

        $hod = User::updateOrCreate(
            ['email' => 'hod.cs@gdcollegewase.test'],
            [
                'name' => 'Dev HOD — Computer Science (Sample)',
                'password' => Hash::make('ChangeMe!12345'),
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );

        $hodRole = Role::where('slug', 'hod')->first();

        if ($hodRole) {
            // Scoped assignment: this is the row departmentScopeIds() reads.
            // Not ->roles()->syncWithoutDetaching(), since that call can't
            // set scope_type/scope_id — done directly against the pivot.
            DB::table('role_user')->updateOrInsert(
                ['user_id' => $hod->id, 'role_id' => $hodRole->id, 'scope_type' => 'department', 'scope_id' => $department->id],
                ['updated_at' => now(), 'created_at' => now()]
            );

            // Department.hod_user_id is a fast-lookup convenience column
            // (see its migration) — the role_user row above is the actual
            // source of truth read by departmentScopeIds(); keep both in
            // sync here since nothing else does yet.
            $department->update(['hod_user_id' => $hod->id]);
        }

        $lecturer = User::updateOrCreate(
            ['email' => 'lecturer.cs@gdcollegewase.test'],
            [
                'name' => 'Dev Lecturer — Computer Science (Sample)',
                'password' => Hash::make('ChangeMe!12345'),
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );

        $lecturerRole = Role::where('slug', 'lecturer')->first();
        if ($lecturerRole) {
            $lecturer->roles()->syncWithoutDetaching([$lecturerRole->id]);
        }

        // Assign the sample lecturer to this department's sample offerings
        // so the Phase 8 lecturer portal has something to load against.
        CourseOffering::whereHas('programme', fn ($q) => $q->where('department_id', $department->id))
            ->update(['lecturer_id' => $lecturer->id]);
    }
}
