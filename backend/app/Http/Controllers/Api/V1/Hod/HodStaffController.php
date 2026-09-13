<?php

namespace App\Http\Controllers\Api\V1\Hod;

use App\Http\Controllers\Api\V1\Hod\Concerns\ResolvesHodDepartment;
use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\CourseOffering;
use App\Models\User;
use Illuminate\Http\Request;

/**
 * HOD Portal — department staff (§17). "Staff of a department" isn't a
 * modelled relation anywhere yet (no staff_department table — see
 * docs/PROJECT_STATUS.md if that's needed later); this derives the list
 * from who is actually lecturing this department's course offerings,
 * which is the data that exists today, rather than inventing a new
 * table for a single read-only listing.
 */
class HodStaffController extends Controller
{
    use ApiResponse, ResolvesHodDepartment;

    public function index(Request $request)
    {
        $department = $this->resolveHodDepartment($request, $error);
        if (! $department) {
            return $error;
        }

        $programmeIds = $department->programmes()->pluck('id');

        $lecturerIds = CourseOffering::whereIn('programme_id', $programmeIds)
            ->whereNotNull('lecturer_id')
            ->distinct()
            ->pluck('lecturer_id');

        $staff = User::whereIn('id', $lecturerIds)
            ->orderBy('name')
            ->get()
            ->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'course_offerings_count' => CourseOffering::whereIn('programme_id', $programmeIds)
                    ->where('lecturer_id', $user->id)
                    ->count(),
            ]);

        return $this->success($staff);
    }
}
