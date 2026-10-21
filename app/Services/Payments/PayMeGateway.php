<?php

namespace App\Services\Payments;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use RuntimeException;

/**
 * Thin client for the ClicknPay PayMe order API.
 *
 *   POST /payme/orders            create an order  -> paymeURL + correlator
 *   GET  /payme/orders/{correlator}  read an order -> status, totalPaid, clientReference
 *
 * Nothing here touches our database; OnlinePaymentService decides what a response means.
 */
class PayMeGateway
{
    public const SUCCESS = 'success';
    public const FAILED  = 'failed';
    public const PENDING = 'pending';

    /** Create an order. Never retried: a retry could create a second order for one payment. */
    public function createOrder(array $payload): array
    {
        try {
            $response = $this->http()->post('/payme/orders', $payload);
        } catch (ConnectionException $e) {
            Log::warning('PayMe create order: connection failed', ['error' => $e->getMessage()]);
            throw new RuntimeException('The payment service could not be reached.', 0, $e);
        }

        if (!$response->successful()) {
            Log::warning('PayMe create order rejected', ['status' => $response->status(), 'body' => substr($response->body(), 0, 300)]);
            throw new RuntimeException('The payment service rejected the request.');
        }

        $order = $response->json();

        if (!is_array($order) || empty($order['paymeURL']) || empty($order['correlator'])) {
            Log::warning('PayMe create order: unexpected response shape', ['keys' => is_array($order) ? array_keys($order) : gettype($order)]);
            throw new RuntimeException('The payment service returned an unexpected response.');
        }

        if (!$this->isAllowedPayUrl($order['paymeURL'])) {
            Log::alert('PayMe returned a payment URL on an unexpected host', ['host' => parse_url($order['paymeURL'], PHP_URL_HOST)]);
            throw new RuntimeException('The payment service returned an untrusted payment link.');
        }

        return $order;
    }

    /** Read an order by its gateway id (correlator). Safe to retry. */
    public function fetchOrder(string $correlator): array
    {
        try {
            $response = $this->http()->retry(2, 400, throw: false)->get('/payme/orders/' . rawurlencode($correlator));
        } catch (ConnectionException $e) {
            throw new RuntimeException('The payment service could not be reached.', 0, $e);
        }

        if (!$response->successful()) {
            throw new RuntimeException('The payment service could not report the order status (HTTP ' . $response->status() . ').');
        }

        $order = $response->json();

        // A 200 with an empty body is how the gateway answers an unknown id.
        if (!is_array($order) || empty($order['clientReference'])) {
            throw new RuntimeException('The payment service did not recognise the order.');
        }

        return $order;
    }

    /** Collapse the gateway's status vocabulary into success / failed / pending. */
    public static function interpret(?string $status): string
    {
        return match (strtoupper(trim((string) $status))) {
            'SUCCESS', 'SUCCESSFUL', 'PAID', 'COMPLETED' => self::SUCCESS,
            'FAILED', 'FAILURE', 'CANCELLED', 'CANCELED', 'DECLINED', 'EXPIRED', 'REJECTED' => self::FAILED,
            default => self::PENDING,   // INITIATED, PENDING, PROCESSING, unknown: wait, never guess success
        };
    }

    public function isAllowedPayUrl(string $url): bool
    {
        $parts = parse_url($url);
        if (($parts['scheme'] ?? '') !== 'https' || empty($parts['host'])) {
            return false;
        }

        foreach ((array) config('payme.allowed_pay_hosts') as $allowed) {
            if ($parts['host'] === $allowed || str_ends_with($parts['host'], '.' . $allowed)) {
                return true;
            }
        }

        return false;
    }

    private function http()
    {
        return Http::baseUrl(rtrim((string) config('payme.base_url'), '/'))
            ->timeout((int) config('payme.timeout'))
            ->connectTimeout((int) config('payme.connect_timeout'))
            ->acceptJson()
            ->asJson();
    }
}
