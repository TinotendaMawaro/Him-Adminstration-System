import React from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../lib/api.js";
import { notificationStyle, timeAgo } from "../../lib/notifications.js";

/** On top of the dashboard cards: what is new in the zone, and how many messages wait in the inbox. */
export default function NotificationStrip({ onNavigate }) {
    const { data } = useQuery({
        queryKey: ["notification-strip"],
        queryFn: async () => (await api.get("/notifications", { params: { kind: "notification", tab: "unread", per_page: 4 } })).data,
        refetchInterval: 30000,
        refetchOnWindowFocus: true,
    });

    const items = data?.notifications || [];
    const unreadNotifications = data?.unread_notifications || 0;
    const unreadMessages = data?.unread_messages || 0;

    if (!items.length && !unreadMessages) return null;

    return (
        <section aria-label="Notifications" className="overflow-hidden rounded-xl border border-amber-100 bg-gradient-to-r from-amber-50/80 to-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-100/70 px-4 py-2.5">
                <h3 className="flex items-center gap-2 text-sm font-bold text-gray-900">
                    Notifications
                    {unreadNotifications > 0 && <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[11px] font-semibold text-white">{unreadNotifications} new</span>}
                </h3>
                <div className="flex items-center gap-2">
                    {unreadMessages > 0 && (
                        <button onClick={() => onNavigate("inbox")} className="rounded-lg bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-700 hover:bg-sky-200">
                            ✉️ {unreadMessages} unread {unreadMessages === 1 ? "message" : "messages"}
                        </button>
                    )}
                    <button onClick={() => onNavigate("notifications")} className="text-xs font-semibold text-amber-700 hover:text-amber-800">View all</button>
                </div>
            </div>
            {items.length > 0 && (
                <ul className="divide-y divide-amber-100/60">
                    {items.map((n) => (
                        <li key={n.id}>
                            <button onClick={() => onNavigate("notifications", { focus: n })} className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-white/70">
                                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${notificationStyle(n.category).color} text-sm`}>{notificationStyle(n.category).icon}</span>
                                <span className="min-w-0 flex-1">
                                    <span className="block truncate text-sm font-semibold text-gray-900">{n.title}</span>
                                    <span className="block truncate text-xs text-gray-500">{n.message}</span>
                                </span>
                                <span className="shrink-0 text-[11px] text-gray-400">{timeAgo(n.created_at)}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
