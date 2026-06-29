import React, { useState, useEffect, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCurrentUser, useUser } from "../context/UserContext";
import api from "../lib/api";
import HomeGroupCommunity from "./HomeGroupCommunity";
import HomeGroupSelector from "./HomeGroupSelector.jsx";
import DepartmentRequest from "./DepartmentRequest.jsx";
import Drawer from "./Drawer.jsx";
import EventsTab from "./dashboard/EventsTab.jsx";
import LeaveReasonModal from "./LeaveReasonModal.jsx";

// ============================================================================
// FLOATING PARTICLES BACKGROUND
// ============================================================================

const FloatingParticles = () => {
    const containerRef = useRef(null);
    const [offset, setOffset] = useState({ x: 0, y: 0 });

    useEffect(() => {
        if (typeof window === "undefined") return;
        const handleMouseMove = (e) => {
            const { innerWidth, innerHeight } = window;
            const x = (e.clientX - innerWidth / 2) / 80;
            const y = (e.clientY - innerHeight / 2) / 80;
            setOffset({ x, y });
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    const particles = useMemo(() => {
        return Array.from({ length: 15 }).map((_, i) => ({
            id: i,
            size: 3 + Math.random() * 5,
            left: Math.random() * 100,
            top: Math.random() * 100,
            duration: 18 + Math.random() * 15,
            delay: Math.random() * 12,
            opacity: 0.1 + Math.random() * 0.2,
            color: Math.random() > 0.5 ? "gold" : "sky",
        }));
    }, []);

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 overflow-hidden pointer-events-none"
            style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
        >
            {particles.map((p) => (
                <div
                    key={p.id}
                    className="absolute rounded-full"
                    style={{
                        width: p.size,
                        height: p.size,
                        left: p.left + "%",
                        top: p.top + "%",
                        background:
                            p.color === "gold"
                                ? "rgba(212,175,55,0.15)"
                                : "rgba(14,165,233,0.1)",
                        animation: `floatUp ${p.duration}s ${p.delay}s linear infinite`,
                        opacity: p.opacity,
                    }}
                />
            ))}
        </div>
    );
};

// ============================================================================
// ICONS
// ============================================================================

const Icons = {
    Home: ({ className }) => (
        <svg
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
            />
        </svg>
    ),
    MapPin: ({ className }) => (
        <svg
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
            />
        </svg>
    ),
    Users: ({ className }) => (
        <svg
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
            />
        </svg>
    ),
    Calendar: ({ className }) => (
        <svg
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
            />
        </svg>
    ),
    DocumentText: ({ className }) => (
        <svg
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
            />
        </svg>
    ),
    Bell: ({ className }) => (
        <svg
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
            />
        </svg>
    ),
    BuildingOffice: ({ className }) => (
        <svg
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"
            />
        </svg>
    ),
    Clock: ({ className }) => (
        <svg
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6v6l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
        </svg>
    ),
    User: ({ className }) => (
        <svg
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
            />
        </svg>
    ),
    Check: ({ className }) => (
        <svg
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-9"
            />
        </svg>
    ),
    XMark: ({ className }) => (
        <svg
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
            />
        </svg>
    ),
};

export { Icons };

// ============================================================================
// REGISTRATION CONFIRMATION
// ============================================================================

const RegistrationConfirmation = ({ user }) => {
    if (!user || !user.is_first_time) return null;
    const zone = user.zone;
    const member = user.member;
    const pastorName = zone?.pastor_name || "Not Assigned";

    return (
        <div className="mb-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100 shadow-sm">
            <p className="text-xs text-emerald-800 font-medium">
                Good evening, {user.name?.split(" ")[0] || "Member"}!
            </p>
            <p className="text-[10px] text-emerald-600 mt-0.5">
                Your membership has been registered successfully. You are now
                part of <strong>{zone?.name || "your zone"}</strong>.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3">
                <div className="bg-white/60 rounded-md p-2 border border-emerald-100">
                    <p className="text-[9px] text-gray-500 font-medium uppercase tracking-widest">
                        Membership Code
                    </p>
                    <p className="text-xs font-semibold text-gray-900 font-mono">
                        {member?.member_code || "—"}
                    </p>
                </div>
                <div className="bg-white/60 rounded-md p-2 border border-emerald-100">
                    <p className="text-[9px] text-gray-500 font-medium uppercase tracking-widest">
                        Zone
                    </p>
                    <p className="text-xs font-semibold text-gray-900">
                        {zone?.name || "—"}
                    </p>
                </div>
                <div className="bg-white/60 rounded-md p-2 border border-emerald-100">
                    <p className="text-[9px] text-gray-500 font-medium uppercase tracking-widest">
                        Region
                    </p>
                    <p className="text-xs font-semibold text-gray-900">
                        {zone?.region?.name || "—"}
                    </p>
                </div>
                <div className="bg-white/60 rounded-md p-2 border border-emerald-100">
                    <p className="text-[9px] text-gray-500 font-medium uppercase tracking-widest">
                        Pastor
                    </p>
                    <p className="text-xs font-semibold text-gray-900 truncate">
                        {pastorName}
                    </p>
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// HOMEGROUP SECTION
// ============================================================================

const HomegroupSection = ({ user, onViewHomegroup, onRequestLeave }) => {
    const hg = user && user.home_group;
    if (hg && hg.name) {
        const isLeader = hg.leader_id === user?.id;
        return (
            <div className="gradient-border card-hover">
                <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1.5">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-sm">
                                <Icons.Users className="w-3.5 h-3.5 text-white" />
                            </div>
                            <h3 className="text-xs font-bold text-gray-900">
                                My Homegroup
                            </h3>
                        </div>
                        <button
                            onClick={onViewHomegroup}
                            className="text-[#dfb15b] hover:text-amber-700 text-[10px] font-semibold flex items-center gap-0.5"
                        >
                            View All <span>→</span>
                        </button>
                    </div>
                    <div className="flex items-center gap-2.5 mb-2.5">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-md">
                            <Icons.Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 text-xs">
                                {hg.name}
                            </p>
                            <p className="text-[10px] text-gray-400">Active</p>
                        </div>
                    </div>
                    {!isLeader && (
                        <button
                            onClick={() => onRequestLeave("homegroup")}
                            className="btn btn-sm bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition-all"
                        >
                            Leave Group
                        </button>
                    )}
                    {isLeader && (
                        <p className="text-[10px] text-gray-500 text-center">
                            As leader, contact pastor to transfer leadership before leaving.
                        </p>
                    )}
                </div>
            </div>
        );
    }
    return (
        <div className="gradient-border card-hover">
            <div className="p-4 text-center">
                <div className="w-12 h-12 mx-auto mb-2.5 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <Icons.Users className="w-6 h-6 text-emerald-500" />
                </div>
                <h3 className="text-xs font-bold text-gray-900 mb-0.5">
                    No Homegroup Yet
                </h3>
                <p className="text-[10px] text-gray-500 mb-3">
                    Join a homegroup to connect with fellow members.
                </p>
                <button
                    onClick={onViewHomegroup}
                    className="btn btn-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-all"
                >
                    Browse Homegroups
                </button>
            </div>
        </div>
    );
};

const DepartmentsSection = ({ user, onViewDepartments, onRequestLeave }) => {
    const dept = user && user.department;
    if (dept && dept.name) {
        const isHod = dept.hod_id === user?.id;
        return (
            <div className="gradient-border card-hover">
                <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-1.5">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-sm">
                                <Icons.BuildingOffice className="w-3.5 h-3.5 text-white" />
                            </div>
                            <h3 className="text-xs font-bold text-gray-900">
                                My Department
                            </h3>
                        </div>
                        <button
                            onClick={onViewDepartments}
                            className="text-[#dfb15b] hover:text-amber-700 text-[10px] font-semibold flex items-center gap-0.5"
                        >
                            View All <span>→</span>
                        </button>
                    </div>
                    <div className="flex items-center gap-2.5 mb-2.5">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-md">
                            <Icons.BuildingOffice className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 text-xs">
                                {dept.name}
                            </p>
                            <p className="text-[10px] text-gray-400">Active</p>
                        </div>
                    </div>
                    {!isHod && (
                        <button
                            onClick={() => onRequestLeave("department")}
                            className="btn btn-sm bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 transition-all"
                        >
                            Leave Department
                        </button>
                    )}
                    {isHod && (
                        <p className="text-[10px] text-gray-500 text-center">
                            As HOD, contact pastor to transfer leadership before leaving.
                        </p>
                    )}
                </div>
            </div>
        );
    }
    return (
        <div className="gradient-border card-hover">
            <div className="p-4 text-center">
                <div className="w-12 h-12 mx-auto mb-2.5 rounded-xl bg-purple-50 flex items-center justify-center">
                    <Icons.BuildingOffice className="w-6 h-6 text-purple-500" />
                </div>
                <h3 className="text-xs font-bold text-gray-900 mb-0.5">
                    No Department Yet
                </h3>
                <p className="text-[10px] text-gray-500 mb-3">
                    Join a department to serve alongside other members.
                </p>
                <button
                    onClick={onViewDepartments}
                    className="py-1.5 px-3 bg-purple-500 text-white rounded-lg text-[10px] font-bold hover:bg-purple-600 transition-all"
                >
                    Browse Departments
                </button>
            </div>
        </div>
    );
};

// ============================================================================
// EVENTS DATA
// ============================================================================

const CHURCH_EVENTS_2026 = [
    {
        id: "e1",
        title: "21 Days of Prayer and Fasting",
        startDate: "2026-01-11",
        endDate: "2026-01-31",
        category: "International",
        location: "IOC and Zones",
    },
    {
        id: "e2",
        title: "Anointing Night",
        startDate: "2026-01-30",
        endDate: "2026-01-30",
        category: "International",
        location: "IOC",
    },
    {
        id: "e3",
        title: "Operation Come and See",
        startDate: "2026-01-18",
        endDate: "2026-01-18",
        category: "Events",
    },
    {
        id: "e4",
        title: "Homegroup Opening",
        startDate: "2026-02-03",
        endDate: "2026-02-03",
        category: "Events",
    },
];

// ============================================================================
// MAIN MEMBERS PORTAL
// ============================================================================

export default function MembersPortal({ onLogout }) {
    const { user, updateUser } = useUser();
    
    const { data: invitationsData } = useQuery({
        queryKey: ["homegroup-invitations"],
        queryFn: async () => {
            const res = await api.get("/homegroup-invitations");
            if (!res.data.success) throw new Error();
            return res.data.invitations || [];
        },
        staleTime: 15000,
        refetchInterval: 30000,
    });

    const { data: deptRequestsData } = useQuery({
        queryKey: ["department-requests"],
        queryFn: async () => {
            const res = await api.get("/department-requests");
            if (!res.data.success) throw new Error();
            return res.data.requests || [];
        },
        staleTime: 15000,
        refetchInterval: 30000,
    });

    const pendingInvitationsCount = (invitationsData || []).filter(
        (inv) => inv.status === "pending",
    ).length;
    const pendingDeptCount = (deptRequestsData || []).filter(
        (r) => r.status === "pending",
    ).length;

    const [activeTab, setActiveTab] = useState("home");
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [showHomegroupSelector, setShowHomegroupSelector] = useState(false);
    const [showDepartmentSelector, setShowDepartmentSelector] = useState(false);
    const [leaveModal, setLeaveModal] = useState({ show: false, type: null });

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        setNotificationsOpen(false);
    };

    const handleNotificationToggle = () => {
        setNotificationsOpen((prev) => !prev);
    };

    const handleLeaveHomegroup = async (reason) => {
        try {
            const response = await fetch("/api/home-group/leave", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("him_token")}`,
                },
                body: JSON.stringify({ reason }),
            });
            const data = await response.json();
            if (data.success) {
                updateUser({ home_group: null });
            } else {
                alert(data.message || "Failed to leave home group.");
            }
        } catch (err) {
            alert("Failed to leave home group. Please try again.");
        }
    };

    const handleLeaveDepartment = async (reason) => {
        try {
            const response = await fetch("/api/department/leave", {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("him_token")}`,
                },
                body: JSON.stringify({ reason }),
            });
            const data = await response.json();
            if (data.success) {
                updateUser({ department: null });
            } else {
                alert(data.message || "Failed to leave department.");
            }
        } catch (err) {
            alert("Failed to leave department. Please try again.");
        }
    };

    const handleAction = (id) => {
        if (id === "feedback") setActiveTab("home");
        if (id === "homegroups") setShowHomegroupSelector(true);
        if (id === "departments") setShowDepartmentSelector(true);
    };

    return (
        <div className="min-h-screen relative bg-gray-50/50">
            <FloatingParticles />

            <style>{`
                .gradient-border { position: relative; background: white; border-radius: 14px; }
                .gradient-border::before { content: ''; position: absolute; inset: -1px; border-radius: 15px; background: linear-gradient(135deg, #dfb15b, #0ea5e9, #dfb15b); background-size: 200% 200%; animation: gradient-shift 4s ease infinite; z-index: -1; opacity: 0; transition: opacity 0.4s ease; }
                .gradient-border:hover::before { opacity: 1; }
                .card-hover { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
                .card-hover:hover { transform: translateY(-2px); box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(212, 175, 55, 0.15); }
                .badge-pulse { animation: pulse-glow 2s ease-in-out infinite; }
                .tab-panel { animation: tabFadeIn 0.3s ease-out; }
                @keyframes tabFadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
                .nav-btn { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 600; transition: all 0.2s; border: none; background: none; cursor: pointer; }
                .nav-btn.nav-active { background: linear-gradient(135deg, rgba(212,175,55,0.12), rgba(212,175,55,0.03)); color: #1a1a1a; }
                .nav-btn.nav-inactive { color: #6b7280; }
                .nav-btn.nav-inactive:hover { background: #f9fafb; color: #374151; }
                .nav-icon { width: 14px; height: 14px; }
                .nav-icon-wrap { position: relative; display: inline-flex; }
                .nav-badge { position: absolute; top: -3px; right: -3px; min-width: 14px; height: 14px; padding: 0 3px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #ef4444, #e11d48); color: white; font-size: 8px; font-weight: 700; border-radius: 999px; }
                .nav-avatar { width: 28px; height: 28px; border-radius: 7px; background: linear-gradient(135deg, #dfb15b, #f59e0b); display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 11px; position: relative; }
                .nav-avatar-dot { position: absolute; bottom: 0; right: 0; width: 7px; height: 7px; background: #22c55e; border-radius: 50%; border: 1px solid white; }
                .nav-logout { padding: 5px; border-radius: 7px; color: #9ca3af; transition: all 0.2s; border: none; background: none; cursor: pointer; }
                .nav-logout:hover { color: #ef4444; background: #fef2f2; }
                .mobile-tab { position: relative; border: none; background: none; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1px; flex: 1; height: 100%; }
                .mobile-tab-icon { width: 34px; height: 34px; border-radius: 10px; display: flex; align-items: center; justify-content: center; transition: all 0.3s; }
                .mobile-tab-label { font-size: 9px; font-weight: 500; transition: color 0.2s; }
                .mobile-tab-dot { position: absolute; top: 2px; left: 50%; transform: translateX(-50%); width: 3px; height: 3px; border-radius: 50%; background: #dfb15b; }
                .page-heading { font-size: 1.125rem; font-weight: 600; color: #111827; margin: 0; letter-spacing: -0.01em; }
                .btn { display: inline-flex; align-items: center; justify-content: center; padding: 4px 10px; border-radius: 7px; font-size: 10px; font-weight: 600; transition: all 0.2s; cursor: pointer; border: none; }
                .btn-sm { padding: 3px 8px; font-size: 9px; border-radius: 6px; }
                .btn-lg { padding: 5px 12px; font-size: 11px; border-radius: 8px; }
                .mobile-badge { position: absolute; top: -1px; right: -1px; min-width: 14px; height: 14px; padding: 0 3px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #ef4444, #e11d48); color: white; font-size: 8px; font-weight: 700; border-radius: 999px; }
            `}</style>

            <div className="relative z-10 pb-20">
                {/* Registration Confirmation */}
                <div className="max-w-7xl mx-auto px-4 pt-3">
                    <RegistrationConfirmation user={user} />
                </div>

                <div className="max-w-7xl mx-auto px-4 mt-4 mb-2">
                    <h1 className="page-heading">Member Portal</h1>
                </div>

                {/* Desktop Top Nav */}
                <nav className="hidden md:block bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm sticky top-0 z-40">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="flex items-center justify-between h-14">
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => handleTabChange("home")}
                                    className={
                                        "nav-btn " +
                                        (activeTab === "home"
                                            ? "nav-active"
                                            : "nav-inactive")
                                    }
                                >
                                    <Icons.Home className="nav-icon" />{" "}
                                    <span>Home</span>
                                </button>
                                <button
                                    onClick={() => handleTabChange("zone")}
                                    className={
                                        "nav-btn " +
                                        (activeTab === "zone"
                                            ? "nav-active"
                                            : "nav-inactive")
                                    }
                                >
                                    <Icons.MapPin className="nav-icon" />{" "}
                                    <span>Zone</span>
                                </button>
                                <button
                                    onClick={() => handleTabChange("homegroup")}
                                    className={
                                        "nav-btn " +
                                        (activeTab === "homegroup"
                                            ? "nav-active"
                                            : "nav-inactive")
                                    }
                                >
                                    <Icons.Users className="nav-icon" />{" "}
                                    <span>Group</span>
                                </button>
                                <button
                                    onClick={() => handleTabChange("events")}
                                    className={
                                        "nav-btn " +
                                        (activeTab === "events"
                                            ? "nav-active"
                                            : "nav-inactive")
                                    }
                                >
                                    <Icons.Calendar className="nav-icon" />{" "}
                                    <span>Events</span>
                                </button>
                                <button
                                    onClick={() => handleTabChange("reports")}
                                    className={
                                        "nav-btn " +
                                        (activeTab === "reports"
                                            ? "nav-active"
                                            : "nav-inactive")
                                    }
                                >
                                    <Icons.DocumentText className="nav-icon" />{" "}
                                    <span>Reports</span>
                                </button>
                                <button
                                    onClick={() => {
                                        handleTabChange("notifications");
                                        handleNotificationToggle();
                                    }}
                                    className={
                                        "nav-btn " +
                                        (activeTab === "notifications"
                                            ? "nav-active"
                                            : "nav-inactive")
                                    }
                                >
                                    <span className="nav-icon-wrap">
                                        <Icons.Bell className="nav-icon" />
                                        {pendingInvitationsCount > 0 && (
                                            <span className="nav-badge">
                                                {pendingInvitationsCount}
                                            </span>
                                        )}
                                    </span>
                                    <span>Alerts</span>
                                </button>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="nav-avatar">
                                    {(user?.name || "M").charAt(0)}
                                    <span className="nav-avatar-dot"></span>
                                </div>
                                <button
                                    onClick={onLogout}
                                    className="nav-logout"
                                    title="Logout"
                                >
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2}
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Mobile Bottom Nav */}
                <nav
                    className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/90 backdrop-blur-2xl border-t border-gray-200/80"
                    style={{
                        paddingBottom: "env(safe-area-inset-bottom, 0px)",
                    }}
                >
                    <div className="flex items-center justify-around h-16">
                        {[
                            {
                                id: "home",
                                icon: Icons.Home,
                                label: "Home",
                                gradient: "from-sky-400 to-sky-600",
                            },
                            {
                                id: "zone",
                                icon: Icons.MapPin,
                                label: "Zone",
                                gradient: "from-[#dfb15b] to-amber-600",
                            },
                            {
                                id: "homegroup",
                                icon: Icons.Users,
                                label: "Groups",
                                gradient: "from-emerald-400 to-emerald-600",
                            },
                            {
                                id: "events",
                                icon: Icons.Calendar,
                                label: "Events",
                                gradient: "from-violet-400 to-violet-600",
                            },
                            {
                                id: "reports",
                                icon: Icons.DocumentText,
                                label: "Reports",
                                gradient: "from-orange-400 to-orange-600",
                            },
                            {
                                id: "notifications",
                                icon: Icons.Bell,
                                label: "Alerts",
                                gradient: "from-rose-400 to-rose-600",
                                badge: pendingInvitationsCount,
                            },
                        ].map((item) => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.id;
                            const isNotif = item.id === "notifications";
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        if (isNotif) {
                                            handleTabChange("notifications");
                                            handleNotificationToggle();
                                        } else handleTabChange(item.id);
                                    }}
                                    className="mobile-tab"
                                >
                                    <div
                                        className={
                                            "mobile-tab-icon " +
                                            (isActive
                                                ? "bg-gradient-to-br text-white shadow-lg scale-110"
                                                : "text-gray-400")
                                        }
                                        style={
                                            isActive
                                                ? {
                                                      background:
                                                          "linear-gradient(135deg, " +
                                                          item.gradient +
                                                          ")",
                                                  }
                                                : {}
                                        }
                                    >
                                        <Icon className="w-5 h-5" />
                                        {(item.badge || 0) > 0 && isActive && (
                                            <span className="mobile-badge">
                                                {item.badge}
                                            </span>
                                        )}
                                    </div>
                                    <span
                                        className={
                                            "mobile-tab-label " +
                                            (isActive
                                                ? "text-gray-900"
                                                : "text-gray-400")
                                        }
                                    >
                                        {item.label}
                                    </span>
                                    {isActive && (
                                        <span className="mobile-tab-dot"></span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </nav>

                {/* ===== TAB CONTENT ===== */}
                <div className="max-w-7xl mx-auto px-4 py-4 pb-24 md:pb-8">
                    {/* HOME TAB */}
                    {activeTab === "home" && (
                        <div className="tab-panel space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <HomegroupSection
                                    user={user}
                                    onViewHomegroup={() => handleAction("homegroups")}
                                    onRequestLeave={setLeaveModal}
                                />
                                <DepartmentsSection
                                    user={user}
                                    onViewDepartments={() => handleAction("departments")}
                                    onRequestLeave={setLeaveModal}
                                />
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-2.5">
                                    <h3 className="text-xs font-bold text-gray-900">
                                        Upcoming Events
                                    </h3>
                                    <button
                                        onClick={() =>
                                            handleTabChange("events")
                                        }
                                        className="text-[10px] text-[#dfb15b] font-semibold hover:text-amber-700"
                                    >
                                        View All
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                                    {CHURCH_EVENTS_2026.slice(0, 4).map(
                                        (event) => (
                                            <div
                                                key={event.id}
                                                className="gradient-border card-hover p-2.5 cursor-pointer"
                                                onClick={() =>
                                                    handleTabChange("events")
                                                }
                                            >
                                                <div
                                                    className={
                                                        "w-7 h-7 rounded-md bg-gradient-to-br " +
                                                        (event.category ===
                                                        "International"
                                                            ? "from-[#dfb15b] to-amber-500"
                                                            : "from-sky-400 to-sky-600") +
                                                        " flex items-center justify-center shadow-sm mb-1.5"
                                                    }
                                                >
                                                    <Icons.Calendar className="w-3 h-3 text-white" />
                                                </div>
                                                <h4 className="text-[10px] font-bold text-gray-900 truncate">
                                                    {event.title}
                                                </h4>
                                                <p className="text-[9px] text-gray-400 mt-0.5 font-medium">
                                                    {event.startDate}
                                                </p>
                                            </div>
                                        ),
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ZONE TAB */}
                    {activeTab === "zone" && (
                        <div className="tab-panel space-y-4">
                            <div className="gradient-border card-hover p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-8 h-8 rounded-md bg-gradient-to-br from-[#dfb15b] to-amber-600 flex items-center justify-center shadow-sm">
                                        <Icons.MapPin className="w-4 h-4 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-bold text-gray-900">
                                            My Zone
                                        </h3>
                                        <p className="text-[10px] text-gray-500">
                                            {user && user.zone
                                                ? user.zone.name
                                                : "Not Assigned"}
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-1.5 text-[10px] text-gray-600 mb-3">
                                    <p>
                                        <strong>Region:</strong>{" "}
                                        {user && user.zone && user.zone.region
                                            ? user.zone.region.name
                                            : "—"}
                                    </p>
                                    <p>
                                        <strong>Pastor:</strong>{" "}
                                        {user && user.pastor
                                            ? user.pastor.user.name
                                            : user &&
                                                user.zone &&
                                                user.zone.pastor_name
                                              ? user.zone.pastor_name
                                              : "Not Assigned"}
                                    </p>
                                    <p>
                                        <strong>Address:</strong>{" "}
                                        {user && user.zone
                                            ? user.zone.address || "—"
                                            : "—"}
                                    </p>
                                    <p>
                                        <strong>Phone:</strong>{" "}
                                        {user && user.zone
                                            ? user.zone.phone || "—"
                                            : "—"}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleAction("view-zone")}
                                    className="btn btn-lg bg-gradient-to-r from-[#dfb15b]/10 to-amber-50 text-[#8b6914] border border-[#dfb15b]/20 hover:from-[#dfb15b]/20 hover:to-amber-100 transition-all"
                                >
                                    View Zone Details
                                </button>
                            </div>
                        </div>
                    )}

{/* GROUPS TAB - Unified Homegroups & Departments */}
                     {activeTab === "homegroup" && (
                         <div className="tab-panel space-y-4">
                             <div className="flex items-center justify-between mb-4">
                                 <div className="flex items-center gap-2">
                                     <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                                         <Icons.Users className="w-4 h-4 text-white" />
                                     </div>
                                     <h3 className="text-sm font-bold text-gray-900">My Groups</h3>
                                 </div>
                             </div>
                             
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                 <HomegroupSection
                                     user={user}
                                     onViewHomegroup={() => handleAction("homegroups")}
                                     onRequestLeave={setLeaveModal}
                                 />
                                 <DepartmentsSection
                                     user={user}
                                     onViewDepartments={() => handleAction("departments")}
                                     onRequestLeave={setLeaveModal}
                                 />
                             </div>
                         </div>
                     )}

                    {/* EVENTS TAB */}
                    {activeTab === "events" && (
                        <div className="tab-panel space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-bold text-gray-900">
                                    All Upcoming Events
                                </h3>
                            </div>
                            <div className="grid grid-cols-1 gap-2.5">
                                {CHURCH_EVENTS_2026.filter(
                                    (e) =>
                                        new Date(e.startDate) >=
                                        new Date(new Date().toDateString()),
                                )
                                    .slice(0, 8)
                                    .map((event) => (
                                        <div
                                            key={event.id}
                                            className="gradient-border card-hover p-3 cursor-pointer"
                                            onClick={() =>
                                                handleAction("view-events")
                                            }
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={
                                                        "w-9 h-9 rounded-md bg-gradient-to-br " +
                                                        (event.category ===
                                                        "International"
                                                            ? "from-[#dfb15b] to-amber-500"
                                                            : "from-sky-400 to-sky-600") +
                                                        " flex items-center justify-center shadow-sm flex-shrink-0"
                                                    }
                                                >
                                                    <Icons.Calendar className="w-4 h-4 text-white" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-xs font-bold text-gray-900 truncate">
                                                        {event.title}
                                                    </h4>
                                                    <p className="text-[10px] text-gray-500 mt-0.5">
                                                        {event.startDate}
                                                        {event.endDate !==
                                                        event.startDate
                                                            ? " — " +
                                                              event.endDate
                                                            : ""}
                                                    </p>
                                                    {event.location && (
                                                        <p className="text-[9px] text-gray-400 mt-0.5">
                                                            📍 {event.location}
                                                        </p>
                                                    )}
                                                </div>
                                                <span
                                                    className={
                                                        "px-1.5 py-0.5 rounded-md text-[9px] font-bold " +
                                                        (event.category ===
                                                        "International"
                                                            ? "bg-[#dfb15b]/10 text-[#8b6914]"
                                                            : "bg-sky-50 text-sky-700")
                                                    }
                                                >
                                                    {event.category}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}

                    {/* REPORTS TAB */}
                    {activeTab === "reports" && (
                        <div className="tab-panel space-y-4">
                            <div className="gradient-border card-hover p-4 text-center">
                                <div className="w-12 h-12 mx-auto mb-2.5 rounded-md bg-orange-50 flex items-center justify-center">
                                    <Icons.DocumentText className="w-5 h-5 text-orange-500" />
                                </div>
                                <h3 className="text-xs font-bold text-gray-900 mb-0.5">
                                    Submit a Report
                                </h3>
                                <p className="text-[10px] text-gray-500 mb-2.5">
                                    Share prayer requests, report absences, or
                                    give feedback.
                                </p>
                                <button
                                    onClick={() =>
                                        handleAction("submit-reports")
                                    }
                                    className="btn btn-lg bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md hover:shadow-lg transition-all"
                                >
                                    Open Report Form
                                </button>
                            </div>
                        </div>
                    )}

{/* ALERTS TAB */}
                     {activeTab === "notifications" && (
                         <div className="tab-panel space-y-4">
                             <div className="flex items-center justify-between">
                                 <h3 className="text-xs font-bold text-gray-900">
                                     Notifications
                                 </h3>
                                 <span className="text-[10px] text-gray-500">
                                     {pendingInvitationsCount + pendingDeptCount}{" "}
                                     pending
                                 </span>
                             </div>
                             <div className="space-y-2.5">
                                 {(invitationsData || [])
                                     .filter((inv) => inv.status === "pending")
                                     .map((inv) => (
                                         <div
                                             key={inv.id}
                                             className="gradient-border card-hover p-3"
                                         >
                                             <div className="flex items-center gap-2">
                                                 <div className="w-8 h-8 rounded-md bg-rose-50 flex items-center justify-center flex-shrink-0">
                                                     <Icons.Users className="w-4 h-4 text-rose-500" />
                                                 </div>
                                                 <div className="flex-1 min-w-0">
                                                     <p className="text-[10px] font-bold text-gray-900">
                                                         {inv.home_group
                                                             ? inv.home_group
                                                                 .name
                                                             : "Homegroup Invitation"}
                                                     </p>
                                                     <p className="text-[9px] text-gray-500 mt-0.5">
                                                         You have been invited to
                                                         join this homegroup
                                                     </p>
                                                     <p className="text-[9px] text-gray-400 mt-0.5">
                                                         {inv.created_at
                                                             ? new Date(
                                                                   inv.created_at,
                                                               ).toLocaleDateString()
                                                             : ""}
                                                     </p>
                                                 </div>
                                             </div>
                                         </div>
                                     ))}
                                 {(deptRequestsData || [])
                                     .filter((r) => r.status === "pending")
                                     .map((req) => (
                                         <div
                                             key={req.id}
                                             className="gradient-border card-hover p-3"
                                         >
                                             <div className="flex items-center gap-2">
                                                 <div className="w-8 h-8 rounded-md bg-purple-50 flex items-center justify-center flex-shrink-0">
                                                     <Icons.BuildingOffice className="w-4 h-4 text-purple-500" />
                                                 </div>
                                                 <div className="flex-1 min-w-0">
                                                     <p className="text-[10px] font-bold text-gray-900">
                                                         {req.department
                                                             ? req.department
                                                                   .name
                                                             : "Department Request"}
                                                     </p>
                                                     <p className="text-[9px] text-gray-500 mt-0.5">
                                                         Your request is pending
                                                         approval
                                                     </p>
                                                     <p className="text-[9px] text-gray-400 mt-0.5">
                                                         {req.created_at
                                                             ? new Date(
                                                                   req.created_at,
                                                               ).toLocaleDateString()
                                                             : ""}
                                                     </p>
                                                 </div>
                                             </div>
                                         </div>
                                     ))}
                             </div>
                             {(invitationsData || []).filter(
                                 (inv) => inv.status === "pending",
                             ).length === 0 &&
                             (deptRequestsData || []).filter(
                                 (r) => r.status === "pending",
                             ).length === 0 ? (
                                 <div className="gradient-border card-hover p-6 text-center">
                                     <div className="w-12 h-12 mx-auto mb-2 rounded-md bg-gray-50 flex items-center justify-center">
                                         <Icons.Bell className="w-5 h-5 text-gray-400" />
                                     </div>
                                     <h3 className="text-xs font-bold text-gray-900 mb-0.5">
                                         All Caught Up!
                                     </h3>
                                     <p className="text-[10px] text-gray-500">
                                         No new notifications.
                                     </p>
                                 </div>
                             ) : null}
                         </div>
                     )}
                     </div>
             </div>
             
{/* Homegroup Selector Drawer */}
             {showHomegroupSelector && (
                 <Drawer
                     isOpen={showHomegroupSelector}
                     onClose={() => setShowHomegroupSelector(false)}
                     title="My Home Group"
                     size="lg"
                 >
                     <HomeGroupSelector
                         user={user}
                         onClose={() => setShowHomegroupSelector(false)}
                         onRequestLeave={setLeaveModal}
                     />
                 </Drawer>
             )}
             
             {/* Department Selector Drawer */}
             {showDepartmentSelector && (
                 <Drawer
                     isOpen={showDepartmentSelector}
                     onClose={() => setShowDepartmentSelector(false)}
                     title="My Department"
                     size="lg"
                 >
                     <DepartmentRequest
                         user={user}
                         onClose={() => setShowDepartmentSelector(false)}
                         onRequestLeave={setLeaveModal}
                     />
                 </Drawer>
             )}
             
             {/* Leave Reason Modal */}
             <LeaveReasonModal
                 isOpen={leaveModal.show}
                 onClose={() => setLeaveModal({ show: false, type: null })}
                 onConfirm={(reason) => {
                     if (leaveModal.type === "homegroup") {
                         handleLeaveHomegroup(reason);
                     } else if (leaveModal.type === "department") {
                         handleLeaveDepartment(reason);
                     }
                     setLeaveModal({ show: false, type: null });
                 }}
                 title={leaveModal.type === "homegroup" ? "Leave Home Group" : "Leave Department"}
                 description={leaveModal.type === "homegroup" 
                     ? "Please provide a reason for leaving your home group." 
                     : "Please provide a reason for leaving your department."}
             />
         </div>
    );
}

// ============================================================================
// KEYFRAMES (must be after component)
// ============================================================================

const keyframesStyle = `
    @keyframes floatUp {
        0% { transform: translateY(100vh) translateX(0px); opacity: 0; }
        10% { opacity: var(--particle-opacity); }
        90% { opacity: var(--particle-opacity); }
        100% { transform: translateY(-100px) translateX(30px); opacity: 0; }
    }
    @keyframes gradient-shift {
        0%, 100% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
    }
    @keyframes pulse-glow {
        0%, 100% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0); }
        50% { box-shadow: 0 0 20px 4px rgba(212, 175, 55, 0.15); }
    }
`;

if (typeof window !== "undefined") {
    const style = document.createElement("style");
    style.textContent = keyframesStyle;
    document.head.appendChild(style);
}
