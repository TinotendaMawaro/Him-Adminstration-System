import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";
import { BadgeCheck, ChevronRight, Crown, HeartHandshake, Home, IdCard, PlaySquare, ShieldCheck, ShoppingBag, Sparkles, Users } from "lucide-react";
import { community } from "./lib.js";
import { useUser } from "../context/UserContext.jsx";

/**
 * The first-time tour for members and partners (portals keep their own). It tells people what the app is and, importantly,
 * whether they are already a partner. Shown once: finishing or skipping it records `completed_tour` on the account.
 */
export default function AppTour({ onFinish }) {
    const { user } = useUser();
    const { data } = useQuery({ queryKey: ["bootstrap"], queryFn: community.bootstrap, staleTime: 30_000 });
    const p = data?.data?.partnership;
    const [i, setI] = useState(0);
    const first = user?.name?.split(" ")[0] || "friend";

    const partnerLine = !p ? "Loading your partnership…"
        : p.status === "active" || p.status === "expiring" ? `You are ${p.package ? `a ${p.package} partner` : "a partner"}. Thank you! Your marketplace shop and partner teachings are unlocked${p.renewal_date ? ` until ${new Date(p.renewal_date).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}` : ""}.`
        : p.status === "expired" ? "Your partnership has expired, so the marketplace and partner content are locked. Renew any time from Me → Partnership."
        : p.status === "pending" ? "Your partnership is waiting for its first payment. Finish it from Me → Partnership to unlock the marketplace."
        : "You are not a partner yet. Partners support the ministry and unlock the marketplace. You can join any time from Me → Partnership, and we will remind you each month.";

    const steps = [
        { icon: Sparkles, color: "#c9a84c", title: `Welcome, ${first}!`, text: "This is Heartfelt Community: your church family, in your pocket. Here is a 30-second look around." },
        { icon: Home, color: "#2f6bff", title: "Home", text: "Share posts, photos, videos and polls. Follow people, post 24-hour stories and encourage one another." },
        { icon: PlaySquare, color: "#e11d48", title: "Watch", text: "The Apostle's teachings and live services, with reminders so you never miss one." },
        { icon: Users, color: "#7c3aed", title: "Channels", text: "Start a channel for your group: chat, set goals, plan meetings and schedule live sessions." },
        { icon: ShoppingBag, color: "#12a150", title: "Market", text: "Partners open shops here. Everyone can order or ask for a quote. Keep your partnership active to keep the marketplace unlocked." },
        { icon: IdCard, color: "#0e7490", title: "Me", text: "Your zone, home group, department, prayer requests to your pastor, events and your digital ID card live under Me → My church." },
        { icon: ShieldCheck, color: "#0e7490", title: "Your data is protected", text: "Screenshots are blocked in this app to protect everyone's personal information. Never share your password, and sign out of all devices from Me → Security if you lose your phone." },
        { icon: p && (p.status === "active" || p.status === "expiring") ? Crown : HeartHandshake, color: "#b45309", title: "Your partnership", text: partnerLine },
    ];
    const s = steps[i], Icon = s.icon, last = i === steps.length - 1;

    useEffect(() => { const k = (e) => e.key === "Escape" && onFinish?.(); window.addEventListener("keydown", k); return () => window.removeEventListener("keydown", k); }, [onFinish]);

    return createPortal(
        <div role="dialog" aria-modal="true" aria-label="App tour" style={{ position: "fixed", inset: 0, zIndex: 99990, display: "flex", alignItems: "flex-end", justifyContent: "center", background: "rgba(6,14,28,.72)", backdropFilter: "blur(5px)", padding: 14, fontFamily: "Inter, system-ui, sans-serif" }}>
            <div key={i} style={{ width: "100%", maxWidth: 440, borderRadius: 28, background: "#fff", color: "#0f172a", padding: "26px 22px 20px", boxShadow: "0 30px 80px rgba(0,0,0,.5)", animation: "tour-up .45s cubic-bezier(.2,.9,.3,1.1) both" }}>
                <style>{"@keyframes tour-up{from{opacity:0;transform:translateY(40px) scale(.97)}to{opacity:1;transform:none}}"}</style>
                <div style={{ width: 64, height: 64, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", background: `${s.color}1f`, color: s.color }}><Icon size={32} /></div>
                <h2 style={{ fontSize: 24, fontWeight: 800, marginTop: 16, lineHeight: 1.15 }}>{s.title}</h2>
                <p style={{ fontSize: 15.5, lineHeight: 1.5, color: "#475569", marginTop: 8, minHeight: 92 }}>{s.text}</p>
                <div style={{ display: "flex", gap: 6, justifyContent: "center", margin: "6px 0 16px" }} aria-hidden="true">{steps.map((_, n) => <span key={n} style={{ width: n === i ? 22 : 7, height: 7, borderRadius: 7, background: n === i ? s.color : "#cbd5e1", transition: "all .3s" }} />)}</div>
                <div style={{ display: "flex", gap: 10 }}>
                    {!last && <button onClick={onFinish} style={{ height: 50, padding: "0 18px", borderRadius: 16, border: 0, background: "#f1f5f9", color: "#475569", fontWeight: 700, fontSize: 15 }}>Skip</button>}
                    <button onClick={() => (last ? onFinish?.() : setI(i + 1))} style={{ flex: 1, height: 50, borderRadius: 16, border: 0, background: `linear-gradient(135deg, ${s.color}, #0f2744)`, color: "#fff", fontWeight: 800, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                        {last ? <><BadgeCheck size={19} /> Start exploring</> : <>Next <ChevronRight size={19} /></>}
                    </button>
                </div>
            </div>
        </div>,
        document.body,
    );
}
