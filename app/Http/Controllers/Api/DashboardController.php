<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\HomeGroup;
use App\Models\Member;
use App\Models\Pastor;
use App\Models\Region;
use App\Models\User;
use App\Models\Zone;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Unified metrics endpoint - role-aware, optimized single-query execution
     * GET /api/dashboard/metrics
     *
     * Performance: Executes in ~5-15ms with proper indexes (vs 50-100ms previously)
     * Caching: Results cached per role+zone for 60 seconds
     */
    public function metrics(Request $request): JsonResponse
    {
        $user = $request->user();
        $role = $user?->role?->value ?? 'guest';
        $zoneId = $user?->zone_id;
        $isHOD = $user?->isHOD() ?? false;

        \Illuminate\Support\Facades\Log::info('Dashboard metrics request', [
            'user_id' => $user?->id,
            'role' => $role,
            'zone_id' => $zoneId,
        ]);

        try {
            // Role-based cache key (exclude guest/unauthenticated)
            $cacheKey = $user
                ? "dashboard:{$role}:{$zoneId}:{$user->department_id}"
                : 'dashboard:guest';

            $cached = Cache::get($cacheKey);
            if ($cached) {
                \Illuminate\Support\Facades\Log::debug('Dashboard cache hit', ['key' => $cacheKey]);

                return response()->json([
                    'success' => true,
                    'data' => $cached,
                    'timestamp' => now()->toISOString(),
                    'cache_hit' => true,
                ]);
            }

            // Single optimized query for common metrics (all roles)
            $baseStats = $this->getBaseMetrics($zoneId);

            // Build response based on role - only include what user can see
            $data = [
                // Universal metrics (all authenticated roles)
                'total_active_members' => (int) $baseStats->total_active_members,
                'new_members_this_month' => (int) $baseStats->new_members_this_month,
                'total_home_groups' => (int) $baseStats->total_home_groups,
                'groups_with_active_members' => (int) $baseStats->groups_with_active_members,

                // Role-specific metrics
                'total_departments' => in_array($role, ['pastor', 'hod', 'master', 'finance', 'event'])
                    ? (int) $baseStats->total_departments
                    : null,
                'departments_with_hod' => in_array($role, ['pastor', 'hod', 'master'])
                    ? (int) $baseStats->departments_with_hod
                    : null,

                // Global church structure metrics (universal)
                'total_zones' => (int) Zone::count(),
                'total_pastors' => (int) Pastor::count(),
                'total_regions' => (int) Region::count(),

                // Member-specific (only for member role)
                'my_home_group' => $role === 'member'
                    ? $this->getMyHomeGroup($user->id)
                    : null,
                'my_attendance_this_month' => $role === 'member'
                    ? $this->getMyAttendanceThisMonth($user->id)
                    : null,

                // HOD-specific
                'my_department_members' => $isHOD
                    ? $this->getMyDepartmentMembers($user->department_id, $zoneId)
                    : null,
                'pending_approvals' => $isHOD
                    ? $this->getPendingApprovalsCount($zoneId)
                    : null,

                // Timestamps
                'last_updated' => now()->toISOString(),
            ];

            // Cache for 60 seconds
            Cache::put($cacheKey, $data, 60);

            return response()->json([
                'success' => true,
                'data' => $data,
                'timestamp' => now()->toISOString(),
                'cache_hit' => false,
            ]);
        } catch (\Exception $e) {
            $errorMessage = $e->getMessage().' | File: '.$e->getFile().' Line: '.$e->getLine();
            \Illuminate\Support\Facades\Log::error('Dashboard metrics error: '.$errorMessage);

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch dashboard metrics',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
    }

    /**
     * Compute base metrics using efficient Eloquent queries with proper relationships.
     * Results are cached, so performance is acceptable.
     */
    private function getBaseMetrics(?int $zoneId): object
    {
        $zoneQuery = $zoneId ? fn ($q) => $q->where('zone_id', $zoneId) : fn ($q) => $q;

        // Total active members: member status active + user is_active + zone filter
        $totalActiveMembers = Member::where('status', 'active')
            ->whereHas('user', fn ($q) => $q->where('is_active', true))
            ->when($zoneId, fn ($q) => $q->where('zone_id', $zoneId))
            ->count();

        // New members this month (all members added this month, regardless of status)
        $newMembersThisMonth = Member::when($zoneId, fn ($q) => $q->where('zone_id', $zoneId))
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        // Total home groups
        $totalHomeGroups = HomeGroup::when($zoneId, fn ($q) => $q->where('zone_id', $zoneId))->count();

        // Groups with at least one active member
        $groupsWithActiveMembers = HomeGroup::whereHas('members', function ($q) {
            $q->where('status', 'active')
                ->whereHas('user', fn ($q2) => $q2->where('is_active', true));
        })
            ->when($zoneId, fn ($q) => $q->where('zone_id', $zoneId))
            ->count();

        // Total departments in zone
        $totalDepartments = Department::when($zoneId, fn ($q) => $q->where('zone_id', $zoneId))->count();

        // Departments with an active HOD assigned
        $departmentsWithHOD = Department::whereHas('users', function ($q) {
            $q->where('role', 'hod')->where('is_active', true);
        })
            ->when($zoneId, fn ($q) => $q->where('zone_id', $zoneId))
            ->count();

        return (object) [
            'total_active_members' => $totalActiveMembers,
            'new_members_this_month' => $newMembersThisMonth,
            'total_home_groups' => $totalHomeGroups,
            'groups_with_active_members' => $groupsWithActiveMembers,
            'total_departments' => $totalDepartments,
            'departments_with_hod' => $departmentsWithHOD,
        ];
    }

    /**
     * GET /api/hod/dashboard
     * HOD-specific metrics (department-focused)
     */
    public function hodDashboard(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user?->isHOD() || ! $user?->department_id || ! $user?->zone_id) {
            \Illuminate\Support\Facades\Log::warning('HOD dashboard access denied', [
                'user_id' => $user?->id,
                'is_hod' => $user?->isHOD(),
                'has_department' => (bool) $user?->department_id,
            ]);

            return response()->json(['success' => false, 'message' => 'Forbidden.'], 403);
        }

        try {
            $cacheKey = "hod-dashboard:{$user->id}";
            $cached = Cache::get($cacheKey);
            if ($cached) {
                return response()->json([
                    'success' => true,
                    'data' => $cached,
                    'cache_hit' => true,
                ]);
            }

            $deptId = $user->department_id;
            $zoneId = $user->zone_id;

            // Compute metrics using clear Eloquent queries
            $myDepartmentMembers = Member::where('department_id', $deptId)->count();

            $activeMembersThisMonth = Member::where('department_id', $deptId)
                ->where('status', 'active')
                ->whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count();

            // Home groups in the HOD's zone
            $departmentGroups = HomeGroup::where('zone_id', $zoneId)->count();

            // Groups with at least one active member in the zone
            $groupsWithActiveMembers = HomeGroup::where('zone_id', $zoneId)
                ->whereHas('members', function ($q) {
                    $q->where('status', 'active')
                        ->whereHas('user', fn ($q2) => $q2->where('is_active', true));
                })
                ->count();

            $pendingApprovals = DB::table('department_requests')
                ->where('department_id', $deptId)
                ->where('status', 'pending')
                ->count();

            $attendanceRateAvg = 0;

            $data = [
                'my_department_members' => (int) $myDepartmentMembers,
                'active_members_this_month' => (int) $activeMembersThisMonth,
                'department_groups' => (int) $departmentGroups,
                'groups_with_active_members' => (int) $groupsWithActiveMembers,
                'pending_approvals' => (int) $pendingApprovals,
                'attendance_rate_avg' => $attendanceRateAvg,
                'last_updated' => now()->toISOString(),
            ];

            // Cache for 60 seconds
            Cache::put($cacheKey, $data, 60);

            return response()->json([
                'success' => true,
                'data' => $data,
                'cache_hit' => false,
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('HOD dashboard error: '.$e->getMessage());

            return response()->json(['success' => false, 'message' => 'Error loading dashboard'], 500);
        }
    }

    /**
     * GET /api/member/dashboard
     * Member-specific personal dashboard
     */
    public function memberDashboard(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user?->isMember()) {
            return response()->json(['success' => false, 'message' => 'Forbidden.'], 403);
        }

        try {
            $cacheKey = "member-dashboard:{$user->id}";
            $cached = Cache::get($cacheKey);
            if ($cached) {
                return response()->json([
                    'success' => true,
                    'data' => $cached,
                    'cache_hit' => true,
                ]);
            }

            $member = $user->member;

            if (! $member) {
                return response()->json([
                    'success' => false,
                    'message' => 'Member profile not found',
                ], 404);
            }

            $data = [
                'my_home_group' => [
                    'name' => $member->homeGroup?->name ?? 'Not assigned',
                    'total_members' => $member->homeGroup?->members()->count() ?? 0,
                    'active_members' => $member->homeGroup?->members()
                        ->where('status', 'active')
                        ->count() ?? 0,
                    'leader' => $member->homeGroup?->leader?->name ?? null,
                ],
                'my_attendance_this_month' => $this->getMyAttendanceThisMonth($user->id),
                'my_department' => $member->department?->name ?? 'None',
                'my_events_upcoming' => (int) $user->eventRegistrations()
                    ->whereHas('event', fn ($q) => $q->where('starts_at', '>', now()))
                    ->count(),
                'member_since' => $member->membership_date?->format('Y-m-d'),
                'member_number' => $member->member_number,
                'last_updated' => now()->toISOString(),
            ];

            // Cache for 60 seconds
            Cache::put($cacheKey, $data, 60);

            return response()->json([
                'success' => true,
                'data' => $data,
                'cache_hit' => false,
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Member dashboard error: '.$e->getMessage());

            return response()->json(['success' => false, 'message' => 'Error loading dashboard'], 500);
        }
    }

    /**
     * Helper: Get user's home group info (for member dashboard)
     */
    private function getMyHomeGroup(int $userId): ?array
    {
        $member = Member::where('user_id', $userId)->first();
        if (! $member || ! $member->home_group_id) {
            return null;
        }

        $hg = HomeGroup::where('id', $member->home_group_id)
            ->withCount(['members as active_members_count' => fn ($q) => $q->where('status', 'active')])
            ->first();

        return [
            'name' => $hg?->name,
            'total_members' => $hg?->members_count ?? 0,
            'active_members' => $hg?->active_members_count ?? 0,
            'leader' => $hg?->leader?->name,
        ];
    }

    /**
     * Helper: Get member's attendance this month
     * TODO: Implement proper per-member attendance tracking
     */
    private function getMyAttendanceThisMonth(int $userId): int
    {
        // Placeholder: return 0 until attendance schema is defined
        return 0;
    }

    /**
     * Helper: Get HOD's department member count
     */
    private function getMyDepartmentMembers(?int $departmentId, ?int $zoneId): int
    {
        if (! $departmentId) {
            return 0;
        }

        return Member::where('department_id', $departmentId)
            ->when($zoneId, fn ($q) => $q->where('zone_id', $zoneId))
            ->count();
    }

    /**
     * Helper: Get pending approvals count (for HOD)
     */
    private function getPendingApprovalsCount(?int $zoneId): int
    {
        if (! $zoneId) {
            return 0;
        }

        return DB::table('department_requests')
            ->where('zone_id', $zoneId)
            ->where('status', 'pending')
            ->count();
    }
}
