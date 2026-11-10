// Partnership inside the app: the status members see, the monthly nudge, the lock on partner-only material, and the screen to join or renew.
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, BadgeCheck, CalendarClock, Check, Crown, HeartHandshake, Lock, Store, Tv, X } from "lucide-react";
import { Body, Btn, Empty, ErrorState, Skel, TopBar, toast } from "./ui.jsx";
import api from "../lib/api.js";
import { community, errorMessage, haptic, money } from "./lib.js";
import { useNav } from "./nav.jsx";

const TONE = {
    none: { label: "Not a partner yet", color: "#2f6bff", icon: HeartHandshake },
    pending: { label: "Waiting for payment", color: "#b45309", icon: CalendarClock },
    active: { label: "Active partner", color: "#12a150", icon: BadgeCheck },
    expiring: { label: "Renews soon", color: "#b45309", icon: CalendarClock },
    expired: { label: "Expired", color: "#e11d48", icon: AlertTriangle },
};
const FREQ = [["monthly", "Monthly"], ["quarterly", "Every 3 months"], ["annually", "Yearly"]];
const fmtDate = (d) => (d ? new Date(d).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : null);

export function usePartnership() {
    const { data } = useQuery({ queryKey: ["bootstrap"], queryFn: community.bootstrap, staleTime: 30_000 });
    return data?.data?.partnership || null;
}

const give = (amount) => window.dispatchEvent(new CustomEvent("him:give", { detail: { type: "partnership", amount } }));

// ── Slim strip + monthly nudge on the Home tab ──────────────────────────────────────────────────────
export function PartnershipBanner() {
    const nav = useNav();
    const p = usePartnership();
    const month = new Date().toISOString().slice(0, 7);
    const [hidden, setHidden] = useState(() => { try { return localStorage.getItem("hm-partner-nudge") === month; } catch { return false; } });
    if (!p) return null;
    const hide = () => { try { localStorage.setItem("hm-partner-nudge", month); } catch { /* storage blocked */ } setHidden(true); };
    const open = () => { haptic(8); nav.push("partnership"); };

    if (p.status === "active") {
        return (
            <button onClick={open} className="w-full flex items-center gap-2 px-4 py-2 text-left text-[12.5px] font-semibold" style={{ background: "color-mix(in srgb, #12a150 12%, var(--surface))", color: "#0b7a3d" }}>
                <Crown size={15} /> {p.package ? `${p.package} partner` : "Partner"}{p.renewal_date ? ` · active until ${fmtDate(p.renewal_date)}` : " · thank you for partnering"}
            </button>
        );
    }
    if (p.status === "expired") {
        return (
            <div className="flex items-center gap-3 px-4 py-2.5" style={{ background: "color-mix(in srgb, #e11d48 12%, var(--surface))", color: "#9f1239" }}>
                <AlertTriangle size={18} className="shrink-0" />
                <button onClick={open} className="flex-1 text-left text-[13px] font-semibold leading-snug">Your partnership has expired. The marketplace and partner content are locked. <u>Renew now</u></button>
            </div>
        );
    }
    if (hidden) return null;
    const warn = p.status === "expiring";
    return (
        <div className="flex items-center gap-3 px-4 py-2.5" style={{ background: `color-mix(in srgb, ${warn ? "#b45309" : "#2f6bff"} 11%, var(--surface))`, color: warn ? "#92400e" : "#1d4ed8" }}>
            <HeartHandshake size={18} className="shrink-0" />
            <button onClick={open} className="flex-1 text-left text-[13px] font-semibold leading-snug">{warn ? p.message : p.status === "pending" ? "Finish your partnership payment to unlock the marketplace." : "Become a partner this month: support the ministry and unlock the marketplace."} <u>{warn ? "Renew" : "Learn more"}</u></button>
            <button aria-label="Dismiss until next month" onClick={hide} className="p-1 -mr-1 opacity-70"><X size={16} /></button>
        </div>
    );
}

// ── Shown instead of locked material (the marketplace, partner-only teachings) ────────────────────
export function PartnerLock({ what = "the marketplace", compact }) {
    const nav = useNav();
    const p = usePartnership();
    return (
        <div className={`flex flex-col items-center text-center px-8 ${compact ? "py-8" : "py-16"}`}>
            <span className="w-16 h-16 rounded-3xl flex items-center justify-center mb-4" style={{ background: "color-mix(in srgb, #e11d48 12%, transparent)", color: "#e11d48" }}><Lock size={30} /></span>
            <h2 className="text-xl font-extrabold">{p?.status === "none" ? "Partners only" : "Your partnership has expired"}</h2>
            <p className="text-sm mt-2 max-w-xs" style={{ color: "var(--mut)" }}>{p?.status === "none" ? `Become a partner to use ${what}.` : `Renew your partnership to use ${what} again.`}</p>
            <Btn className="mt-5" icon={HeartHandshake} onClick={() => nav.push("partnership")}>{p?.status === "none" ? "Become a partner" : "Renew partnership"}</Btn>
        </div>
    );
}

