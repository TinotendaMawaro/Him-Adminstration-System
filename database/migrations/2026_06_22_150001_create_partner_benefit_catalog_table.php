<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('partner_benefit_catalog', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->string('label');
            $table->text('description')->nullable();
            $table->string('icon')->nullable();
            $table->integer('min_package_order')->default(1); // 1=Bronze, 2=Silver, etc.
            $table->integer('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['min_package_order', 'sort_order']);
        });

        Schema::table('partner_benefits', function (Blueprint $table) {
            $table->foreignId('catalog_id')->nullable()->after('id')->constrained('partner_benefit_catalog')->onDelete('set null');
            $table->dropSoftDeletes();
        });
    }

    public function down(): void
    {
        Schema::table('partner_benefits', function (Blueprint $table) {
            $table->dropForeign(['partner_benefits_catalog_id_foreign']);
            $table->dropColumn(['catalog_id']);
            $table->softDeletes();
        });

        Schema::dropIfExists('partner_benefit_catalog');
    }
};
