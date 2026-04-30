import { useState, useEffect } from "react";
import api from "../../lib/api";

export default function DepartmentsTab() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await api.get('/departments');
      if (response.data && response.data.success) {
        setDepartments(response.data.departments || []);
      }
    } catch (err) {
      console.error('Error fetching departments:', err);
      setError(err.response && err.response.data && err.response.data.message || 'Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-600">{error}</p>
        <button onClick={fetchDepartments} className="mt-3 text-gold-600 hover:underline">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map(department => (
          <div key={department.id} className="group relative bg-white/70 backdrop-blur-xl rounded-3xl border border-white/50 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer p-6">
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

            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
              <button className="flex-1 text-sm bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 text-white px-5 py-2.5 rounded-full font-semibold shadow-lg shadow-gold-500/25 hover:shadow-gold-500/40 hover:scale-105 transition-all duration-300">
                Appoint HOD
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}