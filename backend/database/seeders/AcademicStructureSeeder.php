<?php

namespace Database\Seeders;

use App\Models\AcademicSession;
use App\Models\Course;
use App\Models\CourseOffering;
use App\Models\CourseType;
use App\Models\Department;
use App\Models\Level;
use App\Models\Programme;
use App\Models\School;
use App\Models\Semester;
use Illuminate\Database\Seeder;

/**
 * DEVELOPMENT / DEMO DATA ONLY.
 *
 * Every name below is explicitly marked "(Sample)" so it can never be
 * mistaken for confirmed College data — see the platform spec's rule
 * against fabricating official programmes/fees/policies. Real academic
 * structure should be entered through the Phase 21 admin UI (or a proper
 * data-entry seeder built from College-confirmed data) before launch.
 */
class AcademicStructureSeeder extends Seeder
{
    public function run(): void
    {
        $levelI = Level::updateOrCreate(['name' => 'ND I'], ['sort_order' => 1]);
        $levelII = Level::updateOrCreate(['name' => 'ND II'], ['sort_order' => 2]);

        $session = AcademicSession::updateOrCreate(
            ['name' => '2026/2027'],
            ['is_current' => true]
        );

        $first = Semester::updateOrCreate(
            ['academic_session_id' => $session->id, 'name' => 'First Semester'],
            ['sort_order' => 1, 'is_current' => true]
        );
        Semester::updateOrCreate(
            ['academic_session_id' => $session->id, 'name' => 'Second Semester'],
            ['sort_order' => 2, 'is_current' => false]
        );

        $core = CourseType::updateOrCreate(['name' => 'Core']);
        $general = CourseType::updateOrCreate(['name' => 'General Studies']);

        $school = School::updateOrCreate(
            ['slug' => 'school-of-applied-sciences-sample'],
            ['name' => 'School of Applied Sciences (Sample)', 'description' => 'Placeholder school — replace with confirmed structure.']
        );

        $department = Department::updateOrCreate(
            ['slug' => 'computer-science-sample'],
            ['school_id' => $school->id, 'name' => 'Computer Science (Sample)']
        );

        $programme = Programme::updateOrCreate(
            ['slug' => 'nd-computer-science-sample'],
            [
                'department_id' => $department->id,
                'name' => 'ND Computer Science (Sample)',
                'award_type' => 'ND',
                'duration_levels' => 2,
                'is_active' => true,
            ]
        );

        // Course codes/titles mirror the worked examples already present in
        // the platform specification itself (Master Implementation Brief
        // §10–11), not fabricated data.
        $csc101 = Course::updateOrCreate(
            ['code' => 'CSC101'],
            ['title' => 'Introduction to Computing', 'credit_units' => 3, 'course_type_id' => $core->id]
        );
        $csc201 = Course::updateOrCreate(
            ['code' => 'CSC201'],
            ['title' => 'Data Structures', 'credit_units' => 3, 'course_type_id' => $core->id]
        );
        $csc203 = Course::updateOrCreate(
            ['code' => 'CSC203'],
            ['title' => 'Database Systems', 'credit_units' => 3, 'course_type_id' => $core->id]
        );
        $gst202 = Course::updateOrCreate(
            ['code' => 'GST202'],
            ['title' => 'Entrepreneurship', 'credit_units' => 2, 'course_type_id' => $general->id]
        );

        $csc201->prerequisites()->syncWithoutDetaching([$csc101->id]);

        CourseOffering::updateOrCreate(
            [
                'course_id' => $csc201->id,
                'academic_session_id' => $session->id,
                'semester_id' => $first->id,
                'programme_id' => $programme->id,
                'level_id' => $levelII->id,
            ],
            ['capacity' => 60]
        );

        CourseOffering::updateOrCreate(
            [
                'course_id' => $csc101->id,
                'academic_session_id' => $session->id,
                'semester_id' => $first->id,
                'programme_id' => $programme->id,
                'level_id' => $levelI->id,
            ],
            ['capacity' => 80]
        );
    }
}