// ── The partnership screen ─────────────────────────────────────────────────────────────────────────
export function PartnershipScreen() {
    const qc = useQueryClient();
    const p = usePartnership();
    const [freq, setFreq] = useState("monthly");
    const [picked, setPicked] = useState(null);
    const pk = useQuery({ queryKey: ["partnership-packages"], queryFn: async () => (await api.get("/partnership-packages")).data.data || [], staleTime: 300_000 });
    const t = TONE[p?.status || "none"];
    const Icon = t.icon;
    const canPay = p && p.status !== "none";

    const enroll = useMutation({
        mutationFn: (pkg) => api.post("/partners/enroll", { package_id: pkg.id, contribution_type: freq, payment_method: "visa" }),
        onSuccess: (_, pkg) => { qc.invalidateQueries({ queryKey: ["bootstrap"] }); toast("Almost done: complete your first payment", "success"); give(pkg.monthly_amount); },
        onError: (e) => toast(errorMessage(e), "error"),
    });

    const days = p?.days_left;
    const pct = p?.status === "active" || p?.status === "expiring" ? Math.max(4, Math.min(100, Math.round(((days ?? 30) / 31) * 100))) : p?.status === "expired" ? 0 : null;

    return (
        <div className="flex flex-col h-full">
            <TopBar back title="Partnership" subtitle="Support the ministry, unlock more" />
            <Body>
                <div className="rounded-3xl p-5 text-white relative overflow-hidden" style={{ background: `linear-gradient(150deg, #0f2744, #1e3a5f 55%, ${t.color} 170%)` }}>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider opacity-90"><Icon size={15} /> {t.label}</div>
                    <div className="text-2xl font-extrabold mt-1 leading-tight">{p?.package ? `${p.package} partner` : p?.status === "none" ? "Join the partners" : "Partnership"}</div>
                    <p className="text-sm opacity-90 mt-1.5 leading-snug">{p?.message || "Partners support the work of the ministry and unlock the marketplace."}</p>
                    {p?.renewal_date && <div className="text-[13px] mt-3 font-semibold">{p.status === "expired" ? "Expired" : "Renews"} {fmtDate(p.renewal_date)}</div>}
                    {pct !== null && <div className="h-2 rounded-full mt-2" style={{ background: "rgba(255,255,255,.18)" }}><div className="h-2 rounded-full" style={{ width: `${pct}%`, background: p.status === "expired" ? "#fb7185" : "linear-gradient(90deg,#c9a84c,#f2dc9a)" }} /></div>}
                    {canPay && p.amount > 0 && <Btn block className="mt-4" icon={HeartHandshake} onClick={() => give(p.amount)}>{p.status === "expired" || p.status === "expiring" ? "Renew" : p.status === "pending" ? "Pay now" : "Give"} {money(p.amount)}</Btn>}
                </div>

                <h3 className="hm-label" style={{ marginTop: 24 }}>What partners enjoy</h3>
                <div className="hm-card divide-y" style={{ "--tw-divide-opacity": 1 }}>
                    {[[Store, "Open a shop", "Sell products and services to the whole community"], [Tv, "Partner-only teachings", "Messages kept for partners"], [BadgeCheck, "Partner badge", "Shown on your profile and posts"]].map(([I, a, b], i) => (
                        <div key={a} className="flex items-center gap-3.5 px-4 py-3" style={i ? { borderTop: "1px solid var(--line)" } : undefined}>
                            <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "color-mix(in srgb, var(--accent) 12%, transparent)", color: "var(--accent)" }}><I size={18} /></span>
                            <div className="min-w-0"><div className="font-semibold text-[15px]">{a}</div><div className="text-xs" style={{ color: "var(--mut)" }}>{b}</div></div>
                        </div>
                    ))}
                </div>

                {(!p || p.status === "none") && (
                    <>
                        <h3 className="hm-label" style={{ marginTop: 24 }}>Choose a package</h3>
                        <div className="flex gap-1 rounded-2xl p-1 mb-3" style={{ background: "var(--surface2)" }}>
                            {FREQ.map(([id, label]) => <button key={id} onClick={() => setFreq(id)} className="flex-1 h-9 rounded-xl text-[12.5px] font-bold transition" style={freq === id ? { background: "var(--surface)", boxShadow: "var(--shadow-sm, 0 1px 3px rgba(0,0,0,.12))" } : { color: "var(--mut)" }}>{label}</button>)}
                        </div>
                        {pk.isLoading && <Skel h={92} r={20} />}
                        {pk.isError && <ErrorState error={pk.error} onRetry={pk.refetch} />}
                        {!pk.isLoading && !pk.isError && !(pk.data || []).length && <Empty icon={HeartHandshake} title="No packages yet" text="Head office has not published partnership packages." />}
                        <div className="space-y-3">
                            {(pk.data || []).map((pkg) => (
                                <button key={pkg.id} onClick={() => { haptic(8); setPicked(pkg.id); }} className="hm-card p-4 w-full text-left transition" style={picked === pkg.id ? { borderColor: "var(--accent)", boxShadow: "0 0 0 2px color-mix(in srgb, var(--accent) 30%, transparent)" } : undefined}>
                                    <div className="flex items-center justify-between gap-3"><div className="font-extrabold text-[17px]">{pkg.name}</div><div className="font-extrabold">{money(pkg.monthly_amount)}<span className="text-xs font-semibold" style={{ color: "var(--mut)" }}>/mo</span></div></div>
                                    {pkg.impact_description && <p className="text-[13px] mt-1" style={{ color: "var(--mut)" }}>{pkg.impact_description}</p>}
                                    {picked === pkg.id && Array.isArray(pkg.benefits) && <ul className="mt-2 space-y-1">{pkg.benefits.map((b) => <li key={b} className="flex gap-2 text-[13px]"><Check size={15} style={{ color: "#12a150" }} className="shrink-0 mt-0.5" />{b}</li>)}</ul>}
                                </button>
                            ))}
                        </div>
                        <Btn block className="mt-4" disabled={!picked} loading={enroll.isPending} icon={HeartHandshake} onClick={() => enroll.mutate((pk.data || []).find((x) => x.id === picked))}>Become a partner</Btn>
                        <p className="text-xs text-center mt-2" style={{ color: "var(--mut)" }}>You pay securely through the ClicknPay gateway. Your partnership starts when the payment is confirmed.</p>
                    </>
                )}
            </Body>
        </div>
    );
}
