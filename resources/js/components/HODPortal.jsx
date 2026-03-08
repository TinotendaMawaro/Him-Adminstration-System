import React, { useState } from "react";
import PortalLayout from "./PortalLayout";

// Dashboard for HOD - Premium Frosted Glass
const HODDashboard = ({ user }) => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-violet-50/80 via-white/80 to-sky-50/80 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-lg">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
          Welcome back, HOD {user?.name?.split(" ")[1] || "John"}!
        </h1>
        <p className="text-gray-500">
          Manage your department efficiently.
        </p>
      </div>

      {/* Stats - Premium Glass */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-lg">
          <p className="text-gray-400 text-sm mb-1">Department Members</p>
          <p className="text-3xl font-bold text-gray-900">45</p>
        </div>
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-lg">
          <p className="text-gray-400 text-sm mb-1">This Week's Attendance</p>
          <p className="text-3xl font-bold text-gray-900">32</p>
        </div>
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-lg">
          <p className="text-gray-400 text-sm mb-1">Upcoming Events</p>
          <p className="text-3xl font-bold text-gray-900">3</p>
        </div>
      </div>

      {/* Quick Actions - Premium Glass */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="p-5 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/50 shadow-md hover:shadow-xl transition-all text-left">
          <p className="text-gray-900 font-semibold mb-1">View Members</p>
          <p className="text-gray-400 text-sm">See all department members</p>
        </button>
        <button className="p-5 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/50 shadow-md hover:shadow-xl transition-all text-left">
          <p className="text-gray-900 font-semibold mb-1">Submit Report</p>
          <p className="text-gray-400 text-sm">Weekly department report</p>
        </button>
        <button className="p-5 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/50 shadow-md hover:shadow-xl transition-all text-left">
          <p className="text-gray-900 font-semibold mb-1">My Zone</p>
          <p className="text-gray-400 text-sm">View zone information</p>
        </button>
      </div>
    </div>
  );
};

// HOD Members - Premium Frosted Glass
const HODMembers = () => {
  const members = [
    { id: 1, name: "John Doe", role: "Leader", email: "john@example.com", phone: "0771234567" },
    { id: 2, name: "Jane Smith", role: "Member", email: "jane@example.com", phone: "0772345678" },
    { id: 3, name: "Mike Johnson", role: "Member", email: "mike@example.com", phone: "0773456789" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Department Members</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map((member) => (
          <div key={member.id} className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-400 to-indigo-500 flex items-center justify-center shadow-lg">
                <span className="text-white font-semibold">{member.name.charAt(0)}</span>
              </div>
              <div>
                <p className="text-gray-900 font-semibold">{member.name}</p>
                <p className="text-gray-400 text-sm">{member.role}</p>
              </div>
            </div>
            <div className="space-y-2 text-gray-500 text-sm mb-4">
              <p>{member.email}</p>
              <p>{member.phone}</p>
            </div>
            <button className="w-full py-2.5 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all font-medium">
              View Profile
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// HOD Reports - Premium Frosted Glass
const HODReports = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Department Reports</h2>
      
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Submit Weekly Report</h3>
        <form className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-500 text-sm mb-1">Attendance</label>
              <input
                type="number"
                className="w-full bg-gray-50/80 text-gray-900 px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-violet-400/50 focus:ring-2 focus:ring-violet-400/20"
              />
            </div>
            <div>
              <label className="block text-gray-500 text-sm mb-1">New Members</label>
              <input
                type="number"
                className="w-full bg-gray-50/80 text-gray-900 px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-violet-400/50 focus:ring-2 focus:ring-violet-400/20"
              />
            </div>
          </div>
          <div>
            <label className="block text-gray-500 text-sm mb-1">Notes</label>
            <textarea
              rows={3}
              className="w-full bg-gray-50/80 text-gray-900 px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-violet-400/50 focus:ring-2 focus:ring-violet-400/20"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-violet-400 to-indigo-500 text-white py-3 rounded-xl font-semibold hover:from-violet-500 hover:to-indigo-600 transition-all shadow-lg shadow-violet-500/20"
          >
            Submit Report
          </button>
        </form>
      </div>
    </div>
  );
};

// Main HOD Portal
export default function HODPortal({ user, onLogout }) {
  const [activePage, setActivePage] = useState("dashboard");

  const hodMenuItems = [
    { id: "dashboard", label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { id: "members", label: "Members", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
    { id: "reports", label: "Reports", icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
    { id: "zone", label: "My Zone", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  ];

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <HODDashboard user={user} />;
      case "members":
        return <HODMembers />;
      case "reports":
        return <HODReports />;
      case "zone":
        return <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-lg"><h2 className="text-2xl font-bold text-gray-900">Zone Information</h2><p className="text-gray-500 mt-2">View zone details here.</p></div>;
      default:
        return <HODDashboard user={user} />;
    }
  };

  return (
    <PortalLayout
      user={user}
      activePage={activePage}
      setActivePage={setActivePage}
      onLogout={onLogout}
      menuItems={hodMenuItems}
      colorScheme="purple"
    >
      {renderPage()}
    </PortalLayout>
  );
}
