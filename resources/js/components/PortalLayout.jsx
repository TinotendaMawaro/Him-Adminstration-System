import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

// Icons as components
const DashboardIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const UsersIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const HomeGroupIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const ReportIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const WeddingIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" />
  </svg>
);

const DepartmentIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
  </svg>
);

const NotificationIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
  </svg>
);

const ProfileIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const SettingsIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const LogoutIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const AchievementsIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

// Sidebar Item Component
const SidebarItem = ({ icon, label, to, active, onClick, badge }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 group relative ${
      active
        ? "bg-gradient-to-r from-gold-500/10 to-amber-500/10 text-gold-600 border border-gold-200"
        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
    }`}
  >
    <span className={`${active ? "text-gold-500" : "text-gray-400 group-hover:text-gray-600"}`}>
      {icon}
    </span>
    <span className="font-medium">{label}</span>
    {badge && (
      <span className="ml-auto bg-gold-500 text-white text-xs px-2 py-0.5 rounded-full">
        {badge}
      </span>
    )}
  </Link>
);

// Main Portal Layout
export default function PortalLayout({ children, user, activePage, setActivePage, onLogout, children: childContent }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [notifications] = useState([
    { id: 1, title: "Report Due", message: "Weekly finance report is due tomorrow", time: "2h ago" },
    { id: 2, title: "New Member", message: "John Doe registered in your zone", time: "5h ago" },
  ]);

  const pastorMenuItems = [
    { id: "dashboard", icon: <DashboardIcon className="w-5 h-5" />, label: "Dashboard", to: "/pastor" },
    { id: "members", icon: <UsersIcon className="w-5 h-5" />, label: "Members", to: "/pastor/members" },
    { id: "homegroups", icon: <HomeGroupIcon className="w-5 h-5" />, label: "Home Groups", to: "/pastor/homegroups" },
    { id: "departments", icon: <DepartmentIcon className="w-5 h-5" />, label: "Departments & HODs", to: "/pastor/departments" },
    { id: "achievements", icon: <AchievementsIcon className="w-5 h-5" />, label: "Achievements", to: "/pastor/achievements" },
    { id: "reports", icon: <ReportIcon className="w-5 h-5" />, label: "Reports", to: "/pastor/reports", badge: 1 },
    { id: "zone", icon: <DashboardIcon className="w-5 h-5" />, label: "My Zone", to: "/pastor/zone" },
  ];

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-sky-50 via-white to-gold-50/30">
      {/* Sidebar */}
      <aside className="w-72 bg-white/80 backdrop-blur-xl border-r border-gray-100 flex flex-col shadow-lg">
        {/* Logo */}
        <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl overflow-hidden flex items-center justify-center shadow-lg shadow-gold-500/20 bg-white">
                    <img src="/client/img/logo.png" alt="Heartfelt Logo" className="w-full h-full object-contain p-1" onError={(e) => { e.target.onerror = null; e.target.src = '/images/logo.webp'; }} />
                </div>
                <div>
                    {/* <h1 className="text-gray-900 font-bold text-lg">HIM</h1> */}
                    <p className="text-gray-400 text-xs">Partner Portal</p>
                </div>
            </div>
        </div>

        {/* Zone Info */}
        <div className="p-4 mx-4 mt-4 rounded-2xl bg-gradient-to-br from-gold-50 to-amber-50 border border-gold-100">
          <p className="text-gray-400 text-xs mb-1">My Zone</p>
          <p className="text-gray-900 font-semibold">{user?.zone?.name || "International Overflow Center"}</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {pastorMenuItems.map((item) => (
            <SidebarItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              to={item.to}
              active={activePage === item.id}
              badge={item.badge}
              onClick={() => setActivePage(item.id)}
            />
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-100 space-y-1">
          <SidebarItem
            icon={<ProfileIcon className="w-5 h-5" />}
            label="Profile"
            to="/pastor/profile"
            active={activePage === "profile"}
            onClick={() => setActivePage("profile")}
          />
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 text-gray-500 hover:text-red-600 hover:bg-red-50"
          >
            <LogoutIcon className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-white/80 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between px-6 shadow-sm">
          <div>
            <h2 className="text-gray-900 font-semibold capitalize">{activePage.replace("-", " ")}</h2>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <div className="relative">
              <button className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-900">
                <NotificationIcon className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-gold-500 rounded-full"></span>
              </button>
            </div>

            {/* User Profile */}
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold-400 to-amber-500 flex items-center justify-center shadow-md shadow-gold-500/20">
                <span className="text-white font-semibold text-sm">
                  {user?.name?.charAt(0) || "P"}
                </span>
              </div>
              <div className="hidden md:block">
                <p className="text-gray-900 text-sm font-medium">{user?.name || "Pastor John"}</p>
                <p className="text-gray-400 text-xs">Zone Pastor</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
