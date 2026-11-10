<?php

namespace App\Services\Payments;

use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Enums\PaymentType;
use App\Mail\StaffAlertMail;
use App\Models\EventRegistration;
use App\Models\Notification;
use App\Models\Payment;
use App\Models\User;
use App\Services\AuditTrail;
use App\Support\Mailing;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use RuntimeException;

/**
 * Online giving through ClicknPay PayMe.
 *
 * Rules that keep the money honest:
 *  - The browser only says WHAT it is giving (type) and HOW MUCH. Which ClicknPay account is
 *    used, and whether the type may be paid online at all, is decided here.
 *  - A payment becomes `completed` (and gets its receipt) ONLY when the gateway itself reports
 *    SUCCESS for the order we created — never because a customer came back to a URL.
 *  - Completion is idempotent and runs under a row lock, so the return page, the status API and
 *    the background reconciler can race without ever crediting twice.
 */
class OnlinePaymentService
{
    public function __construct(private readonly PayMeGateway $gateway) {}

    // ─── What may be paid online ──────────────────────────────────────────────

    /** @return array<string, array{label: string, account: string}> contribution types this user may pay online */
    public function optionsFor(User $user): array
    {
        $options = [];
        foreach ((array) config('payme.accounts') as $account => $def) {
            if (blank($def['public_id'] ?? null)) {
                continue; // account not configured: do not offer it
            }
            foreach ($def['types'] as $type) {
                if ($type === PaymentType::Partnership->value && !$this->isPartner($user)) {
                    continue;
                }
                if ($type === PaymentType::EventRegistration->value && $this->payableRegistrations($user)->isEmpty()) {
                    continue;   // nothing owing for any event
                }
                $options[$type] = ['label' => PaymentType::from($type)->getLabel(), 'account' => $account];
            }
        }

        return $options;
    }

    /**
     * Registrations this person still owes money on: not cancelled, a real balance, for an event that has not finished.
     * @return Collection<int, EventRegistration>
     */
    public function payableRegistrations(User $user): Collection
    {
        return EventRegistration::with('event')
            ->where('user_id', $user->id)
            ->whereIn('status', ['pending', 'confirmed'])
            ->whereColumn('amount_paid', '<', 'amount_due')
            ->whereHas('event', fn ($q) => $q->where('status', 'published')
                ->where(fn ($w) => $w->where('ends_at', '>', now())->orWhere(fn ($x) => $x->whereNull('ends_at')->where('starts_at', '>', now()->subHours(12)))))
            ->get()
            ->values();
    }

    public static function balanceOf(EventRegistration $registration): float
    {
        return round(max(0, (float) $registration->amount_due - (float) $registration->amount_paid), 2);
    }

    private function isPartner(User $user): bool
    {
        return $user->isPartner() || $user->partner()->exists();
    }

    // ─── Start ────────────────────────────────────────────────────────────────

