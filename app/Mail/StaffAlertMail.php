<?php

namespace App\Mail;

/** Operational alerts for Finance / Master staff (e.g. an online payment needing review). */
class StaffAlertMail extends BrandedMail
{
    public function __construct(
        public string $subjectLine,
        public array $intro,
        public array $facts = [],
        public ?array $cta = null,
        public string $tone = 'warning',
    ) {
        parent::__construct();
    }

    protected function compose(): array
    {
        return [
            'subject'   => $this->subjectLine,
            'preheader' => $this->intro[0] ?? $this->subjectLine,
            'tone'      => $this->tone,
            'title'     => $this->subjectLine,
            'greeting'  => null,
            'intro'     => $this->intro,
            'facts'     => $this->facts,
            'cta'       => $this->cta,
            'notice'    => null,
            'outro'     => [],
        ];
    }
}
