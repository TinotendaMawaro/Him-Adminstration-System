<?php

namespace App\Mail\Transport;

use Illuminate\Support\Facades\Http;
use Symfony\Component\Mailer\Exception\TransportException;
use Symfony\Component\Mailer\SentMessage;
use Symfony\Component\Mailer\Transport\AbstractTransport;
use Symfony\Component\Mime\Address;
use Symfony\Component\Mime\MessageConverter;

/**
 * Laravel mail transport for Resend (https://resend.com/docs/api-reference/emails/send-email).
 * Uses Resend's HTTP API directly, so no extra Composer package is needed.
 *
 *  - The Idempotency-Key header (taken from X-HIM-Idempotency) makes queue retries safe: a retried
 *    send can never produce a duplicate email.
 *  - The Resend email id is returned as the SentMessage id so it can be stored and matched to webhooks.
 */
class ResendTransport extends AbstractTransport
{
    /** Message headers that are passed through to Resend as real email headers. */
    private const PASSTHROUGH_HEADERS = ['List-Unsubscribe', 'List-Unsubscribe-Post', 'X-Entity-Ref-ID', 'Precedence', 'Auto-Submitted'];

    public function __construct(
        private readonly ?string $apiKey,
        private readonly string $baseUrl = 'https://api.resend.com',
    ) {
        parent::__construct();
    }

    protected function doSend(SentMessage $message): void
    {
        if (blank($this->apiKey)) {
            throw new TransportException('Resend is not configured: set RESEND_API_KEY.');
        }

        $email   = MessageConverter::toEmail($message->getOriginalMessage());
        $headers = $email->getHeaders();

        $payload = array_filter([
            'from'     => $this->address($email->getFrom()[0] ?? null),
            'to'       => array_map([$this, 'address'], $email->getTo()),
            'cc'       => array_map([$this, 'address'], $email->getCc()) ?: null,
            'bcc'      => array_map([$this, 'address'], $email->getBcc()) ?: null,
            'reply_to' => array_map([$this, 'address'], $email->getReplyTo()) ?: null,
            'subject'  => $email->getSubject(),
            'html'     => $email->getHtmlBody(),
            'text'     => $email->getTextBody(),
        ], fn ($v) => $v !== null && $v !== '' && $v !== []);

        $extra = [];
        foreach (self::PASSTHROUGH_HEADERS as $name) {
            if ($headers->has($name)) {
                $extra[$name] = $headers->get($name)->getBodyAsString();
            }
        }
        if ($extra) {
            $payload['headers'] = $extra;
        }

        if ($headers->has('X-HIM-Template')) {
            $payload['tags'] = [['name' => 'template', 'value' => preg_replace('/[^A-Za-z0-9_-]/', '_', $headers->get('X-HIM-Template')->getBodyAsString())]];
        }

        foreach ($email->getAttachments() as $attachment) {
            $payload['attachments'][] = [
                'filename' => $attachment->getFilename() ?: 'attachment',
                'content'  => base64_encode($attachment->getBody()),
            ];
        }

        $request = Http::withToken($this->apiKey)->acceptJson()->asJson()->timeout(20)->connectTimeout(8);
        if ($headers->has('X-HIM-Idempotency')) {
            $request = $request->withHeaders(['Idempotency-Key' => $headers->get('X-HIM-Idempotency')->getBodyAsString()]);
        }

        try {
            $response = $request->post(rtrim($this->baseUrl, '/') . '/emails', $payload);
        } catch (\Throwable $e) {
            throw new TransportException('Could not reach Resend: ' . $e->getMessage(), 0, $e);
        }

        if (!$response->successful()) {
            $body = $response->json();
            throw new ResendException(
                'Resend rejected the email (' . $response->status() . '): ' . ($body['message'] ?? substr($response->body(), 0, 200)),
                $response->status(),
                $body['name'] ?? null,
            );
        }

        if ($id = $response->json('id')) {
            $message->setMessageId($id);
        }
    }

    private function address(?Address $address): string
    {
        return $address ? $address->toString() : '';
    }

    public function __toString(): string
    {
        return 'resend';
    }
}
