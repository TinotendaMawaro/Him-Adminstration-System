import React, { useCallback, useEffect, useRef, useState } from "react";
import api from "../lib/api.js";

/**
 * "Give online" — available in every portal (member, partner, pastor, HOD).
 *
 * The giver MUST choose what the gift is for (tithe / offering / seed, and partnership for partners):
 * nothing is preselected. The server decides which ClicknPay account is used and only ever marks the
 * payment received after PayMe confirms it, so this component just collects intent and redirects.
 */

const PRESETS = [10, 20, 50, 100];

const ICONS = {
    tithe: "🌾",
    offering: "🎁",
    seed: "🌱",
    partnership: "🤝",
};

const BLURB = {
    tithe: "Your faithful tenth",
    offering: "A freewill gift",
    seed: "Sow into a vision",
    partnership: "Covenant partnership",
};

function HeartIcon({ className = "h-5 w-5" }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 21s-7.5-4.6-9.6-9.2C1 8.6 2.6 5 6 5c2 0 3.3 1.1 4 2.2C10.7 6.1 12 5 14 5c3.4 0 5 3.6 3.6 6.8C19.5 16.4 12 21 12 21z" />
        </svg>
    );
}

export default function GiveOnline() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [opts, setOpts] = useState(null); // { types, currency, min, max }
    const [loadError, setLoadError] = useState("");
    const [type, setType] = useState(""); // deliberately empty: the giver must choose
    const [amount, setAmount] = useState("");
    const [note, setNote] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const dialogRef = useRef(null);

    const close = useCallback(() => {
        if (submitting) return;
        setOpen(false);
    }, [submitting]);

    // Load what this person may give online each time the dialog opens.
    useEffect(() => {
        if (!open) return;
        let cancelled = false;
        setLoading(true);
        setLoadError("");
        api.get("/online-payments/options")
            .then(({ data }) => !cancelled && setOpts(data.data))
            .catch(() => !cancelled && setLoadError("Online giving is not available right now."))
            .finally(() => !cancelled && setLoading(false));
        return () => {
            cancelled = true;
        };
    }, [open]);

    // Escape closes; lock page scroll while open.
    useEffect(() => {
        if (!open) return;
        const onKey = (e) => e.key === "Escape" && close();
        document.addEventListener("keydown", onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        dialogRef.current?.focus();
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = prev;
        };
    }, [open, close]);

    const currency = opts?.currency || "USD";
    const num = Number(amount);
    const validAmount = amount !== "" && Number.isFinite(num) && num >= (opts?.min ?? 1) && num <= (opts?.max ?? 20000) && /^\d+(\.\d{1,2})?$/.test(amount);
    const chosen = opts?.types?.find((t) => t.value === type);
    const canSubmit = !!type && validAmount && !submitting;

    const submit = async (e) => {
        e.preventDefault();
        if (!canSubmit) return;
        setError("");
        setSubmitting(true);
        try {
            const { data } = await api.post("/online-payments", { type, amount: num, note: note.trim() || undefined });
            const url = data?.data?.pay_url;
            if (!url) throw new Error("no url");
            // Hand over to PayMe. We come back to the server-rendered return page, which verifies the payment.
            window.location.assign(url);
        } catch (err) {
            const res = err.response?.data;
            setError(res?.errors ? Object.values(res.errors).flat()[0] : res?.message || "We could not start the payment. Please try again.");
            setSubmitting(false);
        }
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="fixed bottom-24 right-4 z-40 flex items-center gap-2 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-900/30 ring-1 ring-white/30 transition hover:scale-105 hover:shadow-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-amber-300 md:bottom-6 md:right-6"
                aria-label="Give online"
            >
                <HeartIcon />
                <span>Give</span>
            </button>

            {open && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 p-0 backdrop-blur-sm sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && close()}>
                    <div
                        ref={dialogRef}
                        tabIndex={-1}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="give-title"
                        className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl outline-none sm:max-w-md sm:rounded-3xl"
                    >
                        <div className="relative overflow-hidden rounded-t-3xl bg-gradient-to-br from-[#1e3a5f] to-[#2d5282] px-6 pb-5 pt-6 text-white sm:rounded-t-3xl">
                            <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-amber-400/20" />
                            <button type="button" onClick={close} className="absolute right-4 top-4 rounded-full p-1.5 text-white/70 hover:bg-white/10 hover:text-white" aria-label="Close">
                                ✕
                            </button>
                            <p className="text-xs font-semibold uppercase tracking-widest text-amber-300">Give online</p>
                            <h2 id="give-title" className="mt-1 text-xl font-bold">
                                Sow into the kingdom
                            </h2>
                            <p className="mt-1 text-sm text-blue-100">Secure payment by PayMe · ClicknPay</p>
                        </div>

                        <form onSubmit={submit} className="space-y-6 px-6 py-6">
                            {loading && <p className="py-8 text-center text-sm text-gray-500">Loading…</p>}
                            {!loading && loadError && <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{loadError}</p>}

                            {!loading && opts && (
                                <>
                                    <fieldset>
                                        <legend className="mb-2 text-sm font-semibold text-gray-800">
                                            What are you giving? <span className="text-red-500">*</span>
                                        </legend>
                                        <div className="grid grid-cols-2 gap-3">
                                            {opts.types.map((t) => {
                                                const active = type === t.value;
                                                return (
                                                    <label
                                                        key={t.value}
                                                        className={`cursor-pointer rounded-2xl border-2 p-3 text-center transition ${active ? "border-[#1e3a5f] bg-blue-50 shadow-sm" : "border-gray-200 hover:border-amber-400"}`}
                                                    >
                                                        <input type="radio" name="give-type" value={t.value} checked={active} onChange={() => setType(t.value)} className="sr-only" />
                                                        <div className="text-2xl" aria-hidden="true">{ICONS[t.value] || "💛"}</div>
                                                        <div className="mt-1 text-sm font-semibold text-gray-900">{t.label}</div>
                                                        <div className="text-xs text-gray-500">{BLURB[t.value] || ""}</div>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                        {!type && <p className="mt-2 text-xs text-gray-500">Please choose what this gift is for.</p>}
                                    </fieldset>

                                    <div>
                                        <label htmlFor="give-amount" className="mb-2 block text-sm font-semibold text-gray-800">
                                            Amount ({currency}) <span className="text-red-500">*</span>
                                        </label>
                                        <div className="mb-3 flex flex-wrap gap-2">
                                            {PRESETS.map((p) => (
                                                <button
                                                    type="button"
                                                    key={p}
                                                    onClick={() => setAmount(String(p))}
                                                    className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${Number(amount) === p ? "border-[#1e3a5f] bg-[#1e3a5f] text-white" : "border-gray-300 text-gray-700 hover:border-amber-400"}`}
                                                >
                                                    ${p}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="relative">
                                            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                                            <input
                                                id="give-amount"
                                                inputMode="decimal"
                                                autoComplete="off"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
                                                placeholder="0.00"
                                                className="w-full rounded-xl border border-gray-300 py-3 pl-8 pr-4 text-lg font-semibold text-gray-900 focus:border-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-blue-200"
                                            />
                                        </div>
                                        {amount !== "" && !validAmount && (
                                            <p className="mt-1 text-xs text-red-600">
                                                Enter an amount between {opts.min} and {opts.max} (max 2 decimals).
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label htmlFor="give-note" className="mb-1 block text-sm font-medium text-gray-700">
                                            Note <span className="font-normal text-gray-400">(optional)</span>
                                        </label>
                                        <input
                                            id="give-note"
                                            maxLength={200}
                                            value={note}
                                            onChange={(e) => setNote(e.target.value)}
                                            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-blue-200"
                                        />
                                    </div>

                                    {error && (
                                        <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
                                            {error}
                                        </p>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={!canSubmit}
                                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1e3a5f] py-3.5 text-base font-semibold text-white shadow-md transition enabled:hover:bg-[#16304f] disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        {submitting ? "Opening secure payment…" : chosen && validAmount ? `Give $${num.toFixed(2)} as ${chosen.label.toLowerCase()}` : "Continue to secure payment"}
                                    </button>
                                    <p className="text-center text-xs text-gray-500">You will be taken to PayMe to complete your payment. Your receipt appears here once it is confirmed.</p>
                                </>
                            )}
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
