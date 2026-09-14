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
 * Creates development accounts for the institutional staff roles so the
 * different staff portals and permission boundaries can be tested locally.
 *
 * Special handling:
 * - HOD is scoped to the sample Computer Science department.
 * - Lecturer is assigned to the sample Computer Science course offerings.
 *
 * The super administrator is intentionally NOT created here because it is
 * already handled by DevSuperAdminSeeder.
 *
 * Change or remove before production — see Phase 25.
 */
class DevSampleStaffSeeder extends Seeder
{
    private const PASSWORD = 'ChangeMe!12345';

    public function run(): void
    {
        /*
         * ------------------------------------------------------------------
         * Find sample Computer Science department.
         * ------------------------------------------------------------------
         *
         * AcademicStructureSeeder runs before this seeder in DatabaseSeeder,
         * so the department should already exist.
         */
        $department = Department::where(
            'slug',
            'computer-science-sample'
        )->first();

        /*
         * ------------------------------------------------------------------
         * HOD
         * ------------------------------------------------------------------
         */
        if ($department) {
            $hod = User::updateOrCreate(
                ['email' => 'hod.cs@gdcollegewase.test'],
                [
                    'name' => 'Dev HOD — Computer Science (Sample)',
                    'password' => Hash::make(self::PASSWORD),
                    'status' => 'active',
                    'email_verified_at' => now(),
                ]
            );

            $this->assignRole(
                $hod,
                'hod'
            );

            /*
             * HOD role must be department-scoped.
             *
             * departmentScopeIds() reads scope_type and scope_id directly
             * from role_user.
             */
            $hodRole = Role::where('slug', 'hod')->first();

            if ($hodRole) {
                DB::table('role_user')->updateOrInsert(
                    [
                        'user_id' => $hod->id,
                        'role_id' => $hodRole->id,
                        'scope_type' => 'department',
                        'scope_id' => $department->id,
                    ],
                    [
                        'updated_at' => now(),
                        'created_at' => now(),
                    ]
                );

                /*
                 * Keep the department convenience column synchronized.
                 */
                $department->update([
                    'hod_user_id' => $hod->id,
                ]);
            }
        }

        /*
         * ------------------------------------------------------------------
         * Lecturer
         * ------------------------------------------------------------------
         */
        if ($department) {
            $lecturer = User::updateOrCreate(
                ['email' => 'lecturer.cs@gdcollegewase.test'],
                [
                    'name' => 'Dev Lecturer — Computer Science (Sample)',
                    'password' => Hash::make(self::PASSWORD),
                    'status' => 'active',
                    'email_verified_at' => now(),
                ]
            );

            $this->assignRole(
                $lecturer,
                'lecturer'
            );

            /*
             * Assign lecturer to the sample Computer Science offerings.
             */
            CourseOffering::whereHas(
                'programme',
                fn ($query) => $query->where(
                    'department_id',
                    $department->id
                )
            )->update([
                'lecturer_id' => $lecturer->id,
            ]);
        }

        /*
         * ------------------------------------------------------------------
         * Admission Officer
         * ------------------------------------------------------------------
         */
        $this->createStaff(
            'admissions@gdcollegewase.test',
            'Dev Admission Officer',
            'admission_officer'
        );

        /*
         * ------------------------------------------------------------------
         * Academic Officer
         * ------------------------------------------------------------------
         */
        $this->createStaff(
            'academic@gdcollegewase.test',
            'Dev Academic Officer',
            'academic_officer'
        );

        /*
         * ------------------------------------------------------------------
         * Bursary Officer
         * ------------------------------------------------------------------
         */
        $this->createStaff(
            'bursary@gdcollegewase.test',
            'Dev Bursary Officer',
            'bursary_officer'
        );

        /*
         * ------------------------------------------------------------------
         * Registrar
         * ------------------------------------------------------------------
         */
        $this->createStaff(
            'registrar@gdcollegewase.test',
            'Dev Registrar',
            'registrar'
        );

        /*
         * ------------------------------------------------------------------
         * Management
         * ------------------------------------------------------------------
         */
        $this->createStaff(
            'management@gdcollegewase.test',
            'Dev Management Officer',
            'management'
        );

        /*
         * ------------------------------------------------------------------
         * Library Officer
         * ------------------------------------------------------------------
         */
        $this->createStaff(
            'library@gdcollegewase.test',
            'Dev Library Officer',
            'library_officer'
        );

        /*
         * ------------------------------------------------------------------
         * SIWES Coordinator
         * ------------------------------------------------------------------
         */
        $this->createStaff(
            'siwes@gdcollegewase.test',
            'Dev SIWES Coordinator',
            'siwes_coordinator'
        );

        /*
         * ------------------------------------------------------------------
         * ICT / System Administrator
         * ------------------------------------------------------------------
         */
        $this->createStaff(
            'ict@gdcollegewase.test',
            'Dev ICT/System Administrator',
            'ict_administrator'
        );
    }

    /**
     * Create or update a normal development staff account and assign
     * its institutional role.
     */
    private function createStaff(
        string $email,
        string $name,
        string $roleSlug
    ): User {
        $user = User::updateOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'password' => Hash::make(self::PASSWORD),
                'status' => 'active',
                'email_verified_at' => now(),
            ]
        );

        $this->assignRole($user, $roleSlug);

        return $user;
    }

    /**
     * Assign an institutional role without removing any other roles.
     */
    private function assignRole(
        User $user,
        string $roleSlug
    ): void {
        $role = Role::where('slug', $roleSlug)->first();

        if (! $role) {
            return;
        }

        $user->roles()->syncWithoutDetaching([
            $role->id,
        ]);
    }
}