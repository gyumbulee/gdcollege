<?php

namespace Database\Seeders;

use App\Models\AcademicSession;
use App\Models\FeeStructure;
use App\Models\Level;
use App\Models\Programme;
use Illuminate\Database\Seeder;

/**
 * DEVELOPMENT / DEMO DATA ONLY — see AcademicStructureSeeder's own note.
 * Amounts here are placeholders, not confirmed College fees; §17/§40
 * forbid fabricating official fees, so every name is marked "(Sample)"
 * and real amounts must come from the College before launch.
 */
class FinanceSeeder extends Seeder
{
    public function run(): void
    {
        $session = AcademicSession::where('name', '2026/2027')->first();
        $programme = Programme::where('slug', 'nd-computer-science-sample')->first();
        $levelI = Level::where('name', 'ND I')->first();

        if (! $session || ! $programme || ! $levelI) {
            return;
        }

        $structure = FeeStructure::updateOrCreate(
            [
                'academic_session_id' => $session->id,
                'programme_id' => $programme->id,
                'level_id' => $levelI->id,
                'name' => 'ND I Tuition & Fees (Sample)',
            ],
            ['description' => 'Placeholder fee bundle — replace amounts with College-confirmed figures before launch.', 'is_active' => true]
        );

        foreach ([
            ['name' => 'Tuition Fee (Sample)', 'code' => 'TUITION', 'amount' => 75000, 'is_mandatory' => true],
            ['name' => 'ICT/Library Fee (Sample)', 'code' => 'ICT_LIB', 'amount' => 10000, 'is_mandatory' => true],
            ['name' => 'Medical/Sports Fee (Sample)', 'code' => 'MED_SPORTS', 'amount' => 5000, 'is_mandatory' => true],
            ['name' => 'Departmental Handbook (Sample)', 'code' => 'HANDBOOK', 'amount' => 2500, 'is_mandatory' => false],
        ] as $item) {
            $structure->items()->updateOrCreate(['code' => $item['code']], $item);
        }
    }
}
