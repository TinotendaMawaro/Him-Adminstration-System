<?php

use Illuminate\Support\Facades\Route;

// SPA catch-all
Route::get('/{any}', function () {
    return view('welcome');
})->where('any', '.*');
