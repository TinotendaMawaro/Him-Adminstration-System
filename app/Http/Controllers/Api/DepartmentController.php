<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\User;
use App\Models\Activity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;

class DepartmentController extends Controller
{
    /**
     * Get all departments with statistics
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->get('per_page', 12);

        $departments = Department::with(['hodUser', 'zone'])
            ->withCount(['activeMembers', 'activities'])
            ->orderBy('name')
            ->paginate($perPage);

        $departments->getCollection()->transform(function ($dept) {
            return [
                'id' => $dept->id,
                'name' => $dept->name,
                'description' => $dept->description,
                'color' => $dept->color,
                'zone_id' => $dept->zone_id,
                'zone' => $dept->zone ? [
                    'id' => $dept->zone->id,
                    'name' => $dept->zone->name,
                ] : null,
                'hod_id' => $dept->hod_id,
                'hod_status' => $dept->hod_status,
                'hod_assigned_at' => $dept->hod_assigned_at,
                'hod_accepted_at' => $dept->hod_accepted_at,
                'hod' => $dept->hodUser ? [
                    'id' => $dept->hodUser->id,
                    'name' => $dept->hodUser->name,
                    'email' => $dept->hodUser->email,
                ] : null,
                'members_count' => $dept->active_members_count,
                'activities_count' => $dept->activities_count,
                'created_at' => $dept->created_at,
            ];
        });

        return response()->json([
            'success' => true,
            'departments' => $departments->items(),
            'meta' => [
                'current_page' => $departments->currentPage(),
                'last_page' => $departments->lastPage(),
                'per_page' => $departments->perPage(),
                'total' => $departments->total(),
            ],
        ]);
    }

    /**
     * Get single department with full details
     */
    public function show(int $id): JsonResponse
    {
        $department = Department::with([
            'hodUser',
            'zone',
            'members' => function ($q) {
                $q->wherePivot('status', 'active');
            },
            'activities' => function ($q) {
                $q->orderBy('created_at', 'desc')->limit(10);
            },
        ])->find($id);

        if (!$department) {
            return response()->json([
                'success' => false,
                'message' => 'Department not found.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'department' => [
                'id' => $department->id,
                'name' => $department->name,
                'description' => $department->description,
                'color' => $department->color,
                'zone' => $department->zone ? [
                    'id' => $department->zone->id,
                    'name' => $department->zone->name,
                ] : null,
                'hod' => $department->hodUser ? [
                    'id' => $department->hodUser->id,
                    'name' => $department->hodUser->name,
                    'email' => $department->hodUser->email,
                    'status' => $department->hod_status,
                    'assigned_at' => $department->hod_assigned_at,
                    'accepted_at' => $department->hod_accepted_at,
                ] : null,
                'members' => $department->members->map(function ($member) {
                    return [
                        'id' => $member->id,
                        'name' => $member->name,
                        'email' => $member->email,
                        'role' => $member->pivot->role,
                        'joined_at' => $member->pivot->joined_at,
                    ];
                }),
                'activities' => $department->activities->map(function ($activity) {
                    return [
                        'id' => $activity->id,
                        'title' => $activity->title,
                        'description' => $activity->description,
                        'type' => $activity->type,
                        'status' => $activity->status,
                        'date' => $activity->date,
                        'time' => $activity->time,
                        'location' => $activity->location,
                        'created_by' => $activity->creator ? [
                            'id' => $activity->creator->id,
                            'name' => $activity->creator->name,
                        ] : null,
                        'created_at' => $activity->created_at,
                    ];
                }),
                'stats' => [
                    'total_members' => $department->members()->count(),
                    'active_members' => $department->activeMembers()->count(),
                    'total_activities' => $department->activities()->count(),
                ],
                'created_at' => $department->created_at,
                'updated_at' => $department->updated_at,
            ],
        ]);
    }

