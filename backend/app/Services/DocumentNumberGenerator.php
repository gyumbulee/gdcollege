<?php

namespace App\Services;

use App\Models\DocumentNumberCounter;
use Illuminate\Support\Facades\DB;

class DocumentNumberGenerator
{
    public function generate(string $type): string
    {
        return DB::transaction(function () use ($type) {
            $counter = DocumentNumberCounter::lockForUpdate()->firstOrCreate(['type' => $type], ['next_sequence' => 1]);

            $sequence = $counter->next_sequence;
            $counter->increment('next_sequence');

            $prefix = strtoupper(substr(preg_replace('/[^A-Z]/', '', $type), 0, 4)) ?: 'DOC';

            return sprintf('%s/%s/%06d', $prefix, now()->format('Y'), $sequence);
        });
    }
}
