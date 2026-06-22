// ============================================================================
// HOD PORTAL - Department-focused workspace for Heads of Department
// Engaging workspace feel with visible logout button
// ============================================================================

import React, { useState, useEffect } from "react";
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
        { id: "partnership", label: "Partnership", Icon: HODIcons.Heart },
        { id: "activities", label: "Activities", Icon: HODIcons.Calendar },
        { id: "achievements", label: "Achievements", Icon: HODIcons.Trophy },
        { id: "communication", label: "Messages", Icon: HODIcons.ChatBubbleLeftRight },
        { id: "reports", label: "Reports", Icon: HODIcons.DocumentChart },
        { id: "profile", label: "Profile", Icon: HODIcons.UserCircle },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-violet-50/30">
            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-2xl border-b border-slate-200/50 shadow-sm">
                <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-12 md:h-16">
                        {/* Logo & Department */}
                        <div className="flex items-center gap-2 md:gap-3">
                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl overflow-hidden flex items-center justify-center shadow-lg shadow-amber-400/20 bg-white">
                                <img src="/images/favicon.ico" alt="Heartfelt Logo" className="w-full h-full object-contain p-1" />
                            </div>
                            <div>
                                <p className="hidden xs:block text-xs text-slate-400">HOD Portal</p>
                                <p className="text-xs md:text-sm font-semibold text-slate-700">{user?.department?.name || "Department"}</p>
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
                                            ? "bg-slate-200/50 text-slate-800"
                                            : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                                    }`}
                                >
                                    <item.Icon className="w-4 h-4" />
                                    {item.label}
                                </button>
                            ))}
                        </nav>

                        {/* User & Logout */}
                        <div className="flex items-center gap-2 md:gap-3">
                            <div className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1.5 bg-slate-100 rounded-xl">
                                <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center">
                                    <span className="text-white font-semibold text-xs md:text-sm">
                                        {user?.name?.charAt(0) || "H"}
                                    </span>
                                </div>
                                <span className="text-xs md:text-sm font-medium text-slate-700 hidden sm:inline">
                                    {user?.name || "HOD"}
                                </span>
                            </div>
                            <button
                                onClick={onLogout}
                                className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-2 rounded-xl text-xs md:text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
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
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-2xl border-t border-slate-200/50 px-2 py-2 flex items-center justify-around z-40">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActivePage(item.id)}
                        className={`flex flex-col items-center gap-1 px-2 md:px-3 py-2 rounded-xl transition-colors ${
                            activePage === item.id
                                ? "text-slate-700"
                                : "text-slate-400"
                        }`}
                    >
                        <item.Icon className="w-5 h-5" />
                        <span className="text-xs font-medium">{item.label}</span>
                    </button>
                ))}
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 md:py-6 pb-24 md:pb-6">
                {children}
            </main>
        </div>
    );
};

// ============================================================================
// MAIN HOD PORTAL COMPONENT
// ============================================================================

const DepartmentPartnershipPage = ({ user }) => {
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        setLoading(true);
        setError("");
        api.get('/pastors/partners')
            .then(res => {
                if (res.data.success) setPartners(res.data.data || []);
                else setError(res.data.message || 'Failed to load partners');
            })
            .catch(() => setError('Unable to load partners'))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="p-6 space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Partnership</h2>
                <p className="text-gray-500 text-sm mt-1">Partnership insights for {user?.department?.name || 'your department'}</p>
            </div>

            {error && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-lg p-6">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Partners</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{partners.length}</p>
                </div>
                <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-lg p-6">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Active Partners</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{partners.filter(p => p.status === 'active').length}</p>
                </div>
                <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-lg p-6">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Pledge</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">${partners.reduce((sum, p) => sum + (parseFloat(p.pledge_amount) || 0), 0).toLocaleString()}</p>
                </div>
            </div>
        </div>
    );
};

export default function HODPortal({ user: initialUser, onLogout }) {
    const [activePage, setActivePage] = useState("workspace");
    const [user, setUser] = useState(initialUser);

    const renderPage = () => {
        switch (activePage) {
            case "workspace":
                return <DepartmentWorkspace user={user} onNavigate={setActivePage} />;
            case "members":
                return <DepartmentMembersPage onNavigate={setActivePage} />;
            case "partnership":
                return <DepartmentPartnershipPage user={user} />;
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
