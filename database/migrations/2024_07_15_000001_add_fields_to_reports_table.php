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
        Schema::table('reports', function (Blueprint $table) {
            // Service type: sunday_service, midweek_service, remote_service
            $table->enum('service_type', ['sunday_service', 'midweek_service', 'remote_service'])->nullable()->after('type');
            
            // Financial breakdown
            $table->decimal('cash_collection', 12, 2)->default(0)->after('balance');
            $table->decimal('bank_deposit', 12, 2)->default(0)->after('cash_collection');
            $table->decimal('online_transfer', 12, 2)->default(0)->after('bank_deposit');
            $table->decimal('other_income', 12, 2)->default(0)->after('online_transfer');
            
            // Tithes and offerings breakdown
            $table->decimal('tithes', 12, 2)->default(0)->after('other_income');
            $table->decimal('offerings', 12, 2)->default(0)->after('tithes');
            $table->decimal('building_fund', 12, 2)->default(0)->after('offerings');
            $table->decimal('missions', 12, 2)->default(0)->after('building_fund');
            $table->decimal('other_designations', 12, 2)->default(0)->after('missions');
            
            // Attendance breakdown
            $table->integer('adults')->default(0)->after('attendance');
            $table->integer('children')->default(0)->after('adults');
            $table->integer('men')->default(0)->after('children');
            $table->integer('women')->default(0)->after('men');
            $table->integer('boys')->default(0)->after('women');
            $table->integer('girls')->default(0)->after('boys');
            $table->integer('toddlers')->default(0)->after('girls');
            
            // Equipment pledged (JSON)
            $table->json('equipment_pledged')->nullable()->after('toddlers');
            
            // Remittance details
            $table->boolean('remittance_submitted')->default(false)->after('equipment_pledged');
            $table->date('remittance_date')->nullable()->after('remittance_submitted');
            $table->decimal('remittance_amount', 12, 2)->default(0)->after('remittance_date');
            
            // File attachments (receipts, etc.)
            $table->json('attachments')->nullable()->after('remittance_amount');
            
            // Submission tracking
            $table->timestamp('submitted_at')->nullable()->after('attachments');
            $table->boolean('is_late')->default(false)->after('submitted_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reports', function (Blueprint $table) {
            $table->dropColumn([
                'service_type',
                'cash_collection',
                'bank_deposit',
                'online_transfer',
                'other_income',
                'tithes',
                'offerings',
                'building_fund',
                'missions',
                'other_designations',
                'adults',
                'children',
                'men',
                'women',
                'boys',
                'girls',
                'toddlers',
                'equipment_pledged',
                'remittance_submitted',
                'remittance_date',
                'remittance_amount',
                'attachments',
                'submitted_at',
                'is_late',
            ]);
        });
    }
};

