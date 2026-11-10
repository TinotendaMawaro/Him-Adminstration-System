import React, { useMemo, useState } from "react";

// Accessible SVG donut/pie chart with a legend: no chart library, so it is light and prints well.
const COLORS = ["#2f6bff", "#12a150", "#e0a82e", "#7c3aed", "#e11d48", "#0e7490"];

function polar(cx, cy, r, angle) {
    const a = ((angle - 90) * Math.PI) / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}

function arc(cx, cy, r, start, end) {
    if (end - start >= 359.99) return `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r} Z`;
    const [x1, y1] = polar(cx, cy, r, start), [x2, y2] = polar(cx, cy, r, end);
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${end - start > 180 ? 1 : 0} 1 ${x2} ${y2} Z`;
}

export function Pie({ data, size = 180 }) {
    const total = data.reduce((s, d) => s + d.value, 0);
    const [hover, setHover] = useState(null);
    const slices = useMemo(() => {
        let angle = 0;
        return data.map((d, i) => {
            const sweep = total ? (d.value / total) * 360 : 0;
            const s = { ...d, color: COLORS[i % COLORS.length], start: angle, end: angle + sweep };
            angle += sweep;
            return s;
        });
    }, [data, total]);
    const c = size / 2, r = size / 2 - 4;
    const active = hover != null ? slices[hover] : null;

    return (
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-8">
            <div className="relative shrink-0" style={{ width: size, height: size }}>
                <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} role="img" aria-label={slices.map((s) => `${s.label}: ${s.value}`).join(", ")}>
                    {total === 0 ? <circle cx={c} cy={c} r={r} fill="#e5e7eb" /> : slices.filter((s) => s.value > 0).map((s) => (
                        <path key={s.label} d={arc(c, c, hover === slices.indexOf(s) ? r + 3 : r, s.start, s.end)} fill={s.color} stroke="#fff" strokeWidth="2" onMouseEnter={() => setHover(slices.indexOf(s))} onMouseLeave={() => setHover(null)} style={{ transition: "d .15s" }} />
                    ))}
                    <circle cx={c} cy={c} r={r * 0.58} fill="#fff" />
                </svg>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                    <div className="text-2xl font-extrabold text-gray-900">{active ? active.value : total}</div>
                    <div className="max-w-[90px] truncate text-[11px] text-gray-500">{active ? active.label : "Total"}</div>
                </div>
            </div>
            <ul className="w-full min-w-0 flex-1 space-y-2">
                {slices.map((s, i) => (
                    <li key={s.label} className="flex items-center gap-3 text-sm" onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
                        <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: s.color }} />
                        <span className="min-w-0 flex-1 truncate text-gray-700">{s.label}</span>
                        <span className="font-bold tabular-nums text-gray-900">{s.value}</span>
                        <span className="w-12 text-right text-xs tabular-nums text-gray-400">{total ? Math.round((s.value / total) * 100) : 0}%</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

const VIEWS = [
    { id: "status", label: "Membership" },
    { id: "home_groups", label: "Home groups" },
    { id: "departments", label: "Departments" },
    { id: "by_group", label: "By group" },
];

export default function PieChartCard({ distribution, zoneName }) {
    const [view, setView] = useState("status");
    if (!distribution) return null;
    const data = distribution[view] || [];
    return (
        <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6" aria-label="Zone composition">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h3 className="text-base font-bold text-gray-900">Zone composition</h3>
                    <p className="text-xs text-gray-500">{zoneName ? `${zoneName}: ` : ""}people in your zone only</p>
                </div>
                <div className="flex flex-wrap gap-1 rounded-xl bg-gray-100 p-1" role="tablist">
                    {VIEWS.map((v) => (
                        <button key={v.id} role="tab" aria-selected={view === v.id} onClick={() => setView(v.id)} className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${view === v.id ? "bg-white text-gray-900 shadow" : "text-gray-500 hover:text-gray-800"}`}>{v.label}</button>
                    ))}
                </div>
            </div>
            {data.length ? <Pie data={data} /> : <p className="py-8 text-center text-sm text-gray-500">Nothing to show yet: no members are in a group.</p>}
        </section>
    );
}
