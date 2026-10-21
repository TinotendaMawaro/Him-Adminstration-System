<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EmailLog;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Resend delivery webhooks (https://resend.com/docs/dashboard/webhooks): delivered, bounced, complained…
 *
 * Verifies the Svix signature, updates the email log, and stops emailing addresses that hard-bounce or
 * mark us as spam (a bad sender reputation would hurt every other email, including receipts).
 *
 * Register https://YOUR-DOMAIN/api/webhooks/resend in Resend and put its signing secret in RESEND_WEBHOOK_SECRET.
 */
class ResendWebhookController extends Controller
{
    private const TOLERANCE_SECONDS = 300;

    public function __invoke(Request $request)
    {
        $secret = config('mailing.webhook_secret');
        abort_if(blank($secret), 503, 'Webhook secret not configured.');

        $body = $request->getContent();
        abort_unless($this->validSignature($request, $body, $secret), 401, 'Invalid signature.');

        $event = json_decode($body, true) ?: [];
        $type  = $event['type'] ?? '';
        $data  = $event['data'] ?? [];
        $id    = $data['email_id'] ?? null;

        $log = $id ? EmailLog::where('provider_id', $id)->first() : null;

        $status = match ($type) {
            'email.delivered'        => 'delivered',
            'email.delivery_delayed' => 'delayed',
            'email.bounced'          => 'bounced',
            'email.complained'       => 'complained',
            'email.failed'           => 'failed',
            default                  => null,
        };

        if ($log && $status) {
            $log->forceFill(array_filter([
                'status'       => $status,
                'delivered_at' => $status === 'delivered' ? now() : null,
                'error'        => in_array($status, ['bounced', 'failed'], true) ? substr((string) ($data['bounce']['message'] ?? $data['reason'] ?? $type), 0, 500) : null,
            ], fn ($v) => $v !== null))->save();
        }

        // Permanent bounces and spam complaints: never email this address again until an admin clears it.
        $permanentBounce = $type === 'email.bounced' && strtolower((string) ($data['bounce']['type'] ?? 'permanent')) === 'permanent';
        if (($permanentBounce || $type === 'email.complained')) {
            $address = $log?->to_email ?? ($data['to'][0] ?? null);
            $user = $log?->user ?? ($address ? User::where('email', $address)->first() : null);

            if ($user && !$user->email_suppressed_at) {
                $user->forceFill(['email_suppressed_at' => now(), 'email_suppression_reason' => $type === 'email.complained' ? 'complaint' : 'hard_bounce'])->save();
                Log::notice('Email address suppressed', ['user' => $user->id, 'reason' => $type]);
            }
        }

        return response()->json(['received' => true]);
    }

    /** Svix: HMAC-SHA256 over "{id}.{timestamp}.{body}" with the base64 secret; header may hold several "v1,<sig>" values. */
    private function validSignature(Request $request, string $body, string $secret): bool
    {
        $id        = $request->header('svix-id');
        $timestamp = $request->header('svix-timestamp');
        $header    = $request->header('svix-signature');

        if (!$id || !$timestamp || !$header || !ctype_digit((string) $timestamp)) {
            return false;
        }

        if (abs(time() - (int) $timestamp) > self::TOLERANCE_SECONDS) {
            return false;   // replayed or badly skewed
        }

        $key      = base64_decode(str_starts_with($secret, 'whsec_') ? substr($secret, 6) : $secret, true);
        $expected = base64_encode(hash_hmac('sha256', "{$id}.{$timestamp}.{$body}", (string) $key, true));

        foreach (explode(' ', $header) as $candidate) {
            [$version, $signature] = array_pad(explode(',', $candidate, 2), 2, '');
            if ($version === 'v1' && hash_equals($expected, $signature)) {
                return true;
            }
        }

        return false;
    }
}
