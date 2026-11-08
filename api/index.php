<?php

/**
 * Vercel serverless entry point for Laravel (runtime: vercel-php).
 * The deployed filesystem is read-only except /tmp, so every writable Laravel path lives there.
 */

foreach (['storage/framework/views', 'storage/framework/cache/data', 'storage/framework/sessions', 'storage/logs', 'bootstrap/cache'] as $dir) {
    if (!is_dir("/tmp/{$dir}")) {
        @mkdir("/tmp/{$dir}", 0777, true);
    }
}

// The function file lives at /api/index.php, which would make Laravel believe its base path is "/api" and strip it from
// every API URL. Present it as the usual public/index.php instead.
$_SERVER['SCRIPT_NAME'] = '/index.php';
$_SERVER['PHP_SELF'] = '/index.php';
$_SERVER['SCRIPT_FILENAME'] = dirname(__DIR__) . '/public/index.php';

define('LARAVEL_START', microtime(true));

require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->useStoragePath('/tmp/storage');

$app->handleRequest(Illuminate\Http\Request::capture());
