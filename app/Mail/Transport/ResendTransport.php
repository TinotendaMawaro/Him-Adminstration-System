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

        $inline = 0;
        foreach ($email->getAttachments() as $attachment) {
            $mime = strtolower($attachment->getMediaType() . '/' . $attachment->getMediaSubtype());
            $item = [
                'filename'     => $attachment->getFilename() ?: 'attachment',
                'content'      => base64_encode($attachment->getBody()),
                'content_type' => $mime,
            ];

            // Embedded image (e.g. the logo): Symfony references it as cid:<random>@symfony. Give Resend a simple,
            // safe content_id and point the HTML at it, so the picture shows inline in every mail client.
            // The HTML refers to the part either by an explicit Content-ID or (as Laravel's $message->embed() does) by its
            // file name, so match whichever one the HTML actually uses.
            if ($attachment->getDisposition() === 'inline' && isset($payload['html'])) {
                $candidates = array_filter([$attachment->hasContentId() ? $attachment->getContentId() : null, $attachment->getFilename()]);
                foreach ($candidates as $reference) {
                    if (str_contains($payload['html'], 'cid:' . $reference)) {
                        $cid                = 'img' . (++$inline);
                        $item['content_id'] = $cid;
                        // Laravel names an embedded image with a random string. Without an extension the mail client cannot tell it is a
                        // picture, shows it as an attached file (a thumbnail under the email) and leaves the header empty.
                        $item['filename']   = "{$cid}." . (['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/gif' => 'gif', 'image/webp' => 'webp'][$mime] ?? 'img');
                        $payload['html']    = str_replace('cid:' . $reference, 'cid:' . $cid, $payload['html']);
                        break;
                    }
                }
            }

            $payload['attachments'][] = $item;
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
