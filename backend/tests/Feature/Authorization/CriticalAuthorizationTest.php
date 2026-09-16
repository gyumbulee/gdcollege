<?php

namespace Tests\Feature\Authorization;

use App\Models\AcademicSession;
use App\Models\Applicant;
use App\Models\Application;
use App\Models\Course;
use App\Models\CourseOffering;
use App\Models\Department;
use App\Models\Level;
use App\Models\Programme;
use App\Models\Result;
use App\Models\Role;
use App\Models\School;
use App\Models\Semester;
use App\Models\Student;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

/**
 * Covers the spec's own §42 "Verify that:" checklist, one test per line.
 * Written during Phase 14's security audit — nothing in this repo tested
 * this before (tests/Feature had only the framework's default
 * ExampleTest.php). Could not be executed in the sandbox this was
 * authored in (no PHP/Composer/MySQL — see docs/PROJECT_STATUS.md); run
 * with `php artisan test --filter=CriticalAuthorizationTest` against a
 * real environment before trusting it, the same as every other file in
 * this phase's zip.
 */
class CriticalAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(RolePermissionSeeder::class);
    }

    private function makeUser(string $roleSlug, ?int $departmentScopeId = null): User
    {
        $user = User::create([
            'name' => ucfirst($roleSlug).' Test User',
            'email' => $roleSlug.'-'.uniqid().'@test.gdcollege.local',
            'password' => Hash::make('password'),
            'status' => 'active',
        ]);

        $role = Role::where('slug', $roleSlug)->firstOrFail();

        $user->roles()->attach($role->id, [
            'scope_type' => $departmentScopeId ? 'department' : null,
            'scope_id' => $departmentScopeId,
        ]);

        return $user;
    }

    /** Minimal school/department/programme/level/session/semester/course/offering tree. */
    private function makeCourseOffering(?User $lecturer): CourseOffering
    {
        $school = School::create(['name' => 'School of Applied Sciences', 'slug' => 'sas-'.uniqid()]);
        $department = Department::create(['school_id' => $school->id, 'name' => 'Computer Science', 'slug' => 'cs-'.uniqid()]);
        $programme = Programme::create(['department_id' => $department->id, 'name' => 'ND Computer Science', 'slug' => 'nd-cs-'.uniqid(), 'award_type' => 'ND', 'duration_levels' => 2, 'is_active' => true]);
        $level = Level::create(['name' => 'ND I', 'sort_order' => 1]);
        $session = AcademicSession::create(['name' => '2026/2027', 'is_current' => true]);
        $semester = Semester::create(['academic_session_id' => $session->id, 'name' => 'First Semester', 'sort_order' => 1, 'is_current' => true]);
        $course = Course::create(['code' => 'CSC'.rand(100, 999), 'title' => 'Test Course', 'credit_units' => 3]);

        return CourseOffering::create([
            'course_id' => $course->id,
            'academic_session_id' => $session->id,
            'semester_id' => $semester->id,
            'programme_id' => $programme->id,
            'level_id' => $level->id,
            'lecturer_id' => $lecturer?->id,
            'capacity' => 40,
        ]);
    }

    private function makeStudent(CourseOffering $offering): Student
    {
        $studentUser = User::create([
            'name' => 'Test Student',
            'email' => 'student-'.uniqid().'@test.gdcollege.local',
            'password' => Hash::make('password'),
            'status' => 'active',
        ]);
        $studentUser->roles()->attach(Role::where('slug', 'student')->firstOrFail()->id);

        return Student::create([
            'user_id' => $studentUser->id,
            'matric_number' => 'ND/CS/26/'.rand(1000, 9999),
            'programme_id' => $offering->programme_id,
            'current_level_id' => $offering->level_id,
            'admission_academic_session_id' => $offering->academic_session_id,
            'status' => 'ACTIVE',
        ]);
    }

    private function makeSubmittedResult(CourseOffering $offering, Student $student): Result
    {
        return Result::create([
            'course_offering_id' => $offering->id,
            'student_id' => $student->id,
            'total_score' => 65,
            'grade' => 'B',
            'grade_point' => 4.0,
            'status' => Result::STATUS_SUBMITTED,
            'submitted_at' => now(),
        ]);
    }

    /** §42: "Student cannot approve results." */
    public function test_student_cannot_approve_results(): void
    {
        $lecturer = $this->makeUser('lecturer');
        $offering = $this->makeCourseOffering($lecturer);
        $student = $this->makeStudent($offering);
        $result = $this->makeSubmittedResult($offering, $student);
        $result->update(['status' => Result::STATUS_REVIEWED]);

        $this->actingAs($student->user)
            ->postJson("/api/v1/staff/results/{$result->id}/verify")
            ->assertForbidden();
    }

    /** §42: "Lecturer cannot approve their own submitted results." */
    public function test_lecturer_cannot_approve_own_submitted_result_even_with_academic_officer_role(): void
    {
        $lecturer = $this->makeUser('lecturer');
        // Dual-role: also holds academic_officer, which DOES carry
        // results.approve — proving the block is structural (ResultPolicy),
        // not just "the lecturer role happens not to have the permission".
        $lecturer->roles()->attach(Role::where('slug', 'academic_officer')->firstOrFail()->id);

        $offering = $this->makeCourseOffering($lecturer);
        $student = $this->makeStudent($offering);
        $result = $this->makeSubmittedResult($offering, $student);
        $result->update(['status' => Result::STATUS_VERIFIED]);

        $this->actingAs($lecturer)
            ->postJson("/api/v1/staff/results/{$result->id}/approve")
            ->assertForbidden();
    }

    /** A different academic officer (not the lecturer) CAN approve — sanity check the fix isn't over-broad. */
    public function test_academic_officer_who_is_not_the_lecturer_can_approve(): void
    {
        $lecturer = $this->makeUser('lecturer');
        $officer = $this->makeUser('academic_officer');

        $offering = $this->makeCourseOffering($lecturer);
        $student = $this->makeStudent($offering);
        $result = $this->makeSubmittedResult($offering, $student);
        $result->update(['status' => Result::STATUS_VERIFIED]);

        $this->actingAs($officer)
            ->postJson("/api/v1/staff/results/{$result->id}/approve")
            ->assertOk();
    }

    /** §42: "HOD cannot access another department's restricted records." */
    public function test_hod_cannot_review_another_departments_result(): void
    {
        $lecturer = $this->makeUser('lecturer');
        $offeringInOtherDepartment = $this->makeCourseOffering($lecturer);
        $student = $this->makeStudent($offeringInOtherDepartment);
        $result = $this->makeSubmittedResult($offeringInOtherDepartment, $student);

        // HOD scoped to a *different* department than the one the course
        // offering actually belongs to.
        $unrelatedDepartment = Department::create([
            'school_id' => School::create(['name' => 'Another School', 'slug' => 'other-'.uniqid()])->id,
            'name' => 'Mass Communication',
            'slug' => 'masscomm-'.uniqid(),
        ]);
        $hod = $this->makeUser('hod', $unrelatedDepartment->id);

        $this->actingAs($hod)
            ->postJson("/api/v1/staff/results/{$result->id}/review")
            ->assertForbidden();
    }

    /** The same HOD, scoped to the *correct* department, CAN review — sanity check. */
    public function test_hod_can_review_own_departments_result(): void
    {
        $lecturer = $this->makeUser('lecturer');
        $offering = $this->makeCourseOffering($lecturer);
        $student = $this->makeStudent($offering);
        $result = $this->makeSubmittedResult($offering, $student);

        $ownDepartmentId = $offering->programme->department_id;
        $hod = $this->makeUser('hod', $ownDepartmentId);

        $this->actingAs($hod)
            ->postJson("/api/v1/staff/results/{$result->id}/review")
            ->assertOk();
    }

    /** §42: "Applicant cannot access another applicant's application." */
    public function test_applicant_cannot_view_another_applicants_application(): void
    {
        $session = AcademicSession::create(['name' => '2026/2027', 'is_current' => true]);
        $school = School::create(['name' => 'School of Applied Sciences', 'slug' => 'sas-'.uniqid()]);
        $department = Department::create(['school_id' => $school->id, 'name' => 'Computer Science', 'slug' => 'cs-'.uniqid()]);
        $programme = Programme::create(['department_id' => $department->id, 'name' => 'ND Computer Science', 'slug' => 'nd-cs-'.uniqid(), 'award_type' => 'ND', 'duration_levels' => 2, 'is_active' => true]);

        $applicantAUser = $this->makeUser('applicant');
        $applicantA = Applicant::create(['user_id' => $applicantAUser->id]);
        $applicationA = Application::create([
            'applicant_id' => $applicantA->id,
            'academic_session_id' => $session->id,
            'programme_id' => $programme->id,
            'application_number' => 'APP-'.uniqid(),
            'status' => Application::STATUS_DRAFT,
        ]);

        $applicantBUser = $this->makeUser('applicant');

        $this->actingAs($applicantBUser)
            ->getJson("/api/v1/applications/{$applicationA->id}")
            ->assertForbidden();
    }

    /** §42: "Student cannot access another student's private records." */
    public function test_student_results_endpoint_never_returns_another_students_results(): void
    {
        $lecturer = $this->makeUser('lecturer');
        $offering = $this->makeCourseOffering($lecturer);

        $studentA = $this->makeStudent($offering);
        $resultA = $this->makeSubmittedResult($offering, $studentA);
        $resultA->update(['status' => Result::STATUS_PUBLISHED, 'published_at' => now()]);

        $studentB = $this->makeStudent($offering);
        $resultB = $this->makeSubmittedResult($offering, $studentB);
        $resultB->update(['status' => Result::STATUS_PUBLISHED, 'published_at' => now()]);

        $response = $this->actingAs($studentA->user)
            ->getJson('/api/v1/student/results')
            ->assertOk();

        $ids = collect($response->json('data'))->pluck('id');

        $this->assertTrue($ids->contains($resultA->id));
        $this->assertFalse($ids->contains($resultB->id));
    }

    /** §42: "Technical admin cannot automatically bypass academic permissions." */
    public function test_ict_administrator_cannot_bypass_academic_permission_to_approve_results(): void
    {
        $lecturer = $this->makeUser('lecturer');
        $offering = $this->makeCourseOffering($lecturer);
        $student = $this->makeStudent($offering);
        $result = $this->makeSubmittedResult($offering, $student);
        $result->update(['status' => Result::STATUS_VERIFIED]);

        $ictAdmin = $this->makeUser('ict_administrator');

        $this->actingAs($ictAdmin)
            ->postJson("/api/v1/staff/results/{$result->id}/approve")
            ->assertForbidden();
    }

    /** Sanity check the one deliberate blanket bypass still works as intended. */
    public function test_super_administrator_can_approve_results(): void
    {
        $lecturer = $this->makeUser('lecturer');
        $offering = $this->makeCourseOffering($lecturer);
        $student = $this->makeStudent($offering);
        $result = $this->makeSubmittedResult($offering, $student);
        $result->update(['status' => Result::STATUS_VERIFIED]);

        $superAdmin = $this->makeUser('super_administrator');

        $this->actingAs($superAdmin)
            ->postJson("/api/v1/staff/results/{$result->id}/approve")
            ->assertOk();
    }
}
