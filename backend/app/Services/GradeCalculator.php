<?php

namespace App\Services;

use App\Models\GradingScale;
use App\Models\ResultComponent;

/**
 * Computes a total score and grade from component scores. Both the
 * component definitions and the grading scale come from the database
 * (ResultComponent, GradingScale) — nothing here hardcodes what a
 * component is called, its max score, or where grade boundaries fall.
 */
class GradeCalculator
{
    /** @param array<string, float> $componentScores keyed by ResultComponent::name */
    public function total(array $componentScores): float
    {
        return round(array_sum($componentScores), 2);
    }

    public function grade(float $total): ?GradingScale
    {
        return GradingScale::forScore($total);
    }

    /** Validates that submitted component scores don't exceed each component's configured max. */
    public function validateComponentScores(array $componentScores): array
    {
        $errors = [];
        $components = ResultComponent::pluck('max_score', 'name');

        foreach ($componentScores as $name => $score) {
            $max = $components[$name] ?? null;
            if ($max === null) {
                $errors[$name] = ["\"{$name}\" is not a configured result component."];
            } elseif ($score < 0 || $score > $max) {
                $errors[$name] = ["Score for {$name} must be between 0 and {$max}."];
            }
        }

        return $errors;
    }
}
