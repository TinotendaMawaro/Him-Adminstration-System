<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;
use App\Models\HomeGroup;
use App\Models\Appointment;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    // Notification type constants
    const TYPE_REMINDER = 'reminder';
    const TYPE_ANNOUNCEMENT = 'announcement';
    const TYPE_SUCCESS = 'success';
    const TYPE_INFO = 'info';
    const TYPE_WARNING = 'warning';

    // Notification category constants
    const CATEGORY_REPORT = 'report';
    const CATEGORY_FINANCE = 'finance';
    const CATEGORY_MEMBER = 'member';
    const CATEGORY_APPOINTMENT = 'appointment';
    const CATEGORY_SYSTEM = 'system';

    /**
     * Create a report reminder notification
     */
    public static function createReportReminder(User $user, string $reportType, string $message = null): Notification
    {
        $labels = [
            'sunday_service' => 'Sunday Service',
            'midweek_service' => 'Midweek Service',
            'remote_service' => 'Remote/Online Service',
        ];

        $label = $labels[$reportType] ?? 'Weekly Report';

        return Notification::create([
            'user_id' => $user->id,
            'title' => "📊 {$label} Report Due",
            'message' => $message ?? "Please submit your {$label} report for this week. Prompt submission ensures proper zonal records.",
            'type' => self::TYPE_REMINDER,
            'category' => self::CATEGORY_REPORT,
            'is_read' => false,
        ]);
    }

    /**
     * Create a finance submission reminder notification
     */
    public static function createFinanceReminder(User $user, string $financeType, string $message = null): Notification
    {
        $labels = [
            'tithe' => 'Tithe',
            'offering' => 'Offering',
            'donation' => 'Donation',
            'project' => 'Project Fund',
        ];

        $label = $labels[$financeType] ?? 'Finance';

        return Notification::create([
            'user_id' => $user->id,
            'title' => "💰 {$label} Submission Reminder",
            'message' => $message ?? "Please submit your {$label} report for this week. Thank you for your faithful stewardship.",
            'type' => self::TYPE_REMINDER,
            'category' => self::CATEGORY_FINANCE,
            'is_read' => false,
        ]);
    }

    /**
     * Create a new member registration notification
     */
    public static function createNewMemberNotification(User $pastor, HomeGroup $homeGroup, array $memberData): Notification
    {
        $memberName = $memberData['name'] ?? 'A new member';
        
        return Notification::create([
            'user_id' => $pastor->id,
            'title' => "👤 New Member Registered",
            'message' => "{$memberName} has been registered in {$homeGroup->name} Home Group. Welcome to the family!",
            'type' => self::TYPE_SUCCESS,
            'category' => self::CATEGORY_MEMBER,
            'is_read' => false,
        ]);
    }

    /**
     * Create an appointment confirmation notification
     */
    public static function createAppointmentNotification(User $user, Appointment $appointment): Notification
    {
        $typeLabels = [
            'hod' => 'Head of Department',
            'homegroup_leader' => 'Home Group Leader',
            'zone_pastor' => 'Zone Pastor',
            'shepherd' => 'Shepherd',
        ];

        $typeLabel = $typeLabels[$appointment->appointment_type] ?? 'Leadership Position';

        return Notification::create([
            'user_id' => $user->id,
            'title' => "🎖️ Appointment Confirmed",
            'message' => "Congratulations! You have been appointed as {$typeLabel} for {$appointment->department?->name ?? $appointment->homeGroup?->name ?? 'the ministry'}. Start date: " . ($appointment->start_date?->format('M d, Y') ?? 'Today'),
            'type' => self::TYPE_SUCCESS,
            'category' => self::CATEGORY_APPOINTMENT,
            'is_read' => false,
        ]);
    }

    /**
     * Create a system notification
     */
    public static function createSystemNotification(User $user, string $title, string $message, string $type = self::TYPE_INFO): Notification
    {
        return Notification::create([
            'user_id' => $user->id,
            'title' => $title,
            'message' => $message,
            'type' => $type,
            'category' => self::CATEGORY_SYSTEM,
            'is_read' => false,
        ]);
    }

    /**
     * Send notification to multiple users
     */
    public static function sendToUsers(array $userIds, string $title, string $message, string $type = self::TYPE_INFO, string $category = self::CATEGORY_SYSTEM): array
    {
        $notifications = [];
        
        foreach ($userIds as $userId) {
            $notifications[] = Notification::create([
                'user_id' => $userId,
                'title' => $title,
                'message' => $message,
                'type' => $type,
                'category' => $category,
                'is_read' => false,
            ]);
        }
        
        return $notifications;
    }

    /**
     * Send notification to all pastors in a zone
     */
    public static function sendToZonePastors(int $zoneId, string $title, string $message, string $type = self::TYPE_INFO): array
    {
        $pastors = User::where('role', 'pastor')
            ->where('zone_id', $zoneId)
            ->get();
        
        return self::sendToUsers(
            $pastors->pluck('id')->toArray(),
            $title,
            $message,
            $type,
            self::CATEGORY_SYSTEM
        );
    }

    /**
     * Get notification icon based on category
     */
    public static function getCategoryIcon(string $category): string
    {
        return match ($category) {
            self::CATEGORY_REPORT => '📊',
            self::CATEGORY_FINANCE => '💰',
            self::CATEGORY_MEMBER => '👤',
            self::CATEGORY_APPOINTMENT => '🎖️',
            default => '📢',
        };
    }

    /**
     * Get notification color based on type
     */
    public static function getTypeColor(string $type): string
    {
        return match ($type) {
            self::TYPE_SUCCESS => 'emerald',
            self::TYPE_WARNING => 'amber',
            self::TYPE_REMINDER => 'sky',
            self::TYPE_INFO => 'blue',
            default => 'gray',
        };
    }
}

