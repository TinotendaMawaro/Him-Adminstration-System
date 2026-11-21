<?php
require __DIR__ . '/../../vendor/autoload.php';
$app = require __DIR__ . '/../../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
$http = $app->make(Illuminate\Contracts\Http\Kernel::class);
$r = $http->handle(Illuminate\Http\Request::create('/api/login', 'OPTIONS', [], [], [], ['HTTP_ORIGIN' => 'https://localhost', 'HTTP_ACCESS_CONTROL_REQUEST_METHOD' => 'POST', 'HTTP_ACCESS_CONTROL_REQUEST_HEADERS' => 'content-type,x-him-client,accept']));
echo $r->getStatusCode(), ' ', $r->headers->get('Access-Control-Allow-Headers'), "\n";
