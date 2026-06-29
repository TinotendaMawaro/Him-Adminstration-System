import { useState, useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/api.js";
import MemberDrawer from "./MemberDrawer.jsx";
import Pagination from "../Pagination.jsx";

const ROW_CLASS = "h-11";
const TH_CLASS = "px-2 py-1 text-left text-[11px] font-medium text-gray-500 uppercase tracking-widest bg-white/75 backdrop-blur-md border-b border-gray-100";
const TD_CLASS = "px-2 py-1 text-xs text-gray-900 border-b border-gray-100 align-middle";
const INPUT_CLASS = "h-9 rounded-lg border border-gray-200 bg-white/70 px-2 text-xs focus:ring-1 focus:ring-[#dfb15b]/60 focus:border-[#dfb15b]";

export default function MembersTab() {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [filterHomeGroup, setFilterHomeGroup] = useState("");
    const [filterMinistry, setFilterMinistry] = useState("");
    const [selectedMember, setSelectedMember] = useState(null);
    const [showDrawer, setShowDrawer] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(20);
    const [selectedIds, setSelectedIds] = useState([]);

    const {
           data: membersResponse,
           isLoading: membersLoading,
           error: membersError,
           refetch: refetchMembers,
           isFetching: membersFetching,
         } = useQuery({
           queryKey: ["pastor-members", currentPage, perPage, searchTerm, filterStatus, filterHomeGroup, filterMinistry],
           queryFn: async () => {
             try {
               const params = new URLSearchParams({ page: currentPage, per_page: perPage });
               if (searchTerm) params.append('search', searchTerm);
               if (filterStatus) params.append('status', filterStatus);
               if (filterHomeGroup) params.append('home_group_id', filterHomeGroup);
               if (filterMinistry) params.append('ministry', filterMinistry);

               const res = await api.get(`/members?${params}`);
               if (!res.data.success) throw new Error(res.data.message || "Failed to fetch members");
               localStorage.setItem('members-data', JSON.stringify(res.data));
               return res.data;
             } catch (err) {
               if ((err.response && err.response.status === 403) || (err.response && err.response.status === 401)) {
                 localStorage.removeItem("him_token");
                 window.location.href = "/login";
               }
               throw err;
             }
           },
           staleTime: 30000,
           gcTime: 300000,
           refetchOnWindowFocus: false,
           retry: 1,
           keepPreviousData: true,
           initialData: () => {
             const cached = localStorage.getItem('members-data');
             return cached ? JSON.parse(cached) : undefined;
           },
         });

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

    const handlePageChange = (page) => {
      setCurrentPage(page);
      setSelectedIds([]);
    };

    useEffect(() => {
      setCurrentPage(1);
      setSelectedIds([]);
    }, [searchTerm, filterStatus, filterHomeGroup, filterMinistry]);

    const filteredMembers = useMemo(() => Array.isArray(membersData) ? membersData : [], [membersData]);

    const toggleSelectAll = () => {
      setSelectedIds(prev => prev.length === filteredMembers.length ? [] : filteredMembers.map(m => m.id));
    };

    const toggleSelect = (id) => {
      setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const handleViewMember = async (member) => {
      try {
        const response = await api.get(`/members/${member.id}`);
        if (response.data.success) {
          setSelectedMember(response.data.data);
          setShowDrawer(true);
        }
      } catch (err) {
        console.error('Error fetching member details:', err);
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

    const handleBulkAction = async (action) => {
      if (!selectedIds.length) return;
      if (!window.confirm(`Confirm ${action} for ${selectedIds.length} member(s)?`)) return;
      try {
        await api.post('/pastors/members/bulk', { ids: selectedIds, action });
        await handleRefresh();
        setSelectedIds([]);
      } catch (err) {
        alert(err.response?.data?.message || err.message || "Action failed");
      }
    };

    const handleStatusToggle = async (member) => {
      const action = member.status === 'active' ? 'deactivate' : 'activate';
      if (!window.confirm(`Change status to ${action} for this member?`)) return;
      try {
        await api.post(`/pastors/members/${member.id}/status`, { status: action === 'activate' ? 'active' : 'inactive' });
        await handleRefresh();
      } catch (err) {
        alert(err.response?.data?.message || err.message || "Status update failed");
      }
    };

    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900 leading-tight">Zone Members</h2>
            <p className="text-xs text-gray-500">Only your zone members are visible</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">{filteredMembers.length} member{filteredMembers.length !== 1 ? "s" : ""}</span>
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
          <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search name, code, phone, email..." className={`${INPUT_CLASS} w-48`} />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={`${INPUT_CLASS} w-28`}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select value={filterMinistry} onChange={(e) => setFilterMinistry(e.target.value)} className={`${INPUT_CLASS} w-28`}>
            <option value="">All Ministries</option>
            <option value="R">Revival (R)</option>
            <option value="M">Ministry (M)</option>
            <option value="H">Harvest (H)</option>
            <option value="P">Purpose (P)</option>
          </select>
          <select value={filterHomeGroup} onChange={(e) => setFilterHomeGroup(e.target.value)} className={`${INPUT_CLASS} w-36`}>
            <option value="">All Home Groups</option>
            {homegroups.map((hg) => <option key={hg.id} value={hg.id}>{hg.name}</option>)}
          </select>
          <button onClick={handleExport} disabled={!filteredMembers.length} className={`${INPUT_CLASS} px-3 bg-white hover:bg-gray-50 disabled:opacity-50`}>
            Export CSV
          </button>
        </div>

        {selectedIds.length > 0 && (
          <div className="mb-2 flex items-center gap-2">
            <span className="text-xs text-gray-600">{selectedIds.length} selected</span>
            <button onClick={() => handleBulkAction('deactivate')} className="h-7 px-3 bg-amber-500 text-white text-xs rounded-lg">Deactivate</button>
            <button onClick={() => handleBulkAction('activate')} className="h-7 px-3 bg-emerald-500 text-white text-xs rounded-lg">Activate</button>
          </div>
        )}

        <div className="flex-1 overflow-auto rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full table-fixed">
            <thead className="sticky top-0 z-10">
              <tr>
                <th className={`${TH_CLASS} w-8`}><input type="checkbox" checked={selectedIds.length === filteredMembers.length && filteredMembers.length > 0} onChange={toggleSelectAll} /></th>
                <th className={`${TH_CLASS} w-28`}>Member Code</th>
                <th className={`${TH_CLASS}`}>Full Name</th>
                <th className={`${TH_CLASS} w-28`}>Phone</th>
                <th className={`${TH_CLASS} w-44`}>Email</th>
                <th className={`${TH_CLASS} w-24`}>Registered</th>
                <th className={`${TH_CLASS} w-20`}>Status</th>
                <th className={`${TH_CLASS} w-24`}>Title</th>
                <th className={`${TH_CLASS} w-28`}>Department</th>
                <th className={`${TH_CLASS} w-28`}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {membersLoading ? (
                <tr><td colSpan={10} className="px-4 py-8 text-center text-xs text-gray-500">Loading members...</td></tr>
              ) : filteredMembers.length === 0 ? (
                <tr><td colSpan={10} className="px-4 py-8 text-center text-xs text-gray-500">No members found</td></tr>
              ) : filteredMembers.map((member) => (
                <tr key={member.id} className={`${ROW_CLASS} hover:bg-gray-50`}>
                  <td className={`${TD_CLASS}`}><input type="checkbox" checked={selectedIds.includes(member.id)} onChange={() => toggleSelect(member.id)} /></td>
                  <td className={`${TD_CLASS} font-mono`} title={member.member_code || member.member_number || "N/A"}>{member.member_code || member.member_number || "N/A"}</td>
                  <td className={`${TD_CLASS} font-medium truncate`} title={member.full_name || member.name || "Unknown"}>{member.full_name || member.name || "Unknown"}</td>
                  <td className={`${TD_CLASS}`} title={member.phone || "N/A"}>{member.phone || "N/A"}</td>
                  <td className={`${TD_CLASS} truncate`} title={member.email || "N/A"}>{member.email || "N/A"}</td>
                  <td className={`${TD_CLASS}`}>{member.membership_date ? new Date(member.membership_date).toLocaleDateString() : "N/A"}</td>
                  <td className={`${TD_CLASS}`}>
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium bg-white ${member.status === "active" ? "border-emerald-200 text-emerald-700" : "border-red-200 text-red-700"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${member.status === "active" ? "bg-emerald-500" : "bg-red-500"}`}></span>
                      {member.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className={`${TD_CLASS}`} title={member.title || "N/A"}>{member.title || "N/A"}</td>
                  <td className={`${TD_CLASS} truncate`} title={member.department?.name || "N/A"}>{member.department?.name || "N/A"}</td>
                  <td className={`${TD_CLASS}`}>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleViewMember(member)} className="text-[#dfb15b] hover:text-amber-900">View</button>
                      <button onClick={() => handleStatusToggle(member)} className="text-emerald-600 hover:text-emerald-800">
                        {member.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {paginationMeta.total > 0 && (
            <div className="border-t border-gray-200 bg-gray-50 px-2 py-1">
              <Pagination currentPage={paginationMeta.current_page} totalPages={paginationMeta.last_page} totalItems={paginationMeta.total} itemsPerPage={paginationMeta.per_page} onPageChange={handlePageChange} />
            </div>
          )}
        </div>

        {showDrawer && selectedMember && (
          <MemberDrawer member={selectedMember} onClose={() => setShowDrawer(false)} onUpdated={handleRefresh} />
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
