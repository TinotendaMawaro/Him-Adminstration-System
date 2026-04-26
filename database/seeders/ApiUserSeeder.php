<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * ApiUserSeeder
 *
 * Creates restricted API database user for production deployments.
 * DO NOT USE in development - use secure_setup.php instead.
 */
class ApiUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Only run if in production environment
        if (app()->environment('local', 'testing')) {
            $this->command->info('Skipping API user creation in local environment.');
            return;
        }

        $apiUser = env('DB_USERNAME', 'pastor_api');
        $apiPass = env('DB_PASSWORD', '');
        $database = env('DB_DATABASE', 'pastor_portal');

        // Generate strong password if not set
        if (empty($apiPass) || $apiPass === '') {
            $apiPass = bin2hex(random_bytes(16));
            $this->command->warn("Generated API password: {$apiPass}");
            $this->command->warn("Add to .env: DB_PASSWORD={$apiPass}");
        }

        try {
            // Connect to MySQL without database
            $config = config('database.connections.mysql');
            unset($config['database']);

            $pdo = new \PDO(
                "mysql:host={$config['host']};port={$config['port']}",
                'root', // or admin user
                env('DB_PASSWORD_ROOT', '')
            );

            // Drop existing user
            $pdo->exec("DROP USER IF EXISTS '{$apiUser}'@'localhost'");

            // Create new user with strong password
            $pdo->exec("CREATE USER '{$apiUser}'@'localhost' IDENTIFIED BY '{$apiPass}'");
            $this->command->info("Created API user '{$apiUser}'@'localhost'");

            // Grant minimal privileges
            $pdo->exec("GRANT SELECT, INSERT, UPDATE ON `{$database}`.* TO '{$apiUser}'@'localhost'");
            $pdo->exec("REVOKE DROP, DELETE, ALTER, CREATE, INDEX, REFERENCES ON `{$database}`.* FROM '{$apiUser}'@'localhost'");
            $pdo->exec("FLUSH PRIVILEGES");

            $this->command->info('Granted minimal database privileges');
            $this->command->info('✅ API user secured');

        } catch (\Exception $e) {
            $this->command->error('Failed to create API user: ' . $e->getMessage());
        }
    }
}
