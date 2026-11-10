import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, BadgeCheck, CheckCircle2, ChevronRight, Loader2, X, AlertCircle, Inbox } from "lucide-react";
import { useNav } from "./nav.jsx";
import { haptic, absUrl } from "./lib.js";

export const cx = (...a) => a.filter(Boolean).join(" ");

// ── Avatar ──────────────────────────────────────────────────────────────────────────────────────

const PALETTE = [["#1e3a5f", "#2f6bff"], ["#7c3aed", "#c026d3"], ["#047857", "#10b981"], ["#b45309", "#f59e0b"], ["#be123c", "#fb7185"], ["#0e7490", "#22d3ee"], ["#4338ca", "#818cf8"]];
const initials = (name = "") => name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("") || "?";

export function Avatar({ user, size = 40, ring, onClick, className }) {
    const [broken, setBroken] = useState(false);
    const [a, b] = PALETTE[(user?.id || 0) % PALETTE.length];
    const inner = (
        <div
            onClick={onClick}
            className={cx("shrink-0 rounded-full overflow-hidden flex items-center justify-center text-white font-bold select-none", className)}
            style={{ width: size, height: size, background: `linear-gradient(135deg, ${a}, ${b})`, fontSize: size * 0.38 }}
        >
            {user?.avatar && !broken ? <img src={absUrl(user.avatar)} alt="" className="w-full h-full object-cover" loading="lazy" onError={() => setBroken(true)} /> : initials(user?.name)}
        </div>
    );
    if (!ring) return inner;
    return <div className="hm-ring" data-seen={ring === "seen"}><div className="hm-ring-inner">{inner}</div></div>;
}

export const Verified = ({ size = 15 }) => <BadgeCheck size={size} className="shrink-0" style={{ color: "#2f6bff", fill: "color-mix(in srgb, #2f6bff 18%, transparent)" }} aria-label="Verified" />;

// ── Buttons, chips, text ────────────────────────────────────────────────────────────────────────

export function Btn({ variant = "primary", size, block, icon: Icon, loading, className, children, ...rest }) {
    return (
        <button className={cx("hm-btn", `hm-btn-${variant}`, size === "sm" && "hm-btn-sm", block && "hm-btn-block", className)} disabled={loading || rest.disabled} {...rest} onClick={(e) => { haptic(8); rest.onClick?.(e); }}>
            {loading ? <Loader2 size={18} className="animate-spin" /> : Icon ? <Icon size={size === "sm" ? 16 : 18} /> : null}
            {children}
        </button>
    );
}

export const IconBtn = ({ icon: Icon, label, badge, onClick, className, size = 22, ...rest }) => (
    <button className={cx("hm-icon-btn", className)} onClick={(e) => { haptic(6); onClick?.(e); }} aria-label={label} {...rest}>
        <Icon size={size} />
        {badge > 0 && <span className="hm-tab-dot" style={{ top: 2, left: "auto", right: 0 }}>{badge > 99 ? "99+" : badge}</span>}
    </button>
);

export const Chip = ({ on, children, onClick, icon: Icon }) => (
    <button className="hm-chip" data-on={!!on} onClick={() => { haptic(5); onClick?.(); }}>
        {Icon && <Icon size={15} />}{children}
    </button>
);

