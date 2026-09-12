<?php

namespace Database\Seeders;

use App\Models\GradingScale;
use App\Models\ResultComponent;
use Illuminate\Database\Seeder;

/**
 * DEFAULT result configuration — a common Nigerian tertiary CA/Exam split
 * and grading scale, seeded so the platform is usable out of the box.
 * This is NOT confirmed institutional policy — Academic Affairs should
 * review and adjust both tables (via Phase 21's admin UI once it exists,
 * or directly) before relying on this for real results. Per §12, the
 * application code never assumes these values; changing these rows is
 * the entire "configuration" surface.
 */
class ResultConfigSeeder extends Seeder
{
    public function run(): void
    {
        ResultComponent::updateOrCreate(['name' => 'CA'], ['max_score' => 30, 'sort_order' => 1]);
        ResultComponent::updateOrCreate(['name' => 'Examination'], ['max_score' => 70, 'sort_order' => 2]);

        $scale = [
            [70, 100, 'A', 5.00],
            [60, 69, 'B', 4.00],
            [50, 59, 'C', 3.00],
            [45, 49, 'D', 2.00],
            [40, 44, 'E', 1.00],
            [0, 39, 'F', 0.00],
        ];

        foreach ($scale as [$min, $max, $grade, $point]) {
            GradingScale::updateOrCreate(
                ['min_score' => $min, 'max_score' => $max],
                ['grade' => $grade, 'grade_point' => $point]
            );
        }
    }
}
