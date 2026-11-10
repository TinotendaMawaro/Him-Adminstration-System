import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "../../../lib/api.js";
import { useCurrentUser } from "../../../context/UserContext.jsx";
import DataTable, { SelectionBar, useSelection } from "../../ui/DataTable.jsx";

// The HOD's department directory, straight from the database (/api/departments/{id}/members).

const when = (iso) => (iso ? new Date(iso).toLocaleDateString(undefined, { month: "short", year: "numeric" }) : "—");

export default function DepartmentMembersPage() {
    const user = useCurrentUser();
    const departmentId = user?.department?.id ?? user?.department_id ?? null;
    const [q, setQ] = useState("");

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ["hod-department-members", departmentId],
        enabled: !!departmentId,
        queryFn: async () => (await api.get(`/departments/${departmentId}/members`)).data,
        staleTime: 30_000,
    });

    const all = data?.members || [];
    const members = useMemo(() => {
        const term = q.trim().toLowerCase();
        return term ? all.filter((m) => `${m.name} ${m.email} ${m.role}`.toLowerCase().includes(term)) : all;
    }, [all, q]);
    const selection = useSelection(members);

    const columns = [
        { key: "name", label: "Member", primary: true, className: "font-semibold", render: (m) => (
            <span className="flex items-center gap-2.5">
                {m.photo ? <img src={m.photo} alt="" className="h-8 w-8 rounded-full object-cover" /> : <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-600">{(m.name || "?").charAt(0)}</span>}
                <span data-history-user={m.id}>{m.name}</span>
            </span>) },
        { key: "role", label: "Role", render: (m) => <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${m.is_hod ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-700"}`}>{m.role}</span> },
        { key: "email", label: "Email", className: "max-w-[240px] truncate", render: (m) => m.email || "—" },
        { key: "status", label: "Status", className: "capitalize", render: (m) => m.pivot_status || "active" },
        { key: "joined", label: "Joined", render: (m) => when(m.joined_at) },
    ];

    if (!departmentId) {
        return <p className="rounded-2xl bg-white/70 p-8 text-center text-gray-600">You are not assigned to a department yet. Your pastor can appoint you as a head of department.</p>;
    }

    return (
        <div className="space-y-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h2 className="text-2xl font-bold text-white">{data?.department?.name || "Department"} members</h2>
                    <p className="mt-1 text-sm text-gray-300">Members join by request and your pastor approves them.</p>
                </div>
                <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or email…" className="h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm sm:w-64" />
            </div>

            <SelectionBar count={selection.chosen.length} noun="member" onClear={selection.clear}
                actions={[{ label: "Copy emails", onClick: () => navigator.clipboard?.writeText(selection.chosen.map((m) => m.email).filter(Boolean).join(", ")) }]} />

            <DataTable columns={columns} rows={members} loading={isLoading} error={isError ? "Members could not be loaded." : null} onRetry={refetch} selection={selection} pageSize={15} noun="member" empty="No members in this department yet." />
        </div>
    );
}
