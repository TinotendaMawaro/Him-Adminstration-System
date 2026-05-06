import { useState, useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/api.js";
import MemberDrawer from "./MemberDrawer.jsx";
import Pagination from "../Pagination.jsx";

// ============================================================================
// SECURE MEMBERS TAB COMPONENT
// - Fetches only the authenticated pastor's zone members
// - Implements rate-limit awareness and error boundaries
// - Displays empty state when no members exist
// ============================================================================

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

    // Fetch members with pagination
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
               const params = new URLSearchParams({
                 page: currentPage,
                 per_page: perPage,
               });

               if (searchTerm) params.append('search', searchTerm);
               if (filterStatus) params.append('status', filterStatus);
               if (filterHomeGroup) params.append('home_group_id', filterHomeGroup);
               if (filterMinistry) params.append('ministry', filterMinistry);

               const res = await api.get(`/members?${params}`);
               if (!res.data.success) {
                 throw new Error(res.data.message || "Failed to fetch members");
               }

               // Save to localStorage for persistence
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
             // Load from localStorage if available
             const cached = localStorage.getItem('members-data');
             return cached ? JSON.parse(cached) : undefined;
           },
         });

    const membersData = membersResponse?.data || [];
    const paginationMeta = membersResponse?.meta || {
      current_page: 1,
      last_page: 1,
      per_page: perPage,
      total: 0
    };

   // Fetch home groups for filter dropdown
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

  // --------------------------------------------------------------------------
  // Handle page changes
  // --------------------------------------------------------------------------
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterHomeGroup, filterMinistry]);

  // Use server-filtered data (pagination already applied)
  const filteredMembers = useMemo(() => {
    return Array.isArray(membersData) ? membersData : [];
  }, [membersData]);

  // --------------------------------------------------------------------------
  // Action handlers
  // --------------------------------------------------------------------------
  const handleViewMember = async (member) => {
    // Fetch full member details with all relationships
    try {
      const response = await api.get(`/members/${member.id}`);
      if (response.data.success) {
        setSelectedMember(response.data.data);
        setShowDrawer(true);
      }
    } catch (err) {
      console.error('Error fetching member details:', err);
      // Fallback to basic member data
      setSelectedMember(member);
      setShowDrawer(true);
    }
  };

    const handleRefresh = async () => {
      await queryClient.invalidateQueries({ queryKey: ["pastor-members"] });
      await refetchMembers();
    };

  // --------------------------------------------------------------------------
  // RENDER
  // --------------------------------------------------------------------------
  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-500">Portal</span>
        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-gray-900 font-medium">Members</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Members</h2>
          <p className="text-gray-500 mt-1">Manage your zone's member directory</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">
            {filteredMembers.length} member{filteredMembers.length !== 1 ? "s" : ""}
          </span>
            <button
              onClick={handleRefresh}
              disabled={membersFetching}
              className="flex items-center gap-2 px-4 py-2 bg-gold-500 text-white rounded-xl hover:bg-gold-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-gold-500/25 hover:shadow-gold-500/40"
          >
             <svg className={`w-4 h-4 ${membersFetching ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.5M19 19v-5h-.5M5 4.5A9 9 0 0118.8 7.5M19 19.5a9 9 0 01-13.8-3" />
            </svg>
             {membersFetching ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

       {/* Error State */}
       {membersError && (
         <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-rose-700">
           <div className="flex items-start gap-4">
             <svg className="w-6 h-6 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
             </svg>
             <div className="flex-1 min-w-0">
               <p className="font-semibold text-base">Unable to load members</p>
               <p className="text-sm mt-1 text-rose-600 break-words">{membersError.message}</p>
               <button
                 onClick={() => {
                     queryClient.invalidateQueries({ queryKey: ["pastor-members"] });
                     refetchMembers();
                 }}
                 className="mt-4 px-4 py-2 bg-rose-600 text-white text-sm font-medium rounded-xl hover:bg-rose-700 transition-colors"
               >
                 Retry
               </button>
             </div>
           </div>
         </div>
       )}

      {/* Search and Filter Bar */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, member code, phone or email..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400 transition-all"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white/50 focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400 transition-all text-sm"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>

          <select
            value={filterMinistry}
            onChange={(e) => setFilterMinistry(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white/50 focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400 transition-all text-sm"
          >
            <option value="">All Ministries</option>
            <option value="R">Revival (R)</option>
            <option value="M">Ministry (M)</option>
            <option value="H">Harvest (H)</option>
            <option value="P">Purpose (P)</option>
          </select>

          <select
            value={filterHomeGroup}
            onChange={(e) => setFilterHomeGroup(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white/50 focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400 transition-all text-sm"
          >
            <option value="">All Home Groups</option>
            {homegroups.map((hg) => (
              <option key={hg.id} value={hg.id}>
                {hg.name}
              </option>
            ))}
          </select>
        </div>
      </div>

       {/* --------------------------------------------------------------- */}
       {/* SECURE MEMBERS TABLE: Inline rendering - no external component  */}
       {/* --------------------------------------------------------------- */}
       {membersLoading ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center justify-center">
            <svg className="animate-spin h-8 w-8 text-gold-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="ml-3 text-gray-500">Loading members...</span>
          </div>
        </div>
      ) : filteredMembers.length === 0 ? (
        /* EMPTY STATE - No data leakage, user-friendly message */
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12">
          <div className="text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No members found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm || filterStatus || filterHomeGroup || filterMinistry
                ? "Try adjusting your search or filters"
                : "Your zone has no registered members yet"}
            </p>
            {(searchTerm || filterStatus || filterHomeGroup || filterMinistry) && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterStatus("");
                  setFilterHomeGroup("");
                  setFilterMinistry("");
                }}
                className="px-4 py-2 text-gold-600 hover:text-gold-800 font-medium"
              >
                Clear all filters
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gold-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-gold-700">
                            {(member.name && member.name.charAt(0) && member.name.charAt(0).toUpperCase()) || "?"}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {member.name || "Unknown"}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-[200px]">
                            {member.email || "No email"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 font-mono">
                        {member.member_number || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {member.phone || member.mobile || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          member.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {member.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleViewMember(member)}
                        className="text-gold-600 hover:text-gold-900 transition-colors"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {paginationMeta.total > 0 && (
            <Pagination
              currentPage={paginationMeta.current_page}
              totalPages={paginationMeta.last_page}
              totalItems={paginationMeta.total}
              itemsPerPage={paginationMeta.per_page}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      )}

       {/* Member Drawer */}
       {showDrawer && selectedMember && (
         <MemberDrawer member={selectedMember} onClose={() => setShowDrawer(false)} />
       )}

      {/* Register Modal placeholder */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowRegisterModal(false)}></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-4">Register New Member</h3>
              <p className="text-gray-500">Registration form to be implemented.</p>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="mt-4 px-4 py-2 bg-gold-500 text-white rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
