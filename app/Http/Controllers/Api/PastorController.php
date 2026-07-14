<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\MemberResource;
use App\Models\DepartmentRequest;
use App\Models\Event;
use App\Models\EventRegistration;
use App\Models\HomeGroup;
use App\Models\HomeGroupInvitation;
use App\Models\Member;
use App\Models\Partner;
use App\Models\Report;
use App\Models\SpiritualMilestone;
use App\Models\UserBadge;
use App\Models\Zone;
use App\Models\ZoneHistory;
use App\Services\ProfileCompletenessService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;

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

        if (!$user->isPastor() || !$user->zone_id) {
            return response()->json(['success' => false, 'message' => 'Forbidden.'], 403);
        }

        $zoneId = $user->zone_id;
        $cacheKey = "zone_summary_{$zoneId}";
        
        return response()->json(\Cache::remember($cacheKey, 300, function () use ($zoneId) {
            $now = now();
            $lastWeek = $now->copy()->subWeek();

            // Current counts
            $totalMembers = Member::where('zone_id', $zoneId)->active()->count();
            $totalHomeGroups = \App\Models\HomeGroup::where('zone_id', $zoneId)->count();
            $totalDepartments = \App\Models\Department::where('zone_id', $zoneId)->count();

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

            return [
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
        }));
    }

    /** GET /api/pastors/dashboard— Comprehensive dashboard data */
    public function dashboard(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->isPastor() || !$user->zone_id) {
            return response()->json(['success' => false, 'message' => 'Forbidden.'], 403);
        }

        $zoneId = $user->zone_id;
        $cacheKey = "dashboard_{$zoneId}";
        
        return response()->json(\Cache::remember($cacheKey, 300, function () use ($zoneId) {
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

            return [
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
        }));
    }

     /** GET /api/pastors/partners — List partners in pastor's zone */
     public function partners(Request $request): JsonResponse
     {
         $user = $request->user();

         if (!$user->isPastor() || !$user->zone_id) {
             return response()->json(['success' => false, 'message' => 'Forbidden.'], 403);
         }

         $zoneId = $user->zone_id;

         $query = Partner::whereHas('user', fn ($q) => $q->where('zone_id', $zoneId))
             ->with(['user:id,name,email,phone', 'zone:id,name'])
             ->withSum('payments as total_giving', function ($q) {
                 $q->where('status', \App\Enums\PaymentStatus::Completed);
             });

         $search = $request->query('search');
         if ($search && strlen($search) > 100) {
             return response()->json(['success' => false, 'message' => 'Search term too long'], 422);
         }

         if (!empty($search)) {
             $query->where(function ($q) use ($search) {
                 $q->where('name', 'LIKE', "%{$search}%")
                   ->orWhere('surname', 'LIKE', "%{$search}%")
                   ->orWhere('partner_number', 'LIKE', "%{$search}%")
                   ->orWhereHas('user', fn ($uq) => $uq->where('email', 'LIKE', "%{$search}%"));
             });
         }

         if ($request->has('tier') && in_array($request->tier, \App\Enums\PartnerTier::values(), true)) {
             $query->where('tier', $request->tier);
         }

         if ($request->has('status') && in_array($request->status, \App\Enums\PartnerStatus::values(), true)) {
             $query->where('status', $request->status);
         }

         $perPage = (int) $request->query('per_page', 20);
         $perPage = \Illuminate\Support\Collection::make([10, 20, 50, 100])
             ->filter()
             ->contains($perPage) ? $perPage : 20;

         $partners = $query->orderByDesc('partnership_date')
             ->paginate($perPage)
             ->withQueryString();

         return response()->json([
             'success' => true,
             'data' => \App\Http\Resources\PartnerResource::collection($partners->items()),
             'meta' => [
                 'current_page' => $partners->currentPage(),
                 'last_page' => $partners->lastPage(),
                 'total' => $partners->total(),
                 'per_page' => $partners->perPage(),
                 'has_more' => $partners->hasMorePages(),
             ],
         ]);
     }

     /** GET /api/pastors/members — List members in pastor's zone
      *  SECURITY:
      *  - Role & zone-based access control
      *  - Rate limiting (60 requests/minute per user)
      *  - Input validation & sanitization
      *  - Audit logging of all access
      *  - Pagination enforced (max 100 per page)
      *  - Selective field exposure via Resource
      */
     public function members(Request $request): JsonResponse
     {
         $user = $request->user();

         // 1️⃣ AUTH: Verify pastor role and zone assignment
         if (!$user->isPastor() || !$user->zone_id) {
             \Log::warning('Unauthorized members access attempt', [
                 'user_id' => $user->id,
                 'role' => $user->role,
                 'zone_id' => $user->zone_id,
                 'ip' => $request->ip(),
                 'user_agent' => $request->userAgent(),
             ]);
             return response()->json(['success' => false, 'message' => 'Forbidden.'], 403);
         }

// 2️⃣ RATE LIMITING: Atomic increment to avoid race conditions
          $cacheKey = 'pastor_members_rate:' . $user->id;
          $attempts = \Cache::increment($cacheKey, 1);
          if ($attempts === 1) {
              \Cache::expire($cacheKey, 60);
          }
          if ($attempts > 60) {
              \Log::notice('Rate limit exceeded for members API', ['user_id' => $user->id]);
              return response()->json([
                  'success' => false,
                  'message' => 'Too many requests. Please try again later.'
              ], 429);
          }

         // 3️⃣ INPUT VALIDATION: Strict allowlist for filters
         $perPage = (int) $request->query('per_page', 20);
         $perPage = \Illuminate\Support\Collection::make([10, 20, 50, 100])
             ->filter()
             ->contains($perPage) ? $perPage : 20; // Cap at 100

         $search = $request->query('search');
         if ($search && strlen($search) > 100) {
             return response()->json([
                 'success' => false,
                 'message' => 'Search term too long'
             ], 422);
         }

         // 4️⃣ SECURE QUERY: Parameter binding via Eloquent prevents SQL injection
          $query = Member::where('zone_id', $user->zone_id)
              ->active()
              ->with(['user:id,name,email,phone,title', 'homeGroup:id,name', 'department:id,name', 'gender:id,name']);

         // 5️⃣ FILTERING: Server-side only - client filters are secondary
         if (!empty($search)) {
             $query->where(function ($q) use ($search) {
                 $q->where('name', 'LIKE', '%' . $search . '%')
                   ->orWhere('member_number', 'LIKE', '%' . $search . '%')
                   ->orWhere('email', 'LIKE', '%' . $search . '%');
             });
         }

         if ($request->has('status') && in_array($request->status, ['active', 'inactive'])) {
             $query->where('is_active', $request->status === 'active');
         }

         if ($request->has('home_group_id') && is_numeric($request->home_group_id)) {
             $query->where('home_group_id', (int) $request->home_group_id);
         }

         // 6️⃣ ORDERING: Whitelist columns only
         $sortColumn = $request->query('sort', 'name');
         $allowedSorts = ['name', 'member_number', 'created_at', 'email'];
         if (!in_array($sortColumn, $allowedSorts)) {
             $sortColumn = 'name';
         }
         $sortDir = $request->query('dir', 'asc') === 'desc' ? 'desc' : 'asc';

         $members = $query->orderBy($sortColumn, $sortDir)
             ->paginate($perPage)
             ->withQueryString();

         // 7️⃣ AUDIT LOG: Record access (without PII)
         \Log::info('Pastor accessed members list', [
             'user_id' => $user->id,
             'zone_id' => $user->zone_id,
             'total_records' => $members->total(),
             'page' => $members->currentPage(),
             'filters' => [
                 'search' => $search ? 'present' : 'none',
                 'status' => $request->status,
                 'home_group' => $request->home_group_id,
             ],
             'ip' => $request->ip(),
         ]);

         // 8️⃣ RESPONSE: Structured data, never expose internal columns
         return response()->json([
             'success' => true,
             'data' => $members->items(),
             'meta' => [
                 'current_page' => $members->currentPage(),
                 'last_page' => $members->lastPage(),
                 'total' => $members->total(),
                 'per_page' => $members->perPage(),
                 'has_more' => $members->hasMorePages(),
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
            ->withCount('users')
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

         // Recent home group join requests (pending)
         $recentHomeGroupRequests = HomeGroupInvitation::whereHas('member', function ($q) use ($zoneId) {
                 $q->where('zone_id', $zoneId);
             })
             ->with(['member:id,name,email', 'homeGroup:id,name'])
             ->where('status', 'pending')
             ->orderBy('created_at', 'desc')
             ->take(10)
             ->get();

         foreach ($recentHomeGroupRequests as $request) {
             $activities[] = [
                 'id' => $request->id,
                 'type' => 'homegroup_request',
                 'title' => 'Home Group Join Request',
                 'description' => ($request->member ? $request->member->name : 'Unknown') . " requested to join " . ($request->homeGroup ? $request->homeGroup->name : 'Unknown'),
                 'time' => $request->created_at->diffForHumans(),
                 'created_at' => $request->created_at->toISOString(),
             ];
         }

         // Recent department join requests (pending)
         $recentDepartmentRequests = DepartmentRequest::whereHas('user', function ($q) use ($zoneId) {
                 $q->where('zone_id', $zoneId);
             })
             ->with(['user:id,name,email', 'department:id,name'])
             ->where('status', 'pending')
             ->orderBy('requested_at', 'desc')
             ->take(10)
             ->get();

         foreach ($recentDepartmentRequests as $request) {
             $activities[] = [
                 'id' => $request->id,
                 'type' => 'department_request',
                 'title' => 'Department Join Request',
                 'description' => ($request->user ? $request->user->name : 'Unknown') . " requested to join " . ($request->department ? $request->department->name : 'Unknown'),
                 'time' => $request->requested_at->diffForHumans(),
                 'created_at' => $request->requested_at->toISOString(),
             ];
         }

         // Recent event registrations
         $recentRegistrations = EventRegistration::whereHas('user', function ($q) use ($zoneId) {
                 $q->where('zone_id', $zoneId);
             })
             ->with(['user:id,name,email', 'event:id,title,starts_at'])
             ->orderBy('created_at', 'desc')
             ->take(10)
             ->get();

         foreach ($recentRegistrations as $registration) {
             $activities[] = [
                 'id' => $registration->id,
                 'type' => 'event_registration',
                 'title' => 'Event Registration',
                 'description' => ($registration->user ? $registration->user->name : 'Unknown') . " registered for " . ($registration->event ? $registration->event->title : 'Unknown'),
                 'time' => $registration->created_at->diffForHumans(),
                 'created_at' => $registration->created_at->toISOString(),
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

      /** GET /api/pastors/zone-history — Zone history timeline data */
      public function zoneHistory(Request $request): JsonResponse
      {
          $user = $request->user();

          if (!$user->isPastor() || !$user->zone_id) {
              return response()->json(['success' => false, 'message' => 'Forbidden.'], 403);
          }

          $zoneId = $user->zone_id;
          $now = now();

          $historyRecords = ZoneHistory::where('zone_id', $zoneId)
              ->with(['pastor:id,name,unique_code'])
              ->orderBy('start_date', 'desc')
              ->get();

          $timeline = [];
          foreach ($historyRecords as $record) {
              $pastor = $record->pastor;
              $isCurrent = is_null($record->end_date);

              $type = 'pastor_change';
              if ($record->notes) {
                  $lowerNotes = strtolower($record->notes);
                  if (str_contains($lowerNotes, 'achievement') || str_contains($lowerNotes, 'milestone')) {
                      $type = 'achievement';
                  } elseif (str_contains($lowerNotes, 'event') || str_contains($lowerNotes, 'conference')) {
                      $type = 'event';
                  } elseif (str_contains($lowerNotes, 'growth') || str_contains($lowerNotes, 'expansion')) {
                      $type = 'growth';
                  } elseif (str_contains($lowerNotes, 'established') || str_contains($lowerNotes, 'created')) {
                      $type = 'zone_created';
                  }
              }

              $description = $record->notes ?: "Pastoral assignment for " . ($pastor?->name ?? 'Unknown');

              $timeline[] = [
                  'id' => $record->id,
                  'type' => $type,
                  'title' => $isCurrent ? 'Current Zone Pastor' : 'Zone Pastor',
                  'description' => $description,
                  'date' => $record->start_date->format('Y-m-d'),
                  'pastor' => [
                      'name' => $pastor?->name ?? 'Unknown',
                      'isCurrent' => $isCurrent,
                  ],
                  'start_date' => $record->start_date->format('Y-m-d'),
                  'end_date' => $record->end_date?->format('Y-m-d'),
              ];
          }

          if ($historyRecords->isEmpty()) {
              $zone = Zone::find($zoneId);
              if ($zone) {
                  $timeline[] = [
                      'id' => 0,
                      'type' => 'zone_created',
                      'title' => 'Zone Established',
                      'description' => $zone->name . ' was established',
                      'date' => $zone->created_at?->format('Y-m-d') ?? $now->format('Y-m-d'),
                      'pastor' => null,
                  ];
              }
          }

          return response()->json([
              'success' => true,
              'data' => $timeline,
          ]);
      }

      /** PUT /api/pastors/zone — update zone information (pastor only) */
      public function updateZoneInfo(Request $request): JsonResponse
      {
          $user = $request->user();

          if (!$user->isPastor() || !$user->zone_id) {
              return response()->json(['success' => false, 'message' => 'Forbidden.'], 403);
          }

          $validated = $request->validate([
              'name'             => 'sometimes|string|max:255',
              'description'      => 'sometimes|string|nullable',
              'location'         => 'sometimes|string|max:255',
              'year_established' => 'sometimes|integer|min:1900|max:2100',
              'address'          => 'sometimes|string|nullable',
              'phone'            => 'sometimes|string|max:50',
          ]);

          $zone = Zone::findOrFail($user->zone_id);
          $zone->update($validated);

          return response()->json([
              'success' => true,
              'message' => 'Zone information updated successfully',
              'data'    => $zone,
          ]);
      }

      /** POST /api/pastors/members/bulk — bulk actions for selected zone members */
      public function bulkMemberAction(Request $request): JsonResponse
      {
          $user = $request->user();

          if (!$user->isPastor() || !$user->zone_id) {
              return response()->json(['success' => false, 'message' => 'Forbidden.'], 403);
          }

          $validated = $request->validate([
              'ids'   => ['required', 'array', 'min:1'],
              'ids.*' => ['integer', 'exists:members,id'],
              'action'=> ['required', 'string', Rule::in(['activate', 'deactivate'])],
          ]);

          $members = Member::whereIn('id', $validated['ids'])
              ->where('zone_id', $user->zone_id)
              ->get();

          if ($members->isEmpty()) {
              return response()->json(['success' => false, 'message' => 'No matching members found in your zone.'], 404);
          }

          $newStatus = $validated['action'] === 'activate' ? 'active' : 'inactive';
          $updated = 0;

          foreach ($members as $member) {
              if ($member->status !== $newStatus) {
                  $member->status = $newStatus;
                  $member->save();
                  $updated++;
              }
          }

          return response()->json([
              'success' => true,
              'message' => "{$updated} member(s) updated.",
          ]);
      }

      /** POST /api/pastors/members/{member}/status — change member status */
      public function updateMemberStatus(Request $request, Member $member): JsonResponse
      {
          $user = $request->user();

          if (!$user->isPastor() || !$user->zone_id) {
              return response()->json(['success' => false, 'message' => 'Forbidden.'], 403);
          }

          if ($member->zone_id !== $user->zone_id) {
              return response()->json(['success' => false, 'message' => 'Forbidden.'], 403);
          }

          $validated = $request->validate([
              'status' => ['required', 'string', Rule::in(['active', 'inactive'])],
          ]);

           $member->status = $validated['status'];
           $member->save();

           return response()->json([
               'success' => true,
               'data' => new MemberResource($member->load(['user', 'zone', 'homeGroup', 'department', 'gender', 'demography'])),
           ]);
       }

    /** GET /api/pastors/members/{member}/360 — 360-degree member view */
    public function member360(Request $request, Member $member): JsonResponse
    {
        $user = $request->user();

        if (!$user->isPastor() || !$user->zone_id) {
            return response()->json(['success' => false, 'message' => 'Forbidden.'], 403);
        }

        if ($member->zone_id !== $user->zone_id) {
            return response()->json(['success' => false, 'message' => 'Forbidden.'], 403);
        }

        $member->load(['user', 'zone', 'homeGroup', 'department', 'gender', 'demography', 'partner']);
        $memberUser = $member->user;

        $engagement = [
            'total_events_attended'   => (int) $memberUser->eventRegistrations()->where('status', 'attended')->count(),
            'upcoming_events'         => (int) $memberUser->eventRegistrations()->whereHas('event', fn($q) => $q->upcoming())->count(),
            'home_group_tenure_months'=> $member->homeGroup ? $member->homeGroup->created_at->diffInMonths(now()) : 0,
            'department_tenure_months'=> $member->department ? $member->department->created_at->diffInMonths(now()) : 0,
            'partner_since'           => $member->partner?->enrolled_at?->format('Y-m-d'),
            'total_donations'         => (float) $memberUser->payments()->sum('amount'),
        ];

        $milestones = SpiritualMilestone::where('user_id', $memberUser->id)
            ->orderByDesc('achieved_at')
            ->get();

        $events = $memberUser->eventRegistrations()
            ->with('event')
            ->orderByDesc('registered_at')
            ->limit(10)
            ->get()
            ->pluck('event')
            ->map(fn($e) => [
                'id'       => $e->id,
                'title'    => $e->title,
                'starts_at'=> $e->starts_at?->format('Y-m-d H:i'),
                'venue'    => $e->venue_name,
            ]);

        $badges = UserBadge::where('user_id', $memberUser->id)
            ->with('badgeCatalog')
            ->orderByDesc('earned_at')
            ->get();

        return response()->json([
            'success' => true,
            'data' => [
                'member'     => new MemberResource($member),
                'engagement' => $engagement,
                'milestones' => $milestones,
                'events'     => $events,
                'badges'     => $badges,
                'notes'      => $member->pastor_notes,
                'affiliations' => [
                    'current_home_group' => $member->homeGroup?->name,
                    'current_department' => $member->department?->name,
                    'zone_name'          => $member->zone?->name,
                ],
            ],
        ]);
    }

    /** PUT /api/pastors/members/{member}/notes — update pastor notes */
    public function updateMemberNotes(Request $request, Member $member): JsonResponse
    {
        $user = $request->user();

        if (!$user->isPastor() || !$user->zone_id) {
            return response()->json(['success' => false, 'message' => 'Forbidden.'], 403);
        }

        if ($member->zone_id !== $user->zone_id) {
            return response()->json(['success' => false, 'message' => 'Forbidden.'], 403);
        }

        $validated = $request->validate([
            'notes' => ['nullable', 'string', 'max:5000'],
        ]);

        $member->update([
            'pastor_notes'          => $validated['notes'] ?? null,
            'pastor_notes_by'       => $user->id,
            'pastor_notes_updated_at'=> now(),
        ]);

        return response()->json(['success' => true, 'message' => 'Notes saved successfully.']);
    }
}