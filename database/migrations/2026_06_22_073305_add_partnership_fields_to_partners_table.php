<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('partners', function (Blueprint $table) {
            $table->foreignId('package_id')->nullable()->after('tier')->constrained('partnership_packages')->onDelete('set null');
            $table->date('renewal_date')->nullable()->after('partnership_date');
            $table->date('cancelled_at')->nullable()->after('renewal_date');
            $table->date('suspended_at')->nullable()->after('cancelled_at');
            $table->text('notes')->nullable()->after('suspended_at');
            $table->integer('points_earned')->default(0)->after('notes');
            $table->string('payment_method')->nullable()->after('points_earned');
        });
    }

    public function down(): void
    {
        Schema::table('partners', function (Blueprint $table) {
            $table->dropForeign(['package_id']);
            $table->dropColumn([
                'package_id', 'renewal_date', 'cancelled_at',
                'suspended_at', 'notes', 'points_earned', 'payment_method',
            ]);
        });
    }
};
