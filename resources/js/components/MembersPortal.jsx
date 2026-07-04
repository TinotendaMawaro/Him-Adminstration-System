import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCurrentUser, useUser } from "../context/UserContext";
import api from "../lib/api";
import HomeGroupCommunity from "./HomeGroupCommunity";
import HomeGroupSelector from "./HomeGroupSelector.jsx";
import DepartmentRequest from "./DepartmentRequest.jsx";
import Drawer from "./Drawer.jsx";
import EventsTab from "./dashboard/EventsTab.jsx";
import LeaveReasonModal from "./LeaveReasonModal.jsx";
import MembershipCard from "./MembershipCard.jsx";

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
    Heart: ({ className }) => (
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
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.385.848-4.5 2.153-1.292-1.513-2.877-2.337-4.718-2.337C3.6 3.75 1.5 5.765 1.5 8.25c0 4.242 3.71 7.5 8.25 11.25 4.5-3.75 8.25-7 8.25-11.25z"
            />
        </svg>
    ),
    ChartBar: ({ className }) => (
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
                d="M3 13.5V3a1.5 1.5 0 013 0v9.75m6-2.25V9a1.5 1.5 0 013 0v4.5m6-2.25V5.25a1.5 1.5 0 013 0v7.5M3 21h18M5.25 21h.008v.008H5.25V21zm4.5 0h.008v.008H9.75V21zm4.5 0h.008v.008h-.008V21zm4.5 0h.008v.008H18.75V21z"
            />
        </svg>
    ),
    BookOpen: ({ className }) => (
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
                d="M12 6.253v13m0-13C10.832 5.477 9.457 5 8 5c-2.21 0-4 1.343-4 3 0 1.861 1.528 3.407 3.378 3.833v1.357c0 .416-.247.77-.564.939C5.447 15.937 4.5 16.793 4.5 18c0 1.104.896 2 2 2h12c1.104 0 2-.896 2-2 0-1.207-.947-2.063-1.936-2.339-.317-.169-.564-.523-.564-.939v-1.357C16.472 11.761 18 10.215 18 9c0-1.657-1.79-C18-4 4-4s4 .903 4 3 0 3-1.79 3 4 4c0-1.657-1.794-3-4-3z"
            />
        </svg>
    ),
    ShieldCheck: ({ className }) => (
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
                d="M9 12.75l1.5 1.5.75-.75 2.25-1.5.75.75 1.5 1.5M4.5 12a7.5 7.5 0 1115 0 7.5 7.5 0 01-15 0z"
            />
        </svg>
    ),
    ChatBubble: ({ className }) => (
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
                d="M2.25 12c0-4.97 4.03-9 9-9s9 4.03 9 9-4.03 9-9 9c-1.44 0-2.79-.38-3.96-1.04L2.25 21V12z"
            />
        </svg>
    ),
    HandRaised: ({ className }) => (
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
                d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v7.5A2.25 2.25 0 008.25 13.5h2.25m0-9V3.75A2.25 2.25 0 0112 6v1.5m0-1.5h2.25A2.25 2.25 0 0117 7.5v7.5a2.25 2.25 0 002.25 2.25h2.25"
            />
        </svg>
    ),
    Star: ({ className }) => (
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
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l.143.435a1.998 1.998 0 001.907 1.558h.474c.97 0 1.397 1.24.594 1.812l-.397.293a1.998 1.998 0 01-1.124.427h-.672c-.496 0-.682-.628-.327-.978l.225-.193a1.998 1.998 0 00.528-2.043l-.143-.435c-.3-.921-1.603-.921-1.902 0l-.143.435a1.998 1.998 0 001.907 1.558h.474c.97 0 1.397 1.24.594 1.812l-.397.293a1.998 1.998 0 01-1.124.427h-.672c-.496 0-.682-.628-.327-.978l.225-.193a1.998 1.998 0 00.528-2.043l-.143-.435z"
            />
        </svg>
    ),
    ChevronDown: ({ className }) => (
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
                d="M19.5 8.25l-7.5 7.5-7.5-7.5"
            />
        </svg>
    ),
    DocumentDownload: ({ className }) => (
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
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M12 13l3-3m0 0l-3-3m3 3H3"
            />
        </svg>
    ),
    Share: ({ className }) => (
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
                d="M7.217 10.907a2.25 2.25 0 100-2.25 2.217L8 10.907l-1.107-.01a2.25 2.25 0 100 4.43 2.217L8 10.907l1.107.01zm0 0l2.217 2.217L12 14.124l-1.107-.01-2.217-2.217z"
            />
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 13.5l3 3m0 0l-3 3m3-3H9"
            />
        </svg>
    ),
};

