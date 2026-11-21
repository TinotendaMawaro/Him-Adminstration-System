import React, { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/api.js";
import Pagination from "../Pagination.jsx";
import { notificationStyle, relatedPage, timeAgo } from "../../lib/notifications.js";

const PER_PAGE = 10;
const TABS = [
    { id: "unread", label: "Unread" },
    { id: "read", label: "Read" },
    { id: "archived", label: "Archived" },
];

/**
 * Things that happened in your zone (a member joined, a report is due…). Messages people send you are in the Inbox, not here.
 * Tabs: unread · read · archived. Opening a notification marks it read; archiving keeps it but out of the way.
 */
export default function NotificationsPage({ initialTab = "unread", focus = null, onNavigate }) {
    const queryClient = useQueryClient();
    const [tab, setTab] = useState(initialTab);
    const [page, setPage] = useState(1);
    const [opened, setOpened] = useState(focus);
    const [busy, setBusy] = useState(false);

    useEffect(() => { setPage(1); }, [tab]);
    useEffect(() => { setOpened(focus); if (focus) setTab(focus.archived_at ? "archived" : "read"); }, [focus?.id]);

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ["notifications-page", tab, page],
        queryFn: async () => (await api.get("/notifications", { params: { kind: "notification", tab, page, per_page: PER_PAGE } })).data,
        placeholderData: (previous) => previous,
        refetchInterval: 30000,
    });

    const items = data?.notifications || [];
    const meta = data?.meta || { total: 0, last_page: 1 };

    const refresh = () => {
        queryClient.invalidateQueries({ queryKey: ["notifications-page"] });
        window.dispatchEvent(new Event("him:notifications-changed"));
    };

    const act = async (fn) => {
        setBusy(true);
        try { await fn(); refresh(); } catch (e) { console.error("[Notifications]", e); } finally { setBusy(false); }
    };

    const open = (n) => {
        setOpened(n);
        if (!n.is_read) act(() => api.put(`/notifications/${n.id}/read`).then(() => setOpened({ ...n, is_read: true })));
    };

    const archive = (n) => act(async () => { await api.post(`/notifications/${n.id}/archive`); if (opened?.id === n.id) setOpened(null); });
    const restore = (n) => act(async () => { await api.delete(`/notifications/${n.id}/archive`); if (opened?.id === n.id) setOpened(null); });
    const markAll = () => act(() => api.put("/notifications/read-all", null, { params: { kind: "notification" } }));

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="inline-flex rounded-xl bg-gray-100 p-1" role="tablist">
                    {TABS.map((t) => (
                        <button
                            key={t.id}
                            role="tab"
                            aria-selected={tab === t.id}
                            onClick={() => setTab(t.id)}
                            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${tab === t.id ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                        >
                            {t.label}
                            {t.id === "unread" && data?.unread_notifications > 0 && (
                                <span className="ml-2 rounded-full bg-rose-500 px-2 py-0.5 text-[11px] text-white">{data.unread_notifications}</span>
                            )}
                        </button>
                    ))}
                </div>
                {tab === "unread" && items.length > 0 && (
                    <button disabled={busy} onClick={markAll} className="text-sm font-semibold text-sky-600 hover:text-sky-700 disabled:opacity-50">Mark all as read</button>
                )}
            </div>

            {opened && (
                <div className="rounded-2xl border border-sky-100 bg-sky-50/60 p-4 sm:p-5">
                    <div className="flex items-start gap-3">
                        <div className={`shrink-0 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${notificationStyle(opened.category).color} text-xl`}>{notificationStyle(opened.category).icon}</div>
                        <div className="min-w-0 flex-1">
                            <p className="font-bold text-gray-900">{opened.title}</p>
                            <p className="mt-1 whitespace-pre-line break-words text-sm text-gray-700">{opened.message}</p>
                            <p className="mt-2 text-xs text-gray-400">{new Date(opened.created_at).toLocaleString()}</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {relatedPage(opened) && onNavigate && (
                                    <button onClick={() => onNavigate(relatedPage(opened).page)} className="rounded-lg bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white">{relatedPage(opened).label}</button>
                                )}
                                {opened.archived_at
                                    ? <button disabled={busy} onClick={() => restore(opened)} className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 border border-gray-200">Restore</button>
                                    : <button disabled={busy} onClick={() => archive(opened)} className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 border border-gray-200">Archive</button>}
                                <button onClick={() => setOpened(null)} className="rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-500 hover:bg-white">Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
                {isLoading ? (
                    <div className="p-8 text-center text-sm text-gray-400">Loading…</div>
                ) : isError ? (
                    <div className="p-8 text-center text-sm text-rose-600">Could not load notifications. <button className="underline" onClick={() => refetch()}>Try again</button></div>
                ) : items.length === 0 ? (
                    <div className="p-10 text-center">
                        <p className="font-medium text-gray-600">{tab === "unread" ? "You're all caught up" : tab === "read" ? "No read notifications yet" : "Nothing archived"}</p>
                        <p className="mt-1 text-sm text-gray-400">Messages from people are in your Inbox.</p>
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-100">
                        {items.map((n) => {
                            const style = notificationStyle(n.category);
                            return (
                                <li key={n.id} className={`group flex items-start gap-3 px-4 py-3.5 sm:px-5 ${opened?.id === n.id ? "bg-sky-50/60" : !n.is_read ? "bg-sky-50/30" : ""}`}>
                                    <button onClick={() => open(n)} className="flex min-w-0 flex-1 items-start gap-3 text-left">
                                        <span className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${style.color}`}>{style.icon}</span>
                                        <span className="min-w-0 flex-1">
                                            <span className="flex items-center gap-2">
                                                <span className={`truncate text-sm font-semibold ${n.is_read ? "text-gray-600" : "text-gray-900"}`}>{n.title}</span>
                                                {!n.is_read && <span className="h-2 w-2 shrink-0 rounded-full bg-sky-500" />}
                                            </span>
                                            <span className="mt-0.5 line-clamp-2 block text-sm text-gray-500">{n.message}</span>
                                            <span className="mt-1 block text-xs text-gray-400">{timeAgo(n.created_at)}</span>
                                        </span>
                                    </button>
                                    {tab === "archived"
                                        ? <button disabled={busy} onClick={() => restore(n)} className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-sky-600 hover:bg-sky-50">Restore</button>
                                        : <button disabled={busy} onClick={() => archive(n)} className="shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-gray-500 hover:bg-gray-100" title="Archive">Archive</button>}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            <Pagination currentPage={page} totalPages={meta.last_page} totalItems={meta.total} itemsPerPage={PER_PAGE} onPageChange={setPage} />
        </div>
    );
}
