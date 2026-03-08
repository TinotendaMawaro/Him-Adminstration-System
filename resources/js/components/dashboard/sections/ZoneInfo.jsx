import { useState } from "react";

// Editable Zone Profile Section
export default function ZoneInfo({ zone, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: zone?.name || "International Overflow Center",
    description: zone?.description || "A vibrant community of believers committed to spiritual growth and fellowship.",
    location: zone?.location || "Harare,Ashdown Park",
    established: zone?.established || "2010",
  });

  const handleSave = () => {
    setIsEditing(false);
    if (onUpdate) {
      onUpdate(editData);
    }
  };

  const handleCancel = () => {
    setEditData({
      name: zone?.name || "International Overflow Center",
      description: zone?.description || "A vibrant community of believers committed to spiritual growth and fellowship.",
      location: zone?.location || "Harare,Ashdown Park",
      established: zone?.established || "2010",
    });
    setIsEditing(false);
  };

  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/50 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg shadow-gold-500/20">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Zone Information</h3>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 rounded-xl bg-sky-100/50 text-sky-600 font-medium text-sm hover:bg-sky-100 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            Edit
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 rounded-xl bg-gray-100/50 text-gray-600 font-medium text-sm hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-gold-400 to-gold-500 text-white font-medium text-sm hover:shadow-lg hover:shadow-gold-500/25 transition-all"
            >
              Save
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {isEditing ? (
          // Edit Mode
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Zone Name</label>
              <input
                type="text"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400 transition-all resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={editData.location}
                  onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Established</label>
                <input
                  type="text"
                  value={editData.established}
                  onChange={(e) => setEditData({ ...editData, established: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-gold-400/50 focus:border-gold-400 transition-all"
                />
              </div>
            </div>
          </div>
        ) : (
          // View Mode
          <div className="space-y-6">
            {/* Zone Header */}
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-xl shadow-gold-500/20">
                <span className="text-white font-bold text-xl">{editData.name.charAt(0)}</span>
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-bold text-gray-900">{editData.name}</h4>
                <p className="text-gray-500 mt-1">{editData.description}</p>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-sky-50/50 rounded-2xl p-4 text-center">
                <p className="text-2xl font-bold text-sky-600">{zone?.membersCount || "250"}</p>
                <p className="text-sm text-gray-500 mt-1">Members</p>
              </div>
              <div className="bg-emerald-50/50 rounded-2xl p-4 text-center">
                <p className="text-2xl font-bold text-emerald-600">{zone?.homeGroupsCount || "20"}</p>
                <p className="text-sm text-gray-500 mt-1">HomeGroups</p>
              </div>
              <div className="bg-violet-50/50 rounded-2xl p-4 text-center">
                <p className="text-2xl font-bold text-violet-600">{zone?.departmentsCount || "8"}</p>
                <p className="text-sm text-gray-500 mt-1">Departments</p>
              </div>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50/50 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Location</p>
                  <p className="font-semibold text-gray-900">{editData.location}</p>
                </div>
              </div>
              <div className="bg-gray-50/50 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gold-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-gold-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Established</p>
                  <p className="font-semibold text-gray-900">{editData.established}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Pastors List Component - shown inside My Zone tab
export function PastorsList({ pastors = [], onViewProfile }) {
  const currentPastor = pastors.find((p) => p.isCurrent);
  const otherPastors = pastors.filter((p) => !p.isCurrent);

  return (
    <div className="bg-white/60 backdrop-blur-xl rounded-3xl border border-white/50 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Zonal Pastors</h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Current Pastor */}
        {currentPastor && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Current Pastor</p>
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-gold-50/50 to-sky-50/50 border border-gold-200/30">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg shadow-gold-500/20">
                <span className="text-white font-bold text-lg">{currentPastor.name.charAt(0)}</span>
              </div>
              <div className="flex-1">
                <p className="font-bold text-gray-900">{currentPastor.name}</p>
                <p className="text-sm text-gray-500">{currentPastor.title || "Lead Pastor"}</p>
                <p className="text-xs text-gold-600 mt-1">Since {currentPastor.since}</p>
              </div>
              <button
                onClick={() => onViewProfile?.(currentPastor)}
                className="w-10 h-10 rounded-xl bg-white/60 hover:bg-white flex items-center justify-center transition-colors"
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Other Pastors */}
        {otherPastors.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Previous Pastors</p>
            <div className="space-y-3">
              {otherPastors.map((pastor, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50/50 transition-colors cursor-pointer"
                  onClick={() => onViewProfile?.(pastor)}
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-sky-500 flex items-center justify-center text-white font-semibold">
                    {pastor.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{pastor.name}</p>
                    <p className="text-xs text-gray-500">{pastor.period || "2020 - 2022"}</p>
                  </div>
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Pastor Button */}
        <button className="w-full py-3 rounded-xl border-2 border-dashed border-gray-200 text-gray-500 font-medium hover:border-gold-400 hover:text-gold-600 transition-colors flex items-center justify-center gap-2">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Pastor
        </button>
      </div>
    </div>
  );
}

