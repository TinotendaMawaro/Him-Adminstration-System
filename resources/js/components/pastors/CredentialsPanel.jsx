import { useState } from "react";
import { createPortal } from "react-dom";
import api from "../../lib/api.js";

/**
 * New sign-in details after a transfer: shown once, with Copy buttons and a watermarked PDF to hand over.
 * The details come straight from the server's response to the transfer and are not kept anywhere.
 */
export default function CredentialsPanel({ credentials: c, onClose }) {
    const [copied, setCopied] = useState(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    const rows = [[c.login_label, c.login], ...(c.code && c.code !== c.login ? [["Code", c.code]] : []), ["Temporary password", c.password]];
    const all = `${c.name}\n${rows.map(([l, v]) => `${l}: ${v}`).join("\n")}`;

    const copy = async (text, key) => {
        try { await navigator.clipboard.writeText(text); setCopied(key); setTimeout(() => setCopied(null), 1800); } catch { setError("Copying is blocked in this browser. Select the text instead."); }
    };

    const download = async () => {
        setBusy(true); setError("");
        try {
            const res = await api.post("/credentials/pdf", c, { responseType: "blob" });
            const url = URL.createObjectURL(res.data);
            const a = document.createElement("a");
            a.href = url; a.download = `heartfelt-credentials-${String(c.name).toLowerCase().replace(/[^a-z0-9]+/g, "-")}.pdf`; a.click();
            setTimeout(() => URL.revokeObjectURL(url), 2000);
        } catch { setError("The PDF could not be created. Copy the details instead."); }
        setBusy(false);
    };

    return createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="New sign-in details" data-sensitive>
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                <h3 className="text-lg font-bold text-gray-900">New sign-in details</h3>
                <p className="mt-1 text-sm text-gray-500"><span className="font-semibold text-gray-800">{c.name}</span> · {c.role}{c.zone ? ` · ${c.zone}` : ""}</p>

                <div className="mt-4 space-y-3">
                    {rows.map(([label, value], i) => (
                        <div key={label}>
                            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
                            <div className="flex items-center gap-2">
                                <code className="flex-1 select-all break-all rounded-lg bg-gray-100 px-3 py-2.5 font-mono text-base font-bold text-gray-900">{value}</code>
                                <button type="button" onClick={() => copy(value, i)} className="h-10 rounded-lg bg-sky-600 px-3 text-sm font-semibold text-white hover:bg-sky-700">{copied === i ? "Copied ✓" : "Copy"}</button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-4 flex gap-2">
                    <button type="button" onClick={() => copy(all, "all")} className="h-10 flex-1 rounded-lg border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-50">{copied === "all" ? "Copied ✓" : "Copy everything"}</button>
                    <button type="button" onClick={download} disabled={busy} className="h-10 flex-1 rounded-lg bg-amber-500 text-sm font-semibold text-white shadow hover:bg-amber-600 disabled:opacity-60">{busy ? "Preparing…" : "Download PDF"}</button>
                </div>

                {error && <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700" role="alert">{error}</p>}
                <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs text-amber-900"><b>Protect this information.</b> These details are shown once and are not stored. Hand them over privately: never by screenshot or an open message. The person must change the password on first sign-in, and their other devices have been signed out.</p>

                <button type="button" onClick={onClose} className="mt-4 h-10 w-full rounded-lg bg-gray-900 text-sm font-semibold text-white hover:bg-gray-800">Done</button>
            </div>
        </div>,
        document.body,
    );
}
