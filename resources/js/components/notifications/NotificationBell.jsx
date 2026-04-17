import React, { useState, useEffect, useRef } from "react";
import api from "../../lib/api";

// Notification type icons and colors
const getNotificationStyle = (category, type) => {
    const styles = {
        pastor: { icon: '📣', color: 'from-amber-400 to-orange-500', bg: 'bg-amber-50', label: 'Pastor' },
        announcement: { icon: '📢', color: 'from-amber-400 to-orange-500', bg: 'bg-amber-50', label: 'Announcement' },
        report: { icon: '📊', color: 'from-amber-400 to-orange-500', bg: 'bg-amber-50', label: 'Report' },
        report_reminder: { icon: '⏰', color: 'from-orange-400 to-red-500', bg: 'bg-orange-50', label: 'Report Reminder' },
        event: { icon: '📅', color: 'from-sky-400 to-blue-500', bg: 'bg-sky-50', label: 'Event' },
        event_reminder: { icon: '🔔', color: 'from-violet-400 to-purple-500', bg: 'bg-violet-50', label: 'Event Reminder' },
        finance: { icon: '💰', color: 'from-emerald-400 to-green-500', bg: 'bg-emerald-50', label: 'Finance' },
        member: { icon: '👤', color: 'from-sky-400 to-blue-500', bg: 'bg-sky-50', label: 'Member' },
        member_update: { icon: '🔄', color: 'from-cyan-400 to-teal-500', bg: 'bg-cyan-50', label: 'Member Update' },
        appointment: { icon: '🎖️', color: 'from-purple-400 to-violet-500', bg: 'bg-purple-50', label: 'Appointment' },
        system: { icon: '📢', color: 'from-gray-400 to-slate-500', bg: 'bg-gray-50', label: 'System' },
    };
    return styles[category] || styles.system;
};

// Format relative time
const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
};

// ============================================================================
// NOTIFICATION DROPDOWN - Glass Panel
// ============================================================================

