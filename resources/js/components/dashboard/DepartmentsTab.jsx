import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";
import api from "../../lib/api";
import Pagination from "../Pagination.jsx";
import { SelectionBar, useSelection } from "../ui/DataTable.jsx";

// Assign HOD Modal
function AssignHodModal({ isOpen, onClose, departmentName, departmentId, onSuccess }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && departmentId) {
      fetchUsers();
    }
  }, [isOpen, departmentId]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Get all active users that can be HODs
      const response = await api.get('/members');
      if (response.data && response.data.success) {
        // Filter to users with appropriate roles (member, hod, pastor)
        const eligibleUsers = response.data.data.filter(user =>
          user.is_active && ['member', 'hod', 'pastor'].includes(user.role?.toLowerCase())
        );
        setUsers(eligibleUsers || []);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAssign = async () => {
    if (!selectedUser) return;

    setAssigning(true);
    setError("");

    try {
      const response = await api.post(`/departments/${departmentId}/assign-hod`, {
        user_id: selectedUser.id
      });

      if (response.data && response.data.success) {
        onSuccess();
        onClose();
      } else {
        setError(response.data?.message || 'Failed to assign HOD');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'An error occurred. Please try again.';
      setError(msg);
    } finally {
      setAssigning(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Assign HOD">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden animate-scale-in">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Assign HOD</h2>
          <p className="text-gray-500 text-sm mt-1">Select a user to lead {departmentName}</p>
        </div>
        <div className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}
          <div className="relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search users..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-white/50 focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400 transition-all"
            />
          </div>
          <div className="max-h-60 overflow-y-auto space-y-2">
            {loading ? (
              <div className="text-center py-4 text-gray-500">Loading users...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No eligible users available</div>
            ) : (
              filteredUsers.map(user => (
                <button
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={`w-full p-4 rounded-xl flex items-center gap-3 transition-all ${
                    selectedUser && selectedUser.id === user.id
                      ? 'bg-emerald-50 border-2 border-emerald-400'
                      : 'bg-white border-2 border-transparent hover:bg-gray-50'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center text-white font-bold">
                    {user.name.charAt(0)}
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-500">{user.role || 'Member'}</p>
                  </div>
                  {selectedUser && selectedUser.id === user.id && (
                    <svg className="w-5 h-5 text-emerald-500 ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={!selectedUser || assigning}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold-400 to-gold-500 text-white font-semibold hover:from-gold-500 hover:to-gold-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {assigning ? 'Assigning...' : 'Assign HOD'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function DepartmentsTab() {
    const [showAssignHodModal, setShowAssignHodModal] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(12);

    const { data: departmentsResponse, isLoading, error, refetch } = useQuery({
        queryKey: ['departments', currentPage, perPage],
        queryFn: async () => {
            const params = new URLSearchParams({
                page: currentPage,
                per_page: perPage,
            });
            const response = await api.get(`/departments?${params}`);
            if (response.data && response.data.success) {
                // Save to localStorage for persistence
                localStorage.setItem('departments-data', JSON.stringify(response.data));
                return response.data;
            }
            throw new Error(response.data?.message || 'Failed to load departments');
        },
        staleTime: 30000,
        gcTime: 300000,
        refetchOnWindowFocus: true,
        retry: 1,
        keepPreviousData: true,
        initialData: () => {
            // Load from localStorage if available
            const cached = localStorage.getItem('departments-data');
            return cached ? JSON.parse(cached) : undefined;
        },
    });

    const departments = departmentsResponse?.departments || [];
    const selection = useSelection(departments);
    const paginationMeta = departmentsResponse?.meta || {
        current_page: 1,
        last_page: 1,
        per_page: perPage,
        total: 0
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handleAssignHod = (department) => {
        setSelectedDepartment(department);
        setShowAssignHodModal(true);
    };

   if (isLoading) {
        return (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500"></div>
          </div>
        );
      }

      if (error) {
        return (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600">{error.message}</p>
            <button onClick={() => refetch()} className="mt-3 text-gold-600 hover:underline">
              Try Again
            </button>
          </div>
        );
      }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Departments</h2>
          <p className="text-gray-500 mt-1">Manage church departments and HODs</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white/60 backdrop-blur-md rounded-full px-4 py-2 text-sm font-medium text-gray-600">
            {departments.length} Departments
          </div>
        </div>
      </div>

      <SelectionBar
        count={selection.chosen.length}
        noun="department"
        onClear={selection.clear}
        actions={selection.chosen.length === 1 ? [{ label: selection.chosen[0].hod ? "Change HOD" : "Appoint HOD", tone: "primary", onClick: () => handleAssignHod(selection.chosen[0]) }] : []}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        {departments.map(department => (
          <div key={department.id} className={`group relative flex h-full flex-col bg-white/70 backdrop-blur-xl rounded-3xl border overflow-hidden hover:shadow-xl transition-all duration-300 p-6 pt-12 ${selection.has(department.id) ? "border-sky-400 ring-2 ring-sky-300" : "border-white/50"}`}>
            <label className="absolute left-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow">
              <input type="checkbox" className="h-4 w-4" aria-label={`Select ${department.name}`} checked={selection.has(department.id)} onChange={() => selection.toggle(department.id)} />
            </label>
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-400/20 to-sky-100/10 flex items-center justify-center">
                <svg className="w-6 h-6 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-600">
                Active
              </span>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-900">{department.name}</h3>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{department.description}</p>
            </div>

            <div className="bg-white/50 rounded-2xl p-4 mb-4" onClick={(e) => e.stopPropagation()}>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Head of Department</p>
              {department.hod ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-400 to-gold-500 flex items-center justify-center text-white font-bold text-sm">
                    {department.hod.name ? department.hod.name.charAt(0) : '?'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{department.hod.name}</p>
                    <p className="text-xs text-gray-500">Since {department.hod_assigned_at ? new Date(department.hod_assigned_at).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-2">
                  <p className="text-sm text-gray-500">No HOD appointed</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white/50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-gray-900">{department.members_count || 0}</p>
                <p className="text-xs text-gray-500">Members</p>
              </div>
              <div className="bg-white/50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-gray-900">{department.activities_count || 0}</p>
                <p className="text-xs text-gray-500">Activities</p>
              </div>
            </div>

            <div className="mt-auto flex gap-2" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => handleAssignHod(department)}
                className="flex-1 text-sm bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 text-white px-5 py-2.5 rounded-full font-semibold shadow-lg shadow-gold-500/25 hover:shadow-gold-500/40 hover:scale-105 transition-all duration-300"
              >
                Appoint HOD
              </button>
            </div>
          </div>
        ))}
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

      {/* Assign HOD Modal */}
      <AssignHodModal
        isOpen={showAssignHodModal}
        onClose={() => { setShowAssignHodModal(false); setSelectedDepartment(null); }}
        departmentName={selectedDepartment && selectedDepartment.name}
        departmentId={selectedDepartment && selectedDepartment.id}
        onSuccess={refetch}
      />
    </div>
  );
}