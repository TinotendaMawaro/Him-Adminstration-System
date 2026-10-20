<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;
use App\Models\HomeGroup;
use App\Models\Appointment;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    const TYPE_REMINDER = 'reminder';
    const TYPE_ANNOUNCEMENT = 'announcement';
    const TYPE_SUCCESS = 'success';
    const TYPE_INFO = 'info';
    const TYPE_WARNING = 'warning';

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

        $label = isset($labels[$reportType]) ? $labels[$reportType] : 'Weekly Report';
        $msg = isset($message) ? $message : "Please submit your {$label} report for this week. Prompt submission ensures proper zonal records.";

        return Notification::create([
            'user_id' => $user->id,
            'title' => "📊 {$label} Report Due",
            'message' => $msg,
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

        $label = isset($labels[$financeType]) ? $labels[$financeType] : 'Finance';
        $msg = isset($message) ? $message : "Please submit your {$label} report for this week. Thank you for your faithful stewardship.";

        return Notification::create([
            'user_id' => $user->id,
            'title' => "💰 {$label} Submission Reminder",
            'message' => $msg,
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
        $memberName = isset($memberData['name']) ? $memberData['name'] : 'A new member';

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

        $typeLabel = isset($typeLabels[$appointment->appointment_type]) ? $typeLabels[$appointment->appointment_type] : 'Leadership Position';

        $deptName = $appointment->department ? $appointment->department->name : null;
        $hgName = $appointment->homeGroup ? $appointment->homeGroup->name : null;
        $targetName = $deptName !== null ? $deptName : ($hgName !== null ? $hgName : 'the ministry');

        $startDate = $appointment->start_date ? $appointment->start_date->format('M d, Y') : 'Today';

        return Notification::create([
            'user_id' => $user->id,
            'title' => "🎖️ Appointment Confirmed",
            'message' => "Congratulations! You have been appointed as {$typeLabel} for {$targetName}. Start date: {$startDate}",
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
     * Create member left home group notification
     */
    public static function createMemberLeftNotification(User $recipient, HomeGroup $homeGroup, User $member, string $reason): Notification
    {
        return Notification::create([
            'user_id' => $recipient->id,
            'title' => "🚪 Member Left Home Group",
            'message' => "{$member->name} has left {$homeGroup->name} Home Group. Reason: {$reason}",
            'type' => self::TYPE_INFO,
            'category' => 'homegroup_left',
            'is_read' => false,
        ]);
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
     * Create homegroup invitation notification (member invited)
     */
    public static function createHomeGroupInvitation(User $member, HomeGroup $homeGroup, User $pastor): Notification
    {
        return Notification::create([
            'user_id' => $member->id,
            'title' => "🏠 Home Group Invitation",
            'message' => "Pastor {$pastor->name} has invited you to join {$homeGroup->name} Home Group. Please accept or decline in your member portal.",
            'type' => self::TYPE_INFO,
            'category' => 'homegroup_invitation',
            'is_read' => false,
        ]);
    }

    /**
     * Create invitation accepted notification (pastor notified)
     */
    public static function createInvitationAccepted(User $pastor, HomeGroup $homeGroup, User $member): Notification
    {
        return Notification::create([
            'user_id' => $pastor->id,
            'title' => "✅ Invitation Accepted",
            'message' => "{$member->name} has accepted your invitation to join {$homeGroup->name} Home Group.",
            'type' => self::TYPE_SUCCESS,
            'category' => 'homegroup_invitation',
            'is_read' => false,
        ]);
    }

    /**
     * Create invitation declined notification (pastor notified)
     */
    public static function createInvitationDeclined(User $pastor, HomeGroup $homeGroup, User $member, $reason = null): Notification
    {
        $message = "{$member->name} has declined your invitation to join {$homeGroup->name} Home Group.";
        if ($reason) {
            $message .= " Reason: {$reason}";
        }

        return Notification::create([
            'user_id' => $pastor->id,
            'title' => "❌ Invitation Declined",
            'message' => $message,
            'type' => self::TYPE_WARNING,
            'category' => 'homegroup_invitation',
            'is_read' => false,
        ]);
    }

    /**
     * Create leader promotion request notification (sent to member)
     */
    public static function createLeaderPromotionRequested(User $member, HomeGroup $homeGroup, User $pastor): Notification
    {
        return Notification::create([
            'user_id' => $member->id,
            'title' => "🏆 Homegroup Leader Promotion",
            'message' => "Pastor {$pastor->name} has nominated you to become a Homegroup Leader for {$homeGroup->name}. Please accept or decline this request in your portal.",
            'type' => self::TYPE_INFO,
            'category' => 'leader_promotion',
            'is_read' => false,
        ]);
    }

    /**
     * Create leader promotion accepted notification (sent to pastor)
     */
    public static function createLeaderPromotionAccepted(User $pastor, HomeGroup $homeGroup, User $member): Notification
    {
        return Notification::create([
            'user_id' => $pastor->id,
            'title' => "✅ Leader Promotion Accepted",
            'message' => "{$member->name} has accepted the Homegroup Leader promotion for {$homeGroup->name}. They have been redirected to the HOD Portal.",
            'type' => self::TYPE_SUCCESS,
            'category' => 'leader_promotion',
            'is_read' => false,
        ]);
    }

    /**
     * Create leader promotion declined notification (sent to pastor)
     */
    public static function createLeaderPromotionDeclined(User $pastor, HomeGroup $homeGroup, User $member): Notification
    {
        return Notification::create([
            'user_id' => $pastor->id,
            'title' => "❌ Leader Promotion Declined",
            'message' => "{$member->name} has declined the Homegroup Leader promotion for {$homeGroup->name}.",
            'type' => self::TYPE_WARNING,
            'category' => 'leader_promotion',
            'is_read' => false,
        ]);
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