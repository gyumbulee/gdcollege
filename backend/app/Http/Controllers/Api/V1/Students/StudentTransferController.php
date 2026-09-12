<?php

namespace App\Http\Controllers\Api\V1\Students;

use App\Http\Controllers\Controller;
use App\Http\Requests\Students\TransferProgrammeRequest;
use App\Http\Resources\StudentResource;
use App\Http\Responses\ApiResponse;
use App\Models\Student;
use App\Models\StudentProgrammeHistory;
use App\Services\AuditLogger;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class StudentTransferController extends Controller
{
    use ApiResponse;

    /**
     * Records a programme transfer. Old and new programme are BOTH kept
     * in student_programme_histories (§36) — this never edits a prior
     * history row, only appends and updates the student's current
     * programme pointer.
     */
    public function store(TransferProgrammeRequest $request, Student $student, AuditLogger $audit)
    {
        $fromProgrammeId = $student->programme_id;
        $toProgrammeId = $request->integer('to_programme_id');

        if ($fromProgrammeId === $toProgrammeId) {
            return $this->fail('Student is already in this programme.', [], 422);
        }

        $history = DB::transaction(function () use ($student, $fromProgrammeId, $toProgrammeId, $request) {
            $history = StudentProgrammeHistory::create([
                'student_id' => $student->id,
                'from_programme_id' => $fromProgrammeId,
                'to_programme_id' => $toProgrammeId,
                'reason' => $request->input('reason'),
                'changed_by' => Auth::id(),
                'changed_at' => now(),
            ]);

            $student->update(['programme_id' => $toProgrammeId]);

            return $history;
        });

        $audit->log(
            'student.programme_transfer',
            $history,
            ['programme_id' => $fromProgrammeId],
            ['programme_id' => $toProgrammeId, 'reason' => $request->input('reason')]
        );

        return $this->success(
            new StudentResource($student->fresh(['programme.department.school', 'programmeHistories.fromProgramme', 'programmeHistories.toProgramme'])),
            'Programme transfer recorded.'
        );
    }
}
