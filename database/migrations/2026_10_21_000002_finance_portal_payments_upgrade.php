<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // The original ENUM columns could not hold the seed / building fund / missions
        // contribution types or the mobile-money methods the app already defines.
        DB::statement("ALTER TABLE payments MODIFY `type` VARCHAR(40) NOT NULL");
        DB::statement("ALTER TABLE payments MODIFY `method` VARCHAR(40) NULL");
        DB::statement("ALTER TABLE payments MODIFY `status` VARCHAR(20) NOT NULL DEFAULT 'pending'");

        Schema::table('payments', function (Blueprint $table) {
            $table->foreignId('zone_id')->nullable()->after('user_id')->constrained()->nullOnDelete();
            $table->string('receipt_number', 30)->nullable()->unique()->after('reference');
            $table->timestamp('confirmed_at')->nullable();
            $table->foreignId('confirmed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('voided_at')->nullable();
            $table->foreignId('voided_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('void_reason', 500)->nullable();

            $table->index(['type', 'status', 'paid_at'], 'payments_type_status_paid_idx');
            $table->index(['zone_id', 'paid_at'], 'payments_zone_paid_idx');
        });

        // Sequential, gap-free receipt numbers per year (incremented under a row lock).
        Schema::create('receipt_counters', function (Blueprint $table) {
            $table->unsignedSmallInteger('year')->primary();
            $table->unsignedInteger('last_number')->default(0);
        });

        // Backfill zone for any existing payments from the payer's zone.
        DB::statement('UPDATE payments p JOIN users u ON u.id = p.user_id SET p.zone_id = u.zone_id WHERE p.zone_id IS NULL');
    }

    public function down(): void
    {
        Schema::dropIfExists('receipt_counters');

        Schema::table('payments', function (Blueprint $table) {
            $table->dropIndex('payments_type_status_paid_idx');
            $table->dropIndex('payments_zone_paid_idx');
            $table->dropConstrainedForeignId('voided_by');
            $table->dropConstrainedForeignId('confirmed_by');
            $table->dropConstrainedForeignId('zone_id');
            $table->dropColumn(['receipt_number', 'confirmed_at', 'voided_at', 'void_reason']);
        });
    }
};
