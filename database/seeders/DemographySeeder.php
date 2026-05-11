<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DemographySeeder extends Seeder
{
    public function run(): void
    {
        $demographies = ['Middle School', 'High School', 'College', 'Young Adult', 'Adult', 'Senior'];
        foreach ($demographies as $name) {
            DB::table('demographies')->updateOrInsert(['name' => $name], ['created_at' => now(), 'updated_at' => now()]);
        }
        $this->command->info('Demographies seeded: ' . implode(', ', $demographies));
    }
}
