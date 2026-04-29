// ============================================================================
// HOD ACTIVITY FEED - Recent Department Activity Timeline
// Vertical timeline showing recent department activities
// ============================================================================

import React, { useState, useEffect } from "react";
import { HODIcons } from "./HODIcons";
import { HODTimelineItem, HODGoldButton, HODGlassCard } from "./HODComponents";

// ============================================================================
// ACTIVITY FEED COMPONENT
// ============================================================================

export const HODActivityFeed = ({ departmentId, limit = 10 }) => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    // Sample data for demonstration
    const sampleActivities = [
        {
            id: 1,
            type: "member_added",
            title: "New Member Added",
            description: "Tatenda Moyo joined the department",
            time: "2 hours ago",
            color: "from-violet-400 to-purple-600",
            icon: "Users",
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        },
        {
            id: 2,
            type: "event_created",
            title: "Event Created",
            description: "Youth Fellowship Service - Saturday at 6PM",
            time: "5 hours ago",
            color: "from-sky-400 to-sky-600",
            icon: "Calendar",
            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
        },
        {
            id: 3,
            type: "report_submitted",
            title: "Weekly Report Submitted",
            description: "Week 12 attendance & offerings recorded",
            time: "1 day ago",
            color: "from-emerald-400 to-emerald-600",
            icon: "DocumentChart",
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
        {
            id: 4,
            type: "pastor_message",
            title: "Pastor Message Received",
            description: "Pastor John: Please submit quarterly report",
            time: "1 day ago",
            color: "from-amber-400 to-amber-600",
            icon: "ChatBubbleLeftRight",
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
        {
            id: 5,
            type: "achievement",
            title: "Achievement Unlocked",
            description: "Department reached 50 active members",
            time: "2 days ago",
            color: "from-rose-400 to-rose-600",
            icon: "Trophy",
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        },
        {
            id: 6,
            type: "meeting",
            title: "Department Meeting",
            description: "Weekly sync scheduled for Wednesday",
            time: "3 days ago",
            color: "from-purple-400 to-purple-600",
            icon: "UserGroup",
            timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
    ];

    // Map icon string to actual icon component
    const getIcon = (iconName) => {
        const icons = {
            Users: HODIcons.Users,
            Calendar: HODIcons.Calendar,
            DocumentChart: HODIcons.DocumentChart,
            ChatBubbleLeftRight: HODIcons.ChatBubbleLeftRight,
            Trophy: HODIcons.Trophy,
            UserGroup: HODIcons.UserGroup,
            CheckCircle: HODIcons.CheckCircle,
            Bell: HODIcons.Bell,
        };
        return icons[iconName] || HODIcons.Bell;
    };

    // Fetch activities from API (with fallback to sample)
    const fetchActivities = async () => {
        try {
            setLoading(true);
            const him_token = localStorage.getItem('him_token');
            
            // Try to fetch from multiple endpoints
            const endpoints = [
                `/api/activities?department_id=${departmentId}&limit=${limit}`,
                `/api/reports/history?department_id=${departmentId}&limit=5`,
            ];
            
            let activitiesData = [];
            
            for (const endpoint of endpoints) {
                try {
                    const response = await fetch(endpoint, {
                        headers: { 'Authorization': `Bearer ${him_token}` }
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        if (data.activities) {
                            activitiesData = [...activitiesData, ...data.activities.map(a => ({
                                id: a.id,
                                type: 'activity',
                                title: a.title,
                                description: a.type === 'meeting' ? 'Department meeting' : 'Activity scheduled',
                                time: new Date(a.date).toLocaleDateString(),
                                color: "from-sky-400 to-sky-600",
                                icon: a.type === 'meeting' ? 'UserGroup' : 'Calendar',
                                timestamp: new Date(a.date),
                            }))];
                        }
                        if (data.reports) {
                            activitiesData = [...activitiesData, ...data.reports.map(r => ({
                                id: r.id,
                                type: 'report',
                                title: 'Report Submitted',
                                description: `Week ${r.week_number} - ${r.offering_total}`,
                                time: new Date(r.created_at).toLocaleDateString(),
                                color: "from-emerald-400 to-emerald-600",
                                icon: 'DocumentChart',
                                timestamp: new Date(r.created_at),
                            }))];
                        }
                    }
                } catch (e) {
                    // Continue to next endpoint
                }
            }
            
            if (activitiesData.length > 0) {
                // Sort by timestamp descending
                activitiesData.sort((a, b) => b.timestamp - a.timestamp);
                setActivities(activitiesData.slice(0, limit));
            } else {
                setActivities(sampleActivities);
            }
        } catch (err) {
            // Use sample data as fallback
            setActivities(sampleActivities);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActivities();
    }, [departmentId, limit]);

    // Get icon component
    const IconComponent = getIcon(activities[0]?.icon || 'Bell');

    return (
        <HODGlassCard title="Recent Activity" className="h-full">
            <div className="max-h-96 overflow-y-auto pr-2">
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-500"></div>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {activities.map((activity, index) => {
                            const Icon = getIcon(activity.icon);
                            return (
                                <HODTimelineItem
                                    key={activity.id || index}
                                    icon={Icon}
                                    title={activity.title}
                                    description={activity.description}
                                    time={activity.time}
                                    color={activity.color}
                                />
                            );
                        })}
                    </div>
                )}
            </div>
            
            {/* View All Link */}
            <div className="mt-4 pt-3 border-t border-white/20">
                <button className="text-sm text-amber-600 hover:text-amber-700 font-medium transition-colors flex items-center gap-1">
                    View All Activity
                    <HODIcons.ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </HODGlassCard>
    );
};

// ============================================================================
// COMPACT ACTIVITY FEED (For sidebar/widget)
// ============================================================================

export const HODActivityFeedCompact = ({ activities = [], maxItems = 5 }) => {
    const getIcon = (iconName) => {
        const icons = {
            Users: HODIcons.Users,
            Calendar: HODIcons.Calendar,
            DocumentChart: HODIcons.DocumentChart,
            ChatBubbleLeftRight: HODIcons.ChatBubbleLeftRight,
            Trophy: HODIcons.Trophy,
            UserGroup: HODIcons.UserGroup,
            CheckCircle: HODIcons.CheckCircle,
            Bell: HODIcons.Bell,
        };
        return icons[iconName] || HODIcons.Bell;
    };

    return (
        <div className="space-y-1">
            {activities.slice(0, maxItems).map((activity, index) => {
                const Icon = getIcon(activity.icon);
                return (
                    <HODTimelineItem
                        key={activity.id || index}
                        icon={Icon}
                        title={activity.title}
                        description={activity.description}
                        time={activity.time}
                        color={activity.color}
                    />
                );
            })}
        </div>
    );
};

export default HODActivityFeed;
