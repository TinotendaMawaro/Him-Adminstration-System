<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            // Our own unguessable order reference, sent to the gateway as clientReference.
            $table->string('client_reference', 40)->nullable()->unique()->after('reference');
            $table->string('gateway', 20)->nullable();
            $table->string('gateway_order_id', 60)->nullable()->index();   // ClicknPay "correlator"
            $table->string('gateway_url', 300)->nullable();                 // paymeURL the customer is sent to
            $table->string('gateway_status', 30)->nullable();               // last status the gateway reported
            $table->json('gateway_payload')->nullable();                    // last order snapshot (audit)
            $table->timestamp('gateway_checked_at')->nullable();

            $table->index(['gateway', 'status', 'gateway_checked_at'], 'payments_gateway_reconcile_idx');
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropIndex('payments_gateway_reconcile_idx');
            $table->dropColumn(['client_reference', 'gateway', 'gateway_order_id', 'gateway_url', 'gateway_status', 'gateway_payload', 'gateway_checked_at']);
        });
    }
};
