<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class GenderSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('genders')->updateOrInsert(['name' => 'Male'], ['created_at' => now(), 'updated_at' => now()]);
        DB::table('genders')->updateOrInsert(['name' => 'Female'], ['created_at' => now(), 'updated_at' => now()]);
        $this->command->info('Genders seeded: Male, Female');
    }
}
