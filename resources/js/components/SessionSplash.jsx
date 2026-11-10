import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/**
 * One animated splash for every sign-in and sign-out, in every portal and in the app:
 *   <SessionSplash mode="welcome" name="Tino" subtitle="Gold partner · IOC zone" onDone={...} />   after a successful sign-in
 *   <GoodbyeHost />                                                                            mounted once; shows the sign-out message
 * Anything can say goodbye with:  sayGoodbye({ name, reason })
 */

const KEYFRAMES = `
@keyframes ss-pop{0%{transform:scale(.4);opacity:0}60%{transform:scale(1.08);opacity:1}100%{transform:scale(1)}}
@keyframes ss-ring{to{transform:rotate(360deg)}}
@keyframes ss-rise{0%{opacity:0;transform:translateY(18px)}100%{opacity:1;transform:none}}
@keyframes ss-bar{0%{width:0}100%{width:100%}}
@keyframes ss-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
@keyframes ss-fade{0%{opacity:0}100%{opacity:1}}
@keyframes ss-check{0%{stroke-dashoffset:48}100%{stroke-dashoffset:0}}
@media (prefers-reduced-motion: reduce){.ss *{animation-duration:.01ms!important;animation-delay:0ms!important}}
`;

const BG = "radial-gradient(60% 50% at 80% 0%, rgba(47,107,255,.45), transparent 70%), radial-gradient(55% 45% at 0% 100%, rgba(201,168,76,.32), transparent 70%), linear-gradient(160deg, #08172b, #0f2744 60%, #132f55)";

function Shell({ children, onSkip, label }) {
    return (
        <div className="ss" role="status" aria-live="polite" aria-label={label} onClick={onSkip} style={{ position: "fixed", inset: 0, zIndex: 100000, display: "flex", alignItems: "center", justifyContent: "center", background: BG, color: "#fff", textAlign: "center", padding: 24, fontFamily: "Inter, 'Segoe UI', system-ui, sans-serif", overflow: "hidden", animation: "ss-fade .35s ease both" }}>
            <style>{KEYFRAMES}</style>
            {[8, 22, 40, 60, 78, 90].map((l, i) => <span key={l} aria-hidden="true" style={{ position: "absolute", left: `${l}%`, top: `${15 + ((i * 17) % 60)}%`, width: 6 + (i % 3) * 4, height: 6 + (i % 3) * 4, borderRadius: "50%", background: i % 2 ? "rgba(232,207,138,.5)" : "rgba(120,160,255,.45)", animation: `ss-float ${4 + (i % 3)}s ease-in-out ${i * 0.4}s infinite` }} />)}
            <div style={{ maxWidth: 420, width: "100%" }}>{children}</div>
        </div>
    );
}

function Logo() {
    return (
        <div style={{ position: "relative", width: 128, height: 128, margin: "0 auto 28px" }}>
            <div aria-hidden="true" style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "conic-gradient(from 0deg, #c9a84c, #f6e2a0, rgba(255,255,255,.1), #c9a84c)", animation: "ss-ring 2.4s linear infinite", WebkitMask: "radial-gradient(circle, transparent 58%, #000 60%)", mask: "radial-gradient(circle, transparent 58%, #000 60%)" }} />
            <div style={{ position: "absolute", inset: 14, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", animation: "ss-pop .8s cubic-bezier(.2,.9,.3,1.2) both", boxShadow: "0 12px 40px rgba(0,0,0,.4)" }}>
                <img src="/images/logo.webp" alt="" style={{ width: "78%", height: "78%", objectFit: "contain" }} onError={(e) => { e.currentTarget.style.display = "none"; }} />
            </div>
        </div>
    );
}

export function SessionSplash({ name, subtitle, done = true, minMs = 2400, onDone }) {
    const [elapsed, setElapsed] = useState(false);
    const fired = useRef(false);
    useEffect(() => { const t = setTimeout(() => setElapsed(true), minMs); return () => clearTimeout(t); }, [minMs]);
    useEffect(() => {
        if (elapsed && done && !fired.current) { fired.current = true; onDone?.(); }
    }, [elapsed, done, onDone]);
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

    return createPortal(
        <Shell label={`Welcome ${name || ""}`} onSkip={() => { if (done && !fired.current) { fired.current = true; onDone?.(); } }}>
            <Logo />
            <p style={{ fontSize: 13, letterSpacing: ".26em", textTransform: "uppercase", color: "#e8cf8a", fontWeight: 700, animation: "ss-rise .7s .45s ease both" }}>{greeting}</p>
            <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 40, lineHeight: 1.1, fontWeight: 800, margin: "10px 0 0", animation: "ss-rise .7s .6s ease both" }}>
                Welcome{name ? <>, <span style={{ background: "linear-gradient(90deg,#f6e2a0,#c9a84c)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{name}</span></> : ""}
            </h1>
            {subtitle && <p style={{ fontSize: 16, color: "#c4d3ea", marginTop: 12, animation: "ss-rise .7s .8s ease both" }}>{subtitle}</p>}
            <p style={{ fontSize: 13, color: "#8fa6c9", marginTop: 18, fontStyle: "italic", animation: "ss-rise .7s 1s ease both" }}>“Let your light shine before others.”</p>
            <div aria-hidden="true" style={{ height: 4, borderRadius: 4, background: "rgba(255,255,255,.14)", margin: "34px auto 0", maxWidth: 220, overflow: "hidden" }}>
                <div style={{ height: "100%", background: "linear-gradient(90deg,#c9a84c,#f6e2a0)", animation: `ss-bar ${minMs}ms linear both` }} />
            </div>
        </Shell>,
        document.body,
    );
}

/** Fire this to show the goodbye message (e.g. after the person signs out, or an idle time-out). */
export function sayGoodbye(detail = {}) {
    window.dispatchEvent(new CustomEvent("him:goodbye", { detail }));
}

/** Mount once, outside the router, so it survives the page change that signing out causes. */
export function GoodbyeHost() {
    const [bye, setBye] = useState(null);
    useEffect(() => {
        let t;
        const on = (e) => { setBye(e.detail || {}); clearTimeout(t); t = setTimeout(() => setBye(null), 2300); };
        window.addEventListener("him:goodbye", on);
        return () => { window.removeEventListener("him:goodbye", on); clearTimeout(t); };
    }, []);
    if (!bye) return null;
    return createPortal(
        <Shell label="You have been signed out" onSkip={() => setBye(null)}>
            <div style={{ width: 92, height: 92, margin: "0 auto 26px", borderRadius: "50%", background: "rgba(18,161,80,.16)", border: "2px solid rgba(18,161,80,.55)", display: "flex", alignItems: "center", justifyContent: "center", animation: "ss-pop .7s cubic-bezier(.2,.9,.3,1.2) both" }}>
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 13l4 4L19 7" strokeDasharray="48" style={{ animation: "ss-check .7s .35s ease both" }} /></svg>
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 34, fontWeight: 800, animation: "ss-rise .6s .3s ease both" }}>{bye.name ? `Take care, ${bye.name}` : "You are signed out"}</h1>
            <p style={{ fontSize: 16, color: "#c4d3ea", marginTop: 12, animation: "ss-rise .6s .5s ease both" }}>{bye.reason || "You have been signed out safely. See you soon."}</p>
        </Shell>,
        document.body,
    );
}
