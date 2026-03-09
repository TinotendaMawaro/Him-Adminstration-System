<?php

namespace App\Console\Commands;

use App\Models\Report;
use App\Models\Notification;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Console\Command;

class CheckReportReminders extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'reports:check-reminders';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Check for missing weekly reports and send reminder notifications to pastors every hour';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Checking for missing weekly reports...');
        
        $now = Carbon::now();
        $currentDay = $now->dayOfWeek;
        $currentHour = $now->hour;
        
        // Get all pastors with zones
        $pastors = User::where('role', 'pastor')
            ->whereNotNull('zone_id')
            ->with('zone')
            ->get();
        
        $remindersSent = 0;
        
        foreach ($pastors as $pastor) {
            $zoneId = $pastor->zone_id;
            
            // Determine which services need reports based on current day/time
            $servicesToCheck = $this->getServicesToCheck($now);
            
            foreach ($servicesToCheck as $serviceType => $serviceInfo) {
                // Check if report exists for this service this week
                $weekStart = $now->copy()->startOfWeek(Carbon::SUNDAY);
                $weekEnd = $now->copy()->endOfWeek(Carbon::SATURDAY);
                
                $existingReport = Report::where('zone_id', $zoneId)
                    ->where('service_type', $serviceType)
                    ->whereBetween('report_date', [$weekStart, $weekEnd])
                    ->where('status', 'submitted')
                    ->first();
                
                if (!$existingReport) {
                    // Check if we already sent a reminder recently (within last hour)
                    $recentNotification = Notification::where('user_id', $pastor->id)
                        ->where('type', 'reminder')
                        ->where('category', 'report')
                        ->where('title', 'like', '%' . $serviceInfo['label'] . '%')
                        ->where('created_at', '>=', $now->copy()->subHour())
                        ->first();
                    
                    if (!$recentNotification) {
                        // Create notification
                        $this->createReminderNotification($pastor, $serviceType, $serviceInfo, $now);
                        $remindersSent++;
                        
                        $this->line("Reminder sent to {$pastor->name} for {$serviceInfo['label']}");
                    }
                }
            }
        }
        
        $this->info("Completed! Sent {$remindersSent} reminder notifications.");
        
        return 0;
    }
    
    /**
     * Determine which services need reports based on current date/time
     */
    private function getServicesToCheck($now)
    {
        $services = [];
        $currentDay = $now->dayOfWeek;
        $currentHour = $now->hour;
        
        // Always check for Sunday service (weekly obligation)
        $services['sunday_service'] = [
            'label' => 'Sunday Service',
            'due_hours' => 72 // 3 days after Sunday
        ];
        
        // Check midweek service on Thursdays after 6pm or Fridays
        if (($currentDay === Carbon::THURSDAY && $currentHour >= 18) || 
            $currentDay === Carbon::FRIDAY || 
            $currentDay === Carbon::SATURDAY) {
            $services['midweek_service'] = [
                'label' => 'Midweek Service',
                'due_hours' => 48
            ];
        }
        
        // Check remote services every day
        $services['remote_service'] = [
            'label' => 'Remote/Online Service',
            'due_hours' => 24
        ];
        
        return $services;
    }
    
    /**
     * Create reminder notification for pastor
     */
    private function createReminderNotification($pastor, $serviceType, $serviceInfo, $now)
    {
        $hour = $now->format('g:00 A');
        
        Notification::create([
            'user_id' => $pastor->id,
            'title' => "⏰ {$serviceInfo['label']} Report Due",
            'message' => "Please submit your {$serviceInfo['label']} report. This is your {$this->getOrdinal($now->hour)} hourly reminder. Prompt submission ensures proper zonal records.",
            'type' => 'reminder',
            'category' => 'report',
            'is_read' => false,
        ]);
    }
    
    /**
     * Get ordinal number for hour
     */
    private function getOrdinal($number)
    {
        if (($number % 100) >= 11 && ($number % 100) <= 13) {
            return $number . 'th';
        }
        
        switch ($number % 10) {
            case 1:
                return $number . 'st';
            case 2:
                return $number . 'nd';
            case 3:
                return $number . 'rd';
            default:
                return $number . 'th';
        }
    }
}

