<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Report;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class WeeklyReportController extends Controller
{
    /**
     * Store a newly created report.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|string',
            'service_type' => 'required|in:sunday_service,midweek_service,remote_service',
            'report_date' => 'required|date',
            'week_number' => 'required|integer|min:1|max:53',
            'year' => 'required|integer|min:2020',
            
            // Financial fields
            'cash_collection' => 'nullable|numeric|min:0',
            'bank_deposit' => 'nullable|numeric|min:0',
            'online_transfer' => 'nullable|numeric|min:0',
            'other_income' => 'nullable|numeric|min:0',
            'tithes' => 'nullable|numeric|min:0',
            'offerings' => 'nullable|numeric|min:0',
            'building_fund' => 'nullable|numeric|min:0',
            'missions' => 'nullable|numeric|min:0',
            'other_designations' => 'nullable|numeric|min:0',
            
            // Attendance
            'adults' => 'nullable|integer|min:0',
            'children' => 'nullable|integer|min:0',
            'men' => 'nullable|integer|min:0',
            'women' => 'nullable|integer|min:0',
            'boys' => 'nullable|integer|min:0',
            'girls' => 'nullable|integer|min:0',
            'toddlers' => 'nullable|integer|min:0',
            
            // Equipment
            'equipment_pledged' => 'nullable|array',
            'equipment_pledged.*.item' => 'required|string',
            'equipment_pledged.*.quantity' => 'required|integer|min:1',
            'equipment_pledged.*.pledged_by' => 'required|string',
            
            // Remittance
            'remittance_submitted' => 'nullable|boolean',
            'remittance_date' => 'nullable|date',
            'remittance_amount' => 'nullable|numeric|min:0',
            
            // Notes
            'notes' => 'nullable|string',
        ]);

        $user = Auth::user();
        $zoneId = $user->zone_id ?? $user->zone?->id;

        // Calculate totals
        $totalIncome = 
            ($validated['cash_collection'] ?? 0) +
            ($validated['bank_deposit'] ?? 0) +
            ($validated['online_transfer'] ?? 0) +
            ($validated['other_income'] ?? 0);

        // Check if report already exists for this week/service
        $existingReport = Report::where('zone_id', $zoneId)
            ->where('service_type', $validated['service_type'])
            ->where('week_number', $validated['week_number'])
            ->where('year', $validated['year'])
            ->first();

        if ($existingReport) {
            return response()->json([
                'message' => 'Report already exists for this period',
                'report' => $existingReport
            ], 422);
        }

        // Determine if late (after Wednesday for Sunday service)
        $reportDate = Carbon::parse($validated['report_date']);
        $isLate = false;
        if ($validated['service_type'] === 'sunday_service') {
            $isLate = $reportDate->dayOfWeek != Carbon::SUNDAY && 
                      now()->diffInHours($reportDate->startOfDay()) > 72;
        }

        $report = Report::create([
            'zone_id' => $zoneId,
            'user_id' => $user->id,
            'type' => $validated['type'],
            'service_type' => $validated['service_type'],
            'report_date' => $validated['report_date'],
            'week_number' => $validated['week_number'],
            'year' => $validated['year'],
            'total_income' => $totalIncome,
            'cash_collection' => $validated['cash_collection'] ?? 0,
            'bank_deposit' => $validated['bank_deposit'] ?? 0,
            'online_transfer' => $validated['online_transfer'] ?? 0,
            'other_income' => $validated['other_income'] ?? 0,
            'tithes' => $validated['tithes'] ?? 0,
            'offerings' => $validated['offerings'] ?? 0,
            'building_fund' => $validated['building_fund'] ?? 0,
            'missions' => $validated['missions'] ?? 0,
            'other_designations' => $validated['other_designations'] ?? 0,
            'attendance' => ($validated['adults'] ?? 0) + ($validated['children'] ?? 0),
            'adults' => $validated['adults'] ?? 0,
            'children' => $validated['children'] ?? 0,
            'men' => $validated['men'] ?? 0,
            'women' => $validated['women'] ?? 0,
            'boys' => $validated['boys'] ?? 0,
            'girls' => $validated['girls'] ?? 0,
            'toddlers' => $validated['toddlers'] ?? 0,
            'equipment_pledged' => json_encode($validated['equipment_pledged'] ?? []),
            'remittance_submitted' => $validated['remittance_submitted'] ?? false,
            'remittance_date' => $validated['remittance_date'] ?? null,
            'remittance_amount' => $validated['remittance_amount'] ?? 0,
            'notes' => $validated['notes'] ?? null,
            'status' => 'submitted',
            'submitted_at' => now(),
            'is_late' => $isLate,
        ]);

        return response()->json([
            'message' => 'Report submitted successfully',
            'report' => $report
        ], 201);
    }

    /**
     * Update an existing report.
     */
    public function update(Request $request, $id)
    {
        $report = Report::findOrFail($id);
        
        // Only allow updates if status is draft
        if ($report->status !== 'draft') {
            return response()->json([
                'message' => 'Cannot update submitted report'
            ], 422);
        }

        $validated = $request->validate([
            // Same validation as store
            'type' => 'sometimes|string',
            'service_type' => 'sometimes|in:sunday_service,midweek_service,remote_service',
            'report_date' => 'sometimes|date',
            'week_number' => 'sometimes|integer|min:1|max:53',
            'year' => 'sometimes|integer|min:2020',
            'cash_collection' => 'nullable|numeric|min:0',
            'bank_deposit' => 'nullable|numeric|min:0',
            'online_transfer' => 'nullable|numeric|min:0',
            'other_income' => 'nullable|numeric|min:0',
            'tithes' => 'nullable|numeric|min:0',
            'offerings' => 'nullable|numeric|min:0',
            'building_fund' => 'nullable|numeric|min:0',
            'missions' => 'nullable|numeric|min:0',
            'other_designations' => 'nullable|numeric|min:0',
            'adults' => 'nullable|integer|min:0',
            'children' => 'nullable|integer|min:0',
            'men' => 'nullable|integer|min:0',
            'women' => 'nullable|integer|min:0',
            'boys' => 'nullable|integer|min:0',
            'girls' => 'nullable|integer|min:0',
            'toddlers' => 'nullable|integer|min:0',
            'equipment_pledged' => 'nullable|array',
            'remittance_submitted' => 'nullable|boolean',
            'remittance_date' => 'nullable|date',
            'remittance_amount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $report->update($validated);

        return response()->json([
            'message' => 'Report updated successfully',
            'report' => $report
        ]);
    }

    /**
     * Get report history for the user's zone.
     */
    public function history(Request $request)
    {
        $user = Auth::user();
        $zoneId = $user->zone_id ?? $user->zone?->id;

        $reports = Report::where('zone_id', $zoneId)
            ->orderBy('report_date', 'desc')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($report) {
                $report->equipment_pledged = json_decode($report->equipment_pledged, true);
                return $report;
            });

        return response()->json([
            'reports' => $reports
        ]);
    }

    /**
     * Get a specific report.
     */
    public function show($id)
    {
        $report = Report::with(['zone', 'user'])->findOrFail($id);
        $report->equipment_pledged = json_decode($report->equipment_pledged, true);

        return response()->json([
            'report' => $report
        ]);
    }

    /**
     * Get pending reminders for the user.
     */
    public function pendingReminders()
    {
        $user = Auth::user();
        $zoneId = $user->zone_id ?? $user->zone?->id;

        // Get current week's date range
        $now = Carbon::now();
        $weekStart = $now->startOfWeek(Carbon::SUNDAY);
        $weekEnd = $now->endOfWeek(Carbon::SATURDAY);

        $reminders = [];

        // Check Sunday service
        $sundayReport = Report::where('zone_id', $zoneId)
            ->where('service_type', 'sunday_service')
            ->whereBetween('report_date', [$weekStart, $weekEnd])
            ->first();

        if (!$sundayReport) {
            $reminders[] = [
                'type' => 'sunday_service',
                'message' => 'Sunday Service Report is due',
                'service_date' => $weekStart->format('Y-m-d'),
                'hours_until_due' => $now->diffInHours($weekStart->endOfDay()),
            ];
        }

        // Check midweek service
        $midweekReport = Report::where('zone_id', $zoneId)
            ->where('service_type', 'midweek_service')
            ->whereBetween('report_date', [$weekStart, $weekEnd])
            ->first();

        if (!$midweekReport) {
            $reminders[] = [
                'type' => 'midweek_service',
                'message' => 'Midweek Service Report is due',
                'service_date' => $weekEnd->format('Y-m-d'),
                'hours_until_due' => $now->diffInHours($weekEnd->endOfDay()),
            ];
        }

        return response()->json([
            'reminders' => $reminders
        ]);
    }

    /**
     * Submit remittance for a report.
     */
    public function submitRemittance(Request $request, $id)
    {
        $report = Report::findOrFail($id);

        $validated = $request->validate([
            'remittance_date' => 'required|date',
            'remittance_amount' => 'required|numeric|min:0',
        ]);

        $report->update([
            'remittance_submitted' => true,
            'remittance_date' => $validated['remittance_date'],
            'remittance_amount' => $validated['remittance_amount'],
        ]);

        return response()->json([
            'message' => 'Remittance submitted successfully',
            'report' => $report
        ]);
    }

    /**
     * Upload attachment for a report.
     */
    public function uploadAttachment(Request $request, $id)
    {
        $report = Report::findOrFail($id);

        $request->validate([
            'file' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120',
        ]);

        $path = $request->file('file')->store('report-attachments', 'public');

        $attachments = json_decode($report->attachments ?? '[]', true);
        $attachments[] = [
            'filename' => $request->file('file')->getClientOriginalName(),
            'path' => $path,
            'uploaded_at' => now()->toISOString(),
        ];

        $report->update(['attachments' => json_encode($attachments)]);

        return response()->json([
            'message' => 'Attachment uploaded successfully',
            'attachments' => $attachments
        ]);
    }
}

