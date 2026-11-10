<?php

use App\Http\Controllers\EmailPreferenceController;
use App\Http\Controllers\ExportController;
use App\Http\Controllers\PayReturnController;
use App\Http\Controllers\ReceiptController;
use Illuminate\Support\Facades\Route;

// The hover "history" card in the head-office console (session-authenticated; master only).
Route::get('/staff/history/{user}', [\App\Http\Controllers\Api\PeopleController::class, 'history'])
    ->whereNumber('user')->middleware(['auth', 'role:master', 'throttle:120,1'])->name('staff.history');

// ── Staff portal downloads (session-authenticated; roles enforced in the controllers) ──
Route::get('/exports/{report}', ExportController::class)
    ->middleware('throttle:20,1')
    ->name('exports.download');

Route::get('/receipts/{payment}', ReceiptController::class)
    ->middleware('throttle:60,1')
    ->name('receipts.show');

// ── Links inside emails (signed: tamper-proof and expiring) ───────────────────────────
Route::get('/receipts/{payment}/view', ReceiptController::class)
    ->middleware(['signed', 'throttle:60,1'])
    ->name('receipts.signed');

Route::match(['get', 'post'], '/email/unsubscribe/{user}', [EmailPreferenceController::class, 'unsubscribe'])
    ->middleware(['signed', 'throttle:30,1'])
    ->name('email.unsubscribe');

Route::get('/email/resubscribe/{user}', [EmailPreferenceController::class, 'resubscribe'])
    ->middleware(['signed', 'throttle:30,1'])
    ->name('email.resubscribe');

// ── Password reset pages for the member portals (staff have their own inside each portal) ─────
Route::get('/forgot-password', fn () => view('portal.forgot-password'))->name('password.request.page');
Route::get('/reset-password/{token}', fn (string $token) => view('portal.reset-password', ['token' => $token, 'email' => request('email')]))
    ->name('password.reset.form');

// Where PayMe sends customers after paying. Public by design (unguessable reference); verifies server-side.
Route::get('/pay/return/{reference}', PayReturnController::class)
    ->where('reference', 'HIM[A-Z0-9]+')
    ->middleware('throttle:60,1')
    ->name('pay.return');

// What an ID-card QR code opens. Public by design: the token is signed, and the page shows only name, number, zone and status.
Route::get('/verify/{token}', \App\Http\Controllers\CardVerifyController::class)
    ->where('token', '[A-Za-z0-9_\-]+\.[a-f0-9]{16}')
    ->middleware('throttle:60,1')
    ->name('card.verify');

// SPA catch-all
Route::get('/{any}', function () {
    return view('welcome');
})->where('any', '.*');
