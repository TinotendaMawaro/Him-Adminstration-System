<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('partners', function (Blueprint $table) {
            $table->enum('contribution_type', ['monthly', 'quarterly', 'annually', 'one_time'])->nullable()->after('payment_method');
            $table->text('renewal_terms')->nullable()->after('contribution_type');
            $table->string('payment_reference')->nullable()->after('renewal_terms');
            $table->text('payment_notes')->nullable()->after('payment_reference');
        });
    }

    public function down(): void
    {
        Schema::table('partners', function (Blueprint $table) {
            $table->dropColumn(['contribution_type', 'renewal_terms', 'payment_reference', 'payment_notes']);
        });
    }
};