    /**
     * Create the pending payment, open the order at the gateway and return the payment
     * (with gateway_url set). On gateway failure the payment is closed as failed.
     *
     * For event registrations the amount is NEVER taken from the browser: it is the registration's outstanding balance.
     */
    public function start(User $user, string $type, ?float $amount, ?string $note, callable $returnUrlFor, ?int $registrationId = null): Payment
    {
        $options = $this->optionsFor($user);
        if (!isset($options[$type])) {
            throw ValidationException::withMessages(['type' => 'This contribution cannot be paid online.']);
        }

        $registration = null;
        $productName  = $options[$type]['label'];

        if ($type === PaymentType::EventRegistration->value) {
            $registration = $this->payableRegistrations($user)->firstWhere('id', $registrationId);
            if (!$registration) {
                throw ValidationException::withMessages(['registration_id' => 'That registration has nothing left to pay, or is not yours.']);
            }

            // Already started and still waiting? Hand back the same payment link instead of opening a second order.
            $open = Payment::online()->where('event_registration_id', $registration->id)->where('status', PaymentStatus::Pending->value)
                ->whereNotNull('gateway_url')->where('created_at', '>=', now()->subDay())->latest('id')->first();
            if ($open && (float) $open->amount === self::balanceOf($registration)) {
                return $open;
            }

            $amount      = self::balanceOf($registration);
            $productName = Str::limit('Registration: ' . $registration->event->title, 80, '');
        } else {
            $amount = round((float) $amount, 2);
            $min = (float) config('payme.min_amount');
            $max = (float) config('payme.max_amount');
            if ($amount < $min || $amount > $max) {
                throw ValidationException::withMessages(['amount' => sprintf('Enter an amount between %s and %s.', number_format($min, 2), number_format($max, 2))]);
            }
        }

        $recent = Payment::online()->where('user_id', $user->id)->where('status', PaymentStatus::Pending->value)
            ->where('created_at', '>=', now()->subHour())->count();
        if ($recent >= (int) config('payme.max_open_per_hour')) {
            throw ValidationException::withMessages(['amount' => 'Too many unfinished payments. Please complete or wait before starting another.']);
        }

        $publicId = config("payme.accounts.{$options[$type]['account']}.public_id");

        $payment = Payment::create([
            'user_id'               => $user->id,
            'event_registration_id' => $registration?->id,
            'type'                  => $type,
            'amount'                => $amount,
            'currency'              => config('payme.currency'),
            'status'                => PaymentStatus::Pending,
            'method'                => PaymentMethod::Online,
            'notes'                 => $note ? Str::limit(strip_tags($note), 500, '') : null,
            'gateway'               => 'payme',
            'client_reference'      => $this->newReference(),
        ]);

        try {
            $order = $this->gateway->createOrder($this->orderPayload($payment, $user, $publicId, $productName, $returnUrlFor($payment->client_reference)));
        } catch (RuntimeException $e) {
            $payment->forceFill(['status' => PaymentStatus::Failed, 'gateway_status' => 'CREATE_FAILED'])->save();
            throw $e;
        }

        $payment->forceFill([
            'gateway_order_id' => (string) $order['correlator'],
            'gateway_url'      => $order['paymeURL'],
            'gateway_status'   => (string) ($order['status'] ?? 'INITIATED'),
            'gateway_payload'  => $this->snapshot($order),
        ])->save();

        AuditTrail::record('payment.online_started', $user, $payment, [
            'type' => $type, 'amount' => (string) $amount, 'ref' => $payment->client_reference, 'registration' => $registration?->id,
        ]);

        return $payment;
    }

    private function orderPayload(Payment $payment, User $user, string $publicId, string $productName, string $returnUrl): array
    {
        return array_filter([
            'channel'             => 'AUTOMATED',
            'clientReference'     => $payment->client_reference,
            'currency'            => $payment->currency,
            'customerCharged'     => (bool) config('payme.customer_charged'),
            'customerPhoneNumber' => $user->phone ?: null,
            'customerEmail'       => $user->email,
            'description'         => "{$productName} - {$user->name}",
            'multiplePayments'    => false,
            // "orderYpe" is spelled exactly as the ClicknPay API documents it.
            'orderYpe'            => 'DYNAMIC',
            'productsList'        => [[
                'description' => $productName,
                'id'          => 0,
                'price'       => (float) $payment->amount,
                'productName' => $productName,
                'quantity'    => 1,
            ]],
            'publicUniqueId'      => $publicId,
            'returnUrl'           => $returnUrl,
        ], fn ($v) => $v !== null);
    }

    private function newReference(): string
    {
        do {
            $ref = 'HIM' . strtoupper(Str::random(16));
        } while (Payment::where('client_reference', $ref)->exists());

        return $ref;
    }

    // ─── Verify ───────────────────────────────────────────────────────────────

