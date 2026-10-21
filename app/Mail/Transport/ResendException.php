<?php

namespace App\Mail\Transport;

use Symfony\Component\Mailer\Exception\TransportException;

class ResendException extends TransportException
{
    public function __construct(string $message, public readonly int $status = 0, public readonly ?string $providerName = null)
    {
        parent::__construct($message, $status);
    }

    /** 4xx (except rate limiting) will never succeed on retry: bad address, unverified domain, invalid payload. */
    public function isPermanent(): bool
    {
        return $this->status >= 400 && $this->status < 500 && $this->status !== 429 && $this->status !== 408;
    }
}