    /**
     * Get eligible entities (members or groups) for HOD assignment
     */
    public function getEligibleEntities(Request $request): JsonResponse
    {
        $user = $request->user();
        $search = $request->get('search', '');
        $type = $request->get('type', 'members'); // 'members' or 'groups'

        // Authorization: Only Master, Finance, Event, or Pastor can search
        if (!$user->isMaster() && !$user->isFinance() && !$user->isEventRole() && !$user->isPastor()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized.',
            ], 403);
        }

        if ($type === 'members') {
            // Search for eligible members
            $members = \App\Models\Member::with(['user', 'zone', 'homeGroup'])
                ->where('status', 'active')
                ->whereHas('user', function ($q) {
                    $q->where('is_active', true)
                      ->where('role', 'member'); // Only regular members, not existing HODs
                })
                ->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('surname', 'like', "%{$search}%")
                      ->orWhereHas('user', function ($uq) use ($search) {
                          $uq->where('name', 'like', "%{$search}%")
                             ->orWhere('email', 'like', "%{$search}%");
                      });
                })
                ->limit(20)
                ->get()
                ->map(function ($member) {
                    return [
                        'id' => $member->id,
                        'name' => $member->name . ' ' . $member->surname,
                        'zone_name' => $member->zone?->name ?? 'Unknown Zone',
                        'home_group_name' => $member->homeGroup?->name ?? null,
                        'membership_date' => $member->membership_date?->format('M Y'),
                        'user_id' => $member->user_id,
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $members,
            ]);

        } elseif ($type === 'groups') {
            // Search for eligible home groups
            $groups = \App\Models\HomeGroup::with(['zone', 'members'])
                ->withCount('members')
                ->where('name', 'like', "%{$search}%")
                ->whereHas('members', function ($q) {
                    $q->where('status', 'active');
                }, '>=', 1) // Must have at least 1 active member
                ->limit(20)
                ->get()
                ->map(function ($group) {
                    return [
                        'id' => $group->id,
                        'name' => $group->name,
                        'zone_name' => $group->zone?->name ?? 'Unknown Zone',
                        'member_count' => $group->members_count,
                        'leader_name' => $group->leader?->name ?? 'No Leader',
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $groups,
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Invalid entity type.',
        ], 400);
    }

    /**
     * Assign HOD to department via entity (member or group)
     */
    public function assignHodEntity(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'entity_type' => 'required|in:members,groups',
            'entity_id' => 'required|integer',
            'department_id' => 'required|exists:departments,id',
            'notes' => 'nullable|string|max:500',
        ]);

        $user = $request->user();

        // Authorization: Only Master, Finance, Event, or Pastor can assign
        if (!$user->isMaster() && !$user->isFinance() && !$user->isEventRole() && !$user->isPastor()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only admins, pastors, or event coordinators can assign HODs.',
            ], 403);
        }

        $department = Department::find($validated['department_id']);
        if (!$department) {
            return response()->json([
                'success' => false,
                'message' => 'Department not found.',
            ], 404);
        }

        DB::transaction(function () use ($validated, $department, $user) {
            if ($validated['entity_type'] === 'members') {
                // Assign to member - find/create user account
                $member = \App\Models\Member::find($validated['entity_id']);
                if (!$member) {
                    throw new \Exception('Member not found.');
                }

                $hodUser = $member->user;
                if (!$hodUser) {
                    throw new \Exception('Member has no associated user account.');
                }

                // Check if already HOD of this department
                if ($department->hod_id === $hodUser->id && $department->hod_status === 'accepted') {
                    throw new \Exception('This member is already the HOD of this department.');
                }

            } elseif ($validated['entity_type'] === 'groups') {
                // Assign to group - create new HOD user account for the group
                $group = \App\Models\HomeGroup::find($validated['entity_id']);
                if (!$group) {
                    throw new \Exception('Group not found.');
                }

                // Create a new user account for the group HOD
                $hodUser = User::create([
                    'name' => $group->name . ' HOD',
                    'email' => 'hod.' . $group->id . '@church.local',
                    'password' => bcrypt(\Illuminate\Support\Str::random(16)),
                    'role' => 'hod',
                    'zone_id' => $group->zone_id,
                    'is_active' => true,
                    'terms_accepted' => true,
                    'terms_accepted_at' => now(),
                ]);

                // Create member profile
                \App\Models\Member::create([
                    'user_id' => $hodUser->id,
                    'name' => $group->name,
                    'surname' => 'HOD',
                    'status' => 'active',
                    'zone_id' => $group->zone_id,
                    'home_group_id' => $group->id,
                    'membership_date' => now(),
                ]);

                Log::info('Group-based HOD user created', [
                    'group_id' => $group->id,
                    'user_id' => $hodUser->id,
                    'department_id' => $department->id,
                ]);
            }

            // Cancel any pending assignments
            if ($department->hod_id && $department->hod_status === 'pending') {
                $previousHod = User::find($department->hod_id);
                if ($previousHod) {
                    $previousHod->notifications()->create([
                        'title' => 'HOD Assignment Cancelled',
                        'message' => "Your appointment as HOD for {$department->name} has been cancelled.",
                        'type' => 'department',
                        'category' => 'hod_cancelled',
                    ]);
                }
            }

            // Assign HOD
            $department->assignHod($hodUser, $validated['notes'] ?? null);

            // Send notification to HOD
            $hodUser->notifications()->create([
                'title' => 'HOD Appointment',
                'message' => "You have been appointed as Head of Department for {$department->name}.",
                'type' => 'department',
                'category' => 'hod_appointed',
            ]);

            // Audit log
            \App\Models\AuditLog::create([
                'user_id' => $hodUser->id,
                'action' => 'hod_entity_assignment',
                'actor_id' => $user->id,
                'details' => [
                    'entity_type' => $validated['entity_type'],
                    'entity_id' => $validated['entity_id'],
                    'department_id' => $department->id,
                    'hod_code' => $hodUser->hod_code,
                ]
            ]);

            Log::info('HOD assigned via entity', [
                'entity_type' => $validated['entity_type'],
                'entity_id' => $validated['entity_id'],
                'department_id' => $department->id,
                'hod_user_id' => $hodUser->id,
                'assigned_by' => $user->id,
            ]);
        });

        return response()->json([
            'success' => true,
            'message' => 'HOD assigned successfully via ' . $validated['entity_type'] . '.',
            'department' => [
                'id' => $department->id,
                'hod_id' => $department->hod_id,
                'hod_status' => $department->hod_status,
            ],
        ]);
    }

    /**
     * Assign HOD to department (Pastors & Master only) - Legacy method
     */
    public function assignHod(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'notes' => 'nullable|string|max:500',
        ]);

        $user = $request->user();

        // Authorization: Only Master, Finance, Event, or Pastor can assign
        if (!$user->isMaster() && !$user->isFinance() && !$user->isEventRole() && !$user->isPastor()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only admins, pastors, or event coordinators can assign HODs.',
            ], 403);
        }

        $department = Department::find($id);
        if (!$department) {
            return response()->json([
                'success' => false,
                'message' => 'Department not found.',
            ], 404);
        }

        $hodUser = User::find($validated['user_id']);

        // Check if user is a valid HOD candidate (must be HOD, Pastor, or Member role)
        if (!$hodUser->isHOD() && !$hodUser->isPastor() && !$hodUser->isMember()) {
            return response()->json([
                'success' => false,
                'message' => 'Only users with HOD, Pastor, or Member roles can be appointed as HOD.',
            ], 400);
        }

        // Check if already HOD of this department
        if ($department->hod_id === $hodUser->id && $department->hod_status === 'accepted') {
            return response()->json([
                'success' => false,
                'message' => 'This user is already the HOD of this department.',
            ], 400);
        }

        // If there was a pending assignment, cancel it first
        if ($department->hod_id && $department->hod_status === 'pending') {
            // Notify previous HOD candidate that assignment was cancelled
            $previousHod = User::find($department->hod_id);
            if ($previousHod) {
                $previousHod->notifications()->create([
                    'title' => 'HOD Assignment Cancelled',
                    'message' => "Your appointment as HOD for {$department->name} has been cancelled by an administrator.",
                    'type' => 'department',
                    'category' => 'hod_cancelled',
                ]);
            }
        }

        // Assign HOD
        $department->assignHod($hodUser, $validated['notes'] ?? null);

        // Send notification to HOD candidate
        $hodUser->notifications()->create([
            'title' => 'HOD Appointment Invitation',
            'message' => "You have been appointed as Head of Department for {$department->name}. Please accept or decline this appointment.",
            'type' => 'department',
            'category' => 'hod_invitation',
        ]);

        // Notify pastors and admins about the new assignment
        $admins = User::whereIn('role', ['master', 'finance', 'event'])->get();
        foreach ($admins as $admin) {
            if ($admin->id !== $user->id) {
                $admin->notifications()->create([
                    'title' => 'HOD Assigned',
                    'message' => "{$user->name} assigned {$hodUser->name} as HOD for {$department->name}.",
                    'type' => 'department',
                    'category' => 'hod_assigned',
                ]);
            }
        }

        Log::info('HOD assigned', [
            'department_id' => $id,
            'department_name' => $department->name,
            'hod_user_id' => $hodUser->id,
            'hod_user_name' => $hodUser->name,
            'assigned_by' => $user->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'HOD invitation sent successfully.',
            'department' => [
                'id' => $department->id,
                'hod_id' => $department->hod_id,
                'hod_status' => $department->hod_status,
                'hod_assigned_at' => $department->hod_assigned_at,
            ],
        ]);
    }

    /**
     * HOD accepts appointment
     */
    public function acceptHod(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        $department = Department::find($id);
        if (!$department) {
            return response()->json([
                'success' => false,
                'message' => 'Department not found.',
            ], 404);
        }

        // Verify user is the assigned HOD
        if ($department->hod_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'You are not the assigned HOD for this department.',
            ], 403);
        }

        // Verify status is pending
        if ($department->hod_status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'This appointment is not pending.',
            ], 400);
        }

        $department->acceptHod();

        // Notify admins and pastors
        $notifyUsers = User::whereIn('role', ['master', 'finance', 'event', 'pastor'])->get();
        foreach ($notifyUsers as $notifyUser) {
            $notifyUser->notifications()->create([
                'title' => 'HOD Appointment Accepted',
                'message' => "{$user->name} has accepted the appointment as HOD for {$department->name}.",
                'type' => 'department',
                'category' => 'hod_accepted',
            ]);
        }

        Log::info('HOD accepted', [
            'department_id' => $id,
            'hod_user_id' => $user->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'HOD appointment accepted successfully.',
            'department' => [
                'id' => $department->id,
                'hod_status' => $department->hod_status,
                'hod_accepted_at' => $department->hod_accepted_at,
            ],
        ]);
    }

    /**
     * HOD declines appointment
     */
    public function declineHod(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'reason' => 'nullable|string|max:500',
        ]);

        $user = $request->user();

        $department = Department::find($id);
        if (!$department) {
            return response()->json([
                'success' => false,
                'message' => 'Department not found.',
            ], 404);
        }

        // Verify user is the assigned HOD
        if ($department->hod_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'You are not the assigned HOD for this department.',
            ], 403);
        }

        // Verify status is pending
        if ($department->hod_status !== 'pending') {
            return response()->json([
                'success' => false,
                'message' => 'This appointment is not pending.',
            ], 400);
        }

        $department->declineHod();

        // Notify admins and pastors
        $notifyUsers = User::whereIn('role', ['master', 'finance', 'event', 'pastor'])->get();
        foreach ($notifyUsers as $notifyUser) {
            $notifyUser->notifications()->create([
                'title' => 'HOD Appointment Declined',
                'message' => "{$user->name} declined the appointment as HOD for {$department->name}." .
                    ($validated['reason'] ? " Reason: {$validated['reason']}" : ''),
                'type' => 'department',
                'category' => 'hod_declined',
            ]);
        }

        Log::info('HOD declined', [
            'department_id' => $id,
            'hod_user_id' => $user->id,
            'reason' => $validated['reason'] ?? null,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'HOD appointment declined.',
            'department' => [
                'id' => $department->id,
                'hod_id' => null,
                'hod_status' => null,
            ],
        ]);
    }

    /**
     * Remove HOD (Demote) - Admin/Pastor only
     */
    public function removeHod(Request $request, int $id): JsonResponse
    {
        $user = $request->user();

        if (!$user->isMaster() && !$user->isFinance() && !$user->isEventRole() && !$user->isPastor()) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Only admins and pastors can remove HODs.',
            ], 403);
        }

        $department = Department::find($id);
        if (!$department) {
            return response()->json([
                'success' => false,
                'message' => 'Department not found.',
            ], 404);
        }

        if (!$department->hasHod()) {
            return response()->json([
                'success' => false,
                'message' => 'This department has no active HOD.',
            ], 400);
        }

        $previousHod = $department->hodUser;
        $department->removeHod();

        // Notify the removed HOD
        if ($previousHod) {
            $previousHod->notifications()->create([
                'title' => 'HOD Role Removed',
                'message' => "You have been removed as HOD of {$department->name} by {$user->name}.",
                'type' => 'department',
                'category' => 'hod_removed',
            ]);
        }

        // Notify admins and pastors
        $notifyUsers = User::whereIn('role', ['master', 'finance', 'event', 'pastor'])
            ->where('id', '!=', $user->id)
            ->get();
        foreach ($notifyUsers as $notifyUser) {
            $hodName = $previousHod ? $previousHod->name : 'User';
            $notifyUser->notifications()->create([
                'title' => 'HOD Removed',
                'message' => $hodName . " was removed as HOD of {$department->name}.",
                'type' => 'department',
                'category' => 'hod_removed',
            ]);
        }

        Log::info('HOD removed', [
            'department_id' => $id,
            'removed_hod_id' => $previousHod ? $previousHod->id : null,
            'removed_by' => $user->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'HOD removed successfully.',
        ]);
    }

    /**
     * Get department members
     */
    public function members(int $id): JsonResponse
    {
        $department = Department::find($id);
        if (!$department) {
            return response()->json([
                'success' => false,
                'message' => 'Department not found.',
            ], 404);
        }

        $members = $department->members()
            ->with(['gender', 'demography'])
            ->orderByPivot('role', 'desc') // HOD first
            ->orderBy('name')
            ->get()
            ->map(function ($member) use ($department) {
                $hodRole = $member->pivot->role === 'hod';
                $isCurrentHod = $department->hod_id === $member->id;

                return [
                    'id' => $member->id,
                    'name' => $member->name,
                    'email' => $member->email,
                    'role' => $hodRole ? 'HOD' : 'Member',
                    'pivot_role' => $member->pivot->role,
                    'pivot_status' => $member->pivot->status,
                    'is_hod' => $hodRole,
                    'is_current_hod' => $isCurrentHod,
                    'joined_at' => $member->pivot->joined_at,
                    'gender' => $member->gender ? $member->gender->name : null,
                    'photo' => $member->profile_photo,
                ];
            });

        return response()->json([
            'success' => true,
            'department' => [
                'id' => $department->id,
                'name' => $department->name,
            ],
            'members' => $members,
            'stats' => [
                'total' => $members->count(),
                'hod_count' => $members->where('is_hod', true)->count(),
                'member_count' => $members->where('is_hod', false)->count(),
            ],
        ]);
    }

    /**
     * Get recent activities for department
     */
    public function activities(int $id, Request $request): JsonResponse
    {
        $limit = $request->get('limit', 10);
        $department = Department::find($id);

        if (!$department) {
            return response()->json([
                'success' => false,
                'message' => 'Department not found.',
            ], 404);
        }

        $activities = $department->activities()
            ->with(['creator:id,name,profile_photo'])
            ->orderBy('created_at', 'desc')
            ->limit($limit)
            ->get()
            ->map(function ($activity) {
                return [
                    'id' => $activity->id,
                    'title' => $activity->title,
                    'description' => $activity->description,
                    'type' => $activity->type,
                    'status' => $activity->status,
                    'date' => $activity->date,
                    'time' => $activity->time ? $activity->time->format('H:i') : null,
                    'location' => $activity->location,
                    'creator' => $activity->creator ? [
                        'id' => $activity->creator->id,
                        'name' => $activity->creator->name,
                        'photo' => $activity->creator->profile_photo,
                    ] : null,
                    'created_at' => $activity->created_at,
                    'time_ago' => $activity->created_at->diffForHumans(),
                ];
            });

        return response()->json([
            'success' => true,
            'department' => [
                'id' => $department->id,
                'name' => $department->name,
            ],
            'activities' => $activities,
        ]);
    }

    /**
     * Get dashboard metrics for HOD/Admin
     */
    public function metrics(Request $request): JsonResponse
    {
        $user = $request->user();

        // If HOD, show only their department
        if ($user->isHOD() && $user->department_id) {
            $department = Department::withCount(['activeMembers', 'activities'])
                ->find($user->department_id);

            if (!$department) {
                return response()->json([
                    'success' => false,
                    'message' => 'Department not found.',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'scope' => 'my_department',
                'data' => [
                    'department' => [
                        'id' => $department->id,
                        'name' => $department->name,
                        'members_count' => $department->active_members_count,
                        'activities_count' => $department->activities_count,
                    ],
                ],
            ]);
        }

        // For admins/pastors: show all departments summary
        $totalDepartments = Department::count();
        $totalMembers = DB::table('department_members')
            ->where('status', 'active')
            ->count();
        $departmentsWithHod = Department::whereNotNull('hod_id')
            ->where('hod_status', 'accepted')
            ->count();

        $departments = Department::withCount(['activeMembers', 'activities'])
            ->orderBy('name')
            ->get()
            ->map(function ($dept) {
                return [
                    'id' => $dept->id,
                    'name' => $dept->name,
                    'members_count' => $dept->active_members_count,
                    'activities_count' => $dept->activities_count,
                    'has_hod' => $dept->hasHod(),
                    'hod_name' => $dept->hodUser ? $dept->hodUser->name : null,
                ];
            });

        return response()->json([
            'success' => true,
            'scope' => 'all_departments',
            'metrics' => [
                'total_departments' => $totalDepartments,
                'total_members' => $totalMembers,
                'departments_with_hod' => $departmentsWithHod,
                'departments_without_hod' => $totalDepartments - $departmentsWithHod,
            ],
            'departments' => $departments,
        ]);
    }
}
