import React, { useState } from "react";
import PortalLayout from "./PortalLayout";

// Member Dashboard - Premium Frosted Glass
const MemberDashboard = ({ user }) => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-50/80 via-white/80 to-teal-50/80 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-lg">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
          Welcome, {user?.name || "Member"}!
        </h1>
        <p className="text-gray-500">
          Stay connected with your church family.
        </p>
      </div>

      {/* Quick Info - Premium Glass */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-lg">
          <p className="text-gray-400 text-sm mb-1">Home Group</p>
          <p className="text-2xl font-bold text-gray-900">North A</p>
        </div>
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-lg">
          <p className="text-gray-400 text-sm mb-1">Zone</p>
          <p className="text-2xl font-bold text-gray-900">North Zone</p>
        </div>
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-lg">
          <p className="text-gray-400 text-sm mb-1">Department</p>
          <p className="text-2xl font-bold text-gray-900">Youth</p>
        </div>
      </div>

      {/* Announcements - Premium Glass */}
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Announcements</h3>
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-gray-50/50 hover:bg-gray-100/50 transition-colors">
            <p className="text-gray-900 font-semibold">Sunday Service Reminder</p>
            <p className="text-gray-400 text-sm">Join us this Sunday at 9:00 AM for worship service.</p>
          </div>
          <div className="p-4 rounded-2xl bg-gray-50/50 hover:bg-gray-100/50 transition-colors">
            <p className="text-gray-900 font-semibold">Youth Fellowship</p>
            <p className="text-gray-400 text-sm">Friday at 6:00 PM in the youth center.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Member Profile - Premium Frosted Glass
const MemberProfile = ({ user }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">My Profile</h2>
      
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 border border-white/50 shadow-lg">
        <div className="flex items-center gap-6 mb-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-2xl">{user?.name?.charAt(0) || "M"}</span>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{user?.name || "Member Name"}</h3>
            <p className="text-gray-400">Member since 2024</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-gray-400 text-sm">Email</p>
            <p className="text-gray-900 font-semibold">{user?.email || "member@example.com"}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Phone</p>
            <p className="text-gray-900 font-semibold">0771234567</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Home Group</p>
            <p className="text-gray-900 font-semibold">North A</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Zone</p>
            <p className="text-gray-900 font-semibold">North Zone</p>
          </div>
        </div>
        
        <button className="mt-6 bg-gradient-to-r from-emerald-400 to-teal-500 text-white px-5 py-2.5 rounded-xl font-semibold hover:from-emerald-500 hover:to-teal-600 transition-all shadow-lg shadow-emerald-500/20">
          Edit Profile
        </button>
      </div>
    </div>
  );
};

// Main Member Portal
export default function MemberPortal({ user, onLogout }) {
  const [activePage, setActivePage] = useState("dashboard");

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <MemberDashboard user={user} />;
      case "profile":
        return <MemberProfile user={user} />;
      default:
        return <MemberDashboard user={user} />;
    }
  };

  return (
    <PortalLayout
      user={user}
      activePage={activePage}
      setActivePage={setActivePage}
      onLogout={onLogout}
      colorScheme="green"
    >
      {renderPage()}
    </PortalLayout>
  );
}
