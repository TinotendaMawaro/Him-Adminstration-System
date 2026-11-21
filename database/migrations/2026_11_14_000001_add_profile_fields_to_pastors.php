<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/** A pastor's own details: next of kin, qualifications and the position they hold. One column per statement (TiDB). */
return new class extends Migration
{
    private array $columns = [
        'next_of_kin_name'         => ['string', 120],
        'next_of_kin_phone'        => ['string', 40],
        'next_of_kin_relationship' => ['string', 60],
        'qualifications'           => ['text', null],
        'position'                 => ['string', 160],
    ];

    public function up(): void
    {
        foreach ($this->columns as $name => [$type, $length]) {
            if (!Schema::hasColumn('pastors', $name)) {
                Schema::table('pastors', function (Blueprint $t) use ($name, $type, $length) {
                    $length ? $t->{$type}($name, $length)->nullable() : $t->{$type}($name)->nullable();
                });
            }
        }
    }

    public function down(): void
    {
        foreach (array_keys($this->columns) as $name) {
            if (Schema::hasColumn('pastors', $name)) {
                Schema::table('pastors', fn (Blueprint $t) => $t->dropColumn($name));
            }
        }
    }
};
