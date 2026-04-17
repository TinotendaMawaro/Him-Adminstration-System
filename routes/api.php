<?php

use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ActivityController;
use App\Http\Controllers\Api\DepartmentRequestController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\HomeGroupApiController;
use App\Http\Controllers\Api\HomeGroupMemberController;
use App\Http\Controllers\Api\MemberController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PartnerController;
use App\Http\Controllers\Api\PastorController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\RegisterController;
use App\Http\Controllers\Api\WeeklyReportController;
use Illuminate\Support\Facades\Route;

// ─── Public ───────────────────────────────────────────────────────────────────
// Pastors log in with unique code
Route::post('/login/code', [AuthController::class, 'loginWithCode']);
// Members and Partners log in with email + password
Route::post('/login', [AuthController::class, 'login']);
// Member self-registration
Route::post('/register', RegisterController::class);

// ─── Authenticated ────────────────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // ── Auth / session ────────────────────────────────────────────────────────
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);

    // Onboarding flow (all roles)
    Route::post('/terms/accept',          [AuthController::class, 'acceptTerms']);
    Route::post('/first-login/complete',  [AuthController::class, 'completeFirstLogin']);
    Route::post('/tour/complete',         [AuthController::class, 'completeTour']);
    Route::post('/tour/skip',             [AuthController::class, 'skipTour']);

    // ── Events (all authenticated users can browse) ───────────────────────────
    Route::get('/events',                         [EventController::class, 'index']);
    Route::get('/events/{id}',                    [EventController::class, 'show']);
    Route::post('/events/{id}/register',          [EventController::class, 'register']);
    Route::delete('/events/{id}/register',        [EventController::class, 'cancelRegistration']);

    // Event management (master / event role — enforced via policy)
    Route::post('/events',                        [EventController::class, 'store']);
    Route::put('/events/{id}',                    [EventController::class, 'update']);
    Route::delete('/events/{id}',                 [EventController::class, 'destroy']);
    Route::get('/events/{id}/registrations',      [EventController::class, 'registrations']);

    // ── Payments ──────────────────────────────────────────────────────────────
    Route::get('/payments',           [PaymentController::class, 'index']);
    Route::get('/payments/summary',   [PaymentController::class, 'summary']);
    Route::get('/payments/my',        [PaymentController::class, 'myPayments']);
    Route::get('/payments/{id}',      [PaymentController::class, 'show']);
    Route::post('/payments',          [PaymentController::class, 'store']);    // finance / master only

    // ── Member portal ─────────────────────────────────────────────────────────
    Route::prefix('members')->group(function () {
        Route::get('/me',        [MemberController::class, 'me']);
        Route::put('/me',        [MemberController::class, 'updateMe']);
        // Pastor / HOD listing
        Route::get('/',          [MemberController::class, 'index']);
        Route::get('/{id}',      [MemberController::class, 'show']);
    });

    // ── Pastor portal ─────────────────────────────────────────────────────────
    Route::prefix('pastors')->group(function () {
        Route::get('/me',            [PastorController::class, 'me']);
        Route::get('/zone-summary',  [PastorController::class, 'zoneSummary']);
        Route::get('/dashboard',    [PastorController::class, 'dashboard']);
        Route::get('/members',       [PastorController::class, 'members']);
        Route::get('/home-groups',   [PastorController::class, 'homeGroups']);
        Route::get('/activities',    [PastorController::class, 'activities']);
    });

    // ── Real-time Dashboard Metrics ─────────────────────────────────────────
    Route::get('/dashboard/metrics', [DashboardController::class, 'metrics']);

    // ── Partner portal ────────────────────────────────────────────────────────
    Route::prefix('partners')->group(function () {
        Route::get('/me',          [PartnerController::class, 'me']);
        Route::get('/me/payments', [PartnerController::class, 'myPayments']);
        Route::get('/me/summary',  [PartnerController::class, 'mySummary']);
    });

    // ── Home groups ───────────────────────────────────────────────────────────
    Route::get('/homegroups',                             [HomeGroupApiController::class, 'index']);
    Route::post('/homegroups',                            [HomeGroupApiController::class, 'store']);
    Route::get('/homegroups/{id}',                        [HomeGroupApiController::class, 'show']);
    Route::put('/homegroups/{id}',                        [HomeGroupApiController::class, 'update']);
    Route::delete('/homegroups/{id}',                     [HomeGroupApiController::class, 'destroy']);
    Route::post('/homegroups/{id}/assign-leader',         [HomeGroupApiController::class, 'assignLeader']);
    Route::post('/homegroups/{id}/demote-leader',         [HomeGroupApiController::class, 'demoteLeader']);
    Route::get('/homegroups/{id}/available-members',       [HomeGroupApiController::class, 'availableMembers']);

    Route::get('/home-groups/available',                  [HomeGroupMemberController::class, 'availableHomeGroups']);
    Route::get('/home-group/my',                          [HomeGroupMemberController::class, 'myHomeGroup']);
    Route::post('/home-group/join',                       [HomeGroupMemberController::class, 'joinHomeGroup']);
    Route::delete('/home-group/leave',                    [HomeGroupMemberController::class, 'leaveHomeGroup']);
    Route::get('/home-group/{id}/members',                [HomeGroupMemberController::class, 'homeGroupMembers']);
    Route::post('/home-group/{id}/assign-leader',         [HomeGroupMemberController::class, 'assignLeader']);
    Route::delete('/home-group/{homeGroupId}/members/{memberId}', [HomeGroupMemberController::class, 'removeMember']);

    // ── Reports ──────────────────────────────────────────────────────────────
    Route::get('/reports/history',         [WeeklyReportController::class, 'history']);
    Route::get('/reports/pending',          [WeeklyReportController::class, 'pendingReminders']);
    Route::post('/reports',                 [WeeklyReportController::class, 'store']);
    Route::get('/reports/{id}',             [WeeklyReportController::class, 'show']);
    Route::put('/reports/{id}',             [WeeklyReportController::class, 'update']);
    Route::post('/reports/{id}/remittance', [WeeklyReportController::class, 'submitRemittance']);

    // ── Activity Feed ─────────────────────────────────────────────────────────
    Route::get('/activities', [ActivityController::class, 'index']);

    // ── Notifications ─────────────────────────────────────────────────────────
    Route::get('/notifications',                  [NotificationController::class, 'index']);
    Route::patch('/notifications/{id}/read',     [NotificationController::class, 'markRead']);
    Route::patch('/notifications/read-all',       [NotificationController::class, 'markAllRead']);

    // ── Messages ─────────────────────────────────────────────────────────────
    Route::get('/messages',                 [MessageController::class, 'index']);
    Route::get('/messages/{id}',            [MessageController::class, 'show']);
    Route::post('/messages',                [MessageController::class, 'store']);
    Route::delete('/messages/{id}',         [MessageController::class, 'destroy']);

    // ── Department Requests ───────────────────────────────────────────────────
    Route::get('/department-request/my',          [DepartmentRequestController::class, 'myRequest']);
    Route::delete('/department-request/cancel',   [DepartmentRequestController::class, 'cancelRequest']);
    Route::get('/department-request/approvals',   [DepartmentRequestController::class, 'pendingApprovals']);
    Route::put('/department-request/{id}/approve',  [DepartmentRequestController::class, 'approveRequest']);
    Route::put('/department-request/{id}/reject',  [DepartmentRequestController::class, 'rejectRequest']);
});