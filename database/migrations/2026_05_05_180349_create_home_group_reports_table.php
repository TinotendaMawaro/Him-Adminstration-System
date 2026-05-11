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
        Schema::create('home_group_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('home_group_id')->constrained()->onDelete('cascade');
            $table->foreignId('leader_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->string('title');
            $table->text('content');
            $table->date('report_date');
            $table->integer('attendance_count')->default(0);
            $table->text('challenges')->nullable();
            $table->text('prayer_requests')->nullable();
            $table->text('testimonies')->nullable();
            $table->enum('status', ['draft', 'submitted', 'approved', 'rejected'])->default('draft');
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->text('review_notes')->nullable();
            $table->timestamps();

            $table->index(['home_group_id', 'report_date']);
            $table->index(['leader_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('home_group_reports');
    }
};
