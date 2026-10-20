import { useEffect, useRef, useState } from "react";

// ─── Branding ──────────────────────────────────────────────────────────────────
export const LOGO_SRC = "/images/favicon.ico";

// ─── Shared premium splash styles (injected once) ────────────────────────────
const SPLASH_STYLES = `
    @keyframes himSplashFloat {
        0%, 100% { transform: translateY(0) scale(1); opacity: 0.5; }
        50%      { transform: translateY(-28px) scale(1.08); opacity: 0.85; }
    }
    @keyframes himSplashSpin {
        to { transform: rotate(360deg); }
    }
    @keyframes himSplashRing {
        0%   { stroke-dashoffset: 339.292; }
        100% { stroke-dashoffset: 0; }
    }
    @keyframes himSplashFade {
        from { opacity: 0; transform: translateY(12px); }
        to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes himSplashShine {
        0%   { transform: translateX(-120%) skewX(-20deg); }
        60%  { transform: translateX(220%) skewX(-20deg); }
        100% { transform: translateX(220%) skewX(-20deg); }
    }
    .him-splash-fade { animation: himSplashFade 0.7s cubic-bezier(0.22, 1, 0.36, 1) both; }
    .him-splash-shine {
        position: absolute; inset: 0; overflow: hidden; border-radius: inherit; pointer-events: none;
    }
    .him-splash-shine::after {
        content: ""; position: absolute; top: 0; left: 0; width: 40%; height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.45), transparent);
        animation: himSplashShine 3.2s ease-in-out infinite;
    }
    @keyframes himSplashIndeterminate {
        0%   { left: -40%; }
        100% { left: 100%; }
    }
    .him-splash-bar {
        position: absolute; top: 0; bottom: 0; width: 40%;
        background: linear-gradient(90deg, transparent, #dfb15b, transparent);
        animation: himSplashIndeterminate 1.4s ease-in-out infinite;
    }
`;

// ─── Reusable ornamental background ────────────────────────────────────────────
const SplashBackdrop = () => (
    <>
        <div className="absolute top-0 right-0 w-[28rem] h-[28rem] bg-gradient-to-br from-[#dfb15b]/15 to-transparent rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[22rem] h-[22rem] bg-gradient-to-tr from-sky-500/15 to-transparent rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />
        {[...Array(6)].map((_, i) => (
            <span
                key={i}
                className="absolute rounded-full bg-gradient-to-br from-[#dfb15b]/30 to-sky-400/10"
                style={{
                    width: 6 + (i % 3) * 4,
                    height: 6 + (i % 3) * 4,
                    top: `${12 + i * 14}%`,
                    left: `${8 + (i * 17) % 84}%`,
                    animation: `himSplashFloat ${4 + (i % 4)}s ease-in-out ${i * 0.4}s infinite`,
                }}
            />
        ))}
    </>
);

// ─── Premium crest/monogram ────────────────────────────────────────────────────
const Crest = ({ src = LOGO_SRC }) => (
    <div className="relative flex items-center justify-center">
        {/* Outer pulse ring */}
        <div className="absolute w-40 h-40 rounded-full border border-white/10 animate-pulse" />
        {/* Spinning dashed ring */}
        <div
            className="absolute w-36 h-36 rounded-full border-2 border-transparent border-t-[#dfb15b]/70 border-r-[#dfb15b]/20"
            style={{ animation: "himSplashSpin 3.5s linear infinite" }}
        />
        {/* Solid emblem */}
        <div className="relative w-28 h-28 rounded-3xl bg-gradient-to-br from-[#dfb15b] to-amber-600 flex items-center justify-center shadow-2xl shadow-[#dfb15b]/25 border border-white/20 overflow-hidden">
            <span className="him-splash-shine" />
            {src ? (
                <img
                    src={src}
                    alt="Heartfelt International Ministry"
                    className="w-16 h-16 object-contain drop-shadow"
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
            ) : (
                <span className="text-white font-bold text-5xl font-serif drop-shadow">H</span>
            )}
        </div>
    </div>
);

