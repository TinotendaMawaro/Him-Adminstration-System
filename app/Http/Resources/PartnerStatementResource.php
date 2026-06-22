<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PartnerStatementResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                  => $this->id,
            'statement_number'    => $this->statement_number,
            'period_start'        => $this->period_start?->format('Y-m-d'),
            'period_end'          => $this->period_end?->format('Y-m-d'),
            'opening_balance'     => (float) $this->opening_balance,
            'total_contributions' => (float) $this->total_contributions,
            'total_redemptions'   => (float) $this->total_redemptions,
            'closing_balance'     => (float) $this->closing_balance,
            'format'              => $this->format,
            'file_path'           => $this->file_path,
            'created_at'          => $this->created_at?->toIso8601String(),
        ];
    }
}
