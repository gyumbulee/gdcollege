<?php

namespace App\Http\Controllers\Api\V1\Academic;

use App\Http\Controllers\Controller;
use App\Http\Requests\Academic\LevelRequest;
use App\Http\Responses\ApiResponse;
use App\Models\Level;

class LevelController extends Controller
{
    use ApiResponse;

    public function index()
    {
        return $this->success(Level::orderBy('sort_order')->get());
    }

    public function store(LevelRequest $request)
    {
        $level = Level::create($request->validated());

        return $this->success($level, 'Level created.', 201);
    }

    public function update(LevelRequest $request, Level $level)
    {
        $level->update($request->validated());

        return $this->success($level, 'Level updated.');
    }

    public function destroy(Level $level)
    {
        $level->delete();

        return $this->success([], 'Level deleted.');
    }
}
