<?php

namespace App\Http\Controllers\Api\V1\Academic;

use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\User;
use Illuminate\Http\Request;

/**
 * The gap this closes: assigning a lecturer to a course offering used to
 * mean typing a raw numeric user ID, because the only endpoint that
 * could list staff (Admin\UserManagementController::index()) is gated by
 * `users.manage` — held by ICT/Super Admin only, not by the
 * Academic/Examination Officer or Registrar who actually manage course
 * offerings (`academic_structure.manage`). Rather than loosen
 * `users.manage`'s exposure (name/email/phone/status/role-assignment
 * endpoints) to a wider audience, this is a narrower, read-only,
 * name+email-only lookup scoped to exactly what a picker needs — same
 * permission gate as course-offerings itself (see routes/api.php).
 */
class StaffDirectoryController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $query = User::query()->whereDoesntHave('roles', fn ($q) => $q->whereIn('slug', ['applicant', 'student']));

        if ($request->filled('role')) {
            $query->whereHas('roles', fn ($q) => $q->where('slug', $request->input('role')));
        }

        if ($request->filled('search')) {
            $term = '%'.$request->input('search').'%';
            $query->where(fn ($q) => $q->where('name', 'like', $term)->orWhere('email', 'like', $term));
        }

        return $this->success(
            $query->orderBy('name')->limit(50)->get(['id', 'name', 'email'])
        );
    }
}