    /**
     * Ask the gateway for the truth about this payment and apply it. Safe to call repeatedly.
     * Never throws for gateway trouble: the payment simply stays as it was and is retried later.
     */
    public function verify(Payment $payment, bool $force = false): Payment
    {
        if (!$payment->isOnline() || blank($payment->gateway_order_id) || !$this->isOpen($payment)) {
            return $payment;
        }

        // Debounce: a customer hammering refresh must not hammer the gateway.
        if (!$force && $payment->gateway_checked_at && $payment->gateway_checked_at->gt(now()->subSeconds(4))) {
            return $payment;
        }

        try {
            $order = $this->gateway->fetchOrder($payment->gateway_order_id);
        } catch (RuntimeException $e) {
            Log::notice('PayMe status check failed', ['payment' => $payment->id, 'error' => $e->getMessage()]);
            $payment->forceFill(['gateway_checked_at' => now()])->save();

            return $payment;
        }

        // The order must be the one we created, for the account we expect.
        if (($order['clientReference'] ?? null) !== $payment->client_reference
            || ($order['publicUniqueId'] ?? null) !== $this->expectedPublicId($payment)) {
            Log::alert('PayMe order does not match our payment', ['payment' => $payment->id]);
            AuditTrail::record('payment.online_mismatch', null, $payment, ['reason' => 'reference/account mismatch'], $payment->user_id);
            $this->flagForReview($payment, 'The gateway returned an order that does not match ours (reference or account).');

            return $payment;
        }

        $state = PayMeGateway::interpret($order['status'] ?? null);

        // Once held for review, a payment stays flagged (and Finance is not alerted again) until a person resolves it.
        $held   = $payment->gateway_status === 'SUCCESS_MISMATCH' && $state === PayMeGateway::SUCCESS;
        $status = $held ? 'SUCCESS_MISMATCH' : (string) ($order['status'] ?? $payment->gateway_status);

        $payment->forceFill([
            'gateway_status'     => $status,
            'gateway_payload'    => $this->snapshot($order),
            'gateway_checked_at' => now(),
        ])->save();

        return match ($state) {
            PayMeGateway::SUCCESS => $this->complete($payment, $order),
            PayMeGateway::FAILED  => $this->fail($payment),
            default               => $payment,
        };
    }

    /** Hold a payment for a person to look at, and tell Finance once. */
    private function flagForReview(Payment $payment, string $why): void
    {
        $already = $payment->gateway_status === 'SUCCESS_MISMATCH';

        $payment->forceFill(['gateway_status' => 'SUCCESS_MISMATCH', 'gateway_checked_at' => now()])->save();

        if ($already) {
            return;
        }

        Mailing::toRoles(['finance', 'master'], fn () => new StaffAlertMail(
            'An online payment needs your review',
            ['PayMe reported a payment, but it could not be matched safely, so it was NOT credited. ' . $why],
            [
                'Payer'     => $payment->user?->name,
                'Type'      => $payment->type?->getLabel(),
                'Expected'  => $payment->currency . ' ' . number_format((float) $payment->amount, 2),
                'Reference' => $payment->client_reference,
                'PayMe id'  => $payment->gateway_order_id,
            ],
            ['label' => 'Review in the Finance portal', 'url' => \App\Mail\BrandedMail::portalUrl('/finance/payments/' . $payment->id)],
        ));
    }

    /** Pending, or failed only because we gave up waiting (a late payment can still be recovered). */
    private function isOpen(Payment $payment): bool
    {
        return $payment->status === PaymentStatus::Pending
            || ($payment->status === PaymentStatus::Failed && $payment->gateway_status === 'ABANDONED');
    }

    private function expectedPublicId(Payment $payment): ?string
    {
        foreach ((array) config('payme.accounts') as $def) {
            if (in_array($payment->type?->value, $def['types'], true)) {
                return $def['public_id'];
            }
        }

        return null;
    }

