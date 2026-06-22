<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('partner_statements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('partner_id')->constrained()->onDelete('cascade');
            $table->string('statement_number')->unique();
            $table->date('period_start');
            $table->date('period_end');
            $table->decimal('opening_balance', 12, 2)->default(0);
            $table->decimal('total_contributions', 12, 2)->default(0);
            $table->decimal('total_redemptions', 12, 2)->default(0);
            $table->decimal('closing_balance', 12, 2)->default(0);
            $table->string('format'); // pdf, excel, csv
            $table->string('file_path')->nullable();
            $table->foreignId('generated_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['partner_id', 'period_start', 'period_end']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('partner_statements');
    }
};
