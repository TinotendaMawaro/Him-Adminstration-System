<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\MemberResource;
use App\Models\Event;
use App\Models\HomeGroup;
use App\Models\Member;
use App\Models\Report;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PastorController extends Controller
{
    /** GET /api/pastors/me */
    public function me(Request $request): JsonResponse
    {
        $pastor = $request->user()->pastor()
            ->with(['zone.region.country'])
            ->first();

        if (!$pastor) {
            return response()->json(['success' => false, 'message' => 'Pastor profile not found.'], 404);
        }

        return response()->json([
            'success' => true,
            'data'    => new \App\Http\Resources\PastorResource($pastor),
        ]);
    }

    /** GET /api/pastors/zone-summary  — zone stats for pastor dashboard */
    public function zoneSummary(Request $request): JsonResponse
    {
        $user = $request->user();

        \Log::info('Zone summary request', [
            'user_id' => $user->id,
            'user_role' => $user->role,
            'user_zone_id' => $user->zone_id,
            'is_pastor' => $user->isPastor(),
        ]);

        if (!$user->isPastor() || !$user->zone_id) {
            \Log::warning('Zone summary access denied', [
                'user_id' => $user->id,
                'is_pastor' => $user->isPastor(),
                'zone_id' => $user->zone_id,
            ]);
            return response()->json(['success' => false, 'message' => 'Forbidden.'], 403);
        }

        $zoneId = $user->zone_id;
        $now = now();
        $lastWeek = $now->copy()->subWeek();

        // Current counts
        $totalMembers = Member::where('zone_id', $zoneId)->active()->count();
        $totalHomeGroups = \App\Models\HomeGroup::where('zone_id', $zoneId)->count();
        $totalDepartments = \App\Models\Department::where('zone_id', $zoneId)->count();

        \Log::info('Zone summary counts', [
            'zone_id' => $zoneId,
            'total_members' => $totalMembers,
            'total_home_groups' => $totalHomeGroups,
            'total_departments' => $totalDepartments,
        ]);

        // Last week counts (for trend)
        $membersLastWeek = Member::where('zone_id', $zoneId)
            ->active()
            ->where('created_at', '<', $lastWeek)
            ->count();

        $homeGroupsLastWeek = \App\Models\HomeGroup::where('zone_id', $zoneId)
            ->where('created_at', '<', $lastWeek)
            ->count();

        $departmentsLastWeek = \App\Models\Department::where('zone_id', $zoneId)
            ->where('created_at', '<', $lastWeek)
            ->count();

        // Calculate percentage changes
        $memberTrend = $membersLastWeek > 0 ? round((($totalMembers - $membersLastWeek) / $membersLastWeek) * 100, 1) : 0;
        $homeGroupTrend = $homeGroupsLastWeek > 0 ? round((($totalHomeGroups - $homeGroupsLastWeek) / $homeGroupsLastWeek) * 100, 1) : 0;
        $departmentTrend = $departmentsLastWeek > 0 ? round((($totalDepartments - $departmentsLastWeek) / $departmentsLastWeek) * 100, 1) : 0;

        $response = [
            'success' => true,
            'data'    => [
                'total_members'       => $totalMembers,
                'member_trend'        => $memberTrend,
                'total_home_groups'   => $totalHomeGroups,
                'home_group_trend'    => $homeGroupTrend,
                'total_departments'   => $totalDepartments,
                'department_trend'    => $departmentTrend,
                'new_members_month'   => Member::where('zone_id', $zoneId)
                    ->whereMonth('membership_date', $now->month)
                    ->whereYear('membership_date', $now->year)
                    ->count(),
            ],
        ];

        \Log::info('Zone summary response', $response);

        return response()->json($response);
    }

    /** GET /api/pastors/dashboard — Comprehensive dashboard data */
    public function dashboard(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->isPastor() || !$user->zone_id) {
            return response()->json(['success' => false, 'message' => 'Forbidden.'], 403);
        }

        $zoneId = $user->zone_id;
        $now = now();
        $startOfMonth = $now->copy()->startOfMonth();
        $startOfYear = $now->copy()->startOfYear();

        // Member statistics
        $totalMembers = Member::where('zone_id', $zoneId)->active()->count();
        $newMembersThisMonth = Member::where('zone_id', $zoneId)
            ->active()
            ->where('membership_date', '>=', $startOfMonth)
            ->count();
        $newMembersThisYear = Member::where('zone_id', $zoneId)
            ->active()
            ->where('membership_date', '>=', $startOfYear)
            ->count();

        // Home group statistics
        $totalHomeGroups = HomeGroup::where('zone_id', $zoneId)->count();
        // All home groups are considered active (no is_active column)
        $activeHomeGroups = $totalHomeGroups;

        // Department count
        $totalDepartments = \App\Models\Department::where('zone_id', $zoneId)->count();

        // Upcoming events
        $upcomingEvents = Event::where('zone_id', $zoneId)
            ->published()
            ->upcoming()
            ->take(5)
            ->get(['id', 'title', 'type', 'starts_at', 'venue_name']);

        // Recent weekly reports
        $recentReports = Report::where('zone_id', $zoneId)
            ->orderBy('report_date', 'desc')
            ->take(5)
            ->get(['id', 'report_date', 'week_number', 'year', 'attendance', 'new_members']);

        // Attendance from recent reports
        $totalAttendance = Report::where('zone_id', $zoneId)
            ->where('report_date', '>=', $startOfMonth)
            ->sum('attendance');

        // Gender breakdown - use SQL aggregation instead of loading all members
        $membersByGender = Member::where('zone_id', $zoneId)
            ->active()
            ->select('gender_id')
            ->selectRaw('COUNT(*) as count')
            ->groupBy('gender_id')
            ->get()
            ->mapWithKeys(function ($item) {
                $genderName = \App\Models\Gender::find($item->gender_id)?->name ?? 'Unknown';
                return [$genderName => $item->count];
            });

        $response = [
            'success' => true,
            'data' => [
                'members' => [
                    'total' => $totalMembers,
                    'new_this_month' => $newMembersThisMonth,
                    'new_this_year' => $newMembersThisYear,
                    'by_gender' => $membersByGender,
                ],
                'home_groups' => [
                    'total' => $totalHomeGroups,
                    'active' => $activeHomeGroups,
                ],
                'departments' => [
                    'total' => $totalDepartments,
                ],
                'attendance' => [
                    'this_month' => $totalAttendance,
                ],
                'upcoming_events' => $upcomingEvents->map(fn($e) => [
                    'id' => $e->id,
                    'title' => $e->title,
                    'type' => $e->type->value,
                    'starts_at' => $e->starts_at?->format('Y-m-d H:i'),
                    'venue' => $e->venue_name,
                ]),
                'recent_reports' => $recentReports->map(fn($r) => [
                    'id' => $r->id,
                    'report_date' => $r->report_date?->format('Y-m-d'),
                    'week_number' => $r->week_number,
                    'year' => $r->year,
                    'attendance' => $r->attendance,
                    'new_members' => $r->new_members,
                ]),
            ],
        ];

        \Log::info('Dashboard response', ['user_id' => $user->id, 'zone_id' => $zoneId]);

        return response()->json($response);
    }

    /** GET /api/pastors/members — List members in pastor's zone */
    public function members(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->isPastor() || !$user->zone_id) {
            return response()->json(['success' => false, 'message' => 'Forbidden.'], 403);
        }

        $members = Member::where('zone_id', $user->zone_id)
            ->active()
            ->with(['homeGroup', 'department', 'gender'])
            ->orderBy('name')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $members->items(),
            'meta' => [
                'current_page' => $members->currentPage(),
                'last_page' => $members->lastPage(),
                'total' => $members->total(),
            ],
        ]);
    }

    /** GET /api/pastors/home-groups — List home groups in pastor's zone */
    public function homeGroups(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->isPastor() || !$user->zone_id) {
            return response()->json(['success' => false, 'message' => 'Forbidden.'], 403);
        }

        $homeGroups = HomeGroup::where('zone_id', $user->zone_id)
            ->with(['leader', 'zone'])
            ->withCount('members')
            ->orderBy('name')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $homeGroups->items(),
            'meta' => [
                'current_page' => $homeGroups->currentPage(),
                'last_page' => $homeGroups->lastPage(),
                'total' => $homeGroups->total(),
            ],
        ]);
    }

    /** GET /api/pastors/activities — Recent activities in the zone */
    public function activities(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->isPastor() || !$user->zone_id) {
            return response()->json(['success' => false, 'message' => 'Forbidden.'], 403);
        }

        $zoneId = $user->zone_id;
        $activities = [];

        // Recent new members (last 30 days)
        $recentMembers = Member::where('zone_id', $zoneId)
            ->active()
            ->where('created_at', '>=', now()->subDays(30))
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get();

        foreach ($recentMembers as $member) {
            $activities[] = [
                'id' => $member->id,
                'type' => 'new_member',
                'title' => 'New Member Registered',
                'description' => "{$member->name} {$member->surname} joined",
                'time' => $member->created_at->diffForHumans(),
                'created_at' => $member->created_at->toISOString(),
            ];
        }

        // Recent reports
        $recentReports = Report::where('zone_id', $zoneId)
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get();

        foreach ($recentReports as $report) {
            $activities[] = [
                'id' => $report->id,
                'type' => 'weekly_report',
                'title' => 'Weekly Report Submitted',
                'description' => "Week {$report->week_number} - Attendance: {$report->attendance}",
                'time' => $report->created_at->diffForHumans(),
                'created_at' => $report->created_at->toISOString(),
            ];
        }

        // Recent events
        $recentEvents = Event::where('zone_id', $zoneId)
            ->orderBy('starts_at', 'desc')
            ->take(10)
            ->get();

        foreach ($recentEvents as $event) {
            $activities[] = [
                'id' => $event->id,
                'type' => 'event',
                'title' => $event->type->getLabel() . ' Scheduled',
                'description' => $event->title,
                'time' => $event->starts_at?->diffForHumans() ?? 'TBD',
                'created_at' => $event->created_at->toISOString(),
            ];
        }

        // Sort all activities by date
        usort($activities, fn($a, $b) => 
            strtotime($b['created_at']) - strtotime($a['created_at'])
        );

        return response()->json([
            'success' => true,
            'data' => array_slice($activities, 0, 20),
        ]);
    }
}
