<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\HomeGroup;
use App\Models\Member;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{
    public function metrics(Request $request): JsonResponse
    {
        $user = $request->user();
        
        \Log::info('Dashboard metrics request', [
            'user_id' => $user?->id,
            'user_email' => $user?->email,
            'user_role' => $user?->role,
            'zone_id' => $user?->zone_id,
        ]);
        
        try {
            $zoneId = $user?->zone_id;

            $totalActiveMembers = $this->getTotalActiveMembers($zoneId);
            $totalHomeGroups = $this->getTotalHomeGroups($zoneId);
            $groupsWithActiveMembers = $this->getGroupsWithActiveMembers($zoneId);
            $totalDepartments = $this->getTotalDepartments($zoneId);
            $departmentsWithHod = $this->getDepartmentsWithHod($zoneId);

            return response()->json([
                'success' => true,
                'data' => [
                    'total_active_members' => $totalActiveMembers,
                    'total_home_groups' => $totalHomeGroups,
                    'groups_with_active_members' => $groupsWithActiveMembers,
                    'total_departments' => $totalDepartments,
                    'departments_with_hod' => $departmentsWithHod,
                ],
                'timestamp' => now()->toISOString(),
            ]);
        } catch (\Exception $e) {
            $errorMessage = $e->getMessage() . ' | File: ' . $e->getFile() . ' Line: ' . $e->getLine();
            \Log::error('Dashboard metrics error: ' . $errorMessage);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch dashboard metrics: ' . $e->getMessage(),
            ], 500);
        }
    }

    private function getTotalActiveMembers(?int $zoneId): int
    {
        $query = Member::where('status', 'active');

        if ($zoneId) {
            return $query->where('zone_id', $zoneId)->count();
        }

        return $query->count();
    }

    private function getTotalHomeGroups(?int $zoneId): int
    {
        $query = HomeGroup::query();

        if ($zoneId) {
            return $query->where('zone_id', $zoneId)->count();
        }

        return $query->count();
    }

    private function getGroupsWithActiveMembers(?int $zoneId): int
    {
        $query = HomeGroup::query()
            ->whereHas('members', function ($q) {
                $q->where('status', 'active');
            });

        if ($zoneId) {
            return $query->where('zone_id', $zoneId)->count();
        }

        return $query->count();
    }

    private function getTotalDepartments(?int $zoneId): int
    {
        $query = Department::query();

        if ($zoneId) {
            return $query->where('zone_id', $zoneId)->count();
        }

        return $query->count();
    }

    private function getDepartmentsWithHod(?int $zoneId): int
    {
        $query = Department::query()
            ->whereHas('users', function ($q) {
                $q->where('role', 'hod')->where('is_active', true);
            });

        if ($zoneId) {
            return $query->where('zone_id', $zoneId)->count();
        }

        return $query->count();
    }
}