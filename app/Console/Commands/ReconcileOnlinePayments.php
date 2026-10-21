<?php

namespace App\Console\Commands;

use App\Enums\PaymentStatus;
use App\Models\Payment;
use App\Services\Payments\OnlinePaymentService;
use Illuminate\Console\Command;

/**
 * Settles online payments whose customer never returned to the site, and closes abandoned ones.
 * Runs every few minutes from the scheduler (see routes/console.php).
 */
class ReconcileOnlinePayments extends Command
{
    protected $signature = 'payments:reconcile-online {--limit=200 : Maximum orders to check per run}';

    protected $description = 'Check pending online payments with the gateway and credit those that succeeded';

    public function handle(OnlinePaymentService $online): int
    {
        $payments = Payment::online()
            ->whereNotNull('gateway_order_id')
            ->where('status', PaymentStatus::Pending->value)
            ->where('created_at', '<=', now()->subMinute())           // give the customer a moment first
            ->where(fn ($q) => $q->whereNull('gateway_status')->orWhere('gateway_status', '!=', 'SUCCESS_MISMATCH'))
            ->orderByRaw('gateway_checked_at IS NOT NULL, gateway_checked_at')   // never-checked first, then least recent
            ->limit((int) $this->option('limit'))
            ->get();

        $completed = 0;
        foreach ($payments as $payment) {
            if ($online->verify($payment, force: true)->status === PaymentStatus::Completed) {
                $completed++;
            }
        }

        $abandoned = $online->abandonStale();

        $this->info("Checked {$payments->count()}, completed {$completed}, abandoned {$abandoned}.");

        return self::SUCCESS;
    }
}