// ─── Login Splash ───────────────────────────────────────────────────────────────
export function MemberLoginSplash({ memberName, onComplete, done = false, minDuration = 1800 }) {
    const [visible, setVisible] = useState(true);
    const [elapsed, setElapsed] = useState(false);
    const completedRef = useRef(false);

    // Keep the latest onComplete without making it an effect dependency.
    const onCompleteRef = useRef(onComplete);
    useEffect(() => {
        onCompleteRef.current = onComplete;
    }, [onComplete]);

    // Enforce a minimum display time so the splash never flashes.
    useEffect(() => {
        const t = setTimeout(() => setElapsed(true), minDuration);
        return () => clearTimeout(t);
    }, [minDuration]);

    // Dismiss exactly once: when the login is done AND the minimum time passed.
    useEffect(() => {
        if (done && elapsed && !completedRef.current) {
            completedRef.current = true;
            setVisible(false);
            setTimeout(() => onCompleteRef.current && onCompleteRef.current(), 650);
        }
    }, [done, elapsed]);

    if (!visible) return null;

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-[#0A192F] via-[#112240] to-[#1A365D] overflow-hidden him-splash-fade"
            style={{ transition: "opacity 0.6s ease" }}
        >
            <style>{SPLASH_STYLES}</style>
            <SplashBackdrop />

            <div className="relative z-10 flex flex-col items-center text-center px-6">
                <div className="him-splash-fade" style={{ animationDelay: "0.05s" }}>
                    <Crest />
                </div>

                <p
                    className="lux-eyebrow text-[#dfb15b] mt-10 tracking-[0.25em] him-splash-fade"
                    style={{ animationDelay: "0.15s" }}
                >
                    HEARTFELT INTERNATIONAL MINISTRY
                </p>

                <h1
                    className="mt-3 text-2xl sm:text-3xl font-bold text-white tracking-tight font-serif him-splash-fade"
                    style={{ animationDelay: "0.25s" }}
                >
                    Welcome{memberName ? `, ${memberName}` : ""}
                </h1>

                <p
                    className="mt-2 text-sm text-gray-400 font-light italic him-splash-fade"
                    style={{ animationDelay: "0.35s" }}
                >
                    Welcome to Heartfelt International Ministry
                </p>

                {/* Indeterminate progress bar (keeps moving until done) */}
                <div className="relative mt-8 w-56 h-1 rounded-full bg-white/10 overflow-hidden him-splash-fade" style={{ animationDelay: "0.45s" }}>
                    <div className="him-splash-bar" />
                </div>

                <p className="mt-4 text-[11px] text-gray-500 tracking-wide him-splash-fade" style={{ animationDelay: "0.55s" }}>
                    Preparing your member experience…
                </p>
            </div>
        </div>
    );
}

// ─── Logout Splash ──────────────────────────────────────────────────────────────
export function MemberLogoutSplash({ onComplete, done = false, minDuration = 1500 }) {
    const [visible, setVisible] = useState(true);
    const [elapsed, setElapsed] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setElapsed(true), minDuration);
        return () => clearTimeout(t);
    }, [minDuration]);

    useEffect(() => {
        if (done && elapsed) {
            setVisible(false);
            const t = setTimeout(() => onComplete && onComplete(), 650);
            return () => clearTimeout(t);
        }
    }, [done, elapsed, onComplete]);

    if (!visible) return null;

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-[#0A192F] via-[#112240] to-[#1A365D] overflow-hidden him-splash-fade"
            style={{ transition: "opacity 0.6s ease" }}
        >
            <style>{SPLASH_STYLES}</style>
            <SplashBackdrop />

            <div className="relative z-10 flex flex-col items-center text-center px-6">
                <div className="him-splash-fade" style={{ animationDelay: "0.05s" }}>
                    <Crest />
                </div>

                <p
                    className="lux-eyebrow text-[#dfb15b] mt-10 tracking-[0.25em] him-splash-fade"
                    style={{ animationDelay: "0.15s" }}
                >
                    HEARTFELT INTERNATIONAL MINISTRY
                </p>

                <h1
                    className="mt-3 text-2xl sm:text-3xl font-bold text-white tracking-tight font-serif him-splash-fade"
                    style={{ animationDelay: "0.25s" }}
                >
                    You have been logged out
                </h1>

                <p
                    className="mt-2 text-sm text-gray-400 font-light italic him-splash-fade"
                    style={{ animationDelay: "0.35s" }}
                >
                    Thank you for being part of Heartfelt International Ministry
                </p>

                {/* Indeterminate progress bar (keeps moving until done) */}
                <div className="relative mt-8 w-56 h-1 rounded-full bg-white/10 overflow-hidden him-splash-fade" style={{ animationDelay: "0.45s" }}>
                    <div className="him-splash-bar" />
                </div>

                <p className="mt-4 text-[11px] text-gray-500 tracking-wide him-splash-fade" style={{ animationDelay: "0.55s" }}>
                    Redirecting to sign in…
                </p>
            </div>
        </div>
    );
}

export default MemberLoginSplash;
