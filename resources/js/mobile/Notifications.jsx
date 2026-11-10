import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BellRing, Bell, CheckCheck, Heart, Info, MessageCircle, Megaphone, ShoppingBag, Ticket, Trash2, HandHeart, Home as HomeIcon, Building2 } from "lucide-react";
import { Btn, Chip, Empty, ErrorState, Skel, TopBar, toast } from "./ui.jsx";
import { Scroller } from "./Feed.jsx";
import api from "../lib/api.js";
import { errorMessage, haptic, timeAgo } from "./lib.js";
import { useNav } from "./nav.jsx";
import { alertsState, enableAlerts } from "../lib/alerts.js";

const ICON = {
    community: [Heart, "#e11d48"], market: [ShoppingBag, "#12a150"], message: [MessageCircle, "#2f6bff"], broadcast: [Megaphone, "#c9a84c"],
    event_registration: [Ticket, "#0e7490"], prayer_center: [HandHeart, "#e11d48"], partnership: [HandHeart, "#b45309"], homegroup: [HomeIcon, "#12a150"], department: [Building2, "#7c3aed"], system: [Info, "#667791"],
};
const FILTERS = [["all", "All"], ["unread", "Unread"], ["community", "Community"], ["market", "Market"], ["church", "Church"]];
const CHURCH = new Set(["broadcast", "event_registration", "prayer_center", "partnership", "homegroup", "department", "message", "system"]);

const dayLabel = (iso) => {
    const d = new Date(iso), t = new Date();
    const days = Math.round((new Date(t.getFullYear(), t.getMonth(), t.getDate()) - new Date(d.getFullYear(), d.getMonth(), d.getDate())) / 864e5);
    return days <= 0 ? "Today" : days === 1 ? "Yesterday" : days < 7 ? "This week" : "Earlier";
};