export { Icons };

// ============================================================================
// HOMEGROUP SECTION
// ============================================================================

const HomegroupSection = ({ user, onViewHomegroup, onRequestLeave, homegroupLoading, onBrowseHomegroups }) => {
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
                            <h3 className="text-xs font-bold text-white">
                                My Homegroup
                            </h3>
                        </div>
                        <button
                            onClick={onViewHomegroup}
                            className="text-[#dfb15b] hover:text-amber-400 text-[10px] font-semibold flex items-center gap-0.5"
                        >
                            View All <span>→</span>
                        </button>
                    </div>
                    <div className="flex items-center gap-2.5 mb-2.5">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-md">
                            <Icons.Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="font-bold text-white text-xs">
                                {hg.name}
                            </p>
                            <p className="text-[10px] text-gray-400">Active</p>
                        </div>
                    </div>
                    {!isLeader && (
                        <button
                            onClick={() => onRequestLeave("homegroup")}
                            className="btn btn-sm bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 transition-all"
                        >
                            Leave Group
                        </button>
                    )}
                    {isLeader && (
                        <p className="text-[10px] text-gray-400 text-center">
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
                <div className="w-12 h-12 mx-auto mb-2.5 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                    <Icons.Users className="w-6 h-6 text-emerald-300" />
                </div>
                <h3 className="text-xs font-bold text-white mb-0.5">
                    No Homegroup Yet
                </h3>
                <p className="text-[10px] text-gray-400 mb-2">
                    Join a homegroup to connect with fellow members and grow spiritually.
                </p>
                <div className="bg-emerald-500/10 rounded-lg p-2 mb-3">
                    <p className="text-[10px] font-bold text-emerald-300 mb-1">💡 Recommended For You</p>
                    <p className="text-xs font-bold text-white">IOC Central</p>
                    <p className="text-[9px] text-gray-500">Wednesdays | 3 km away | Perfect for new members!</p>
                </div>
                <button
                    onClick={onBrowseHomegroups || onViewHomegroup}
                    disabled={homegroupLoading}
                    className="btn btn-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 transition-all disabled:opacity-70"
                >
                    {homegroupLoading ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <circle cx="12" cy="12" r="10" strokeWidth="2" strokeDasharray="32" strokeLinecap="round" />
                            </svg>
                            Loading...
                        </span>
                    ) : "Browse Homegroups"}
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
                            <h3 className="text-xs font-bold text-white">
                                My Department
                            </h3>
                        </div>
                        <button
                            onClick={onViewDepartments}
                            className="text-[#dfb15b] hover:text-amber-400 text-[10px] font-semibold flex items-center gap-0.5"
                        >
                            View All <span>→</span>
                        </button>
                    </div>
                    <div className="flex items-center gap-2.5 mb-2.5">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-md">
                            <Icons.BuildingOffice className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="font-bold text-white text-xs">
                                {dept.name}
                            </p>
                            <p className="text-[10px] text-gray-400">Active</p>
                        </div>
                    </div>
                    {!isHod && (
                        <button
                            onClick={() => onRequestLeave("department")}
                            className="btn btn-sm bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 transition-all"
                        >
                            Leave Department
                        </button>
                    )}
                    {isHod && (
                        <p className="text-[10px] text-gray-400 text-center">
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
                <div className="w-12 h-12 mx-auto mb-2.5 rounded-xl bg-purple-500/20 flex items-center justify-center">
                    <Icons.BuildingOffice className="w-6 h-6 text-purple-300" />
                </div>
                <h3 className="text-xs font-bold text-white mb-0.5">
                    No Department Yet
                </h3>
                <p className="text-[10px] text-gray-400 mb-2">
                    Join a department to serve alongside other members and discover your gifts.
                </p>
                <div className="bg-purple-500/10 rounded-lg p-2 mb-3">
                    <p className="text-[10px] font-bold text-purple-300 mb-1">💡 Suggested Ministry</p>
                    <p className="text-xs font-bold text-white">Media & ICT</p>
                    <p className="text-[9px] text-gray-500">4 Open Positions | Training Available</p>
                </div>
                <button
                    onClick={onViewDepartments}
                    className="btn btn-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 transition-all"
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
    const queryClient = useQueryClient();
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

    const upcomingEventsCount = CHURCH_EVENTS_2026.filter(
        (e) => new Date(e.startDate) >= new Date(new Date().toDateString())
    ).length;

    const [activeTab, setActiveTab] = useState("home");
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [showHomegroupSelector, setShowHomegroupSelector] = useState(false);
    const [homegroupLoading, setHomegroupLoading] = useState(false);
    const [showDepartmentSelector, setShowDepartmentSelector] = useState(false);
    const [leaveModal, setLeaveModal] = useState({ show: false, type: null });
    const [connectSubmenu, setConnectSubmenu] = useState(null); // 'messages' | 'prayer' | 'testimonies'

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        setNotificationsOpen(false);
        setConnectSubmenu(null);
    };

    // Handle homegroup button click with loading state
    const handleBrowseHomegroups = useCallback(() => {
        setHomegroupLoading(true);
        const timer = setTimeout(() => {
            setShowHomegroupSelector(true);
            setHomegroupLoading(false);
        }, 2000);
        
        // Clear loading immediately if data loads faster
        fetch("/api/home-groups/available", {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("him_token")}`,
            },
        }).then(() => {
            clearTimeout(timer);
            setHomegroupLoading(false);
            setShowHomegroupSelector(true);
        }).catch(() => {
            clearTimeout(timer);
            setHomegroupLoading(false);
            setShowHomegroupSelector(true);
        });
    }, []);

    const onRequestLeave = useCallback((type) => {
        console.log('[DEBUG] onRequestLeave called with type:', type);
        setLeaveModal({ show: true, type });
    }, []);

    const handleNotificationToggle = () => {
        setNotificationsOpen((prev) => !prev);
    };

    const handleLeaveHomegroup = async (reason) => {
        try {
            console.log('[DEBUG] Leaving homegroup with reason:', reason);
            console.log('[DEBUG] Token exists:', !!localStorage.getItem("him_token"));

            const response = await api.delete("/home-group/leave", {
                data: { reason },
            });

            console.log('[DEBUG] Response:', response.data);

            if (response.data && response.data.success) {
                // Update user state to clear home_group_id
                updateUser({ home_group_id: null, home_group: null });
                queryClient.invalidateQueries({ queryKey: ["homegroup-invitations"] });
            } else {
                alert(response.data?.message || "Failed to leave home group.");
            }
        } catch (err) {
            console.error('[DEBUG] Leave homegroup error:', err);
            const msg = err.response?.data?.message || err.message || 'An error occurred';
            alert(`Failed to leave home group: ${msg}`);
        }
    };

    const handleLeaveDepartment = async (reason) => {
        try {
            const response = await api.delete("/department/leave", {
                data: { reason },
            });

            if (response.data && response.data.success) {
                updateUser({ department_id: null, department: null });
            } else {
                alert(response.data?.message || "Failed to leave department.");
            }
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'An error occurred';
            alert(`Failed to leave department: ${msg}`);
        }
    };

    const handleAction = (id) => {
        if (id === "feedback") setActiveTab("home");
        if (id === "homegroups") setShowHomegroupSelector(true);
        if (id === "departments") setShowDepartmentSelector(true);
    };

    return (
        <div className="min-h-screen relative bg-[#0A192F]">
            <FloatingParticles />

            <style>{`
                .gradient-border { position: relative; background: rgba(255,255,255,0.05); border-radius: 14px; backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.1); }
                .gradient-border::before { content: ''; position: absolute; inset: -1px; border-radius: 15px; background: linear-gradient(135deg, #dfb15b, #0ea5e9, #dfb15b); background-size: 200% 200%; animation: gradient-shift 4s ease infinite; z-index: -1; opacity: 0; transition: opacity 0.4s ease; }
                .gradient-border:hover::before { opacity: 0.3; }
                .card-hover { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
                .card-hover:hover { transform: translateY(-2px); box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(212, 175, 55, 0.2); }
                .badge-pulse { animation: pulse-glow 2s ease-in-out infinite; }
                .tab-panel { animation: tabFadeIn 0.3s ease-out; }
                @keyframes tabFadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
                .nav-btn { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 8px; font-size: 11px; font-weight: 600; transition: all 0.2s; border: none; background: rgba(255,255,255,0.05); cursor: pointer; color: #e5e7eb; }
                .nav-btn.nav-active { background: linear-gradient(135deg, rgba(212,175,55,0.2), rgba(212,175,55,0.1)); color: #ffffff; }
                .nav-btn.nav-inactive { color: #9ca3af; }
                .nav-btn.nav-inactive:hover { background: rgba(255,255,255,0.1); color: #e5e7eb; }
                .nav-icon { width: 14px; height: 14px; }
                .nav-icon-wrap { position: relative; display: inline-flex; }
                .nav-badge { position: absolute; top: -3px; right: -3px; min-width: 14px; height: 14px; padding: 0 3px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #ef4444, #e11d48); color: white; font-size: 8px; font-weight: 700; border-radius: 999px; }
                .nav-avatar { width: 28px; height: 28px; border-radius: 7px; background: linear-gradient(135deg, #dfb15b, #f59e0b); display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 11px; position: relative; }
                .nav-avatar-dot { position: absolute; bottom: 0; right: 0; width: 7px; height: 7px; background: #22c55e; border-radius: 50%; border: 1px solid #0A192F; }
                .nav-logout { padding: 5px; border-radius: 7px; color: #9ca3af; transition: all 0.2s; border: none; background: rgba(255,255,255,0.05); cursor: pointer; }
                .nav-logout:hover { color: #ef4444; background: rgba(239, 68, 68, 0.15); }
                .mobile-tab { position: relative; border: none; background: none; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1px; flex: 1; height: 100%; }
                .mobile-tab-icon { width: 34px; height: 34px; border-radius: 10px; display: flex; align-items: center; justify-content: center; transition: all 0.3s; }
                .mobile-tab-label { font-size: 9px; font-weight: 500; transition: color 0.2s; }
                .mobile-tab-dot { position: absolute; top: 2px; left: 50%; transform: translateX(-50%); width: 3px; height: 3px; border-radius: 50%; background: #dfb15b; }
                .page-heading { font-size: 1.125rem; font-weight: 600; color: #ffffff; margin: 0; letter-spacing: -0.01em; }
                .btn { display: inline-flex; align-items: center; justify-content: center; padding: 4px 10px; border-radius: 7px; font-size: 10px; font-weight: 600; transition: all 0.2s; cursor: pointer; border: none; }
                .btn-sm { padding: 3px 8px; font-size: 9px; border-radius: 6px; }
                .btn-lg { padding: 5px 12px; font-size: 11px; border-radius: 8px; }
                .mobile-badge { position: absolute; top: -1px; right: -1px; min-width: 14px; height: 14px; padding: 0 3px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #ef4444, #e11d48); color: white; font-size: 8px; font-weight: 700; border-radius: 999px; }
                .text-gradient-gold { background: linear-gradient(135deg, #dfb15b, #f59e0b); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
                @keyframes gradient-shift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
                @keyframes floatUp { 0% { transform: translateY(100vh); } 100% { transform: translateY(-100vh); } }
            `}</style>

            <div className="relative z-10 pb-20">
                <nav className="hidden md:block bg-white/5 backdrop-blur-xl border-b border-white/10 shadow-sm sticky top-0 z-40">
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
                                    <span>Connect</span>
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
                                <button
                                    onClick={() => handleTabChange("partnership")}
                                    className={
                                        "nav-btn " +
                                        (activeTab === "partnership"
                                            ? "nav-active"
                                            : "nav-inactive")
                                    }
                                >
                                    <Icons.Heart className="nav-icon" />{" "}
                                    <span>Partnership</span>
                                </button>
                                <button
                                    onClick={() => handleTabChange("profile")}
                                    className={
                                        "nav-btn " +
                                        (activeTab === "profile"
                                            ? "nav-active"
                                            : "nav-inactive")
                                    }
                                >
                                    <Icons.User className="nav-icon" />{" "}
                                    <span>Profile</span>
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
                    className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/5 backdrop-blur-2xl border-t border-white/10"
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
                                gradient: "from-[#d4af37] to-amber-600",
                            },
                            {
                                id: "homegroup",
                                icon: Icons.Users,
                                label: "Connect",
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
                            {
                                id: "partnership",
                                icon: Icons.Heart,
                                label: "Partner",
                                gradient: "from-pink-400 to-pink-600",
                            },
                            {
                                id: "profile",
                                icon: Icons.User,
                                label: "Profile",
                                gradient: "from-indigo-400 to-indigo-600",
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
                                                ? "text-white"
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
                    {/* HOME TAB - Enhanced Dashboard */}
                    {activeTab === "home" && (
                        <div className="tab-panel space-y-4">
                            {/* 1. IDENTITY & AUTHORITY HEADER */}
                            <div className="gradient-border card-hover p-5">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-xl font-bold text-white">
                                            Good Evening{user?.name ? `, ${user.name.split(' ')[0]}` : ''}{" "}
                                            <span className="text-[#d4af37]">👋</span>
                                        </h2>
                                        <p className="text-sm text-gray-300 mt-1">
                                            Welcome to Heartfelt International Ministries
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                                            ACTIVE MEMBER <Icons.ShieldCheck className="w-3 h-3" />
                                        </span>
                                        <span className="block text-xs text-gray-400 mt-1">VERIFIED</span>
                                        {user?.zone?.name && (
                                            <p className="text-xs text-gray-400 mt-2">
                                                Your membership has been registered successfully. You are now officially part of the {user.zone.name} zone.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* 2. CORE CREDENTIALS GRID */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div className="gradient-border p-3">
                                    <p className="text-[10px] text-gray-400 font-medium uppercase">Membership Code</p>
                                    <p className="text-sm font-bold text-white font-mono">{user?.unique_code || user?.member?.member_code || 'xxxxx'}</p>
                                </div>
                                <div className="gradient-border p-3">
                                    <p className="text-[10px] text-gray-400 font-medium uppercase">Zone</p>
                                    <p className="text-sm font-bold text-white">{user?.zone?.name || 'xxx'}</p>
                                </div>
                                <div className="gradient-border p-3">
                                    <p className="text-[10px] text-gray-400 font-medium uppercase">Region</p>
                                    <p className="text-sm font-bold text-white">{user?.zone?.region?.name || 'xxx'}</p>
                                </div>
                                <div className="gradient-border p-3">
                                    <p className="text-[10px] text-gray-400 font-medium uppercase">Pastor</p>
                                    <p className="text-sm font-bold text-white truncate">{user?.pastor?.user?.name || user?.zone?.pastor_name || 'xxx'}</p>
                                </div>
                            </div>

                            {/* 3. SMART NAVIGATION MATRIX */}
                            <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                                {[
                                    { id: "home", icon: Icons.Home, label: "Home" },
                                    { id: "zone", icon: Icons.MapPin, label: "Zone" },
                                    { id: "homegroup", icon: Icons.Users, label: "Connect", hasSubmenu: true },
                                    { id: "events", icon: Icons.Calendar, label: "Events" },
                                    { id: "reports", icon: Icons.DocumentText, label: "Reports" },
                                    { id: "notifications", icon: Icons.Bell, label: "Alerts", badge: pendingInvitationsCount + pendingDeptCount },
                                    { id: "partnership", icon: Icons.Heart, label: "Partnership" },
                                    { id: "profile", icon: Icons.User, label: "Profile" },
                                ].map((item) => {
                                    const Icon = item.icon;
                                    const isActive = activeTab === item.id || (item.id === "homegroup" && connectSubmenu);
                                    const isConnect = item.id === "homegroup";
                                    return (
                                        <div key={item.id} className="relative">
                                            <button
                                                onClick={() => {
                                                    if (isConnect) {
                                                        setConnectSubmenu(connectSubmenu ? null : "messages");
                                                        if (!connectSubmenu) {
                                                            setActiveTab("homegroup");
                                                        }
                                                    } else {
                                                        handleTabChange(item.id);
                                                    }
                                                }}
                                                className="w-full flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-white/5 transition-all relative"
                                            >
                                                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${isActive ? 'bg-gradient-to-r from-[#d4af37] to-amber-500 text-white' : 'bg-white/10 text-gray-300'}`}>
                                                    <Icon className="w-4 h-4" />
                                                    {isConnect && <Icons.ChevronDown className={`w-3 h-3 ml-0.5 transition-transform ${connectSubmenu ? 'rotate-180' : ''}`} />}
                                                </div>
                                                <span className={`text-[9px] font-medium ${isActive ? 'text-white' : 'text-gray-400'}`}>{item.label}</span>
                                                {item.badge > 0 && (
                                                    <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
                                                )}
                                            </button>
                                            
                                            {/* Connect Submenu */}
                                            {isConnect && connectSubmenu && (
                                                <div className="absolute top-full mt-2 left-0 z-20 bg-[#0A192F]/95 backdrop-blur-xl border border-white/10 rounded-lg p-2 space-y-1 min-w-[140px]">
                                                    <button
                                                        onClick={() => handleAction("messages")}
                                                        className="w-full text-left px-2 py-1.5 text-[10px] text-gray-300 hover:bg-white/5 rounded flex items-center gap-2"
                                                    >
                                                        <Icons.ChatBubble className="w-3 h-3" />
                                                        Messages
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction("prayer-requests")}
                                                        className="w-full text-left px-2 py-1.5 text-[10px] text-gray-300 hover:bg-white/5 rounded flex items-center gap-2"
                                                    >
                                                        <Icons.HandRaised className="w-3 h-3" />
                                                        Prayer Requests
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction("testimonies")}
                                                        className="w-full text-left px-2 py-1.5 text-[10px] text-gray-300 hover:bg-white/5 rounded flex items-center gap-2"
                                                    >
                                                        <Icons.Star className="w-3 h-3" />
                                                        Testimonies
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
</div>

                             {/* 4. DYNAMIC ONBOARDING & NEXT STEPS */}
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                 <HomegroupSection
                                    user={user}
                                    onViewHomegroup={() => handleAction("homegroups")}
                                    onRequestLeave={onRequestLeave}
                                    homegroupLoading={homegroupLoading}
                                    onBrowseHomegroups={handleBrowseHomegroups}
                                />
                                <DepartmentsSection
                                    user={user}
                                    onViewDepartments={() => handleAction("departments")}
                                    onRequestLeave={onRequestLeave}
                                />
                            </div>

                            {/* 5. SPIRITUAL PROGRESS DASHBOARD */}
                            <div className="gradient-border p-4">
                                <h3 className="text-xs font-bold text-white mb-3 flex items-center gap-2">
                                    <Icons.ChartBar className="w-4 h-4 text-[#d4af37]" />
                                    Spiritual Progress
                                </h3>
                                <div className="grid grid-cols-4 gap-3">
                                    <div className="text-center">
                                        <p className="text-lg font-bold text-white">{upcomingEventsCount}</p>
                                        <p className="text-[9px] text-gray-400">Upcoming Events</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-lg font-bold text-white">{user?.home_group ? '1' : '0'} <span className="text-[10px]">/1</span></p>
                                        <p className="text-[9px] text-gray-400">Homegroups Joined</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-lg font-bold text-white">{user?.department ? '1' : '0'} <span className="text-[10px]">/1</span></p>
                                        <p className="text-[9px] text-gray-400">Departments Joined</p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-lg font-bold text-purple-400">Prospective</p>
                                        <p className="text-[9px] text-gray-400">Tier</p>
                                    </div>
                                </div>
                            </div>
                             {/* 6. ENHANCED SPIRITUAL CALENDAR */}
                            <div>
                                <div className="flex items-center justify-between mb-2.5">
                                    <h3 className="text-xs font-bold text-white">
                                        Upcoming Events
                                    </h3>
                                    <button
                                        onClick={() => handleTabChange("events")}
                                        className="text-[10px] text-[#dfb15b] font-semibold hover:text-amber-400"
                                    >
                                        View All
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {CHURCH_EVENTS_2026.slice(0, 4).map((event) => (
                                        <div key={event.id} className="gradient-border card-hover p-3 cursor-pointer" onClick={() => handleTabChange("events")}>
                                            <div className="flex items-start gap-3">
                                                <span className={`text-[10px] px-2 py-0.5 rounded ${event.category === "International" ? "bg-[#d4af37]/10 text-[#d4af37]" : "bg-sky-500/20 text-sky-300"}`}>
                                                    {event.category === "International" ? "🔥 FEATURED" : "📅"}
                                                </span>
                                                <div className="flex-1">
                                                    <p className="text-xs font-bold text-white">{event.title}</p>
                                                    <p className="text-[10px] text-gray-400">{event.startDate} • {event.location || "Open to All"}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 7. FOUNDATION & GROWTH CHECKLIST */}
                            <div className="gradient-border p-4">
                                <h3 className="text-xs font-bold text-white mb-2 flex items-center gap-2">
                                    <Icons.BookOpen className="w-4 h-4 text-[#d4af37]" />
                                    Daily Scripture
                                </h3>
                                <p className="text-xs text-gray-300 italic mb-3">
                                    "Those who are planted in the house of the Lord shall flourish in the courts of our God." — Psalm 92:13
                                </p>
                                <h4 className="text-[10px] font-bold text-white mb-2">Action Items</h4>
                                <div className="space-y-1.5">
                                    {[
                                        {id:1, text:'Complete your digital profile to unlock all portal features'},
                                        {id:2, text:'Connect with a local Homegroup'},
                                        {id:3, text:'Sign up for Department orientation'},
                                        {id:4, text:'Activate your Partnership package to support the global vision'}
                                    ].map((item) => (
                                        <label key={item.id} className="flex items-center gap-2 text-[10px]">
                                            <input type="checkbox" className="w-3 h-3 rounded border-gray-600 bg-white/10" />
                                            <span className="text-gray-300">{item.text}</span>
                                        </label>
                                    ))}
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
                                         <h3 className="text-xs font-bold text-white">
                                             My Zone
                                         </h3>
                                         <p className="text-[10px] text-gray-400">
                                             {user && user.zone
                                                 ? user.zone.name
                                                 : "Not Assigned"}
                                         </p>
                                     </div>
                                 </div>
                                 <div className="space-y-1.5 text-[10px] text-gray-300 mb-3">
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
                                     className="btn btn-lg bg-gradient-to-r from-[#dfb15b]/20 to-amber-500/20 text-[#d4af37] border border-[#dfb15b]/30 hover:from-[#dfb15b]/30 hover:to-amber-500/30 transition-all"
                                 >
                                     View Zone Details
                                 </button>
                             </div>
                             
                             {/* Membership Card Section */}
                             <div>
                                 <h3 className="text-xs font-bold text-white mb-2 flex items-center gap-2">
                                     <Icons.ShieldCheck className="w-4 h-4 text-[#d4af37]" />
                                     Digital Membership Card
                                 </h3>
                                 <MembershipCard user={user} />
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
                                     <h3 className="text-sm font-bold text-white">My Groups</h3>
                                 </div>
                             </div>

                             <HomegroupSection
                                 user={user}
                                 onViewHomegroup={() => handleAction("homegroups")}
                                 onRequestLeave={onRequestLeave}
                             />
                             <DepartmentsSection
                                 user={user}
                                 onViewDepartments={() => handleAction("departments")}
                                 onRequestLeave={onRequestLeave}
                             />
                         </div>
                     )}

                    {/* EVENTS TAB */}
                    {activeTab === "events" && (
                        <div className="tab-panel space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-bold text-white">
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
                                                            ? "from-[#d4af37] to-amber-500"
                                                            : "from-sky-400 to-sky-600") +
                                                        " flex items-center justify-center shadow-sm flex-shrink-0"
                                                    }
                                                >
                                                    <Icons.Calendar className="w-4 h-4 text-white" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-xs font-bold text-white truncate">
                                                        {event.title}
                                                    </h4>
                                                    <p className="text-[10px] text-gray-400 mt-0.5">
                                                        {event.startDate}
                                                        {event.endDate !==
                                                        event.startDate
                                                            ? " — " +
                                                              event.endDate
                                                            : ""}
                                                    </p>
                                                    {event.location && (
                                                        <p className="text-[9px] text-gray-500 mt-0.5">
                                                            📍 {event.location}
                                                        </p>
                                                    )}
                                                </div>
                                                <span
                                                    className={
                                                        "px-1.5 py-0.5 rounded-md text-[9px] font-bold " +
                                                        (event.category ===
                                                        "International"
                                                            ? "bg-[#d4af37]/10 text-[#d4af37]"
                                                            : "bg-sky-500/20 text-sky-300")
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
                                <div className="w-12 h-12 mx-auto mb-2.5 rounded-md bg-orange-500/20 flex items-center justify-center">
                                    <Icons.DocumentText className="w-5 h-5 text-orange-300" />
                                </div>
                                <h3 className="text-xs font-bold text-white mb-0.5">
                                    Submit a Report
                                </h3>
                                <p className="text-[10px] text-gray-400 mb-2.5">
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
                                  <h3 className="text-xs font-bold text-white">
                                      Notifications
                                  </h3>
                                  <span className="text-[10px] text-gray-400">
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
                                                  <div className="w-8 h-8 rounded-md bg-rose-500/20 flex items-center justify-center flex-shrink-0">
                                                      <Icons.Users className="w-4 h-4 text-rose-300" />
                                                  </div>
                                                  <div className="flex-1 min-w-0">
                                                      <p className="text-[10px] font-bold text-white">
                                                          {inv.home_group
                                                              ? inv.home_group
                                                                  .name
                                                              : "Homegroup Invitation"}
                                                      </p>
                                                      <p className="text-[9px] text-gray-400 mt-0.5">
                                                          You have been invited to
                                                          join this homegroup
                                                      </p>
                                                      <p className="text-[9px] text-gray-500 mt-0.5">
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
                                                  <div className="w-8 h-8 rounded-md bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                                                      <Icons.BuildingOffice className="w-4 h-4 text-purple-300" />
                                                  </div>
                                                  <div className="flex-1 min-w-0">
                                                      <p className="text-[10px] font-bold text-white">
                                                          {req.department
                                                              ? req.department
                                                                    .name
                                                              : "Department Request"}
                                                      </p>
                                                      <p className="text-[9px] text-gray-400 mt-0.5">
                                                          Your request is pending
                                                          approval
                                                      </p>
                                                      <p className="text-[9px] text-gray-500 mt-0.5">
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
                                       <div className="w-12 h-12 mx-auto mb-2 rounded-md bg-gray-500/20 flex items-center justify-center">
                                           <Icons.Bell className="w-5 h-5 text-gray-400" />
                                       </div>
                                       <h3 className="text-xs font-bold text-white mb-0.5">
                                           All Caught Up!
                                       </h3>
                                       <p className="text-[10px] text-gray-400">
                                           No new notifications.
                                       </p>
                                   </div>
                               ) : null}
                          </div>
                      )}

                      {/* PARTNERSHIP TAB */}
                      {activeTab === "partnership" && (
                          <div className="tab-panel space-y-4">
                              <div className="gradient-border card-hover p-4 text-center">
                                  <div className="w-12 h-12 mx-auto mb-2.5 rounded-md bg-pink-500/20 flex items-center justify-center">
                                      <Icons.Heart className="w-5 h-5 text-pink-300" />
                                  </div>
                                  <h3 className="text-xs font-bold text-white mb-0.5">
                                      Partnership
                                  </h3>
                                  <p className="text-[10px] text-gray-400 mb-2.5">
                                      Support the global vision of HIM
                                  </p>
                                  <button
                                      onClick={() => handleAction("become-partner")}
                                      className="btn btn-lg bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-md hover:shadow-lg transition-all"
                                  >
                                      Activate Partnership
                                  </button>
                              </div>
                          </div>
                      )}

                      {/* PROFILE TAB */}
                      {activeTab === "profile" && (
                          <div className="tab-panel space-y-4">
                              <div className="gradient-border card-hover p-4">
                                  <div className="flex items-center gap-3 mb-4">
                                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center">
                                          <Icons.User className="w-5 h-5 text-white" />
                                      </div>
                                      <div>
                                          <h3 className="text-sm font-bold text-white">My Profile</h3>
                                          <p className="text-[10px] text-gray-400">{user?.email}</p>
                                      </div>
                                  </div>
                                  <div className="space-y-2 text-[10px]">
                                      <p className="flex justify-between py-1.5 border-b border-white/10">
                                          <span className="text-gray-400">Name</span>
                                          <span className="text-white font-medium">{user?.name || "—"}</span>
                                      </p>
                                      <p className="flex justify-between py-1.5 border-b border-white/10">
                                          <span className="text-gray-400">Phone</span>
                                          <span className="text-white font-medium">{user?.phone || "—"}</span>
                                      </p>
                                      <p className="flex justify-between py-1.5 border-b border-white/10">
                                          <span className="text-gray-400">Member Since</span>
                                          <span className="text-white font-medium">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}</span>
                                      </p>
                                  </div>
                                  <button
                                      onClick={() => handleAction("edit-profile")}
                                      className="w-full mt-4 btn btn-lg bg-white/5 text-white hover:bg-white/10 transition-all"
                                  >
                                      Edit Profile
                                  </button>
                              </div>
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
                          onLeave={() => handleAction("homegroups")}
                          onRequestLeave={onRequestLeave}
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

