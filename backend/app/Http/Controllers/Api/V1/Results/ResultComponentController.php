<?php

namespace App\Http\Controllers\Api\V1\Results;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\ResultComponent;

class ResultComponentController extends Controller
{
    use ApiResponse;

    public function index()
    {
        return $this->success(ResultComponent::orderBy('sort_order')->get(['id', 'name', 'max_score', 'sort_order']));
    }
}