export default function NotificationsScreen() {
    const nav = useNav();
    const qc = useQueryClient();
    const [filter, setFilter] = useState("all");
    const [perm, setPerm] = useState(alertsState());
    const { data, isLoading, isError, error, refetch } = useQuery({ queryKey: ["notifications"], queryFn: async () => (await api.get("/notifications", { params: { limit: 100 } })).data, staleTime: 10_000 });
    const all = data?.notifications || [];
    const sync = () => { refetch(); qc.invalidateQueries({ queryKey: ["bootstrap"] }); };

    const list = useMemo(() => all.filter((n) => filter === "all" ? true : filter === "unread" ? !n.is_read : filter === "church" ? CHURCH.has(n.category) || !ICON[n.category] : n.category === filter), [all, filter]);
    const groups = useMemo(() => {
        const g = {};
        list.forEach((n) => { (g[dayLabel(n.created_at)] ||= []).push(n); });
        return ["Today", "Yesterday", "This week", "Earlier"].filter((k) => g[k]).map((k) => [k, g[k]]);
    }, [list]);
    const unread = all.filter((n) => !n.is_read).length;

    const markAll = async () => { try { await api.put("/notifications/read-all"); sync(); } catch (e) { toast(errorMessage(e), "error"); } };
    const clearRead = async () => { try { await api.delete("/notifications/clear-read"); toast("Cleared", "success"); sync(); } catch (e) { toast(errorMessage(e), "error"); } };
    const remove = async (n, e) => { e.stopPropagation(); haptic(8); try { await api.delete(`/notifications/${n.id}`); sync(); } catch (err) { toast(errorMessage(err), "error"); } };
    const turnOn = async () => { const r = await enableAlerts(); setPerm(r); toast(r === "granted" ? "Alerts are on" : "Alerts are blocked in your browser settings", r === "granted" ? "success" : "error"); };

    const open = (n) => {
        if (!n.is_read) api.put(`/notifications/${n.id}/read`).then(sync).catch(() => {});
        const t = `${n.title} ${n.message || ""}`;
        if (n.category === "market") nav.push("orders", { as: /New order|Quote request/.test(n.title) ? "seller" : "buyer" });
        else if (n.category === "event_registration") nav.push("events");
        else if (n.category === "prayer_center") nav.push("prayer");
        else if (n.category === "partnership") nav.push("partnership");
        else if (n.category === "homegroup" || /home ?group/i.test(t)) nav.push("homegroup");
        else if (n.category === "department" || /department/i.test(t)) nav.push("department");
        else if (n.category === "community" && /Live|Starting soon/.test(n.title)) nav.setTab("watch");
    };

    return (
        <div className="flex flex-col h-full">
            <TopBar back title="Notifications" subtitle={unread ? `${unread} unread` : "All caught up"} right={unread > 0 && <Btn variant="ghost" size="sm" icon={CheckCheck} onClick={markAll}>Read all</Btn>} />
            <div className="flex gap-2 overflow-x-auto px-3 py-2 shrink-0">{FILTERS.map(([id, label]) => <Chip key={id} on={filter === id} onClick={() => setFilter(id)}>{label}</Chip>)}</div>
            <Scroller onRefresh={refetch}>
                <div className="px-3 pb-8">
                    {perm === "default" && (
                        <div className="hm-card p-3.5 mb-3 flex items-center gap-3" style={{ borderColor: "color-mix(in srgb, var(--accent) 40%, var(--line))" }}>
                            <BellRing size={22} style={{ color: "var(--accent)" }} className="shrink-0" />
                            <div className="flex-1 min-w-0 text-sm"><b>Get alerts on this device</b><div className="text-xs" style={{ color: "var(--mut)" }}>Know straight away about replies, orders, live services and messages from your pastor.</div></div>
                            <Btn size="sm" onClick={turnOn}>Turn on</Btn>
                        </div>
                    )}
                    {isLoading && [0, 1, 2, 3].map((i) => <Skel key={i} h={72} r={16} className="mb-2" />)}
                    {isError && <ErrorState error={error} onRetry={refetch} />}
                    {!isLoading && !isError && list.length === 0 && <Empty icon={Bell} title={filter === "all" ? "You are all caught up" : "Nothing here"} text="Likes, replies, orders, reminders and pastoral messages show up here." />}
                    {groups.map(([label, items]) => (
                        <section key={label} className="mt-3"><h3 className="hm-label">{label}</h3>
                            <div className="space-y-2">{items.map((n) => { const [I, c] = ICON[n.category] || ICON.system; return (
                                <div key={n.id} role="button" tabIndex={0} onClick={() => open(n)} onKeyDown={(e) => e.key === "Enter" && open(n)} className="w-full hm-card p-3.5 flex gap-3 text-left cursor-pointer active:scale-[.99] transition-transform" style={!n.is_read ? { borderColor: "color-mix(in srgb, var(--accent) 45%, var(--line))", background: "color-mix(in srgb, var(--accent) 6%, var(--surface))" } : undefined}>
                                    <span className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0" style={{ background: `color-mix(in srgb, ${c} 14%, transparent)`, color: c }}><I size={19} /></span>
                                    <div className="flex-1 min-w-0"><div className="font-bold text-[14.5px] leading-snug">{n.title}</div><div className="text-[13px] line-clamp-2 mt-0.5" style={{ color: "var(--mut)" }}>{n.message}</div><div className="text-[11.5px] mt-1" style={{ color: "var(--mut)" }}>{timeAgo(n.created_at)}</div></div>
                                    <div className="flex flex-col items-center justify-between shrink-0">{!n.is_read ? <span className="w-2.5 h-2.5 rounded-full mt-1" style={{ background: "var(--accent)" }} /> : <span />}<button aria-label="Delete notification" onClick={(e) => remove(n, e)} className="p-1.5 -mr-1 rounded-lg" style={{ color: "var(--mut)" }}><Trash2 size={16} /></button></div>
                                </div>); })}</div>
                        </section>
                    ))}
                    {all.some((n) => n.is_read) && <div className="text-center mt-5"><Btn variant="soft" size="sm" onClick={clearRead}>Clear read notifications</Btn></div>}
                </div>
            </Scroller>
        </div>
    );
}