const NotificationDropdown = ({ notifications, onMarkAsRead, onMarkAllRead, onClose, onOpenDrawer }) => {
    const dropdownRef = useRef(null);
    
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const unreadNotifications = notifications.filter(n => !n.is_read);
    const readNotifications = notifications.filter(n => n.is_read);
    
    const displayNotifications = unreadNotifications.length > 0 ? unreadNotifications : readNotifications.slice(0, 5);

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-40" onClick={onClose} />
            
            {/* Dropdown Panel - Glass Effect */}
            <div 
                ref={dropdownRef}
                className="absolute right-0 mt-3 w-96 bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 z-50 overflow-hidden animate-fadeIn"
                style={{ 
                    animation: 'slideDown 0.2s ease-out',
                    maxHeight: '500px'
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100/50 bg-white/40">
                    <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
                        {unreadNotifications.length > 0 && (
                            <span className="px-2 py-0.5 text-xs font-semibold bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full shadow-lg shadow-rose-500/30">
                                {unreadNotifications.length}
                            </span>
                        )}
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-1.5 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Notifications List */}
                <div className="overflow-y-auto" style={{ maxHeight: '360px' }}>
                    {displayNotifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 px-5 text-center">
                            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                                <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                            </div>
                            <p className="text-gray-500 font-medium">No notifications yet</p>
                            <p className="text-gray-400 text-sm">You're all caught up!</p>
                        </div>
                    ) : (
                        displayNotifications.map((notification) => {
                            const style = getNotificationStyle(notification.category, notification.type);
                            return (
                                <div
                                    key={notification.id}
                                    onClick={() => !notification.is_read && onMarkAsRead(notification.id)}
                                    className={`group flex items-start gap-3 px-5 py-4 border-b border-gray-50/50 hover:bg-gray-50/50 cursor-pointer transition-all duration-200 ${
                                        !notification.is_read ? 'bg-sky-50/30' : ''
                                    }`}
                                >
                                    {/* Icon */}
                                    <div className={`shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${style.color} flex items-center justify-center shadow-lg shadow-gray-500/10`}>
                                        <span className="text-lg">{style.icon}</span>
                                    </div>
                                    
                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className={`font-semibold text-sm truncate ${!notification.is_read ? 'text-gray-900' : 'text-gray-600'}`}>
                                                {notification.title}
                                            </p>
                                            {!notification.is_read && (
                                                <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0"></span>
                                            )}
                                        </div>
                                        <p className="text-gray-500 text-sm mt-0.5 line-clamp-2">{notification.message}</p>
                                        <p className="text-gray-400 text-xs mt-1">{formatTime(notification.created_at)}</p>
                                    </div>
                                    
                                    {/* Unread Indicator Line */}
                                    {!notification.is_read && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-sky-400 to-blue-500 rounded-l"></div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                    <div className="px-5 py-3 bg-gray-50/50 border-t border-gray-100">
                        <button 
                            onClick={onOpenDrawer}
                            className="w-full py-2 text-sm font-medium text-sky-600 hover:text-sky-700 hover:bg-sky-50 rounded-xl transition-colors"
                        >
                            View all notifications →
                        </button>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: slideDown 0.2s ease-out;
                }
            `}</style>
        </>
    );
};

// ============================================================================
// NOTIFICATION DRAWER - Slide-in Panel
// ============================================================================

const NotificationDrawer = ({ notifications, onMarkAsRead, onMarkAllRead, onClose }) => {
    const drawerRef = useRef(null);
    
    useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    // Group notifications by date
    const groupedNotifications = notifications.reduce((groups, notification) => {
        const date = new Date(notification.created_at);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        let key;
        if (date.toDateString() === today.toDateString()) {
            key = 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            key = 'Yesterday';
        } else {
            key = 'Earlier';
        }
        
        if (!groups[key]) groups[key] = [];
        groups[key].push(notification);
        return groups;
    }, {});

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <>
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 transition-opacity"
                onClick={onClose}
            />
            
            {/* Drawer - Slide in from right */}
            <div 
                ref={drawerRef}
                className="fixed top-0 right-0 h-full w-full max-w-md bg-white/95 backdrop-blur-2xl shadow-2xl z-50 animate-slideInRight"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-white/60">
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold text-gray-900">All Notifications</h2>
                        {unreadCount > 0 && (
                            <span className="px-2.5 py-1 text-sm font-semibold bg-gradient-to-r from-sky-500 to-blue-500 text-white rounded-full shadow-lg shadow-sky-500/30">
                                {unreadCount} new
                            </span>
                        )}
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                        <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Actions */}
                {unreadCount > 0 && (
                    <div className="px-6 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                        <button 
                            onClick={onMarkAllRead}
                            className="text-sm font-medium text-sky-600 hover:text-sky-700 transition-colors"
                        >
                            Mark all as read
                        </button>
                    </div>
                )}

                {/* Notifications List */}
                <div className="flex-1 overflow-y-auto" style={{ height: 'calc(100% - 140px)' }}>
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                                <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                            </div>
                            <p className="text-gray-600 font-medium text-lg">All caught up!</p>
                            <p className="text-gray-400">You have no notifications at the moment.</p>
                        </div>
                    ) : (
                        Object.entries(groupedNotifications).map(([group, groupNotifications]) => (
                            <div key={group}>
                                <div className="sticky top-0 px-6 py-2 bg-white/80 backdrop-blur-sm border-b border-gray-100">
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{group}</p>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {groupNotifications.map((notification) => {
                                        const style = getNotificationStyle(notification.category, notification.type);
                                        return (
                                            <div
                                                key={notification.id}
                                                onClick={() => !notification.is_read && onMarkAsRead(notification.id)}
                                                className={`group flex items-start gap-4 px-6 py-4 cursor-pointer transition-all duration-200 hover:bg-white/60 ${
                                                    !notification.is_read ? 'bg-sky-50/30' : ''
                                                }`}
                                            >
                                                {/* Icon */}
                                                <div className={`shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${style.color} flex items-center justify-center shadow-lg shadow-gray-500/10 group-hover:scale-110 transition-transform`}>
                                                    <span className="text-xl">{style.icon}</span>
                                                </div>
                                                
                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p className={`font-semibold ${!notification.is_read ? 'text-gray-900' : 'text-gray-600'}`}>
                                                            {notification.title}
                                                        </p>
                                                        {!notification.is_read && (
                                                            <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0 mt-1.5"></span>
                                                        )}
                                                    </div>
                                                    <p className="text-gray-500 text-sm mt-1 line-clamp-2">{notification.message}</p>
                                                    <p className="text-gray-400 text-xs mt-2 flex items-center gap-1">
                                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        {formatTime(notification.created_at)}
                                                    </p>
                                                </div>
                                                
                                                {/* Unread Indicator Line */}
                                                {!notification.is_read && (
                                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-sky-400 to-blue-500 rounded-l"></div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <style>{`
                @keyframes slideInRight {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
                .animate-slideInRight {
                    animation: slideInRight 0.3s cubic-bezier(0.22, 1, 0.36, 1);
                }
            `}</style>
        </>
    );
};

// ============================================================================
// NOTIFICATION BELL - Main Component with API Integration
// ============================================================================

export default function NotificationBell({ userId }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [displayCount, setDisplayCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showSuccessGlow, setShowSuccessGlow] = useState(false);
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);

    // Fetch notifications from API
    const fetchNotifications = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const { data } = await api.get("/notifications");

            setNotifications(data.notifications || []);
            setUnreadCount(data.unread_count || 0);
            console.log("[Notifications] Fetched:", data.unread_count, "unread");
        } catch (err) {
            console.error("[Notifications] Fetch error:", err);
            setError("Failed to load notifications");
        } finally {
            setIsLoading(false);
        }
    };

    // Mark single notification as read
    const handleMarkAsRead = async (notificationId) => {
        try {
            const { data } = await api.put(`/notifications/${notificationId}/read`);

        setNotifications((prev) =>
            prev.map((n) =>
                n.id === notificationId ? { ...n, is_read: true, read_at: data.notification?.read_at } : n
            )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
        console.log("[Notifications] Marked as read:", notificationId);
        } catch (err) {
            console.error("[Notifications] Mark as read error:", err);
        }
    };

    // Mark all as read
    const handleMarkAllRead = async () => {
        try {
            await api.put("/notifications/read-all");
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true, read_at: new Date().toISOString() })));
        setUnreadCount(0);
        console.log("[Notifications] All marked as read");
        } catch (err) {
            console.error("[Notifications] Mark all as read error:", err);
        }
    };

    // Delete notification
    const handleDelete = async (notificationId) => {
        try {
            await api.delete(`/notifications/${notificationId}`);
        const wasUnread = notifications.find((n) => n.id === notificationId && !n.is_read);
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        if (wasUnread) {
            setUnreadCount((prev) => Math.max(0, prev - 1));
        }
        console.log("[Notifications] Deleted:", notificationId);
        } catch (err) {
            console.error("[Notifications] Delete error:", err);
        }
    };

    // Initial fetch and polling
    useEffect(() => {
        fetchNotifications();

        // Poll every 30 seconds for new notifications
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [userId]);

    return (
        <>
            {/* Notification Bell Button */}
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="relative p-3.5 rounded-2xl bg-gray-100 hover:bg-gray-200 transition-smooth group hover:scale-105 active:scale-95"
                    aria-label="Notifications"
                >
                    <svg
                        className="w-5 h-5 text-gray-600 group-hover:text-sky-600 transition-colors"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                        />
                    </svg>

                    {/* Glowing Badge for Unread Messages - Gold Glow Animation */}
                    {unreadCount > 0 && (
                        <>
                            {/* Outer glow ring */}
                            <span className="absolute -top-0.5 -right-0.5 w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-gold-600 animate-pulse opacity-50 blur-sm" />
                            {/* Inner glow ring */}
                            <span className="absolute -top-0.5 -right-0.5 w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-gold-600 animate-pulse opacity-75 blur-md" style={{ animationDelay: '0.5s' }} />
                            {/* Main badge */}
                            <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 flex items-center justify-center bg-gradient-to-br from-amber-400 via-gold-500 to-amber-600 rounded-full text-white text-xs font-bold shadow-lg shadow-amber-500/50 animate-bounce-spring">
                                {unreadCount > 99 ? "99+" : unreadCount}
                            </span>
                        </>
                    )}

                    {/* Soft pulsing glow when there are unread */}
                    {unreadCount > 0 && (
                        <span className="absolute inset-0 rounded-2xl bg-sky-400/20 animate-ping opacity-50" />
                    )}
                </button>

                {/* Dropdown Panel */}
                {isOpen && (
                    <NotificationDropdown
                        notifications={notifications}
                        onMarkAsRead={handleMarkAsRead}
                        onMarkAllRead={handleMarkAllRead}
                        onClose={() => setIsOpen(false)}
                        onOpenDrawer={() => {
                            setIsOpen(false);
                            setIsDrawerOpen(true);
                        }}
                    />
                )}
            </div>

            {/* Slide-in Drawer */}
            {isDrawerOpen && (
                <NotificationDrawer
                    notifications={notifications}
                    onMarkAsRead={handleMarkAsRead}
                    onMarkAllRead={handleMarkAllRead}
                    onClose={() => setIsDrawerOpen(false)}
                />
            )}
            
            {/* CSS for bounce-spring animation */}
            <style>{`
                @keyframes bounce-spring {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.2); }
                }
                .animate-bounce-spring {
                    animation: bounce-spring 2s ease-in-out infinite;
                }
            `}</style>
        </>
    );
}
