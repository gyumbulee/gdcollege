<?php

namespace App\Http\Controllers\Api\V1\Management;

use App\Http\Controllers\Api\V1\Management\Concerns\ResolvesManagementFilters;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * §29's "provide exportable reports", covered here as a CSV export of the
 * same filtered student roster the dashboard's KPIs are built from — the
 * one list every other Management figure (finance, results, admissions)
 * ultimately rolls up from, and the one Registry/Management staff most
 * often need to hand off to someone outside the platform (a spreadsheet
 * for a meeting, a mail-merge, etc.). Uses the same `reports.view`
 * permission and filter set as the dashboard, not a separate export
 * permission.
 */
class ManagementReportController extends Controller
{
    use ResolvesManagementFilters;

    public function exportStudents(Request $request): StreamedResponse
    {
        $filters = $this->resolveFilters($request);

        $students = $this->scopedStudents($filters)
            ->with(['user:id,name,email,phone', 'programme:id,name,department_id', 'programme.department:id,name,school_id', 'programme.department.school:id,name', 'currentLevel:id,name', 'admissionSession:id,name'])
            ->orderBy('matric_number')
            ->get();

        $filename = 'gdcollege-students-'.now()->format('Y-m-d-His').'.csv';

        $callback = function () use ($students) {
            $handle = fopen('php://output', 'w');

            fputcsv($handle, [
                'Matric Number', 'Name', 'Email', 'Phone', 'School', 'Department',
                'Programme', 'Level', 'Admission Session', 'Status',
            ]);

            foreach ($students as $student) {
                fputcsv($handle, [
                    $student->matric_number,
                    $student->user?->name,
                    $student->user?->email,
                    $student->user?->phone,
                    $student->programme?->department?->school?->name,
                    $student->programme?->department?->name,
                    $student->programme?->name,
                    $student->currentLevel?->name,
                    $student->admissionSession?->name,
                    $student->status,
                ]);
            }

            fclose($handle);
        };

        return response()->streamDownload($callback, $filename, [
            'Content-Type' => 'text/csv',
        ]);
    }
}
