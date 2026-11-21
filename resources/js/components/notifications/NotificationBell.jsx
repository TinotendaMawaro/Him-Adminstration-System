import React, { useState, useEffect, useRef, useCallback } from "react";
import api from "../../lib/api";
import { setTitleBadge, showAlert } from "../../lib/alerts.js";
import { isMessage, notificationStyle, timeAgo } from "../../lib/notifications.js";

const BellIcon = ({ className }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
);

/**
 * The bell. What a click does depends on what the notification is:
 *   - a MESSAGE someone sent  → opens in the Inbox, on that conversation;
 *   - anything else (a member joined, a report is due…) → opens in the Notifications tab, where it can be read or archived.
 * `onNavigate(page, params)` is the portal's own navigation.
 */
function Dropdown({ notifications, unread, onOpen, onMarkAll, onClose, onNavigate }) {
    const ref = useRef(null);

    useEffect(() => {
        const outside = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
        const esc = (e) => { if (e.key === "Escape") onClose(); };
        document.addEventListener("mousedown", outside);
        document.addEventListener("keydown", esc);
        return () => { document.removeEventListener("mousedown", outside); document.removeEventListener("keydown", esc); };
    }, [onClose]);

    const go = (page) => { onClose(); onNavigate?.(page); };

    return (
        <div ref={ref} className="absolute right-0 z-50 mt-3 w-[22rem] max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-2xl border border-white/50 bg-white/90 shadow-2xl backdrop-blur-xl" style={{ animation: "bellDown .18s ease-out" }}>
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3.5">
                <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-gray-900">Notifications</h3>
                    {unread > 0 && <span className="rounded-full bg-rose-500 px-2 py-0.5 text-xs font-semibold text-white">{unread}</span>}
                </div>
                {unread > 0 && <button onClick={onMarkAll} className="text-xs font-semibold text-sky-600 hover:text-sky-700">Mark all read</button>}
            </div>

            <div className="overflow-y-auto" style={{ maxHeight: 340 }}>
                {notifications.length === 0 ? (
                    <div className="px-5 py-10 text-center">
                        <p className="font-medium text-gray-500">No notifications yet</p>
                        <p className="text-sm text-gray-400">You're all caught up!</p>
                    </div>
                ) : notifications.map((n) => {
                    const style = notificationStyle(n.category);
                    const message = isMessage(n);
                    return (
                        <button key={n.id} onClick={() => onOpen(n)} className={`flex w-full items-start gap-3 border-b border-gray-50 px-5 py-3.5 text-left transition-colors hover:bg-gray-50 ${!n.is_read ? "bg-sky-50/40" : ""}`}>
                            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${style.color}`}>{style.icon}</span>
                            <span className="min-w-0 flex-1">
                                <span className="flex items-center gap-2">
                                    <span className={`truncate text-sm font-semibold ${!n.is_read ? "text-gray-900" : "text-gray-600"}`}>{n.title}</span>
                                    {!n.is_read && <span className="h-2 w-2 shrink-0 rounded-full bg-sky-500" />}
                                </span>
                                <span className="mt-0.5 line-clamp-2 block text-sm text-gray-500">{n.message}</span>
                                <span className="mt-1 flex items-center gap-2 text-xs text-gray-400">
                                    {timeAgo(n.created_at)}
                                    <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-gray-500">{message ? "Inbox" : "Notification"}</span>
                                </span>
                            </span>
                        </button>
                    );
                })}
            </div>

            <div className="grid grid-cols-2 gap-2 border-t border-gray-100 bg-gray-50/60 p-3">
                <button onClick={() => go("inbox")} className="rounded-xl py-2 text-sm font-semibold text-sky-600 hover:bg-sky-50">Open Inbox</button>
                <button onClick={() => go("notifications")} className="rounded-xl py-2 text-sm font-semibold text-sky-600 hover:bg-sky-50">All notifications</button>
            </div>
            <style>{`@keyframes bellDown{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}`}</style>
        </div>
    );
}

export default function NotificationBell({ userId, onNavigate }) {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const lastUnread = useRef(null);

    const fetchNotifications = useCallback(async () => {
        try {
            const { data } = await api.get("/notifications", { params: { tab: "all", per_page: 12 } });
            const incoming = data.unread_count || 0;
            if (lastUnread.current != null && incoming > lastUnread.current) {
                const newest = (data.notifications || []).find((n) => !n.is_read);
                showAlert(newest?.title || "Heartfelt", newest?.message || `You have ${incoming} unread notifications`);
            }
            lastUnread.current = incoming;
            setTitleBadge(incoming);
            setNotifications(data.notifications || []);
            setUnreadCount(incoming);
        } catch (err) {
            console.error("[Notifications] Fetch error:", err);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
        const tick = () => { if (!document.hidden) fetchNotifications(); };
        const interval = setInterval(tick, 30000);
        window.addEventListener("focus", fetchNotifications);
        window.addEventListener("him:notifications-changed", fetchNotifications);
        document.addEventListener("visibilitychange", tick);
        return () => {
            clearInterval(interval);
            window.removeEventListener("focus", fetchNotifications);
            window.removeEventListener("him:notifications-changed", fetchNotifications);
            document.removeEventListener("visibilitychange", tick);
        };
    }, [userId, fetchNotifications]);

    const markRead = async (n) => {
        if (n.is_read) return;
        setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)));
        setUnreadCount((c) => Math.max(0, c - 1));
        try { await api.put(`/notifications/${n.id}/read`); } catch (err) { console.error("[Notifications] Mark as read error:", err); fetchNotifications(); }
    };

    const open = async (n) => {
        setIsOpen(false);
        markRead(n);
        if (isMessage(n)) {
            onNavigate?.("inbox", { contactId: n.related_id ? Number(n.related_id) : null });
        } else {
            onNavigate?.("notifications", { focus: { ...n, is_read: true } });
        }
    };

    const markAll = async () => {
        try {
            await api.put("/notifications/read-all");
            setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
            setUnreadCount(0);
            setTitleBadge(0);
            window.dispatchEvent(new Event("him:notifications-changed"));
        } catch (err) {
            console.error("[Notifications] Mark all as read error:", err);
        }
    };

    return (
        <div className="relative">
            <button onClick={() => setIsOpen((v) => !v)} className="group relative rounded-2xl bg-gray-100 p-3.5 transition-all hover:scale-105 hover:bg-gray-200 active:scale-95" aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ""}`} aria-expanded={isOpen}>
                <BellIcon className="h-5 w-5 text-gray-600 transition-colors group-hover:text-sky-600" />
                {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-amber-600 px-1.5 text-xs font-bold text-white shadow-lg shadow-amber-500/50">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </button>
            {isOpen && (
                <Dropdown notifications={notifications} unread={unreadCount} onOpen={open} onMarkAll={markAll} onClose={() => setIsOpen(false)} onNavigate={onNavigate} />
            )}
        </div>
    );
}
