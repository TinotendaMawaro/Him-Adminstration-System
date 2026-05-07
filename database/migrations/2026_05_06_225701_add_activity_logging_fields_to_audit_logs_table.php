<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('audit_logs', function (Blueprint $table) {
            $table->string('subject_type')->nullable()->after('details');
            $table->unsignedBigInteger('subject_id')->nullable()->after('subject_type');
            $table->string('target_type')->nullable()->after('subject_id');
            $table->unsignedBigInteger('target_id')->nullable()->after('target_type');
            $table->timestamp('occurred_at')->useCurrent()->after('target_id');

            $table->index(['subject_type', 'subject_id'], 'audit_logs_subject_index');
            $table->index(['target_type', 'target_id'], 'audit_logs_target_index');
            $table->index(['occurred_at'], 'audit_logs_occurred_at_index');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('audit_logs', function (Blueprint $table) {
            $table->dropIndex('audit_logs_subject_index');
            $table->dropIndex('audit_logs_target_index');
            $table->dropIndex('audit_logs_occurred_at_index');
            $table->dropColumn(['subject_type', 'subject_id', 'target_type', 'target_id', 'occurred_at']);
        });
    }
};
