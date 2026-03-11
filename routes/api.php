<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DepartmentRequestController;
use App\Http\Controllers\Api\HomeGroupApiController;
use App\Http\Controllers\Api\HomeGroupMemberController;
use App\Http\Controllers\Api\WeeklyReportController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ActivityController;
use App\Http\Controllers\Api\MessageController;
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
    
    // Weekly Reports routes
    Route::get('/reports/history', [WeeklyReportController::class, 'history']);
    Route::get('/reports/pending', [WeeklyReportController::class, 'pendingReminders']);
    Route::post('/reports', [WeeklyReportController::class, 'store']);
    Route::get('/reports/{id}', [WeeklyReportController::class, 'show']);
    Route::put('/reports/{id}', [WeeklyReportController::class, 'update']);
    Route::post('/reports/{id}/remittance', [WeeklyReportController::class, 'submitRemittance']);
    Route::post('/reports/{id}/attachment', [WeeklyReportController::class, 'uploadAttachment']);
    
    // Notifications routes
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::get('/notifications/unread-count', [NotificationController::class, 'unreadCount']);
    Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::put('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);
    Route::delete('/notifications/clear-read', [NotificationController::class, 'clearRead']);
    
    // Activities routes
    Route::get('/activities', [ActivityController::class, 'index']);
    Route::get('/activities/upcoming', [ActivityController::class, 'upcoming']);
    Route::post('/activities', [ActivityController::class, 'store']);
    Route::get('/activities/{id}', [ActivityController::class, 'show']);
    Route::put('/activities/{id}', [ActivityController::class, 'update']);
    Route::delete('/activities/{id}', [ActivityController::class, 'destroy']);
    Route::put('/activities/{id}/status', [ActivityController::class, 'updateStatus']);
    
    // Messages routes
    Route::get('/messages/conversations', [MessageController::class, 'conversations']);
    Route::get('/messages/conversation/{contactId}', [MessageController::class, 'conversation']);
    Route::post('/messages/direct', [MessageController::class, 'sendDirect']);
    Route::post('/messages/announcement', [MessageController::class, 'sendAnnouncement']);
    Route::post('/messages/notice', [MessageController::class, 'sendNotice']);
    Route::get('/messages/unread-count', [MessageController::class, 'unreadCount']);
    Route::get('/messages/pastor', [MessageController::class, 'pastorMessages']);
    Route::put('/messages/{id}/read', [MessageController::class, 'markAsRead']);
    Route::get('/messages/department-members', [MessageController::class, 'departmentMembers']);
    
    // Department requests routes (join departments after registration)
    Route::get('/departments', [DepartmentRequestController::class, 'departments']);
    Route::post('/department-request', [DepartmentRequestController::class, 'requestJoin']);
    Route::get('/department-request/my', [DepartmentRequestController::class, 'myRequest']);
    Route::delete('/department-request/cancel', [DepartmentRequestController::class, 'cancelRequest']);
    
    // Pastor/HOD approval routes
    Route::get('/department-request/approvals', [DepartmentRequestController::class, 'pendingApprovals']);
    Route::put('/department-request/{id}/approve', [DepartmentRequestController::class, 'approveRequest']);
    Route::put('/department-request/{id}/reject', [DepartmentRequestController::class, 'rejectRequest']);
    
    // Home group membership routes
    Route::get('/home-groups/available', [HomeGroupMemberController::class, 'availableHomeGroups']);
    Route::get('/home-group/my', [HomeGroupMemberController::class, 'myHomeGroup']);
    Route::post('/home-group/join', [HomeGroupMemberController::class, 'joinHomeGroup']);
    Route::delete('/home-group/leave', [HomeGroupMemberController::class, 'leaveHomeGroup']);
    Route::get('/home-group/{id}/members', [HomeGroupMemberController::class, 'homeGroupMembers']);
    Route::post('/home-group/{id}/assign-leader', [HomeGroupMemberController::class, 'assignLeader']);
    Route::delete('/home-group/{homeGroupId}/members/{memberId}', [HomeGroupMemberController::class, 'removeMember']);
});