/** Renders post text with #hashtags and @mentions tappable. */
export function Linkify({ text, onTag, onMention }) {
    if (!text) return null;
    const parts = text.split(/((?<![\p{L}\p{N}_])[#@][\p{L}\p{N}_]{2,40})/u);
    return (
        <span className="hm-prose">
            {parts.map((p, i) =>
                /^#/.test(p) ? <button key={i} className="hm-tag" onClick={() => onTag?.(p.slice(1).toLowerCase())}>{p}</button>
                : /^@/.test(p) ? <button key={i} className="hm-tag" onClick={() => onMention?.(p.slice(1).toLowerCase())}>{p}</button>
                : <span key={i}>{p}</span>)}
        </span>
    );
}

// ── States ──────────────────────────────────────────────────────────────────────────────────────

export const Skel = ({ w = "100%", h = 14, r = 10, className, style }) => <div className={cx("hm-skel", className)} style={{ width: w, height: h, borderRadius: r, ...style }} />;

export function PostSkeleton() {
    return (
        <div className="hm-card p-4 space-y-3">
            <div className="flex items-center gap-3"><Skel w={42} h={42} r={21} /><div className="space-y-2 flex-1"><Skel w="40%" /><Skel w="25%" h={10} /></div></div>
            <Skel h={12} /><Skel w="85%" h={12} /><Skel h={160} r={14} />
        </div>
    );
}

export function Empty({ icon: Icon = Inbox, title, text, action }) {
    return (
        <div className="flex flex-col items-center text-center px-8 py-14 gap-3">
            <div className="w-16 h-16 rounded-3xl flex items-center justify-center" style={{ background: "var(--surface2)", color: "var(--mut)" }}><Icon size={30} /></div>
            <div className="font-bold text-[17px]">{title}</div>
            {text && <div className="text-sm max-w-xs" style={{ color: "var(--mut)" }}>{text}</div>}
            {action}
        </div>
    );
}

export function ErrorState({ error, onRetry }) {
    return (
        <div className="flex flex-col items-center text-center px-8 py-12 gap-3">
            <AlertCircle size={34} style={{ color: "var(--danger)" }} />
            <div className="text-sm" style={{ color: "var(--mut)" }}>{error?.response?.data?.message || "We couldn't load this."}</div>
            {onRetry && <Btn variant="soft" size="sm" onClick={onRetry}>Try again</Btn>}
        </div>
    );
}

export const Spinner = ({ size = 22 }) => <div className="flex justify-center py-6" style={{ color: "var(--mut)" }}><Loader2 size={size} className="animate-spin" /></div>;

/** Calls onVisible when it scrolls into view: infinite lists. */
export function InView({ onVisible, disabled }) {
    const ref = useRef(null);
    useEffect(() => {
        if (disabled || !ref.current) return;
        const io = new IntersectionObserver((e) => e[0].isIntersecting && onVisible(), { rootMargin: "400px" });
        io.observe(ref.current);
        return () => io.disconnect();
    }, [onVisible, disabled]);
    return <div ref={ref} style={{ height: 1 }} />;
}

// ── Layout ──────────────────────────────────────────────────────────────────────────────────────

export function TopBar({ title, subtitle, back, right, transparent, onBack }) {
    const nav = useNav();
    return (
        <div className={cx("flex items-center gap-1 px-3 shrink-0 hm-safe-top z-20", !transparent && "hm-glass")} style={{ minHeight: 56, borderBottom: transparent ? "none" : "1px solid var(--line)" }}>
            {back && <IconBtn icon={ArrowLeft} label="Back" onClick={onBack || nav.pop} />}
            <div className="flex-1 min-w-0 px-1">
                <div className="font-extrabold text-[18px] leading-tight truncate">{title}</div>
                {subtitle && <div className="text-xs truncate" style={{ color: "var(--mut)" }}>{subtitle}</div>}
            </div>
            <div className="flex items-center">{right}</div>
        </div>
    );
}

export function Segmented({ value, onChange, options }) {
    return (
        <div className="flex p-1 rounded-2xl gap-1" style={{ background: "var(--surface2)", border: "1px solid var(--line)" }}>
            {options.map((o) => (
                <button key={o.value} onClick={() => { haptic(5); onChange(o.value); }}
                    className="flex-1 h-9 rounded-xl text-[13.5px] font-bold transition-all flex items-center justify-center gap-1.5"
                    style={value === o.value ? { background: "var(--surface)", color: "var(--ink)", boxShadow: "var(--shadow-sm)" } : { color: "var(--mut)" }}>
                    {o.icon && <o.icon size={15} />}{o.label}
                </button>
            ))}
        </div>
    );
}

export function ScrollTabs({ tabs, value, onChange }) {
    return (
        <div className="flex gap-2 overflow-x-auto hm-hide-scroll px-4 py-2">
            {tabs.map((t) => <Chip key={t.value} on={value === t.value} onClick={() => onChange(t.value)} icon={t.icon}>{t.label}</Chip>)}
        </div>
    );
}

// ── Sheets (rendered into the phone frame so they always sit above everything) ──────────────────

export function Sheet({ open, onClose, title, children, full, footer }) {
    const nav = useNav();
    const [mounted, setMounted] = useState(open);
    useEffect(() => { if (open) setMounted(true); }, [open]);
    useEffect(() => {
        if (!open) return;
        const onKey = (e) => e.key === "Escape" && onClose?.();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    if (!open || !nav.frameRef.current) return null;

    return createPortal(
        <div className="hm-sheet-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()} role="dialog" aria-modal="true" aria-label={title}>
            <div className={cx("hm-sheet", full && "hm-sheet-full")}>
                {!full && <div className="hm-sheet-handle" />}
                {(title || full) && (
                    <div className="flex items-center px-4 pt-2 pb-2 shrink-0 hm-safe-top" style={{ paddingTop: full ? undefined : 4 }}>
                        <div className="font-extrabold text-[18px] flex-1 truncate">{title}</div>
                        <IconBtn icon={X} label="Close" onClick={onClose} />
                    </div>
                )}
                <div className="flex-1 overflow-y-auto hm-hide-scroll px-4 pb-4">{children}</div>
                {footer && <div className="px-4 pt-2 pb-4 shrink-0 hm-safe-bottom" style={{ borderTop: "1px solid var(--line)" }}>{footer}</div>}
            </div>
        </div>,
        nav.frameRef.current,
    );
}

export function ConfirmSheet({ open, onClose, title, text, confirm = "Confirm", cancel = "Cancel", danger, onConfirm, loading }) {
    return (
        <Sheet open={open} onClose={onClose} title={title}>
            {text && <p className="text-[15px] mb-4" style={{ color: "var(--mut)" }}>{text}</p>}
            <div className="flex gap-3 pb-2">
                <Btn variant="soft" block onClick={onClose}>{cancel}</Btn>
                <Btn variant={danger ? "danger" : "primary"} block loading={loading} onClick={onConfirm}>{confirm}</Btn>
            </div>
        </Sheet>
    );
}

export function ActionSheet({ open, onClose, title, actions }) {
    return (
        <Sheet open={open} onClose={onClose} title={title}>
            <div className="space-y-1 pb-3">
                {(actions || []).filter(Boolean).map((a) => (
                    <button key={a.label} onClick={() => { onClose(); a.onClick(); }} className="w-full flex items-center gap-3 h-12 px-3 rounded-2xl text-[15.5px] font-semibold text-left active:bg-[var(--surface2)]" style={a.danger ? { color: "var(--danger)" } : undefined}>
                        {a.icon && <a.icon size={20} />}{a.label}
                    </button>
                ))}
            </div>
        </Sheet>
    );
}

// ── Toasts ──────────────────────────────────────────────────────────────────────────────────────

const listeners = new Set();
export const toast = (message, kind = "info") => listeners.forEach((l) => l({ id: Math.random(), message, kind }));
toast.error = (m) => toast(m, "error");
toast.success = (m) => toast(m, "success");

export function Toaster() {
    const [items, setItems] = useState([]);
    useEffect(() => {
        const l = (t) => {
            setItems((s) => [...s.slice(-1), t]);
            setTimeout(() => setItems((s) => s.filter((x) => x.id !== t.id)), 3200);
        };
        listeners.add(l);
        return () => listeners.delete(l);
    }, []);
    return <>{items.map((t) => <div key={t.id} className="hm-toast" data-kind={t.kind} role="status">{t.kind === "success" && <CheckCircle2 size={18} />}{t.message}</div>)}</>;
}

// ── Misc hooks ──────────────────────────────────────────────────────────────────────────────────

export function useDebounced(value, ms = 350) {
    const [v, setV] = useState(value);
    useEffect(() => { const id = setTimeout(() => setV(value), ms); return () => clearTimeout(id); }, [value, ms]);
    return v;
}

const DarkCtx = createContext({ dark: false, toggle: () => {} });
export const useDark = () => useContext(DarkCtx);
export function DarkProvider({ children }) {
    const [dark, setDark] = useState(() => {
        try {
            const saved = localStorage.getItem("hm-dark");
            return saved === null ? window.matchMedia?.("(prefers-color-scheme: dark)").matches : saved === "1";
        } catch { return false; }
    });
    const toggle = useCallback(() => setDark((d) => { try { localStorage.setItem("hm-dark", d ? "0" : "1"); } catch { /* storage unavailable */ } return !d; }), []);
    const value = useMemo(() => ({ dark, toggle }), [dark, toggle]);
    return <DarkCtx.Provider value={value}>{children}</DarkCtx.Provider>;
}

// ── Shared layout helpers (one copy for every screen) ────────────────────────────────────────────

/** A tappable settings-style row: coloured icon, label, optional hint, chevron. */
export function Row({ icon: Icon, label, hint, onClick, color = "var(--accent)", right, danger }) {
    return (
        <button onClick={() => { haptic(6); onClick?.(); }} className="w-full flex items-center gap-3.5 px-4 min-h-[58px] py-2 text-left active:bg-[var(--surface2)] transition-colors">
            <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `color-mix(in srgb, ${danger ? "var(--danger)" : color} 13%, transparent)`, color: danger ? "var(--danger)" : color }}><Icon size={19} /></span>
            <span className="flex-1 min-w-0"><span className="block font-semibold text-[15.5px]" style={danger ? { color: "var(--danger)" } : undefined}>{label}</span>{hint && <span className="block text-xs truncate" style={{ color: "var(--mut)" }}>{hint}</span>}</span>
            {right ?? <ChevronRight size={18} style={{ color: "var(--mut)" }} />}
        </button>
    );
}

/** A titled card that stacks rows with dividers. */
export const Group = ({ title, children, flush }) => (
    <section className={flush ? "mt-5" : "mx-4 mt-4"}>
        {title && <h3 className="hm-label">{title}</h3>}
        <div className="hm-card overflow-hidden">{(Array.isArray(children) ? children : [children]).filter(Boolean).map((c, i) => <div key={i} style={i ? { borderTop: "1px solid var(--line)" } : undefined}>{c}</div>)}</div>
    </section>
);

export const Field = ({ label, children }) => <div className="mb-3"><label className="hm-label">{label}</label>{children}</div>;

/** The scrolling body of a pushed screen. */
export const Body = ({ children }) => <div className="flex-1 overflow-y-auto hm-scroll px-4 pb-8 pt-3">{children}</div>;
