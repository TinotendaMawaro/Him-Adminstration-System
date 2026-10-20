<?php

use App\Http\Controllers\ExportController;
use App\Http\Controllers\ReceiptController;
use Illuminate\Support\Facades\Route;

// ── Staff portal downloads (session-authenticated; roles enforced in the controllers) ──
Route::get('/exports/{report}', ExportController::class)
    ->middleware('throttle:20,1')
    ->name('exports.download');

Route::get('/receipts/{payment}', ReceiptController::class)
    ->middleware('throttle:60,1')
    ->name('receipts.show');

// SPA catch-all
Route::get('/{any}', function () {
    return view('welcome');
})->where('any', '.*');
