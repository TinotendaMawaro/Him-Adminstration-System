import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Pagination from "../Pagination.jsx";

/**
 * Shared list building blocks for every portal page:
 *
 *   useSelection(rows)      tick boxes; one ticked row shows that row's actions (Edit, Delete, ...), several ticked rows show
 *                           the bulk actions (e.g. Delete selected)
 *   <SelectionBar />        the contextual action bar that appears when something is ticked
 *   <ConfirmDialog />       a centred, in-viewport confirmation (rendered into <body>)
 *   <DataTable />           a responsive table (cards on phones) with selection and pagination
 *
 * Pagination is either server-side (pass `pagination`) or client-side (pass `pageSize`).
 */

export function useSelection(rows, key = "id") {
    const [selected, setSelected] = useState([]);
    const ids = useMemo(() => rows.map((r) => r[key]), [rows, key]);

    // Drop selections that are no longer on screen (page change, filter, delete).
    useEffect(() => { setSelected((s) => s.filter((id) => ids.includes(id))); }, [ids]);

    const toggle = (id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
    const toggleAll = () => setSelected((s) => (s.length === ids.length ? [] : ids));
    const clear = () => setSelected([]);
    const chosen = useMemo(() => rows.filter((r) => selected.includes(r[key])), [rows, selected, key]);

    return { selected, chosen, toggle, toggleAll, clear, allOn: ids.length > 0 && selected.length === ids.length, someOn: selected.length > 0 && selected.length < ids.length, has: (id) => selected.includes(id) };
}

const TONES = {
    default: "bg-white text-gray-700 border-gray-200 hover:bg-gray-50",
    primary: "bg-sky-600 text-white border-sky-600 hover:bg-sky-700",
    success: "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700",
    warn: "bg-amber-500 text-white border-amber-500 hover:bg-amber-600",
    danger: "bg-rose-600 text-white border-rose-600 hover:bg-rose-700",
};

export function ActionButton({ tone = "default", className = "", ...props }) {
    return <button type="button" {...props} className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition disabled:opacity-50 ${TONES[tone] || TONES.default} ${className}`} />;
}

/** actions: [{ label, onClick, tone, icon }]  (already chosen for one vs many by the caller) */
export function SelectionBar({ count, noun = "item", actions = [], onClear }) {
    if (!count) return null;
    return (
        <div role="toolbar" aria-label="Actions for selected rows" className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2">
            <span className="text-sm font-semibold text-sky-900">{count} {noun}{count === 1 ? "" : "s"} selected</span>
            <div className="ml-auto flex flex-wrap items-center gap-2">
                {actions.map((a) => <ActionButton key={a.label} tone={a.tone} onClick={a.onClick} disabled={a.disabled}>{a.label}</ActionButton>)}
                <ActionButton onClick={onClear}>Clear</ActionButton>
            </div>
        </div>
    );
}

export function ConfirmDialog({ open, title, message, confirmLabel = "Confirm", tone = "danger", busy, onConfirm, onClose }) {
    useEffect(() => {
        if (!open) return;
        const onKey = (e) => e.key === "Escape" && onClose?.();
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [open, onClose]);
    if (!open) return null;
    return createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4" role="alertdialog" aria-modal="true" aria-label={title}>
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
                <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                <p className="mt-2 text-sm text-gray-600">{message}</p>
                <div className="mt-6 flex justify-end gap-2">
                    <ActionButton onClick={onClose} disabled={busy}>Cancel</ActionButton>
                    <ActionButton tone={tone} onClick={onConfirm} disabled={busy}>{busy ? "Working…" : confirmLabel}</ActionButton>
                </div>
            </div>
        </div>,
        document.body,
    );
}

/**
 * columns: [{ key, label, render?(row), className?, width?, primary? }]   (primary = the card title on phones)
 * pagination: { page, lastPage, total, perPage, onPage }  (server side)  |  pageSize: number (client side)
 */
export default function DataTable({ columns, rows, rowKey = "id", loading, error, empty = "Nothing here yet", selection, pagination, pageSize, onRetry, onRowClick, noun = "row" }) {
    const [clientPage, setClientPage] = useState(1);
    useEffect(() => { setClientPage(1); }, [rows.length]);

    const server = !!pagination;
    const totalPages = server ? pagination.lastPage : Math.max(1, Math.ceil(rows.length / (pageSize || rows.length || 1)));
    const page = server ? pagination.page : Math.min(clientPage, totalPages);
    const visible = server || !pageSize ? rows : rows.slice((page - 1) * pageSize, page * pageSize);
    const primary = columns.find((c) => c.primary) || columns[0];
    const cell = (c, row) => (c.render ? c.render(row) : row[c.key] ?? "—");
    // A row opens its details when tapped or clicked, except where the tap was meant for a checkbox, button or link inside it.
    const open = (row) => (e) => { if (onRowClick && !e.target.closest("input,button,a,select,label")) onRowClick(row); };
    const clickable = onRowClick ? { role: "button", tabIndex: 0, style: { cursor: "pointer" } } : {};
    const key = (row) => (e) => { if (onRowClick && (e.key === "Enter") && e.target === e.currentTarget) onRowClick(row); };

    if (error) {
        return (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-700" role="alert">
                <p className="text-sm font-semibold">{error}</p>
                {onRetry && <button type="button" onClick={onRetry} className="mt-2 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white">Retry</button>}
            </div>
        );
    }

    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            {/* Desktop / tablet */}
            <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[640px] text-left text-sm">
                    <thead className="bg-gray-50 text-[11px] uppercase tracking-wider text-gray-500">
                        <tr>
                            {selection && <th className="w-10 px-3 py-3"><input type="checkbox" aria-label="Select all" checked={selection.allOn} ref={(el) => el && (el.indeterminate = selection.someOn)} onChange={selection.toggleAll} /></th>}
                            {columns.map((c) => <th key={c.key} style={c.width ? { width: c.width } : undefined} className={`px-3 py-3 font-semibold ${c.className || ""}`}>{c.label}</th>)}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? <tr><td colSpan={columns.length + (selection ? 1 : 0)} className="px-4 py-10 text-center text-sm text-gray-500">Loading…</td></tr>
                            : !visible.length ? <tr><td colSpan={columns.length + (selection ? 1 : 0)} className="px-4 py-10 text-center text-sm text-gray-500">{empty}</td></tr>
                                : visible.map((row) => (
                                    <tr key={row[rowKey]} {...clickable} onClick={open(row)} onKeyDown={key(row)} className={`align-middle hover:bg-gray-50 ${selection?.has(row[rowKey]) ? "bg-sky-50/60" : ""}`}>
                                        {selection && <td className="px-3 py-2.5"><input type="checkbox" aria-label={`Select ${noun}`} checked={selection.has(row[rowKey])} onChange={() => selection.toggle(row[rowKey])} /></td>}
                                        {columns.map((c) => <td key={c.key} className={`px-3 py-2.5 text-gray-800 ${c.className || ""}`}>{cell(c, row)}</td>)}
                                    </tr>
                                ))}
                    </tbody>
                </table>
            </div>

            {/* Phones: one card per row */}
            <div className="divide-y divide-gray-100 md:hidden">
                {loading ? <p className="px-4 py-10 text-center text-sm text-gray-500">Loading…</p>
                    : !visible.length ? <p className="px-4 py-10 text-center text-sm text-gray-500">{empty}</p>
                        : visible.map((row) => (
                            <div key={row[rowKey]} {...clickable} onClick={open(row)} onKeyDown={key(row)} className={`flex gap-3 p-3 ${selection?.has(row[rowKey]) ? "bg-sky-50/60" : ""}`}>
                                {selection && <input className="mt-1 h-5 w-5 shrink-0" type="checkbox" aria-label={`Select ${noun}`} checked={selection.has(row[rowKey])} onChange={() => selection.toggle(row[rowKey])} />}
                                <div className="min-w-0 flex-1">
                                    <div className="truncate text-[15px] font-bold text-gray-900">{cell(primary, row)}</div>
                                    <dl className="mt-1 grid grid-cols-[auto,1fr] gap-x-3 gap-y-0.5 text-xs">
                                        {columns.filter((c) => c !== primary).map((c) => (
                                            <React.Fragment key={c.key}><dt className="text-gray-400">{c.label}</dt><dd className="min-w-0 truncate text-gray-700">{cell(c, row)}</dd></React.Fragment>
                                        ))}
                                    </dl>
                                </div>
                            </div>
                        ))}
            </div>

            {(server ? pagination.total : rows.length) > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-200 bg-gray-50 px-3 py-2">
                    <span className="text-xs text-gray-500">{server ? pagination.total : rows.length} total</span>
                    <Pagination currentPage={page} totalPages={totalPages} totalItems={server ? pagination.total : rows.length} itemsPerPage={server ? pagination.perPage : pageSize || rows.length} onPageChange={server ? pagination.onPage : setClientPage} />
                </div>
            )}
        </div>
    );
}
