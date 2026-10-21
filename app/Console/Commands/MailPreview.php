<?php

namespace App\Console\Commands;

use App\Mail\AccountChangedMail;
use App\Mail\BrandedMail;
use App\Mail\EventRegistrationMail;
use App\Mail\NotificationMail;
use App\Mail\PaymentIssueMail;
use App\Mail\PaymentReceiptMail;
use App\Mail\ResetPasswordMail;
use App\Mail\SecurityAlertMail;
use App\Mail\StaffAlertMail;
use App\Mail\TestMail;
use App\Mail\WelcomeMail;
use App\Models\EventRegistration;
use App\Models\Notification;
use App\Models\Payment;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Mail;

/**
 * Build any email from REAL records and either save it as an HTML file to look at, or send it.
 *
 *   php artisan mail:preview all
 *   php artisan mail:preview receipt --payment=12
 *   php artisan mail:preview welcome --user=5 --send --to=delivered@resend.dev
 *
 * Sending goes straight to the configured mailer. Without a verified sending domain Resend only
 * delivers to your own address, so use --to=delivered@resend.dev (Resend's safe test inbox).
 */
class MailPreview extends Command
{
    protected $signature = 'mail:preview
        {template=all : welcome|account-changed|password|email-changed|receipt|voided|failed|event|event-confirmed|notification|private-notification|reset|staff-alert|test|all}
        {--user= : user id (default: a real member)}
        {--payment= : payment id (default: latest completed)}
        {--registration= : event registration id (default: latest)}
        {--send : actually send, instead of only saving an HTML preview}
        {--to=delivered@resend.dev : recipient when sending}';

    protected $description = 'Render or send any email using real data from the database';

    public function handle(): int
    {
        $templates = $this->argument('template') === 'all'
            ? ['welcome', 'account-changed', 'password', 'email-changed', 'receipt', 'voided', 'failed', 'event', 'event-confirmed', 'notification', 'private-notification', 'reset', 'staff-alert', 'test']
            : [$this->argument('template')];

        $dir = storage_path('app/mail-previews');
        File::ensureDirectoryExists($dir);

        foreach ($templates as $t) {
            $mail = $this->build($t);
            if (!$mail) {
                $this->warn("{$t}: no suitable real record found, skipped.");
                continue;
            }

            $to = (string) $this->option('to');
            $mail->recipientEmail = $this->option('send') ? $to : ($mail->recipientEmail ?? 'recipient@example.org');
            $mail->recipientUserId ??= $this->user()?->id;

            $file = "{$dir}/{$t}.html";
            File::put($file, $mail->render());
            $this->line(sprintf('<info>%-22s</info> %s', $t, $file));

            if ($this->option('send')) {
                try {
                    Mail::to($to)->sendNow($mail);
                    $this->line("   sent to {$to}");
                    usleep(650_000);   // Resend allows ~2 requests/second
                } catch (\Throwable $e) {
                    $this->error("   FAILED: " . $e->getMessage());
                }
            }
        }

        return self::SUCCESS;
    }

    private function user(): ?User
    {
        return $this->option('user')
            ? User::find($this->option('user'))
            : (User::where('role', 'member')->whereHas('member')->whereNotNull('zone_id')->orderBy('id')->first() ?? User::where('role', 'member')->first());
    }

    private function payment(array $where = []): ?Payment
    {
        if ($id = $this->option('payment')) {
            return Payment::find($id);
        }

        return Payment::query()->where($where ?: ['status' => 'completed'])->whereNotNull('receipt_number')->latest('id')->first();
    }

    private function build(string $t): ?BrandedMail
    {
        $user = $this->user();

        return match ($t) {
            'welcome'         => $user ? new WelcomeMail($user) : null,
            'account-changed' => $user ? new AccountChangedMail($user, [['Zone', 'Chegutu', $user->zone?->name], ['Account status', 'Deactivated', 'Active']], 'Head office') : null,
            'password'        => $user ? new SecurityAlertMail($user, 'password_changed', null, '102.67.14.8', 'Chrome on Windows') : null,
            'email-changed'   => $user ? new SecurityAlertMail($user, 'email_changed_old', $user->email, '102.67.14.8', 'Chrome on Windows') : null,
            'receipt'         => ($p = $this->payment()) ? new PaymentReceiptMail($p) : null,
            'voided'          => ($p = $this->payment()) ? new PaymentIssueMail($p->forceFill(['voided_at' => now()]), 'voided') : null,
            'failed'          => ($p = $this->payment()) ? new PaymentIssueMail($p, 'failed') : null,
            'event'           => ($r = $this->registration()) ? new EventRegistrationMail($r, 'registered') : null,
            'event-confirmed' => ($r = $this->registration()) ? new EventRegistrationMail($r, 'confirmed') : null,
            'notification'    => ($n = $this->notification(false)) ? new NotificationMail($n) : null,
            'private-notification' => ($n = $this->notification(true)) ? new NotificationMail($n) : null,
            'reset'           => $user ? new ResetPasswordMail($user, url('/reset-password/preview-token?email=' . urlencode($user->email)), 60) : null,
            'staff-alert'     => ($p = $this->payment()) ? new StaffAlertMail('An online payment needs your review', ['PayMe reported a payment, but it could not be matched safely, so it was NOT credited.'],
                ['Payer' => $p->user?->name, 'Expected' => $p->currency . ' ' . number_format((float) $p->amount, 2), 'Reference' => $p->client_reference ?: $p->reference], ['label' => 'Review in the Finance portal', 'url' => BrandedMail::portalUrl('/finance/payments/' . $p->id)]) : null,
            'test'            => new TestMail('mail:preview'),
            default           => null,
        };
    }

    private function registration(): ?EventRegistration
    {
        return $this->option('registration') ? EventRegistration::find($this->option('registration')) : EventRegistration::with('event')->whereHas('event')->latest('id')->first();
    }

    private function notification(bool $private): ?Notification
    {
        $category = $private ? 'prayer_center' : null;
        $q = Notification::query()->whereHas('user');

        return $private
            ? ($q->where('category', 'prayer_center')->latest('id')->first() ?? $q->latest('id')->first()?->replicate()->forceFill(['category' => 'prayer_center']))
            : $q->where('category', '!=', 'prayer_center')->latest('id')->first();
    }
}
