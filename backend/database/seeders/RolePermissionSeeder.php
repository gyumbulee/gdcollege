<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

/**
 * Seeds the 13 institutional roles and the granular permission list from
 * the platform specification, then assigns a reasonable starting
 * permission set per role. This starting assignment is a sensible default
 * for development — the College should review and adjust it once
 * Phase 21 (System Administration → Roles & Permissions UI) exists.
 */
class RolePermissionSeeder extends Seeder
{
    /** @var array<string, array{name: string, description: string}> */
    private array $roles = [
        'applicant' => ['name' => 'Applicant', 'description' => 'Prospective student with an in-progress or submitted application.'],
        'student' => ['name' => 'Student', 'description' => 'Admitted, enrolled student.'],
        'lecturer' => ['name' => 'Lecturer', 'description' => 'Teaches assigned course offerings.'],
        'hod' => ['name' => 'HOD', 'description' => 'Head of Department — departmental scope.'],
        'admission_officer' => ['name' => 'Admission Officer', 'description' => 'Reviews and decides on applications.'],
        'academic_officer' => ['name' => 'Academic/Examination Officer', 'description' => 'Manages exams, results verification/approval/publication.'],
        'bursary_officer' => ['name' => 'Bursary/Finance Officer', 'description' => 'Manages fees, invoices, payments.'],
        'registrar' => ['name' => 'Registrar/Registry Officer', 'description' => 'Institutional records, documents, clearance.'],
        'management' => ['name' => 'Management', 'description' => 'Executive visibility — read-mostly across the institution.'],
        'library_officer' => ['name' => 'Library Officer', 'description' => 'Library clearance.'],
        'siwes_coordinator' => ['name' => 'SIWES Coordinator', 'description' => 'Manages SIWES placements and records.'],
        'ict_administrator' => ['name' => 'ICT/System Administrator', 'description' => 'Technical administration — deliberately excludes academic/financial approval authority.'],
        'super_administrator' => ['name' => 'Super Administrator', 'description' => 'Full access. Use sparingly — see AuthServiceProvider::boot().'],
    ];

    /**
     * Flat permission slugs from the platform specification, plus one
     * addition: `academic_structure.manage` for schools/departments/
     * programmes/sessions/semesters/levels/course-types — the spec's own
     * permission list (§4) doesn't name a granular slug per entity there,
     * so a single management permission covers that group (Phase 2).
     */
    private array $permissions = [
        'students.view', 'students.create', 'students.update', 'students.status.change',
        'applications.view', 'applications.review', 'applications.shortlist', 'applications.admit', 'applications.reject',
        'courses.view', 'courses.create', 'courses.update',
        'course_registrations.view', 'course_registrations.submit', 'course_registrations.approve',
        'results.view', 'results.enter', 'results.submit', 'results.review', 'results.verify', 'results.approve', 'results.publish', 'results.correct',
        'payments.view', 'payments.verify', 'payments.refund',
        'documents.issue', 'documents.verify',
        'users.manage', 'roles.manage', 'permissions.manage', 'audit_logs.view',
        'academic_structure.manage',
    ];

    /** Role slug => permission slugs. */
    private array $assignments = [
        'admission_officer' => ['applications.view', 'applications.review', 'applications.shortlist', 'applications.admit', 'applications.reject'],
        'academic_officer' => ['courses.view', 'results.view', 'results.verify', 'results.approve', 'results.publish', 'results.correct', 'academic_structure.manage'],
        'lecturer' => ['courses.view', 'results.view', 'results.enter', 'results.submit'],
        'hod' => ['students.view', 'course_registrations.view', 'course_registrations.approve', 'results.view', 'results.review'],
        'bursary_officer' => ['payments.view', 'payments.verify', 'payments.refund'],
        'registrar' => ['students.view', 'students.update', 'students.status.change', 'documents.issue', 'documents.verify', 'academic_structure.manage'],
        'library_officer' => ['documents.verify'],
        'management' => ['students.view', 'applications.view', 'payments.view', 'results.view', 'audit_logs.view'],
        'ict_administrator' => ['users.manage', 'roles.manage', 'permissions.manage', 'audit_logs.view'],
        // student / applicant / siwes_coordinator / super_administrator:
        // deliberately given no blanket permission-table entries here —
        // students/applicants act on their own records only (enforced by
        // ownership checks in each module, not this table), and
        // super_administrator bypasses this table entirely.
    ];

    public function run(): void
    {
        $roleModels = collect($this->roles)->mapWithKeys(
            fn (array $attrs, string $slug) => [
                $slug => Role::updateOrCreate(['slug' => $slug], $attrs),
            ]
        );

        $permissionModels = collect($this->permissions)->mapWithKeys(
            fn (string $slug) => [
                $slug => Permission::updateOrCreate(['slug' => $slug], ['slug' => $slug]),
            ]
        );

        foreach ($this->assignments as $roleSlug => $permissionSlugs) {
            $roleModels[$roleSlug]->permissions()->sync(
                collect($permissionSlugs)->map(fn ($slug) => $permissionModels[$slug]->id)
            );
        }
    }
}
