<?php

namespace App\Mail;

use App\Mail\Transport\ResendException;
use App\Models\EmailLog;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Mail\Mailables\Headers;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;

/**
 * Every Heartfelt email: one premium responsive template, a plain-text twin, queued sending with safe retries.
 *
 * Subclasses describe WHAT to say through compose(); the layout (emails/message.blade.php) decides how it looks.
 *
 *   compose() returns: subject, preheader, tone (info|success|warning|danger), title, greeting,
 *                      intro[], facts[label => value], cta[label,url], notice, outro[]
 *
 * Send through App\Support\Mailing::to() so the safety gate, opt-outs and the email log are applied.
 */
abstract class BrandedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    private const INCREMENT = '__increment__';   // touchLog() sentinel: bump the attempt counter

    public int $tries = 4;
    public array $backoff = [20, 60, 180];

    /** Set by Mailing::to(). */
    public ?int $logId = null;
    public ?int $recipientUserId = null;
    public ?string $recipientEmail = null;

    /** Stable across queue retries, so Resend can drop a duplicate of the same email. */
    public string $idempotencyKey;

    private ?array $composed = null;

    public function __construct()
    {
        $this->idempotencyKey = (string) Str::uuid();
        $this->afterCommit    = true;   // never email about something that was rolled back
    }

    abstract protected function compose(): array;

    /** Notification-style emails the recipient may opt out of. Transactional/security mail is never optional. */
    public function optional(): bool
    {
        return false;
    }

    public function template(): string
    {
        return Str::snake(str_replace('Mail', '', class_basename($this)));
    }

    protected function data(): array
    {
        return $this->composed ??= $this->compose() + [
            'tone' => 'info', 'preheader' => '', 'title' => '', 'greeting' => null, 'intro' => [], 'facts' => [], 'cta' => null, 'notice' => null, 'outro' => [],
        ];
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->data()['subject'],
            replyTo: [new Address((string) config('mailing.support_email'), (string) config('mailing.brand.name'))],
        );
    }

    public function content(): Content
    {
        $unsubscribe = null;
        if ($this->optional() && $this->recipientUserId) {
            $unsubscribe = URL::temporarySignedRoute('email.unsubscribe', now()->addDays((int) config('mailing.signed_link_days', 30)), ['user' => $this->recipientUserId]);
        }

        $view = [
            'm'              => $this->data(),
            'brand'          => config('mailing.brand'),
            'logo'           => config('mailing.logo'),
            'portalUrl'      => self::portalUrl(),
            'supportEmail'   => config('mailing.support_email'),
            'unsubscribeUrl' => $unsubscribe,
            'recipient'      => $this->recipientEmail,
            'year'           => now()->year,
        ];

        return new Content(view: 'emails.message', text: 'emails.message-text', with: $view);
    }

    public function headers(): Headers
    {
        $text = [
            'X-HIM-Template'    => $this->template(),
            'X-HIM-Idempotency' => $this->idempotencyKey,
        ];
        if ($this->logId) {
            $text['X-HIM-Log'] = (string) $this->logId;
        }
        if ($this->optional() && $this->recipientUserId) {
            $url = URL::temporarySignedRoute('email.unsubscribe', now()->addDays((int) config('mailing.signed_link_days', 30)), ['user' => $this->recipientUserId]);
            $text['List-Unsubscribe'] = "<{$url}>";
            $text['List-Unsubscribe-Post'] = 'List-Unsubscribe=One-Click';
        }

        return new Headers(text: $text);
    }

    /** A moment shown in the church's own timezone, e.g. "21 Oct 2026, 01:20 CAT". */
    public static function localTime(?\DateTimeInterface $date, string $format = 'j M Y, H:i T'): string
    {
        return $date ? \Illuminate\Support\Carbon::instance($date)->timezone(config('mailing.timezone'))->format($format) : '';
    }

    public static function portalUrl(string $path = ''): string
    {
        return rtrim((string) (config('mailing.portal_url') ?: config('app.url')), '/') . $path;
    }

    // ─── Sending, logging and failure handling ────────────────────────────────

    public function send($mailer)
    {
        $this->touchLog(['attempts' => self::INCREMENT]);

        try {
            return parent::send($mailer);
        } catch (ResendException $e) {
            if ($e->isPermanent()) {
                // Retrying a rejected address / unverified domain can never work: record it and finish cleanly.
                $this->markFailed($e->getMessage());

                return null;
            }

            throw $e;
        }
    }

    /** Called by the queue after the final retry. */
    public function failed(\Throwable $e): void
    {
        $this->markFailed($e->getMessage());
    }

    private function markFailed(string $message): void
    {
        $this->touchLog(['status' => 'failed', 'error' => Str::limit($message, 500, '')]);
    }

    private function touchLog(array $attributes): void
    {
        if (!$this->logId || !($log = EmailLog::find($this->logId))) {
            return;
        }

        if (($attributes['attempts'] ?? null) === self::INCREMENT) {
            $attributes['attempts'] = min(255, $log->attempts + 1);
        }

        $log->forceFill($attributes)->save();
    }
}
