<?php

use App\Http\Controllers\Api\AssetController;
use App\Http\Controllers\Api\ActivityController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DepartmentController;
use App\Http\Controllers\Api\DepartmentRequestController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\HomeGroupApiController;
use App\Http\Controllers\Api\HomeGroupInvitationController;
use App\Http\Controllers\Api\HomeGroupMemberController;
use App\Http\Controllers\Api\HomeGroupReportController;
use App\Http\Controllers\Api\HomeGroupUpdateController;
use App\Http\Controllers\Api\LocationController;
use App\Http\Controllers\Api\MemberController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PartnerController;
use App\Http\Controllers\Api\PartnershipPackageController;
use App\Http\Controllers\Api\PastorController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\PrayerCenterController;
use App\Http\Controllers\Api\RegisterController;
use App\Http\Controllers\Api\WeeklyReportController;
use App\Http\Controllers\ProfilePictureController;
use Illuminate\Support\Facades\Route;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\Cache;

// ─── PUBLIC ──────────────────────────────────────────────────────────────────
Route::post('/login/code', [AuthController::class, 'loginWithCode'])
     ->middleware('throttle:10,1'); // 10 attempts per minute

Route::post('/login', [AuthController::class, 'login'])
     ->middleware('throttle:5,1'); // 5 attempts per minute

Route::post('/register', RegisterController::class)
     ->middleware('throttle:3,1'); // 3 registrations per minute

// ── Zone Lookup (public — no auth required, used during registration) ─────────
    Route::get('/zones/lookup', [DashboardController::class, 'lookupZone'])
         ->middleware('throttle:30,1');

    Route::post('/location/reverse-geocode', [LocationController::class, 'reverseGeocode'])
         ->middleware('auth:sanctum', 'throttle:30,1');

// ── Partnership Packages (public — no auth required) ─────────────────────────
Route::prefix('partnership-packages')->group(function () {
    Route::get('/', [PartnershipPackageController::class, 'index']);
    Route::get('/{id}', [PartnershipPackageController::class, 'show']);
});

