<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\HomeGroupApiController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/login/code', [AuthController::class, 'loginWithCode']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);
    
    // First time login flow
    Route::post('/terms/accept', [AuthController::class, 'acceptTerms']);
    Route::post('/first-login/complete', [AuthController::class, 'completeFirstLogin']);
    Route::post('/tour/complete', [AuthController::class, 'completeTour']);
    Route::post('/tour/skip', [AuthController::class, 'skipTour']);
    
    // Homegroup routes
    Route::get('/homegroups', [HomeGroupApiController::class, 'index']);
    Route::post('/homegroups', [HomeGroupApiController::class, 'store']);
    Route::get('/homegroups/{id}', [HomeGroupApiController::class, 'show']);
    Route::put('/homegroups/{id}', [HomeGroupApiController::class, 'update']);
    Route::delete('/homegroups/{id}', [HomeGroupApiController::class, 'destroy']);
    Route::post('/homegroups/{id}/assign-leader', [HomeGroupApiController::class, 'assignLeader']);
    Route::post('/homegroups/{id}/demote-leader', [HomeGroupApiController::class, 'demoteLeader']);
    Route::get('/homegroups/{id}/available-members', [HomeGroupApiController::class, 'availableMembers']);
});
