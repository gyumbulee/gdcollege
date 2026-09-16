<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Replaces Laravel's default password-reset notification, which links to
 * a Blade route (`password.reset`) this API-only backend doesn't define.
 * Links to the Next.js frontend's /reset-password page instead.
 *
 * Delivery depends on whatever MAIL_MAILER is configured — 'log' in
 * local/dev writes the full email (including this link) to
 * storage/logs/laravel.log, which is enough to test the flow end to end
 * without real SMTP. Real transactional email is Phase 17's concern
 * (§25 "Email architecture"); this notification will keep working
 * unchanged once that's configured, since Laravel just swaps the driver.
 */
class ResetPasswordNotification extends Notification
{
    use Queueable;

    public function __construct(public readonly string $token)
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $url = rtrim(config('app.frontend_url'), '/').'/reset-password?token='.$this->token.'&email='.urlencode($notifiable->getEmailForPasswordReset());

        return (new MailMessage)
            ->subject('Reset your GD College Wase password')
            ->greeting('Hello '.$notifiable->name.',')
            ->line('You are receiving this email because we received a password reset request for your account.')
            ->action('Reset Password', $url)
            ->line('This password reset link will expire in '.config('auth.passwords.users.expire').' minutes.')
            ->line('If you did not request a password reset, no further action is required.');
    }
}