// ─── AUTHENTICATED ───────────────────────────────────────────────────────────
Route::middleware(['auth:sanctum', 'throttle:60,1'])->group(function () {
     // ── Auth ───────────────────────────────────────────────────────────────────
      Route::get('/me', [AuthController::class, 'me']);
      Route::post('/logout', [AuthController::class, 'logout']);
      Route::put('/profile', [AuthController::class, 'updateProfile']);
      Route::post('/profile/photo', [AuthController::class, 'uploadProfilePhoto']);
      Route::post('/user/profile-picture', [ProfilePictureController::class, 'upload']);

    Route::post('/terms/accept', [AuthController::class, 'acceptTerms']);
    Route::post('/first-login/complete', [AuthController::class, 'completeFirstLogin']);
    Route::post('/tour/complete', [AuthController::class, 'completeTour']);
    Route::post('/tour/skip', [AuthController::class, 'skipTour']);

    // ── Events ─────────────────────────────────────────────────────────────────
    Route::get('/events', [EventController::class, 'index']);
    Route::get('/events/{id}', [EventController::class, 'show']);
    Route::post('/events/{id}/register', [EventController::class, 'register']);
    Route::delete('/events/{id}/register', [EventController::class, 'cancelRegistration']);

    Route::post('/events', [EventController::class, 'store']);
    Route::put('/events/{id}', [EventController::class, 'update']);
    Route::delete('/events/{id}', [EventController::class, 'destroy']);
    Route::get('/events/{id}/registrations', [EventController::class, 'registrations']);

    // ── Assets ──────────────────────────────────────────────────────────────────
    Route::get('/assets', [AssetController::class, 'index']);
    Route::get('/assets/options', [AssetController::class, 'options']);
    Route::post('/assets', [AssetController::class, 'store']);
    Route::get('/assets/{id}', [AssetController::class, 'show']);
    Route::put('/assets/{id}', [AssetController::class, 'update']);
    Route::delete('/assets/{id}', [AssetController::class, 'destroy']);

    // ── Payments ───────────────────────────────────────────────────────────────
    Route::get('/payments', [PaymentController::class, 'index']);
    Route::get('/payments/summary', [PaymentController::class, 'summary']);
    Route::get('/payments/my', [PaymentController::class, 'myPayments']);
    Route::get('/payments/{id}', [PaymentController::class, 'show']);
    Route::post('/payments', [PaymentController::class, 'store']);

    // ── Members ────────────────────────────────────────────────────────────────
    Route::prefix('members')->group(function () {
        Route::get('/me', [MemberController::class, 'me']);
        Route::get('/zone-summary', [MemberController::class, 'zoneSummary']);
        Route::get('/zone-history', [MemberController::class, 'zoneHistory']);
        Route::put('/me', [MemberController::class, 'updateMe']);
        Route::put('/me/profile', [MemberController::class, 'updateProfile']);
        Route::put('/me/location', [MemberController::class, 'updateMeLocation']);
        Route::get('/', [MemberController::class, 'index'])
             ->middleware('throttle:120,1'); // Higher limit for list endpoints
        Route::get('/{id}', [MemberController::class, 'show']);
    });

    // ── Profile ──────────────────────────────────────────────────────────────────
    Route::get('/profile/completeness', [MemberController::class, 'completeness']);

    // ── Spiritual Milestones ─────────────────────────────────────────────────────
    Route::get('/spiritual-milestones', [MemberController::class, 'milestones']);

    // ── Badges ───────────────────────────────────────────────────────────────────
    Route::get('/badges', [MemberController::class, 'badges']);

    // ── Pastor Portal ────────────────────────────────────────────────────────────
    Route::prefix('pastors')->group(function () {
        Route::get('/me', [PastorController::class, 'me']);
        Route::get('/zone-summary', [PastorController::class, 'zoneSummary']);
        Route::get('/dashboard', [PastorController::class, 'dashboard']);
        Route::get('/members', [PastorController::class, 'members'])
             ->middleware('throttle:120,1');
        Route::post('/members/bulk', [PastorController::class, 'bulkMemberAction']);
        Route::post('/members/{member}/status', [PastorController::class, 'updateMemberStatus']);
        Route::get('/home-groups', [PastorController::class, 'homeGroups']);
        Route::get('/activities', [PastorController::class, 'activities']);
        Route::put('/zone', [PastorController::class, 'updateZoneInfo']);
        Route::get('/zone-history', [PastorController::class, 'zoneHistory']);
        Route::get('/partners', [PastorController::class, 'partners']);

        // 360 member view
        Route::get('/members/{member}/360', [PastorController::class, 'member360']);
        Route::put('/members/{member}/notes', [PastorController::class, 'updateMemberNotes']);
    });

    // ── Dashboard Metrics ──────────────────────────────────────────────────────
    Route::get('/dashboard/metrics', [DashboardController::class, 'metrics']);

    Route::get('/hod/dashboard', [DashboardController::class, 'hodDashboard']);
    Route::get('/member/dashboard', [DashboardController::class, 'memberDashboard']);

    // ── Department Entity Management ───────────────────────────────────────────
    Route::get('/departments/eligible-entities', [DepartmentController::class, 'getEligibleEntities']);
    Route::post('/departments/assign-hod-entity', [DepartmentController::class, 'assignHodEntity']);

    // ── Partners ───────────────────────────────────────────────────────────────
    Route::prefix('partners')->group(function () {
        Route::post('/enroll', [PartnerController::class, 'enroll']);
        Route::get('/me', [PartnerController::class, 'me']);
        Route::get('/me/payments', [PartnerController::class, 'myPayments']);
        Route::get('/me/summary', [PartnerController::class, 'mySummary']);
        Route::get('/me/benefits', [PartnerController::class, 'myBenefits']);
        Route::get('/me/points', [PartnerController::class, 'myPoints']);
        Route::get('/me/points/history', [PartnerController::class, 'myPointsHistory']);
        Route::get('/me/statements', [PartnerController::class, 'myStatements']);
        Route::post('/me/statements/generate', [PartnerController::class, 'generateStatement']);
        Route::get('/me/rewards', [PartnerController::class, 'availableRewards']);
        Route::post('/me/rewards/redeem', [PartnerController::class, 'redeemReward']);
        Route::post('/me/upgrade', [PartnerController::class, 'upgrade']);
        Route::get('/options', [PartnerController::class, 'options']);
        Route::post('/me/payment', [PartnerController::class, 'submitPayment']);
    });

     // ── Home Groups ────────────────────────────────────────────────────────────
     Route::get('/homegroups', [HomeGroupApiController::class, 'index']);
     Route::post('/homegroups', [HomeGroupApiController::class, 'store']);
     Route::get('/homegroups/{id}', [HomeGroupApiController::class, 'show']);
     Route::put('/homegroups/{id}', [HomeGroupApiController::class, 'update']);
     Route::delete('/homegroups/{id}', [HomeGroupApiController::class, 'destroy']);
     Route::post('/homegroups/{id}/assign-leader', [HomeGroupApiController::class, 'assignLeader']);
     Route::post('/homegroups/{id}/demote-leader', [HomeGroupApiController::class, 'demoteLeader']);
      Route::get('/homegroups/{id}/available-members', [HomeGroupApiController::class, 'availableMembers']);
      Route::get('/homegroups/{id}/available-members-for-invite', [HomeGroupApiController::class, 'availableMembersForInvite']);
     
      // Home Group Invitations & Requests
      Route::post('/homegroups/{id}/invite', [HomeGroupInvitationController::class, 'invite']);
      Route::post('/homegroups/{id}/request', [HomeGroupInvitationController::class, 'requestJoin']);
      Route::get('/homegroup-invitations', [HomeGroupInvitationController::class, 'index']);
      Route::get('/homegroup-invitations/{id}', [HomeGroupInvitationController::class, 'show']);
      Route::post('/homegroup-invitations/{id}/accept', [HomeGroupInvitationController::class, 'accept']);
      Route::post('/homegroup-invitations/{id}/decline', [HomeGroupInvitationController::class, 'decline']);
      Route::delete('/homegroup-invitations/{id}', [HomeGroupInvitationController::class, 'destroy']);
      Route::get('/pastors/homegroup-invitations', [HomeGroupInvitationController::class, 'pastorInvitations']);
      Route::get('/pastors/homegroup-invitations/pending-count', [HomeGroupInvitationController::class, 'pendingCount']);

    Route::get('/home-groups/available', [HomeGroupApiController::class, 'index']);
    Route::get('/home-group/my', [HomeGroupMemberController::class, 'myHomeGroup']);
    Route::post('/home-group/join', [HomeGroupMemberController::class, 'joinHomeGroup']);
    Route::delete('/home-group/leave', [HomeGroupMemberController::class, 'leaveHomeGroup']);
    Route::get('/home-group/{id}/members', [HomeGroupMemberController::class, 'homeGroupMembers']);
    Route::post('/home-group/{id}/assign-leader', [HomeGroupMemberController::class, 'assignLeader']);
    Route::delete('/home-group/{homeGroupId}/members/{memberId}', [HomeGroupMemberController::class, 'removeMember']);
    Route::put('/home-group/{homeGroupId}/members/{memberId}/status', [HomeGroupMemberController::class, 'updateMemberStatus']);
    Route::post('/home-group/{homeGroupId}/broadcast', [HomeGroupMemberController::class, 'sendBroadcast']);

    // Home group requests
    Route::post('/home-group/request', [HomeGroupMemberController::class, 'requestJoin']);
    Route::get('/home-group/my-request', [HomeGroupMemberController::class, 'myRequest']);
    Route::delete('/home-group/cancel-request', [HomeGroupMemberController::class, 'cancelRequest']);
    Route::get('/home-group/pending-approvals', [HomeGroupMemberController::class, 'pendingApprovals']);
    Route::post('/home-group/approve-request/{id}', [HomeGroupMemberController::class, 'approveRequest']);
    Route::post('/home-group/reject-request/{id}', [HomeGroupMemberController::class, 'rejectRequest']);

    // Home group updates
    Route::get('/home-groups/{homeGroupId}/updates', [HomeGroupUpdateController::class, 'index']);
    Route::post('/home-groups/{homeGroupId}/updates', [HomeGroupUpdateController::class, 'store']);
    Route::put('/home-groups/{homeGroupId}/updates/{updateId}', [HomeGroupUpdateController::class, 'update']);
    Route::delete('/home-groups/{homeGroupId}/updates/{updateId}', [HomeGroupUpdateController::class, 'destroy']);

    // Home group reports
    Route::get('/home-groups/{homeGroupId}/reports', [HomeGroupReportController::class, 'index']);
    Route::post('/home-groups/{homeGroupId}/reports', [HomeGroupReportController::class, 'store']);
    Route::put('/home-groups/{homeGroupId}/reports/{reportId}', [HomeGroupReportController::class, 'update']);
    Route::post('/home-groups/{homeGroupId}/reports/{reportId}/submit', [HomeGroupReportController::class, 'submit']);
    Route::post('/home-groups/{homeGroupId}/reports/{reportId}/review', [HomeGroupReportController::class, 'review']);
    Route::delete('/home-groups/{homeGroupId}/reports/{reportId}', [HomeGroupReportController::class, 'destroy']);

    // ── Reports ────────────────────────────────────────────────────────────────
    Route::get('/reports/history', [WeeklyReportController::class, 'history']);
    Route::get('/reports/pending', [WeeklyReportController::class, 'pendingReminders']);
    Route::post('/reports', [WeeklyReportController::class, 'store']);
    Route::get('/reports/{id}', [WeeklyReportController::class, 'show']);
    Route::put('/reports/{id}', [WeeklyReportController::class, 'update']);
    Route::post('/reports/{id}/remittance', [WeeklyReportController::class, 'submitRemittance']);

    // ── Activity Feed ──────────────────────────────────────────────────────────
    Route::get('/activities', [ActivityController::class, 'index']);

    // ── Notifications ──────────────────────────────────────────────────────────
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
    Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']); // support PUT too
    Route::patch('/notifications/read-all', [NotificationController::class, 'markAllRead']);
    Route::put('/notifications/read-all', [NotificationController::class, 'markAllRead']); // support PUT too
    Route::delete('/notifications/{id}', [NotificationController::class, 'destroy']);
    Route::delete('/notifications/clear-read', [NotificationController::class, 'clearRead']);

    // ── Messages ───────────────────────────────────────────────────────────────
    Route::get('/messages', [MessageController::class, 'index']);
    Route::get('/messages/{id}', [MessageController::class, 'show']);
    Route::post('/messages', [MessageController::class, 'store']);
    Route::delete('/messages/{id}', [MessageController::class, 'destroy']);

    // ── Prayer Center ──────────────────────────────────────────────────────────
    Route::prefix('prayer-center')->group(function () {
        Route::get('/categories', [PrayerCenterController::class, 'categories']);
        Route::get('/messages', [PrayerCenterController::class, 'index']);
        Route::post('/messages', [PrayerCenterController::class, 'store']);
        Route::get('/messages/{id}', [PrayerCenterController::class, 'show']);
        Route::post('/messages/{id}/reply', [PrayerCenterController::class, 'reply']);
        Route::post('/messages/{id}/status', [PrayerCenterController::class, 'updateStatus']);
        Route::get('/notifications', [PrayerCenterController::class, 'notifications']);

        Route::middleware('role:pastor')->group(function () {
            Route::get('/messages/flagged', [PrayerCenterController::class, 'flagged']);
            Route::get('/stats', [PrayerCenterController::class, 'stats']);
        });
    });

    // ── Department Requests ────────────────────────────────────────────────────
    Route::get('/department-request/my', [DepartmentRequestController::class, 'myRequest']);
    Route::delete('/department-request/cancel', [DepartmentRequestController::class, 'cancelRequest']);
    Route::delete('/department/leave', [DepartmentRequestController::class, 'leaveDepartment']);
    Route::get('/department-request/approvals', [DepartmentRequestController::class, 'pendingApprovals']);
    Route::put('/department-request/{id}/approve', [DepartmentRequestController::class, 'approveRequest']);
    Route::put('/department-request/{id}/reject', [DepartmentRequestController::class, 'rejectRequest']);

    // ── Department Management ───────────────────────────────────────────────────
    Route::get('/departments', [DepartmentController::class, 'index']);
    Route::get('/departments/{id}', [DepartmentController::class, 'show']);
    Route::post('/departments/{id}/assign-hod', [DepartmentController::class, 'assignHod']);
    Route::post('/departments/{id}/remove-hod', [DepartmentController::class, 'removeHod']);
    Route::post('/departments/{id}/accept-hod', [DepartmentController::class, 'acceptHod']);
    Route::post('/departments/{id}/decline-hod', [DepartmentController::class, 'declineHod']);
    Route::get('/departments/{id}/members', [DepartmentController::class, 'members']);
    Route::get('/departments/{id}/activities', [DepartmentController::class, 'activities']);
    Route::get('/departments/metrics', [DepartmentController::class, 'metrics']);
});
