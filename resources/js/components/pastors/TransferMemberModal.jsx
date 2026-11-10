import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../lib/api.js";
import CredentialsPanel from "./CredentialsPanel.jsx";

/**
 * A pastor moves a member of their zone to another zone.
 * The server enforces who may do this; this dialog only collects the destination and the reason.
 */
export default function TransferMemberModal({ member, onClose, onDone }) {
    const [zoneId, setZoneId] = useState("");
    const [filter, setFilter] = useState("");
    const [reason, setReason] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [issued, setIssued] = useState(null);   // { message, credentials } once the move is done

    const { data: zones = [], isLoading } = useQuery({
        queryKey: ["pastor-transfer-zones"],
        queryFn: async () => (await api.get("/pastors/zones")).data.data,
        staleTime: 5 * 60 * 1000,
    });

    const visible = useMemo(() => {
        const q = filter.trim().toLowerCase();
        return q ? zones.filter((z) => `${z.code} ${z.name} ${z.region || ""}`.toLowerCase().includes(q)) : zones;
    }, [zones, filter]);

    const name = member.full_name || [member.name, member.surname].filter(Boolean).join(" ");
    const canSubmit = zoneId && reason.trim().length >= 3 && !saving;

    const submit = async (e) => {
        e.preventDefault();
        if (!canSubmit) return;
        setSaving(true);
        setError("");
        try {
            const { data } = await api.post(`/pastors/members/${member.id}/transfer`, { zone_id: Number(zoneId), reason: reason.trim() });
            if (data.credentials) { setIssued({ message: data.message, credentials: data.credentials }); setSaving(false); }
            else onDone?.(data.message);
        } catch (err) {
            const errors = err.response?.data?.errors;
            setError((errors && Object.values(errors).flat()[0]) || err.response?.data?.message || "The move could not be completed.");
            setSaving(false);
        }
    };

    if (issued) return <CredentialsPanel credentials={issued.credentials} onClose={() => onDone?.(issued.message)} />;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={`Move ${name} to another zone`}>
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={saving ? undefined : onClose} />
            <form onSubmit={submit} className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                <h3 className="text-lg font-bold text-gray-900">Move to another zone</h3>
                <p className="mt-1 text-sm text-gray-500">
                    <span className="font-semibold text-gray-800">{name}</span> ({member.member_code || member.member_number}) and their login will join the new zone and leave their current home group.
                    Their member number stays the same.
                </p>

                <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-gray-500">New zone</label>
                <input
                    type="text" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Search zones by name, code or region…"
                    className="mt-1 h-10 w-full rounded-lg border border-gray-200 px-3 text-sm focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-300"
                />
                <select
                    value={zoneId} onChange={(e) => setZoneId(e.target.value)} size={6} disabled={isLoading}
                    className="mt-2 w-full rounded-lg border border-gray-200 text-sm focus:border-amber-400 focus:outline-none"
                >
                    {isLoading && <option>Loading zones…</option>}
                    {visible.map((z) => <option key={z.id} value={z.id}>{z.code} · {z.name}{z.region ? ` (${z.region})` : ""}</option>)}
                    {!isLoading && visible.length === 0 && <option disabled>No zones match</option>}
                </select>

                <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-gray-500">Reason</label>
                <textarea
                    value={reason} onChange={(e) => setReason(e.target.value)} rows={3} maxLength={300} placeholder="Why is this member moving? (shared with both zones' pastors)"
                    className="mt-1 w-full rounded-lg border border-gray-200 p-3 text-sm focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-300"
                />

                {error && <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700" role="alert">{error}</p>}

                <div className="mt-5 flex justify-end gap-2">
                    <button type="button" onClick={onClose} disabled={saving} className="h-10 rounded-lg px-4 text-sm font-medium text-gray-600 hover:bg-gray-100">Cancel</button>
                    <button type="submit" disabled={!canSubmit} className="h-10 rounded-lg bg-amber-500 px-5 text-sm font-semibold text-white shadow hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-50">
                        {saving ? "Moving…" : "Move member"}
                    </button>
                </div>
            </form>
        </div>
    );
}
