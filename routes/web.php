<?php

use App\Http\Controllers\ExportController;
use App\Http\Controllers\PayReturnController;
use App\Http\Controllers\ReceiptController;
use Illuminate\Support\Facades\Route;

// ── Staff portal downloads (session-authenticated; roles enforced in the controllers) ──
Route::get('/exports/{report}', ExportController::class)
    ->middleware('throttle:20,1')
    ->name('exports.download');

Route::get('/receipts/{payment}', ReceiptController::class)
    ->middleware('throttle:60,1')
    ->name('receipts.show');

// Where PayMe sends customers after paying. Public by design (unguessable reference); verifies server-side.
Route::get('/pay/return/{reference}', PayReturnController::class)
    ->where('reference', 'HIM[A-Z0-9]+')
    ->middleware('throttle:60,1')
    ->name('pay.return');

// SPA catch-all
Route::get('/{any}', function () {
    return view('welcome');
})->where('any', '.*');
