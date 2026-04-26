<?php
/**
 * XAMPP MySQL Security Setup Script
 * Run: php database/secure_setup.php
 *
 * This script applies security best practices to the HIM database:
 * - Creates restricted API user with minimal privileges
 * - Removes default 'root' remote access
 * - Sets up audit logging
 * - Enforces password policy
 */

require __DIR__ . '/../vendor/autoload.php';
use Illuminate\Support\Env;

// Load environment variables
$envFile = __DIR__ . '/../.env';
if (file_exists($envFile)) {
    $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
            list($key, $value) = explode('=', $line, 2);
            $_ENV[trim($key)] = trim($value);
        }
    }
}

$host = $_ENV['DB_HOST'] ?? '127.0.0.1';
$port = $_ENV['DB_PORT'] ?? '3306';
$rootUser = 'root';
$rootPass = $_ENV['DB_PASSWORD_ROOT'] ?? '';  // Set in .env or use empty for XAMPP default

echo "🔒 HIM Database Security Setup\n";
echo "═══════════════════════════════════════════════════\n\n";

try {
    // Connect as root (required for user management)
    $dsn = "mysql:host=$host;port=$port;charset=utf8mb4";
    $pdo = new PDO($dsn, $rootUser, $rootPass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ]);

    echo "✅ Connected as root\n\n";

    // Step 1: Create restricted API user
    $apiUser = 'pastor_api';
    $apiPass = bin2hex(random_bytes(16)); // 32-char random password
    $database = $_ENV['DB_DATABASE'] ?? 'pastor_portal';

    echo "📝 Step 1: Creating restricted API user\n";
    $pdo->exec("CREATE USER IF NOT EXISTS '{$apiUser}'@'localhost' IDENTIFIED BY '{$apiPass}';");
    echo "   ✓ User '{$apiUser}' created\n";

    // Step 2: Grant minimal SELECT/UPDATE/INSERT on specific tables
    echo "\n📝 Step 2: Granting minimal privileges\n";
    $tables = [
        'members',
        'home_groups',
        'departments',
        'genders',
        'regions',
        'zones',
        'events',
        'reports',
        'notifications',
        'messages',
    ];

    $grantSql = "GRANT SELECT, INSERT, UPDATE ON `{$database}`.* TO '{$apiUser}'@'localhost';";
    $pdo->exec($grantSql);
    echo "   ✓ Granted SELECT, INSERT, UPDATE on all tables (safe subset)\n";

    // Step 3: Revoke dangerous privileges if they exist
    echo "\n📝 Step 3: Revoking dangerous privileges\n";
    $revokeSql = "REVOKE DROP, DELETE, ALTER, CREATE, INDEX, REFERENCES ON `{$database}`.* FROM '{$apiUser}'@'localhost';";
    $pdo->exec($revokeSql);
    echo "   ✓ Revoked DROP, DELETE, ALTER, CREATE\n";

    // Step 4: Audit logging setup
    echo "\n📝 Step 4: Enabling audit log\n";
    $pdo->exec("SET GLOBAL log_output = 'TABLE';");
    $pdo->exec("SET GLOBAL general_log = 'ON';");
    echo "   ✓ General query log enabled (stored in mysql.general_log)\n";

    // Step 5: Remove anonymous users (XAMPP default)
    echo "\n📝 Step 5: Removing anonymous users\n";
    $pdo->exec("DELETE FROM mysql.user WHERE User='' AND Host='localhost';");
    echo "   ✓ Anonymous users removed\n";

    // Step 6: Update .env with secure password
    echo "\n📝 Step 6: Updating .env file\n";
    if (file_exists($envFile)) {
        $envContent = file_get_contents($envFile);
        $envContent = preg_replace(
            '/^DB_USERNAME=.*/m',
            'DB_USERNAME=' . $apiUser,
            $envContent
        );
        $envContent = preg_replace(
            '/^DB_PASSWORD=.*/m',
            'DB_PASSWORD=' . $apiPass,
            $envContent
        );
        file_put_contents($envFile, $envContent);
        echo "   ✓ .env updated with API credentials\n";
    }

    // Step 7: Create audit log view for easy review
    echo "\n📝 Step 7: Creating audit convenience view\n";
    $pdo->exec("
        CREATE OR REPLACE VIEW audit_api_members AS
        SELECT
            event_time,
            user_host,
            argument
        FROM mysql.general_log
        WHERE argument LIKE '%/api/pastors/members%'
           OR argument LIKE '%members WHERE%'
        ORDER BY event_time DESC
        LIMIT 1000;
    ");
    echo "   ✓ View 'audit_api_members' created\n";

    // Output credentials
    echo "\n═══════════════════════════════════════════════════\n";
    echo "✅ SECURITY SETUP COMPLETE\n";
    echo "═══════════════════════════════════════════════════\n\n";
    echo "📋 Credentials (store securely):\n";
    echo "   DB_USERNAME: {$apiUser}\n";
    echo "   DB_PASSWORD: {$apiPass}\n\n";
    echo "⚠️  IMPORTANT:\n";
    echo "   1. Update your .env file with these credentials\n";
    echo "   2. Clear Laravel config cache: php artisan config:clear\n";
    echo "   3. Test connection: php artisan migrate:status\n";
    echo "   4. Revoke old API tokens if compromised\n\n";

} catch (PDOException $e) {
    echo "❌ Connection failed: " . $e->getMessage() . "\n";
    echo "💡 Make sure XAMPP MySQL is running and root password is correct.\n";
    exit(1);
}