    private function complete(Payment $payment, array $order): Payment
    {
        // The gateway must agree on currency and must not report less money than we expected.
        $paid     = isset($order['totalPaid']) && is_numeric($order['totalPaid']) ? (float) $order['totalPaid'] : null;
        $currency = $order['currency'] ?? $payment->currency;

        if ($currency !== $payment->currency || ($paid !== null && $paid + 0.001 < (float) $payment->amount)) {
            Log::alert('PayMe success does not match expected amount', ['payment' => $payment->id, 'paid' => $paid, 'expected' => (string) $payment->amount]);
            AuditTrail::record('payment.online_mismatch', null, $payment, ['expected' => (string) $payment->amount, 'paid' => $paid, 'currency' => $currency], $payment->user_id);
            $this->flagForReview($payment, sprintf('Expected %s %s but the gateway reported %s %s.', $payment->currency, number_format((float) $payment->amount, 2), $currency, $paid === null ? 'an unknown amount' : number_format($paid, 2)));

            return $payment;
        }

        $result = DB::transaction(function () use ($payment, $order, $paid) {
            $locked = Payment::whereKey($payment->getKey())->lockForUpdate()->first();

            if ($locked->status === PaymentStatus::Completed) {
                return $locked; // another request already credited it
            }

            $locked->forceFill([
                'status'         => PaymentStatus::Completed,
                'paid_at'        => now(),
                'confirmed_at'   => now(),
                'transaction_id' => (string) ($order['correlator'] ?? $locked->gateway_order_id),
            ])->save();   // the saving hook issues the receipt number

            // An event fee: bring the registration's paid amount up to date (confirms it once fully paid).
            $locked->syncEventRegistration();

            AuditTrail::record('payment.online_confirmed', null, $locked, [
                'receipt' => $locked->receipt_number, 'amount' => (string) $locked->amount, 'gateway_paid' => $paid, 'ref' => $locked->client_reference,
            ], $locked->user_id);

            Notification::create([
                'user_id'  => $locked->user_id,
                'title'    => $locked->event_registration_id ? 'Registration payment received' : 'Thank you for your gift',
                'message'  => $locked->event_registration_id
                    ? sprintf('Your event payment of %s %s was received. Receipt %s.', $locked->currency, number_format((float) $locked->amount, 2), $locked->receipt_number)
                    : sprintf('Your %s of %s %s was received. Receipt %s.', strtolower($locked->type->getLabel()), $locked->currency, number_format((float) $locked->amount, 2), $locked->receipt_number),
                'type'     => 'success',
                'category' => 'finance',
                'is_read'  => false,
            ]);

            // A partnership payment renews the partnership (inside the lock, so it can only ever happen once per payment).
            app(\App\Services\PartnershipService::class)->recordPayment($locked);

            return $locked;
        });

        // Keep the caller's instance in step with what was just committed.
        $payment->refresh();

        return $result;
    }

    private function fail(Payment $payment): Payment
    {
        if ($payment->status === PaymentStatus::Pending) {
            $payment->forceFill(['status' => PaymentStatus::Failed])->save();
            AuditTrail::record('payment.online_failed', null, $payment, ['gateway_status' => $payment->gateway_status], $payment->user_id);
        }

        return $payment;
    }

    /** Close attempts nobody finished, so they stop cluttering queues. A late success is still recoverable. */
    public function abandonStale(): int
    {
        return Payment::online()->where('status', PaymentStatus::Pending->value)
            ->where('created_at', '<', now()->subDays((int) config('payme.abandon_after_days')))
            ->where(fn ($q) => $q->whereNull('gateway_status')->orWhereNotIn('gateway_status', ['SUCCESS_MISMATCH']))
            ->get()->each(function (Payment $p) {
                $p->forceFill(['status' => PaymentStatus::Failed, 'gateway_status' => 'ABANDONED'])->save();
            })->count();
    }

    /** Only the fields we want to keep from the gateway's order. */
    private function snapshot(array $order): array
    {
        return array_intersect_key($order, array_flip([
            'id', 'correlator', 'clientReference', 'status', 'orderDate', 'currency', 'totalPaid', 'paymentChannel', 'paymentGatewayReference',
        ]));
    }
}
