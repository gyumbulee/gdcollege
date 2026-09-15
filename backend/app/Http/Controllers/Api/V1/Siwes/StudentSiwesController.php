<?php

namespace App\Http\Controllers\Api\V1\Siwes;

use App\Http\Controllers\Controller;
use App\Http\Requests\Siwes\SiwesRecordRequest;
use App\Http\Resources\SiwesRecordResource;
use App\Http\Responses\ApiResponse;
use App\Models\SiwesRecord;
use App\Services\AuditLogger;
use Illuminate\Support\Facades\Auth;

class StudentSiwesController extends Controller
{
    use ApiResponse;

    public function index()
    {
        $student = Auth::user()->student;
        if (! $student) {
            return $this->fail('No student record is linked to this account.', [], 404);
        }

        return $this->success(SiwesRecordResource::collection(
            $student->siwesRecords()->orderByDesc('id')->get()
        ));
    }

    public function store(SiwesRecordRequest $request, AuditLogger $audit)
    {
        $student = Auth::user()->student;
        if (! $student) {
            return $this->fail('No student record is linked to this account.', [], 404);
        }

        $record = $student->siwesRecords()->create([
            ...$request->validated(),
            'status' => SiwesRecord::STATUS_PENDING,
        ]);

        $audit->log('siwes.request', $record);

        return $this->success(new SiwesRecordResource($record), 'SIWES placement submitted.', 201);
    }
}
