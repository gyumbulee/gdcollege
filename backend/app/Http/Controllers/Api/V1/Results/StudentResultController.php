<?php

namespace App\Http\Controllers\Api\V1\Results;

use App\Http\Controllers\Controller;
use App\Http\Resources\ResultResource;
use App\Http\Responses\ApiResponse;
use App\Models\Result;
use Illuminate\Support\Facades\Auth;

/**
 * "Students see only published results" (§12, §36) — this is the ONLY
 * results endpoint a student role can reach, and it hard-filters to
 * status=PUBLISHED regardless of what the student asks for.
 */
class StudentResultController extends Controller
{
    use ApiResponse;

    public function index()
    {
        $student = Auth::user()->student;
        if (! $student) {
            return $this->fail('No student record found for this account.', [], 404);
        }

        $results = Result::with(['courseOffering.course'])
            ->where('student_id', $student->id)
            ->where('status', Result::STATUS_PUBLISHED)
            ->get();

        return $this->success(ResultResource::collection($results));
    }
}
