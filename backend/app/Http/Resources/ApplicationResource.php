<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Without this, Eloquent's default toArray() would key relations by their
 * PHP method name (`academicSession`, `educationRecords`) while normal
 * columns stay snake_case (`application_number`) — an inconsistent shape.
 * This resource normalizes everything to snake_case, matching the rest of
 * the API. Load the same relations as ApplicationController::WITH before
 * wrapping a model in this resource.
 */
class ApplicationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'application_number' => $this->application_number,
            'status' => $this->status,
            'fee_paid' => $this->fee_paid,
            'submitted_at' => $this->submitted_at,
            'programme' => $this->whenLoaded('programme', fn () => $this->programme ? [
                'id' => $this->programme->id,
                'name' => $this->programme->name,
                'department' => $this->programme->relationLoaded('department') && $this->programme->department ? [
                    'id' => $this->programme->department->id,
                    'name' => $this->programme->department->name,
                ] : null,
            ] : null),
            'academic_session' => $this->whenLoaded('academicSession', fn () => $this->academicSession ? [
                'id' => $this->academicSession->id,
                'name' => $this->academicSession->name,
            ] : null),
            'applicant' => $this->whenLoaded('applicant', fn () => [
                'date_of_birth' => $this->applicant->date_of_birth,
                'gender' => $this->applicant->gender,
                'nationality' => $this->applicant->nationality,
                'state_of_origin' => $this->applicant->state_of_origin,
                'lga' => $this->applicant->lga,
                'address' => $this->applicant->address,
                'next_of_kin_name' => $this->applicant->next_of_kin_name,
                'next_of_kin_phone' => $this->applicant->next_of_kin_phone,
                'next_of_kin_relationship' => $this->applicant->next_of_kin_relationship,
                'next_of_kin_address' => $this->applicant->next_of_kin_address,
                'user' => $this->applicant->relationLoaded('user') ? [
                    'name' => $this->applicant->user->name,
                    'email' => $this->applicant->user->email,
                    'phone' => $this->applicant->user->phone,
                ] : null,
            ]),
            'education_records' => $this->whenLoaded('educationRecords', fn () => $this->educationRecords->map(fn ($r) => [
                'id' => $r->id,
                'exam_body' => $r->exam_body,
                'exam_number' => $r->exam_number,
                'exam_year' => $r->exam_year,
                'school_attended' => $r->school_attended,
                'subjects' => $r->subjects,
            ])),
            'documents' => $this->whenLoaded('documents', fn () => $this->documents->map(fn ($d) => [
                'id' => $d->id,
                'document_type' => $d->document_type,
                'original_filename' => $d->original_filename,
                'size_bytes' => $d->size_bytes,
            ])),
            'admission' => $this->whenLoaded('admission', fn () => $this->admission ? [
                'decision' => $this->admission->decision,
                'decision_reason' => $this->admission->decision_reason,
                'decided_at' => $this->admission->decided_at,
                'decided_by' => $this->admission->relationLoaded('decidedBy') && $this->admission->decidedBy
                    ? $this->admission->decidedBy->name
                    : null,
            ] : null),
            'student' => $this->whenLoaded('student', fn () => $this->student ? [
                'matric_number' => $this->student->matric_number,
            ] : null),
        ];
    }
}
