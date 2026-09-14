<?php

namespace Database\Seeders;

use App\Models\DocumentTemplate;
use Illuminate\Database\Seeder;

/**
 * Seeds the document types named in the platform specification (§22).
 * `requires_request` mirrors DocumentTemplate::INSTANT_TYPES exactly —
 * kept as real seeded rows (not just the PHP constant) so ICT can
 * disable a type via `is_active` without a code change.
 */
class DocumentTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $templates = [
            [DocumentTemplate::TYPE_ADMISSION_LETTER, 'Admission Letter', false],
            [DocumentTemplate::TYPE_COURSE_REG_SLIP, 'Course Registration Slip', false],
            [DocumentTemplate::TYPE_RESULT_SLIP, 'Result Slip', false],
            [DocumentTemplate::TYPE_PAYMENT_RECEIPT, 'Payment Receipt', false],
            [DocumentTemplate::TYPE_STATEMENT_OF_RESULT, 'Statement of Result', true],
            [DocumentTemplate::TYPE_TRANSCRIPT, 'Transcript', true],
            [DocumentTemplate::TYPE_CLEARANCE_CERTIFICATE, 'Clearance Certificate', true],
        ];

        foreach ($templates as [$type, $name, $requiresRequest]) {
            DocumentTemplate::updateOrCreate(
                ['type' => $type],
                ['name' => $name, 'is_active' => true, 'requires_request' => $requiresRequest]
            );
        }
    }
}
