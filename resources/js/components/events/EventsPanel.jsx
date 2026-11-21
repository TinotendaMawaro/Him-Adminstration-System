import React, { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/api.js";
import Pagination from "../Pagination.jsx";

/**
 * The ONE events screen: the mobile app and the pastor / HOD portals all render this component, so an event is registered
 * for, paid for and cancelled the same way everywhere. Everything comes from /api/events (the database): no sample events.
 *
 * Colours use the app's CSS variables when they exist (so it follows dark mode in the app) and sensible light defaults on the web.
 */

const money = (n, currency = "USD") => {
    try { return new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 2 }).format(Number(n || 0)); }
    catch { return `${currency} ${Number(n || 0).toFixed(2)}`; }
};
const when = (iso) => (iso ? new Date(iso).toLocaleString(undefined, { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "");
const monthKey = (iso) => new Date(iso).toLocaleDateString(undefined, { month: "long", year: "numeric" });
const err = (e) => e?.response?.data?.message || (e?.response?.data?.errors && Object.values(e.response.data.errors).flat()[0]) || "Something went wrong. Please try again.";

const card = "rounded-2xl border bg-[var(--surface,#ffffff)] text-[var(--ink,#0f172a)] border-[var(--line,#e5e7eb)] shadow-sm overflow-hidden";
const muted = "text-[var(--mut,#64748b)]";
const btn = "inline-flex h-10 items-center justify-center rounded-xl px-4 text-sm font-bold transition active:scale-[.98] disabled:opacity-50";

export default function EventsPanel() {
    const qc = useQueryClient();
    const [tab, setTab] = useState("upcoming");
    const [busy, setBusy] = useState(null);
    const [flash, setFlash] = useState(null);   // { kind: "ok" | "bad", text }
    const say = (kind, text) => { setFlash({ kind, text }); setTimeout(() => setFlash(null), 5000); };

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ["events-panel"],
        queryFn: async () => (await api.get("/events", { params: { upcoming: 1 } })).data,
        staleTime: 30_000,
    });
    const events = data?.data || [];
    const shown = useMemo(() => (tab === "mine" ? events.filter((e) => e.my_registration && e.my_registration.status !== "cancelled") : events), [events, tab]);
    const PAGE_SIZE = 9;
    const [page, setPage] = useState(1);
    React.useEffect(() => { setPage(1); }, [tab]);
    const pageCount = Math.max(1, Math.ceil(shown.length / PAGE_SIZE));
    const current = Math.min(page, pageCount);
    const pageItems = useMemo(() => shown.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE), [shown, current]);
    const groups = useMemo(() => {
        const g = new Map();
        pageItems.forEach((e) => { const k = monthKey(e.starts_at); g.set(k, [...(g.get(k) || []), e]); });
        return [...g.entries()];
    }, [pageItems]);

    const done = async (msg) => { say("ok", msg); await refetch(); qc.invalidateQueries({ queryKey: ["events-mobile"] }); };
    const register = async (e) => { setBusy(e.id); try { await api.post(`/events/${e.id}/register`); await done(e.requires_payment ? "Registered. Complete your payment to confirm." : "You are registered."); } catch (x) { say("bad", err(x)); } setBusy(null); };
    const cancel = async (e) => { setBusy(e.id); try { await api.delete(`/events/${e.id}/register`); await done("Registration cancelled."); } catch (x) { say("bad", err(x)); } setBusy(null); };
    const pay = (r) => window.dispatchEvent(new CustomEvent("him:give", { detail: { type: "event_registration", registrationId: r.id } }));

    return (
        <section aria-label="Events" className="mx-auto w-full max-w-6xl">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div role="tablist" className="inline-flex rounded-xl bg-[var(--surface2,#f1f5f9)] p-1">
                    {[["upcoming", "Upcoming"], ["mine", "My events"]].map(([id, label]) => (
                        <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={`h-9 rounded-lg px-4 text-sm font-bold transition ${tab === id ? "bg-[var(--surface,#fff)] text-[var(--ink,#0f172a)] shadow" : muted}`}>{label}</button>
                    ))}
                </div>
                <span className={`text-sm ${muted}`}>{events.length} upcoming</span>
            </div>

            {flash && <p role="status" className={`mb-4 rounded-xl px-4 py-3 text-sm font-semibold ${flash.kind === "ok" ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-700"}`}>{flash.text}</p>}

            {isLoading && <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{[0, 1, 2].map((i) => <div key={i} className="h-44 animate-pulse rounded-2xl bg-[var(--surface2,#f1f5f9)]" />)}</div>}
            {isError && <div className={`${card} p-5`}><p className="font-semibold">Events could not be loaded.</p><button onClick={() => refetch()} className={`${btn} mt-3 bg-[var(--accent,#2f6bff)] text-white`}>Try again</button></div>}
            {!isLoading && !isError && shown.length === 0 && (
                <div className={`${card} p-8 text-center`}>
                    <div className="text-4xl" aria-hidden="true">📅</div>
                    <p className="mt-2 text-lg font-bold">{tab === "mine" ? "You have not registered for anything yet" : "No upcoming events"}</p>
                    <p className={`mt-1 text-sm ${muted}`}>{tab === "mine" ? "Register for an event and it will show here." : "New events and conferences will appear here as soon as they are published."}</p>
                </div>
            )}

            {groups.map(([month, list]) => (
                <div key={month} className="mb-6">
                    <h3 className={`mb-3 text-xs font-extrabold uppercase tracking-widest ${muted}`}>{month}</h3>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {list.map((e) => {
                            const r = e.my_registration, d = new Date(e.starts_at);
                            return (
                                <article key={e.id} className={`${card} flex h-full flex-col`}>
                                    {(e.banner_image || e.image) && <div style={{ aspectRatio: "16/7" }}><img src={e.banner_image || e.image} alt="" className="h-full w-full object-cover" loading="lazy" onError={(ev) => { ev.currentTarget.parentElement.style.display = "none"; }} /></div>}
                                    <div className="flex flex-1 gap-3.5 p-4">
                                        <div className="w-14 shrink-0 self-start rounded-2xl py-2 text-center" style={{ background: "linear-gradient(160deg,#c9a84c,#a8832c)", color: "#1c1503" }}>
                                            <div className="text-[11px] font-extrabold uppercase">{d.toLocaleString(undefined, { month: "short" })}</div>
                                            <div className="text-2xl font-extrabold leading-none">{d.getDate()}</div>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h4 className="text-[17px] font-extrabold leading-snug">{e.title}</h4>
                                            <p className={`mt-1 text-[12.5px] ${muted}`}>{when(e.starts_at)}</p>
                                            {e.venue_name && <p className={`text-[12.5px] ${muted}`}>📍 {e.venue_name}</p>}
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {e.requires_payment && <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">{money(e.registration_fee, e.currency)}</span>}
                                                {e.spots_remaining != null && <span className="rounded-full bg-[var(--surface2,#f1f5f9)] px-2.5 py-0.5 text-[11px] font-bold">{e.spots_remaining} spots left</span>}
                                                {r && <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">{r.status === "confirmed" ? "Confirmed" : r.status === "pending" ? "Registered" : r.status}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 px-4 pb-4">
                                        {r ? (
                                            <>
                                                {Number(r.balance_due || 0) > 0 && <button className={`${btn} flex-1 bg-[var(--accent,#2f6bff)] text-white`} onClick={() => pay(r)}>Pay {money(r.balance_due, e.currency)}</button>}
                                                {r.status !== "cancelled" && Number(r.amount_paid || 0) === 0 && <button className={`${btn} bg-[var(--surface2,#f1f5f9)]`} disabled={busy === e.id} onClick={() => cancel(e)}>{busy === e.id ? "…" : "Cancel"}</button>}
                                            </>
                                        ) : e.requires_registration === false ? (
                                            <p className={`text-sm ${muted}`}>No registration needed. Just come!</p>
                                        ) : (
                                            <button className={`${btn} w-full bg-[var(--accent,#2f6bff)] text-white`} disabled={busy === e.id || e.registration_open === false} onClick={() => register(e)}>{e.registration_open === false ? "Registration closed" : busy === e.id ? "Registering…" : "Register"}</button>
                                        )}
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </div>
            ))}
            <Pagination currentPage={current} totalPages={pageCount} totalItems={shown.length} itemsPerPage={PAGE_SIZE} onPageChange={setPage} className="mt-2" />
        </section>
    );
}
