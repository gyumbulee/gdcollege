<?php

namespace App\Http\Controllers\Api\V1\Academic;

use App\Http\Controllers\Controller;
use App\Http\Requests\Academic\AcademicSessionRequest;
use App\Http\Responses\ApiResponse;
use App\Models\AcademicSession;
use Illuminate\Support\Facades\DB;

class AcademicSessionController extends Controller
{
    use ApiResponse;

    public function index()
    {
        return $this->success(AcademicSession::withCount('semesters')->orderByDesc('start_date')->get());
    }

    public function store(AcademicSessionRequest $request)
    {
        $session = $this->saveWithSingleCurrent($request->validated());

        return $this->success($session, 'Academic session created.', 201);
    }

    public function show(AcademicSession $academicSession)
    {
        return $this->success($academicSession->load('semesters'));
    }

    public function update(AcademicSessionRequest $request, AcademicSession $academicSession)
    {
        $academicSession = $this->saveWithSingleCurrent($request->validated(), $academicSession);

        return $this->success($academicSession, 'Academic session updated.');
    }

    public function destroy(AcademicSession $academicSession)
    {
        $academicSession->delete();

        return $this->success([], 'Academic session deleted.');
    }

    /**
     * Ensures at most one academic session is ever marked current — a
     * genuine business rule (there is exactly one "now"), not an arbitrary
     * restriction, so it belongs here rather than left to callers.
     */
    private function saveWithSingleCurrent(array $data, ?AcademicSession $session = null): AcademicSession
    {
        return DB::transaction(function () use ($data, $session) {
            if (! empty($data['is_current'])) {
                AcademicSession::where('is_current', true)->update(['is_current' => false]);
            }

            if ($session) {
                $session->update($data);

                return $session;
            }

            return AcademicSession::create($data);
        });
    }
}
