<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StudentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'matric_number' => $this->matric_number,
            'status' => $this->status,
            'user' => $this->whenLoaded('user', fn () => [
                'name' => $this->user->name,
                'email' => $this->user->email,
                'phone' => $this->user->phone,
            ]),
            'programme' => $this->whenLoaded('programme', fn () => $this->programme ? [
                'id' => $this->programme->id,
                'name' => $this->programme->name,
                'department' => $this->programme->relationLoaded('department') && $this->programme->department ? [
                    'id' => $this->programme->department->id,
                    'name' => $this->programme->department->name,
                    'school' => $this->programme->department->relationLoaded('school') && $this->programme->department->school ? [
                        'id' => $this->programme->department->school->id,
                        'name' => $this->programme->department->school->name,
                    ] : null,
                ] : null,
            ] : null),
            'current_level' => $this->whenLoaded('currentLevel', fn () => $this->currentLevel ? [
                'id' => $this->currentLevel->id,
                'name' => $this->currentLevel->name,
            ] : null),
            'admission_session' => $this->whenLoaded('admissionSession', fn () => $this->admissionSession ? [
                'id' => $this->admissionSession->id,
                'name' => $this->admissionSession->name,
            ] : null),
            'enrolments' => $this->whenLoaded('enrolments', fn () => $this->enrolments->map(fn ($e) => [
                'id' => $e->id,
                'academic_session' => $e->relationLoaded('academicSession') ? $e->academicSession->name : null,
                'level' => $e->relationLoaded('level') ? $e->level->name : null,
                'programme' => $e->relationLoaded('programme') ? $e->programme->name : null,
                'status' => $e->status,
            ])),
            'programme_histories' => $this->whenLoaded('programmeHistories', fn () => $this->programmeHistories->map(fn ($h) => [
                'id' => $h->id,
                'from_programme' => $h->relationLoaded('fromProgramme') ? $h->fromProgramme?->name : null,
                'to_programme' => $h->relationLoaded('toProgramme') ? $h->toProgramme?->name : null,
                'reason' => $h->reason,
                'changed_at' => $h->changed_at,
            ])),
        ];
    }
}
