// ============================================================================
// HOD PORTAL - Department-focused workspace for Heads of Department
// Engaging workspace feel with visible logout button
// ============================================================================

import React, { useState } from "react";
import { HODIcons } from "./dashboard/hod/HODIcons";

// Import reusable HOD components
import {
    DepartmentWorkspace,
    DepartmentMembersPage,
    DepartmentReportsPage,
    DepartmentProfilePage,
    HODActivitiesPage,
    HODAchievementsPage,
    HODCommunicationPage,
} from "./dashboard/hod";

// ============================================================================
// HOD LAYOUT - Custom layout for HOD workspace feel
// ============================================================================

const HODLayout = ({ user, activePage, setActivePage, onLogout, children }) => {
    const menuItems = [
        { id: "workspace", label: "Workspace", Icon: HODIcons.BuildingOffice },
        { id: "members", label: "Members", Icon: HODIcons.Users },
        { id: "activities", label: "Activities", Icon: HODIcons.Calendar },
        { id: "achievements", label: "Achievements", Icon: HODIcons.Trophy },
        { id: "communication", label: "Messages", Icon: HODIcons.ChatBubbleLeftRight },
        { id: "reports", label: "Reports", Icon: HODIcons.DocumentChart },
        { id: "profile", label: "Profile", Icon: HODIcons.UserCircle },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50">
            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-violet-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo & Department */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                                <span className="text-white font-bold text-lg">H</span>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">HOD Portal</p>
                                <p className="text-sm font-semibold text-gray-900">{user?.department?.name || "Department"}</p>
                            </div>
                        </div>

                        {/* Navigation Tabs */}
                        <nav className="hidden md:flex items-center gap-1">
                            {menuItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActivePage(item.id)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                                        activePage === item.id
                                            ? "bg-violet-100 text-violet-700"
                                            : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                                    }`}
                                >
                                    <item.Icon className="w-4 h-4" />
                                    {item.label}
                                </button>
                            ))}
                        </nav>

                        {/* User & Logout */}
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-violet-50 rounded-xl">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center">
                                    <span className="text-white font-semibold text-sm">
                                        {user?.name?.charAt(0) || "H"}
                                    </span>
                                </div>
                                <span className="text-sm font-medium text-gray-700 hidden sm:inline">
                                    {user?.name || "HOD"}
                                </span>
                            </div>
                            <button
                                onClick={onLogout}
                                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                                title="Logout"
                            >
                                <HODIcons.ArrowRightOnRectangle className="w-4 h-4" />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-violet-100 px-4 py-2 flex items-center justify-around z-40">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActivePage(item.id)}
                        className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors ${
                            activePage === item.id
                                ? "text-violet-600"
                                : "text-gray-400"
                        }`}
                    >
                        <item.Icon className="w-5 h-5" />
                        <span className="text-xs font-medium">{item.label}</span>
                    </button>
                ))}
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-6">
                {children}
            </main>
        </div>
    );
};

// ============================================================================
// MAIN HOD PORTAL COMPONENT
// ============================================================================

export default function HODPortal({ user: initialUser, onLogout }) {
    const [activePage, setActivePage] = useState("workspace");
    const [user, setUser] = useState(initialUser);

    const renderPage = () => {
        switch (activePage) {
            case "workspace":
                return <DepartmentWorkspace user={user} onNavigate={setActivePage} />;
            case "members":
                return <DepartmentMembersPage onNavigate={setActivePage} />;
            case "activities":
                return <HODActivitiesPage />;
            case "achievements":
                return <HODAchievementsPage />;
            case "communication":
                return <HODCommunicationPage />;
            case "reports":
                return <DepartmentReportsPage user={user} />;
            case "profile":
                return <DepartmentProfilePage user={user} onUpdate={setUser} />;
            default:
                return <DepartmentWorkspace user={user} onNavigate={setActivePage} />;
        }
    };

    return (
        <HODLayout
            user={user}
            activePage={activePage}
            setActivePage={setActivePage}
            onLogout={onLogout}
        >
            {renderPage()}
        </HODLayout>
    );
}
