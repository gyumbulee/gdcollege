<?php

namespace App\Http\Controllers\Api\V1\Admissions;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\Application;
use Illuminate\Http\Request;

/**
 * Public "check my admission status" search — Master Implementation Brief
 * §5's `/admissions/admission-list` route. Deliberately returns only what
 * someone who already has the application number would need: applicant's
 * own name, the decision, and the programme. No email/phone/address, and
 * no way to enumerate other applicants' numbers (exact match only).
 */
class AdmissionListController extends Controller
{
    use ApiResponse;

    public function search(Request $request)
    {
        $request->validate(['application_number' => ['required', 'string']]);

        $application = Application::with(['applicant.user', 'programme', 'admission'])
            ->where('application_number', $request->string('application_number'))
            ->first();

        if (! $application || ! $application->admission) {
            return $this->fail('No admission decision found for that application number.', [], 404);
        }

        return $this->success([
            'application_number' => $application->application_number,
            'applicant_name' => $application->applicant->user->name,
            'programme' => $application->programme?->name,
            'decision' => $application->admission->decision,
            'decided_at' => $application->admission->decided_at,
        ]);
    }
}
