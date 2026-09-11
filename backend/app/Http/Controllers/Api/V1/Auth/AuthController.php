<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterApplicantRequest;
use App\Models\Applicant;
use App\Models\Role;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

/**
 * Token-based (Sanctum personal access token) authentication. Chosen over
 * cookie-based SPA auth so the same API can serve the Next.js frontend and
 * a future mobile client identically. The frontend never stores this token
 * in localStorage — see frontend/src/app/api/session/ route.ts, which
 * holds it in an httpOnly cookie instead.
 */
class AuthController extends Controller
{
    /**
     * Self-registration for applicants only — staff/lecturer/etc accounts
     * are created by the ICT/System Administrator (Phase 21), never via a
     * public endpoint, per the spec's role model.
     */
    public function register(RegisterApplicantRequest $request, AuditLogger $audit): JsonResponse
    {
        $user = DB::transaction(function () use ($request) {
            $user = User::create([
                'name' => $request->string('name'),
                'email' => $request->string('email'),
                'phone' => $request->input('phone'),
                'password' => Hash::make($request->string('password')),
                'status' => 'active',
            ]);

            $applicantRole = Role::where('slug', 'applicant')->firstOrFail();
            $user->roles()->attach($applicantRole->id);

            Applicant::create(['user_id' => $user->id]);

            return $user;
        });

        $token = $user->createToken('gdcollege-session')->plainTextToken;

        $audit->log('applicant.registered', $user);

        return response()->json([
            'success' => true,
            'message' => 'Account created successfully.',
            'data' => [
                'token' => $token,
                'user' => $this->present($user),
            ],
        ], 201);
    }

    public function login(LoginRequest $request, AuditLogger $audit): JsonResponse
    {
        $user = User::where('email', $request->string('email'))->first();

        if (! $user || ! Hash::check($request->string('password'), $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        if (! $user->isActive()) {
            throw ValidationException::withMessages([
                'email' => ['This account is not active. Contact the ICT/System Administrator.'],
            ]);
        }

        $token = $user->createToken('gdcollege-session')->plainTextToken;

        $audit->log('login');

        return response()->json([
            'success' => true,
            'message' => 'Signed in successfully.',
            'data' => [
                'token' => $token,
                'user' => $this->present($user),
            ],
        ]);
    }

    public function logout(Request $request, AuditLogger $audit): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        $audit->log('logout');

        return response()->json([
            'success' => true,
            'message' => 'Signed out successfully.',
            'data' => [],
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'Current user retrieved.',
            'data' => $this->present($request->user()),
        ]);
    }

    private function present(User $user): array
    {
        $user->loadMissing('roles.permissions');

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'status' => $user->status,
            'roles' => $user->roles->pluck('slug'),
            'permissions' => $user->roles
                ->pluck('permissions')
                ->flatten()
                ->pluck('slug')
                ->unique()
                ->values(),
        ];
    }
}
