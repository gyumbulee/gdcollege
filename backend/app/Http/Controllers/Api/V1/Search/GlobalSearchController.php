<?php

namespace App\Http\Controllers\Api\V1\Search;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\Application;
use App\Models\Course;
use App\Models\Payment;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

/**
 * §31: staff-side global search across student name/matric/admission/
 * application number/phone/email/programme/department/course/payment
 * reference — "Search: ND/CS/26/0045 → Student profile", "especially
 * useful for Registry and management staff."
 *
 * Deliberately not gated by one blanket permission (no single slug in
 * §4/§7 covers "search"). Each category is included only if the caller
 * already holds that category's own view permission — the same
 * `students.view`/`applications.view`/`payments.view`/`courses.view`
 * checks their normal staff screens require, just applied per-category
 * here instead of per-route. A Lecturer (courses.view only) searching
 * "CSC 201" gets course results and nothing else; Registry/Management
 * hold enough view permissions to see everything the spec describes.
 * There is deliberately no way to search Admission by an "admission
 * number" — the schema has never had one (Admission carries only a
 * decision against an Application; see the model). Admission results
 * are surfaced through the same Application match instead.
 */
class GlobalSearchController extends Controller
{
    use ApiResponse;

    private const MIN_LENGTH = 2;
    private const LIMIT_PER_CATEGORY = 10;

    public function index(Request $request)
    {
        $term = trim((string) $request->string('q'));

        if (mb_strlen($term) < self::MIN_LENGTH) {
            return $this->fail('Enter at least '.self::MIN_LENGTH.' characters to search.', [], 422);
        }

        $user = $request->user();
        $bypass = Gate::allows('super-admin-bypass');
        $like = '%'.$term.'%';

        return $this->success([
            'query' => $term,
            'students' => ($bypass || $user->hasPermission('students.view')) ? $this->searchStudents($like) : [],
            'applications' => ($bypass || $user->hasPermission('applications.view')) ? $this->searchApplications($like) : [],
            'payments' => ($bypass || $user->hasPermission('payments.view')) ? $this->searchPayments($like) : [],
            'courses' => ($bypass || $user->hasPermission('courses.view')) ? $this->searchCourses($like) : [],
        ]);
    }

    private function searchStudents(string $like): array
    {
        return Student::query()
            ->with(['user:id,name,email,phone', 'programme:id,name,department_id', 'programme.department:id,name'])
            ->where(function ($q) use ($like) {
                $q->where('matric_number', 'like', $like)
                    ->orWhereHas('user', fn ($u) => $u->where('name', 'like', $like)
                        ->orWhere('email', 'like', $like)
                        ->orWhere('phone', 'like', $like));
            })
            ->limit(self::LIMIT_PER_CATEGORY)
            ->get()
            ->map(fn (Student $student) => [
                'id' => $student->id,
                'matric_number' => $student->matric_number,
                'name' => $student->user?->name,
                'email' => $student->user?->email,
                'phone' => $student->user?->phone,
                'programme' => $student->programme?->name,
                'department' => $student->programme?->department?->name,
                'status' => $student->status,
            ])
            ->all();
    }

    private function searchApplications(string $like): array
    {
        return Application::query()
            ->with(['applicant.user:id,name,email', 'programme:id,name'])
            ->where('application_number', 'like', $like)
            ->limit(self::LIMIT_PER_CATEGORY)
            ->get()
            ->map(fn (Application $application) => [
                'id' => $application->id,
                'application_number' => $application->application_number,
                'applicant_name' => $application->applicant?->user?->name,
                'programme' => $application->programme?->name,
                'status' => $application->status,
            ])
            ->all();
    }

    private function searchPayments(string $like): array
    {
        return Payment::query()
            ->with('student.user:id,name')
            ->where(fn ($q) => $q->where('reference', 'like', $like)->orWhere('gateway_reference', 'like', $like))
            ->limit(self::LIMIT_PER_CATEGORY)
            ->get()
            ->map(fn (Payment $payment) => [
                'id' => $payment->id,
                'reference' => $payment->reference,
                'student_name' => $payment->student?->user?->name,
                'amount' => (float) $payment->amount,
                'status' => $payment->status,
            ])
            ->all();
    }

    private function searchCourses(string $like): array
    {
        return Course::query()
            ->where(fn ($q) => $q->where('code', 'like', $like)->orWhere('title', 'like', $like))
            ->limit(self::LIMIT_PER_CATEGORY)
            ->get()
            ->map(fn (Course $course) => [
                'id' => $course->id,
                'code' => $course->code,
                'title' => $course->title,
                'credit_units' => $course->credit_units,
            ])
            ->all();
    }
}
