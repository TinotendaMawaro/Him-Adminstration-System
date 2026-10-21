<?php

namespace App\Support;

use App\Mail\BrandedMail;
use App\Models\EmailLog;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

/**
 * The one way the application sends email.
 *
 *   Mailing::to($user, new PaymentReceiptMail($payment));
 *   Mailing::toRoles(['finance', 'master'], new StaffAlertMail(...));
 *
 * Applies the safety gate, records the attempt in email_logs, then queues the message so a slow
 * mail provider can never slow down a web request.
 */
class Mailing
{
    public static function to(User|string $recipient, BrandedMail $mail): ?EmailLog
    {
        $user  = $recipient instanceof User ? $recipient : null;
        $email = $user ? (string) $user->email : $recipient;

        $skip = EmailGate::check($user, $email, $mail->optional());
        if ($skip) {
            // Worth recording when a person's own choice or a bounce blocked a real email; routine skips are not.
            if (in_array($skip, ['suppressed', 'opted_out'], true)) {
                self::record($user, $email, $mail, 'skipped', $skip);
            }

            return null;
        }

        $log = self::record($user, $email, $mail, 'queued');

        $mail->logId           = $log->id;
        $mail->recipientUserId = $user?->id;
        $mail->recipientEmail  = $email;

        Mail::to($email, $user?->name)->queue($mail);

        return $log;
    }

    /** Send the same mail to every active user holding one of these roles (each gets their own copy). */
    public static function toRoles(array $roles, callable $mailFor): int
    {
        $sent = 0;
        User::whereIn('role', $roles)->where('is_active', true)->get()->each(function (User $u) use ($mailFor, &$sent) {
            self::to($u, $mailFor($u)) && $sent++;
        });

        return $sent;
    }

    private static function record(?User $user, string $email, BrandedMail $mail, string $status, ?string $error = null): EmailLog
    {
        return EmailLog::create([
            'user_id'  => $user?->id,
            'to_email' => $email,
            'subject'  => $mail->envelope()->subject,
            'template' => $mail->template(),
            'category' => $mail->optional() ? 'notification' : 'transactional',
            'status'   => $status,
            'error'    => $error,
        ]);
    }
}
