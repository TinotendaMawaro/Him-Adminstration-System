import { useState, useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/api.js";
import Member360View from "../pastors/Member360View.jsx";
import TransferMemberModal from "../pastors/TransferMemberModal.jsx";
import DataTable, { ConfirmDialog, SelectionBar, useSelection } from "../ui/DataTable.jsx";

const INPUT_CLASS = "h-10 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:ring-1 focus:ring-[#dfb15b]/60 focus:border-[#dfb15b]";

export default function MembersTab() {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [transferMember, setTransferMember] = useState(null);
    const [flash, setFlash] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [filterHomeGroup, setFilterHomeGroup] = useState("");
    const [filterMinistry, setFilterMinistry] = useState("");
    const [selectedMember, setSelectedMember] = useState(null);
    const [showDrawer, setShowDrawer] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(20);
    const [confirm, setConfirm] = useState(null);   // { title, message, run }
    const [busy, setBusy] = useState(false);

    const {
           data: membersResponse,
           isLoading: membersLoading,
           error: membersError,
           refetch: refetchMembers,
           isFetching: membersFetching,
         } = useQuery({
           queryKey: ["pastor-members", currentPage, perPage, debouncedSearch, filterStatus, filterHomeGroup, filterMinistry],
           queryFn: async () => {
             try {
               const params = new URLSearchParams({ page: currentPage, per_page: perPage });
               if (debouncedSearch) params.append('search', debouncedSearch);
               if (filterStatus) params.append('status', filterStatus);
               if (filterHomeGroup) params.append('home_group_id', filterHomeGroup);
               if (filterMinistry) params.append('ministry', filterMinistry);

               const res = await api.get(`/members?${params}`);
               if (!res.data.success) throw new Error(res.data.message || "Failed to fetch members");
               return res.data;
             } catch (err) {
               // 401 is handled globally by the api client (sign-out); a 403 is shown as an error, not a forced logout.
               throw err;
             }
           },
           staleTime: 30000,
           gcTime: 300000,
           refetchOnWindowFocus: false,
           retry: 1,
           placeholderData: (previous) => previous,
         });

    // Wait for a pause in typing before asking the server (one request instead of one per keystroke).
    useEffect(() => {
      const id = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 350);
      return () => clearTimeout(id);
    }, [searchTerm]);

    const membersData = membersResponse?.data || [];
    const paginationMeta = membersResponse?.meta || { current_page: 1, last_page: 1, per_page: perPage, total: 0 };

    const { data: homegroups = [], isLoading: homegroupsLoading } = useQuery({
         queryKey: ["pastor-homegroups"],
         queryFn: async () => {
             const res = await api.get('/pastors/home-groups');
             if (!res.data.success) throw new Error(res.data.message || 'Failed');
             return res.data.data;
         },
         staleTime: 30000,
         refetchOnWindowFocus: false,
         retry: 1,
    });

    const handlePageChange = (page) => setCurrentPage(page);

    useEffect(() => { setCurrentPage(1); }, [debouncedSearch, filterStatus, filterHomeGroup, filterMinistry]);

    const filteredMembers = useMemo(() => Array.isArray(membersData) ? membersData : [], [membersData]);
    const selection = useSelection(filteredMembers);

    const handleViewMember = async (member) => {
      try {
        const response = await api.get(`/pastors/members/${member.id}/360`);
        if (response.data.success) {
          setSelectedMember(response.data.data);
          setShowDrawer(true);
        }
      } catch (err) {
        console.error('Error fetching member 360:', err);
        // Fallback to basic member data
        setSelectedMember(member);
        setShowDrawer(true);
      }
    };

    const handleRefresh = async () => {
      await queryClient.invalidateQueries({ queryKey: ["pastor-members"] });
      await refetchMembers();
    };

    const handleExport = () => {
      if (!filteredMembers.length) return;
      const headers = ["Member Code", "Full Name", "Phone", "Email", "Registration Date", "Status", "Title", "Department"];
      const rows = filteredMembers.map(m => [
        m.member_code || m.member_number || "",
        m.full_name || [m.name, m.surname].filter(Boolean).join(" ") || "",
        m.phone || "",
        m.email || "",
        m.membership_date || "",
        m.status || "",
        m.title || "",
        m.department?.name || "",
      ]);
      const csv = [headers.join(","), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(","))].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `members-export-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(link.href);
    };

    const runBulk = (action, rows) => setConfirm({
      title: `${action === "activate" ? "Activate" : "Deactivate"} ${rows.length} member${rows.length > 1 ? "s" : ""}?`,
      message: action === "activate" ? "They will be able to use the app again." : "They will be marked inactive and will not be able to sign in until reactivated.",
      confirmLabel: action === "activate" ? "Activate" : "Deactivate",
      tone: action === "activate" ? "success" : "danger",
      run: async () => { await api.post("/pastors/members/bulk", { ids: rows.map((m) => m.id), action }); },
    });

    const confirmAndRun = async () => {
      setBusy(true);
      try {
        await confirm.run();
        await handleRefresh();
        selection.clear();
        setFlash("Done");
      } catch (err) {
        setFlash(err.response?.data?.message || err.message || "Action failed");
      }
      setConfirm(null);
      setBusy(false);
      setTimeout(() => setFlash(""), 5000);
    };

    const toggleStatus = (member) => runBulk(member.status === "active" ? "deactivate" : "activate", [member]);

    const barActions = selection.chosen.length === 1
      ? [
          { label: "View", onClick: () => handleViewMember(selection.chosen[0]) },
          { label: "Move zone", tone: "primary", onClick: () => setTransferMember(selection.chosen[0]) },
          selection.chosen[0].status === "active"
            ? { label: "Deactivate", tone: "warn", onClick: () => toggleStatus(selection.chosen[0]) }
            : { label: "Activate", tone: "success", onClick: () => toggleStatus(selection.chosen[0]) },
        ]
      : [
          { label: "Activate selected", tone: "success", onClick: () => runBulk("activate", selection.chosen) },
          { label: "Deactivate selected", tone: "warn", onClick: () => runBulk("deactivate", selection.chosen) },
        ];

    const columns = [
      { key: "member_code", label: "Member code", className: "font-mono text-xs whitespace-nowrap", render: (m) => m.member_code || m.member_number || "N/A" },
      { key: "name", label: "Full name", primary: true, className: "font-semibold", render: (m) => <span data-history-user={m.user_id || undefined}>{m.full_name || m.name || "Unknown"}</span> },
      { key: "phone", label: "Phone", className: "whitespace-nowrap", render: (m) => m.phone || "N/A" },
      { key: "email", label: "Email", className: "max-w-[220px] truncate", render: (m) => m.email || "N/A" },
      { key: "registered", label: "Registered", className: "whitespace-nowrap", render: (m) => m.membership_date ? new Date(m.membership_date).toLocaleDateString() : "N/A" },
      { key: "status", label: "Status", render: (m) => (
        <span className={`inline-flex items-center gap-1.5 rounded-full border bg-white px-2.5 py-1 text-[11px] font-medium ${m.status === "active" ? "border-emerald-200 text-emerald-700" : "border-red-200 text-red-700"}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${m.status === "active" ? "bg-emerald-500" : "bg-red-500"}`} />{m.status === "active" ? "Active" : "Inactive"}
        </span>) },
      { key: "department", label: "Department", className: "max-w-[160px] truncate", render: (m) => m.department?.name || "N/A" },
    ];

    return (
      <div className="flex flex-col h-full">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900 leading-tight">Zone Members</h2>
            <p className="text-xs text-gray-500">Only your zone members are visible</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">{paginationMeta.total || filteredMembers.length} member{(paginationMeta.total || filteredMembers.length) !== 1 ? "s" : ""}</span>
            <button onClick={handleRefresh} disabled={membersFetching} className="h-8 px-3 bg-[#dfb15b] text-white text-xs font-medium rounded-lg hover:bg-amber-600 disabled:opacity-50">
              {membersFetching ? "..." : "Refresh"}
            </button>
          </div>
        </div>

        {membersError && (
          <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-700">
            <p className="text-xs font-semibold">{membersError.message}</p>
            <button onClick={() => { queryClient.invalidateQueries({ queryKey: ["pastor-members"] }); refetchMembers(); }} className="mt-2 h-7 px-3 bg-rose-600 text-white text-xs rounded-lg">Retry</button>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 mb-3">
          <input type="search" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search name, code, phone, email..." className={`${INPUT_CLASS} w-full sm:w-64`} />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={`${INPUT_CLASS} flex-1 sm:flex-none sm:w-32`}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select value={filterMinistry} onChange={(e) => setFilterMinistry(e.target.value)} className={`${INPUT_CLASS} flex-1 sm:flex-none sm:w-32`}>
            <option value="">All Ministries</option>
            <option value="R">Revival (R)</option>
            <option value="M">Ministry (M)</option>
            <option value="H">Harvest (H)</option>
            <option value="P">Purpose (P)</option>
          </select>
          <select value={filterHomeGroup} onChange={(e) => setFilterHomeGroup(e.target.value)} className={`${INPUT_CLASS} flex-1 sm:flex-none sm:w-40`}>
            <option value="">All Home Groups</option>
            {homegroups.map((hg) => <option key={hg.id} value={hg.id}>{hg.name}</option>)}
          </select>
          <button onClick={handleExport} disabled={!filteredMembers.length} className={`${INPUT_CLASS} px-3 bg-white hover:bg-gray-50 disabled:opacity-50`}>
            Export CSV
          </button>
        </div>

        <SelectionBar count={selection.chosen.length} noun="member" actions={barActions} onClear={selection.clear} />

        <DataTable
          columns={columns}
          rows={filteredMembers}
          loading={membersLoading}
          selection={selection}
          noun="member"
          empty="No members found"
          pagination={{ page: paginationMeta.current_page, lastPage: paginationMeta.last_page, total: paginationMeta.total, perPage: paginationMeta.per_page, onPage: handlePageChange }}
        />

        <ConfirmDialog open={!!confirm} title={confirm?.title} message={confirm?.message} confirmLabel={confirm?.confirmLabel} tone={confirm?.tone} busy={busy} onConfirm={confirmAndRun} onClose={() => !busy && setConfirm(null)} />

        {transferMember && (
          <TransferMemberModal
            member={transferMember}
            onClose={() => setTransferMember(null)}
            onDone={async (message) => { setTransferMember(null); setFlash(message); setTimeout(() => setFlash(""), 6000); await handleRefresh(); }}
          />
        )}

        {flash && (
          <div className="fixed bottom-6 left-1/2 z-[10000] -translate-x-1/2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-medium text-white shadow-lg" role="status">{flash}</div>
        )}

        {showDrawer && selectedMember && (
          <Member360View memberId={selectedMember?.member?.id || selectedMember?.id} onClose={() => setShowDrawer(false)} />
        )}

        {showRegisterModal && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setShowRegisterModal(false)} />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold mb-4">Register New Member</h3>
                <p className="text-gray-500">Registration form to be implemented.</p>
                <button onClick={() => setShowRegisterModal(false)} className="mt-4 px-4 py-2 bg-gold-500 text-white rounded-xl">Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
}
