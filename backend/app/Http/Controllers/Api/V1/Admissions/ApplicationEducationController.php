<?php

namespace App\Http\Controllers\Api\V1\Admissions;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admissions\UpdateEducationRecordsRequest;
use App\Http\Resources\ApplicationResource;
use App\Http\Responses\ApiResponse;
use App\Models\Application;
use Illuminate\Support\Facades\DB;

class ApplicationEducationController extends Controller
{
    use ApiResponse;

    /**
     * Replaces the application's full set of O'Level records in one call
     * — simpler for the wizard's "repeatable rows" UI than granular
     * per-record CRUD, and the whole set is small (a handful of rows).
     */
    public function replace(UpdateEducationRecordsRequest $request, Application $application)
    {
        $this->authorize('update', $application);

        DB::transaction(function () use ($request, $application) {
            $application->educationRecords()->delete();
            foreach ($request->input('records', []) as $record) {
                $application->educationRecords()->create($record);
            }
        });

        return $this->success(new ApplicationResource($application->fresh('educationRecords')), 'Educational history updated.');
    }
}
