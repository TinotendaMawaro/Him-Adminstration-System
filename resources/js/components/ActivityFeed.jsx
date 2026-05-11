// ActivityFeed.jsx - Real-time activity feed component
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

const ActivityFeed = ({ user, limit = 20 }) => {
    const { data: activities, isLoading, error } = useQuery(
        ['activity-feed', user?.id, limit],
        () => api.get(`/users/${user?.id}/activity-feed?limit=${limit}`).then(res => res.data.activities),
        {
            enabled: !!user?.id,
            refetchInterval: 30000, // Refresh every 30 seconds
            staleTime: 15000,
        }
    );

    const getActivityIcon = (action) => {
        const icons = {
            'member_added': '👤',
            'homegroup_invitation_sent': '📨',
            'homegroup_invitation_accepted': '✅',
            'homegroup_join_requested': '🤝',
            'hod_appointment': '🎖️',
            'department_membership_approved': '👥',
        };
        return icons[action] || '📝';
    };

    const formatActivityMessage = (activity) => {
        const { action, subject, target, actor, metadata } = activity;

        switch (action) {
            case 'member_added':
                return `${actor?.name || 'Someone'} added ${target?.name || 'a member'} to ${subject?.name || 'the system'}`;
            case 'homegroup_invitation_sent':
                return `${actor?.name || 'Someone'} invited ${target?.name || 'a member'} to join ${subject?.name || 'a home group'}`;
            case 'homegroup_invitation_accepted':
                return `${actor?.name || 'Someone'} accepted invitation to join ${target?.name || 'a home group'}`;
            case 'homegroup_join_requested':
                return `${actor?.name || 'Someone'} requested to join ${target?.name || 'a home group'}`;
            case 'hod_appointment':
                return `${actor?.name || 'Someone'} appointed ${target?.name || 'someone'} as HOD for ${subject?.name || 'a department'}`;
            default:
                return `${actor?.name || 'Someone'} performed ${action.replace('_', ' ')}`;
        }
    };

    if (isLoading) {
        return (
            <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6">
                <div className="animate-pulse space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6">
                <div className="text-center text-gray-500">
                    <p>Failed to load activity feed</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-2 text-sky-600 hover:text-sky-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                <span className="text-xs text-gray-500">
                    Auto-updates every 30s
                </span>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
                {activities?.length > 0 ? (
                    activities.map((activity) => (
                        <div key={activity.id} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50/50 transition-colors">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white text-sm">
                                {getActivityIcon(activity.action)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-900 leading-relaxed">
                                    {formatActivityMessage(activity)}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {new Date(activity.occurred_at).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        <div className="w-12 h-12 mx-auto mb-3 text-gray-300">
                            📝
                        </div>
                        <p>No recent activity</p>
                        <p className="text-xs mt-1">Activity will appear here as actions are performed</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivityFeed;