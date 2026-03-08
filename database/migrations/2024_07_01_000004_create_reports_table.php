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
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('zone_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('type'); // weekly_finance, weekly_stats
            $table->date('report_date');
            $table->integer('week_number');
            $table->integer('year');
            $table->decimal('total_income', 12, 2)->default(0);
            $table->decimal('total_expenses', 12, 2)->default(0);
            $table->decimal('balance', 12, 2)->default(0);
            $table->integer('new_members')->default(0);
            $table->integer('attendance')->default(0);
            $table->integer('first_timers')->default(0);
            $table->integer('conversions')->default(0);
            $table->text('notes')->nullable();
            $table->string('status')->default('draft'); // draft, submitted, approved
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};
