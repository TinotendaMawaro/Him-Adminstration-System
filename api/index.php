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

define('LARAVEL_START', microtime(true));

require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$app->useStoragePath('/tmp/storage');

$app->handleRequest(Illuminate\Http\Request::capture());
