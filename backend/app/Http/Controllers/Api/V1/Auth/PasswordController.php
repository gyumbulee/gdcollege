<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ChangePasswordRequest;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Services\AuditLogger;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;

/**
 * §35's "Password changes" audit requirement and Phase 1's "Password
 * reset / Password change" — genuinely missing from the codebase before
 * Phase 14 (AuthController only ever had register/login/logout/me).
 * Uses Laravel's built-in password-broker (the `password_reset_tokens`
 * table already exists in the Phase 0 skeleton migration, unused until
 * now) rather than a bespoke token table.
 */
class PasswordController extends Controller
{
    /**
     * Always returns the same generic message whether or not the email
     * exists, to avoid leaking which addresses have accounts. The actual
     * outcome (`ResetLinkSent` vs `InvalidUser`) is intentionally not
     * exposed to the caller.
     */
    public function forgot(ForgotPasswordRequest $request, AuditLogger $audit): JsonResponse
    {
        $status = Password::sendResetLink($request->only('email'));

        if ($status === Password::RESET_LINK_SENT) {
            $audit->log('password.reset.requested');
        }

        return response()->json([
            'success' => true,
            'message' => 'If an account exists for that email address, a password reset link has been sent.',
            'data' => [],
        ]);
    }

    public function reset(ResetPasswordRequest $request, AuditLogger $audit): JsonResponse
    {
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) use ($audit) {
                $user->forceFill(['password' => Hash::make($password)])->save();
                $user->tokens()->delete();

                event(new PasswordReset($user));

                $audit->log('password.reset.completed', $user);
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            return response()->json([
                'success' => false,
                'message' => 'This password reset link is invalid or has expired.',
                'errors' => ['token' => [__($status)]],
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'Your password has been reset. Please sign in with your new password.',
            'data' => [],
        ]);
    }

    /**
     * Authenticated self-service change. Revokes every other active token
     * (keeping only the one used for this request) so a stolen session
     * elsewhere is cut off the moment the real owner changes their
     * password — the same reasoning as `reset()` above, just scoped to
     * "other sessions" rather than "all sessions" since this one is
     * clearly still the legitimate user.
     */
    public function change(ChangePasswordRequest $request, AuditLogger $audit): JsonResponse
    {
        $user = $request->user();

        if (! Hash::check($request->string('current_password'), $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'The current password you entered is incorrect.',
                'errors' => ['current_password' => ['The current password you entered is incorrect.']],
            ], 422);
        }

        $user->forceFill(['password' => Hash::make($request->string('password'))])->save();

        $currentTokenId = $user->currentAccessToken()?->id;
        $user->tokens()->when($currentTokenId, fn ($q) => $q->where('id', '!=', $currentTokenId))->delete();

        $audit->log('password.changed', $user);

        return response()->json([
            'success' => true,
            'message' => 'Your password has been changed.',
            'data' => [],
        ]);
    }
}
