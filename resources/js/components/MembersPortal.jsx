import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCurrentUser, useUser } from "../context/UserContext";
import api from "../lib/api";
import HomeGroupCommunity from "./HomeGroupCommunity";
import HomeGroupSelector from "./HomeGroupSelector.jsx";
import DepartmentRequest from "./DepartmentRequest.jsx";
import Drawer from "./Drawer.jsx";
import EventsTab, { FALLBACK_EVENTS } from "./dashboard/EventsTab.jsx";
import LeaveReasonModal from "./LeaveReasonModal.jsx";
import MembershipCard from "./MembershipCard.jsx";
import PrayerCenter from "./prayer-center/PrayerCenter.jsx";
import ProfileCompletenessNudge from "./dashboard/sections/ProfileCompletenessNudge.jsx";
import SpiritualJourney from "./dashboard/sections/SpiritualJourney.jsx";
import RecommendationsWidget from "./dashboard/RecommendationsWidget.jsx";
import RecommendedHomeGroupCard from "./dashboard/RecommendedHomeGroupCard.jsx";
import NearbyHomeGroups from "./dashboard/NearbyHomeGroups.jsx";
import Member360View from "./pastors/Member360View.jsx";
import LocationEntry from "./onboarding/LocationEntry.jsx";
import ProfileFormManager from "../utils/ProfileFormManager.js";
import MembersNavBar, { membersNavStyles, ProfilePictureModal } from "./MembersNavBar.jsx";
import MembersPartnershipPage from "./MembersPartnershipPage.jsx";
import { MemberLogoutSplash } from "./MemberSplash.jsx";
import LeaderPromotionConsent from "./LeaderPromotionConsent.jsx";

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
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
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
    HandsPraying: ({ className }) => (
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
                d="M12 18.5v-9m0 0l-3.5 3.5m3.5-3.5l3.5 3.5M6.5 13.5l-2 2m14-2l2 2M6.5 10.5l-2-2m14 2l2-2M4.5 9.75v9.75A2.25 2.25 0 006.75 21.75h10.5a2.25 2.25 0 002.25-2.25V9.75"
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
                d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z"
            />
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 13.5l3 3m0 0l-3 3m3-3H9"
            />
        </svg>
    ),
    PlayCircle: ({ className }) => (
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
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z"
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
            <div className="lux-card lux-rise" style={{ animationDelay: "60ms" }}>
                <div className="p-5 sm:p-6 flex flex-1 flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2.5">
                            <div className="lux-monogram w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-300">
                                <Icons.Users className="w-4 h-4" />
                            </div>
                            <span className="lux-eyebrow">Homegroup</span>
                        </div>
                        <button
                            onClick={onViewHomegroup}
                            className="lux-link"
                        >
                            View all <span aria-hidden="true">→</span>
                        </button>
                    </div>
                    <div className="lux-divider mb-5"></div>
                    <div className="flex items-center gap-4">
                        <div className="lux-monogram w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-emerald-600/25 ring-1 ring-emerald-400/25 text-emerald-200">
                            <Icons.Users className="w-7 h-7" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-base font-semibold text-white truncate tracking-tight">
                                {hg.name}
                            </p>
                            <span className="lux-chip mt-2 bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/25">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                Active membership
                            </span>
                        </div>
                    </div>
                    {!isLeader && (
                        <button
                            onClick={() => onRequestLeave("homegroup")}
                            className="lux-btn mt-auto w-full py-2.5 text-xs text-rose-300 bg-white/5 ring-1 ring-rose-500/25 hover:bg-rose-500/10 hover:ring-rose-500/40"
                        >
                            Request to leave group
                        </button>
                    )}
                    {isLeader && (
                        <p className="mt-6 text-[11px] text-gray-500 leading-relaxed text-center">
                            You lead this group. Contact your pastor to transfer
                            leadership before leaving.
                        </p>
                    )}
                </div>
            </div>
        );
    }
    return (
            <div className="lux-card lux-rise" style={{ animationDelay: "60ms" }}>
                <div className="p-6 sm:p-7 text-center flex flex-1 flex-col">
                    <div className="lux-monogram w-14 h-14 mx-auto mb-4 rounded-2xl bg-emerald-500/12 text-emerald-300 ring-1 ring-emerald-500/15">
                        <Icons.Users className="w-7 h-7" />
                    </div>
                    <span className="lux-eyebrow block mb-2">No homegroup yet</span>
                    <h3 className="text-lg font-semibold text-white mb-2 font-serif tracking-tight">
                        Find your people
                    </h3>
                <p className="text-[13px] text-gray-400 mb-5 max-w-xs mx-auto leading-relaxed">
                    Join a homegroup to connect with fellow members, grow
                    spiritually, and belong to a community that cares.
                </p>
                <NearbyHomeGroups onJoin={onBrowseHomegroups || onViewHomegroup} />
                <button
                    onClick={onBrowseHomegroups || onViewHomegroup}
                    disabled={homegroupLoading}
                    className="lux-btn mt-auto w-full py-3 text-sm bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-900/30 hover:from-emerald-400 hover:to-emerald-500 disabled:opacity-70"
                >
                    {homegroupLoading ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <circle cx="12" cy="12" r="10" strokeWidth="2" strokeDasharray="32" strokeLinecap="round" />
                            </svg>
                            Loading...
                        </span>
                    ) : "Browse homegroups"}
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
            <div className="lux-card lux-rise" style={{ animationDelay: "120ms" }}>
                <div className="p-5 sm:p-6 flex flex-1 flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2.5">
                            <div className="lux-monogram w-9 h-9 rounded-xl bg-purple-500/15 text-purple-300">
                                <Icons.BuildingOffice className="w-4 h-4" />
                            </div>
                            <span className="lux-eyebrow">Department</span>
                        </div>
                        <button
                            onClick={onViewDepartments}
                            className="lux-link"
                        >
                            View all <span aria-hidden="true">→</span>
                        </button>
                    </div>
                    <div className="lux-divider mb-5"></div>
                    <div className="flex items-center gap-4">
                        <div className="lux-monogram w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-400/20 to-purple-600/25 ring-1 ring-purple-400/25 text-purple-200">
                            <Icons.BuildingOffice className="w-7 h-7" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-base font-semibold text-white truncate tracking-tight">
                                {dept.name}
                            </p>
                            <span className="lux-chip mt-2 bg-purple-500/10 text-purple-300 ring-1 ring-purple-500/25">
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                                Active ministry
                            </span>
                        </div>
                    </div>
                    {!isHod && (
                        <button
                            onClick={() => onRequestLeave("department")}
                            className="lux-btn mt-auto w-full py-2.5 text-xs text-rose-300 bg-white/5 ring-1 ring-rose-500/25 hover:bg-rose-500/10 hover:ring-rose-500/40"
                        >
                            Request to leave department
                        </button>
                    )}
                    {isHod && (
                        <p className="mt-6 text-[11px] text-gray-500 leading-relaxed text-center">
                            You head this department. Contact your pastor to
                            transfer leadership before leaving.
                        </p>
                    )}
                </div>
            </div>
        );
    }
    return (
            <div className="lux-card lux-rise" style={{ animationDelay: "120ms" }}>
                <div className="p-6 sm:p-7 text-center flex flex-1 flex-col">
                    <div className="lux-monogram w-14 h-14 mx-auto mb-4 rounded-2xl bg-purple-500/12 text-purple-300 ring-1 ring-purple-500/15">
                        <Icons.BuildingOffice className="w-7 h-7" />
                    </div>
                <span className="lux-eyebrow block mb-2">No department yet</span>
                <h3 className="text-lg font-semibold text-white mb-2 font-serif tracking-tight">
                    Discover your calling
                </h3>
                <p className="text-[13px] text-gray-400 mb-5 max-w-xs mx-auto leading-relaxed">
                    Serve alongside other members and use your gifts to make a
                    difference in the house.
                </p>
                <div className="rounded-2xl bg-purple-500/10 ring-1 ring-purple-500/15 p-3.5 mb-5 text-left">
                    <div className="flex items-center gap-2 mb-1">
                        <Icons.Star className="w-3.5 h-3.5 text-purple-300" />
                        <p className="text-[11px] font-semibold text-purple-200 uppercase tracking-wide">
                            Suggested ministry
                        </p>
                    </div>
                    <p className="text-sm font-semibold text-white">Media & ICT</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                        4 open positions · Training available
                    </p>
                </div>
                <button
                    onClick={onViewDepartments}
                    className="lux-btn mt-auto w-full py-3 text-sm bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-900/30 hover:from-purple-400 hover:to-purple-500"
                >
                    Browse departments
                </button>
            </div>
        </div>
    );
};

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

    const { data: leaderPromotion } = useQuery({
        queryKey: ["my-leader-promotion"],
        queryFn: async () => {
            const res = await api.get("/home-group/my-promotion");
            if (!res.data.success) throw new Error();
            return res.data.promotion;
        },
        staleTime: 0,
        refetchInterval: 20000,
        enabled: !!user && user.role === "member",
    });

    const { data: zoneSummaryData } = useQuery({
        queryKey: ["member-zone-summary"],
        queryFn: async () => {
            const res = await api.get("/members/zone-summary");
            if (!res.data.success) throw new Error();
            return res.data.data;
        },
        staleTime: 30000,
        refetchOnWindowFocus: true,
        retry: 1,
    });

    const { data: homeEventsData } = useQuery({
        queryKey: ["home-upcoming-events"],
        queryFn: async () => {
            const res = await api.get("/events?upcoming=true");
            if (!res.data.success) throw new Error();
            return res.data.data || [];
        },
        staleTime: 30000,
    });

    const pendingInvitationsCount = (invitationsData || []).filter(
        (inv) => inv.status === "pending",
    ).length;
    const pendingDeptCount = (deptRequestsData || []).filter(
        (r) => r.status === "pending",
    ).length;

    const upcomingEvents = useMemo(() => {
        const source = homeEventsData && homeEventsData.length > 0 ? homeEventsData : FALLBACK_EVENTS;
        return source
            .filter((e) => !e.is_past)
            .sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at))
            .slice(0, 4);
    }, [homeEventsData]);

    const upcomingEventsCount = upcomingEvents.length;

    const [activeTab, setActiveTab] = useState("home");
    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [showHomegroupSelector, setShowHomegroupSelector] = useState(false);
    const [homegroupLoading, setHomegroupLoading] = useState(false);
    const [showDepartmentSelector, setShowDepartmentSelector] = useState(false);
    const [leaveModal, setLeaveModal] = useState({ show: false, type: null });
    const [connectSubmenu, setConnectSubmenu] = useState(null); // 'messages' | 'prayer' | 'testimonies'
    const [showLocationEntry, setShowLocationEntry] = useState(false);
    const [selectedMemberFor360, setSelectedMemberFor360] = useState(null);
    const [mobileProfileOpen, setMobileProfileOpen] = useState(false);
    const [mobileUploadOpen, setMobileUploadOpen] = useState(false);
    const [, setProfileFormVersion] = useState(0);
    const profileFormRef = useRef(null);

    if (!profileFormRef.current) {
        profileFormRef.current = new ProfileFormManager({
            user: {
                name: user?.name || "",
                email: user?.email || "",
                phone: user?.phone || "",
                address_line_1: user?.address_line_1 || "",
                address_line_2: user?.address_line_2 || "",
                city: user?.city || "",
                province: user?.province || "",
                country: user?.country || "",
                postal_code: user?.postal_code || "",
            },
            member: {
                surname: user?.member?.surname || "",
                date_of_birth: user?.member?.date_of_birth || "",
                gender_id: user?.member?.gender_id || "",
                demography_id: user?.member?.demography_id || "",
            },
        }, () => setProfileFormVersion(v => v + 1));
    }

    const profileForm = profileFormRef.current;
    const [profileSaving, setProfileSaving] = useState(false);
    const [profileSaved, setProfileSaved] = useState(false);

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        setNotificationsOpen(false);
        setConnectSubmenu(null);
    };

    const handleSaveProfile = async () => {
        setProfileSaving(true);
        try {
            const payload = profileForm.getFormData();
            const response = await api.put("/members/me/profile", payload);
            if (response.data?.success) {
                const updated = response.data.data;
                updateUser({
                    name: updated.user?.name || payload.user.name,
                    email: updated.user?.email || payload.user.email,
                    phone: updated.user?.phone || payload.user.phone,
                    address_line_1: updated.user?.address_line_1 || payload.user.address_line_1,
                    address_line_2: updated.user?.address_line_2 || payload.user.address_line_2,
                    city: updated.user?.city || payload.user.city,
                    province: updated.user?.province || payload.user.province,
                    country: updated.user?.country || payload.user.country,
                    postal_code: updated.user?.postal_code || payload.user.postal_code,
                    member: {
                        ...user?.member,
                        surname: updated.member?.surname || payload.member.surname,
                        date_of_birth: updated.member?.date_of_birth || payload.member.date_of_birth,
                        gender: updated.member?.gender || user?.member?.gender,
                        demography: updated.member?.demography || user?.member?.demography,
                    },
                });
                profileForm.reset({
                    user: {
                        name: updated.user?.name || payload.user.name,
                        email: updated.user?.email || payload.user.email,
                        phone: updated.user?.phone || "",
                        address_line_1: updated.user?.address_line_1 || "",
                        address_line_2: updated.user?.address_line_2 || "",
                        city: updated.user?.city || "",
                        province: updated.user?.province || "",
                        country: updated.user?.country || "",
                        postal_code: updated.user?.postal_code || "",
                    },
                    member: {
                        surname: updated.member?.surname || "",
                        date_of_birth: updated.member?.date_of_birth || "",
                        gender_id: updated.member?.gender_id || "",
                        demography_id: updated.member?.demography_id || "",
                    },
                });
                setProfileSaved(true);
                setTimeout(() => setProfileSaved(false), 3000);
                queryClient.invalidateQueries({ queryKey: ["members", "me"] });
            }
        } catch (err) {
            const apiErrors = err.response?.data?.errors || {};
            Object.entries(apiErrors).forEach(([field, messages]) => {
                profileForm.setError(field, Array.isArray(messages) ? messages[0] : messages);
            });
            alert(err.response?.data?.message || "Failed to save profile. Please try again.");
            console.error(err);
        } finally {
            setProfileSaving(false);
        }
    };

    // Check if first-time user needs location entry
    useEffect(() => {
        if (user && !user.location_captured && !localStorage.getItem("location-entry-skipped")) {
            const timer = setTimeout(() => setShowLocationEntry(true), 1500);
            return () => clearTimeout(timer);
        }
    }, [user]);

    // Populate profile form when user data changes
    useEffect(() => {
        if (user) {
            profileForm.reset({
                user: {
                    name: user.name || "",
                    email: user.email || "",
                    phone: user.phone || "",
                    address_line_1: user.address_line_1 || "",
                    address_line_2: user.address_line_2 || "",
                    city: user.city || "",
                    province: user.province || "",
                    country: user.country || "",
                    postal_code: user.postal_code || "",
                },
                member: {
                    surname: user.member?.surname || "",
                    date_of_birth: user.member?.date_of_birth || "",
                    gender_id: user.member?.gender_id || "",
                    demography_id: user.member?.demography_id || "",
                },
            });
        }
    }, [user, profileForm]);

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
        if (id === "edit-profile") setIsEditingProfile(true);
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

                /* ===== CONNECT TAB — PREMIUM REFINEMENTS ===== */
                .connect-eyebrow { font-size: 0.6875rem; letter-spacing: 0.2em; text-transform: uppercase; color: #dfb15b; font-weight: 600; }
                .connect-title { font-size: 1.875rem; line-height: 1.05; font-weight: 700; letter-spacing: -0.025em; color: #ffffff; }
                .connect-subtitle { font-size: 0.8125rem; color: #9ca3af; line-height: 1.6; }
                .lux-eyebrow { font-size: 0.625rem; letter-spacing: 0.16em; text-transform: uppercase; color: #9ca3af; font-weight: 600; }
                .lux-chip { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 999px; font-size: 0.6875rem; font-weight: 600; letter-spacing: 0.01em; line-height: 1; }
                .lux-monogram { display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
                .lux-link { color: #dfb15b; font-size: 0.7rem; font-weight: 600; letter-spacing: 0.01em; transition: color 0.2s ease, gap 0.2s ease; display: inline-flex; align-items: center; gap: 3px; }
                .lux-link:hover { color: #f59e0b; gap: 6px; }
                .lux-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; font-weight: 600; border-radius: 12px; transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; border: none; }
                .lux-divider { height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent); }
                .lux-card { position: relative; display: flex; flex-direction: column; background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.025)); border: 1px solid rgba(255,255,255,0.09); border-radius: 22px; backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); overflow: hidden; transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.4s ease, border-color 0.4s ease; }
                .lux-card::before { content: ''; position: absolute; inset: 0; border-radius: inherit; padding: 1px; background: linear-gradient(135deg, rgba(212,175,55,0.55), rgba(212,175,55,0) 38%, rgba(255,255,255,0.06)); -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite: xor; mask-composite: exclude; opacity: 0; transition: opacity 0.45s ease; pointer-events: none; }
                .lux-card:hover { transform: translateY(-3px); border-color: rgba(212,175,55,0.18); box-shadow: 0 24px 48px -20px rgba(0,0,0,0.55), 0 0 0 1px rgba(212,175,55,0.12); }
                .lux-card:hover::before { opacity: 1; }
                @keyframes lux-rise { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
                .lux-rise { animation: lux-rise 0.6s cubic-bezier(0.22, 1, 0.36, 1) both; }

                /* ===== PREMIUM NAVBAR (MembersNavBar) ===== */
                ${membersNavStyles}

                /* ===== MOBILE BOTTOM NAV (redesigned) ===== */
                .mpm-mobile-tab {
                    position: relative;
                    border: none;
                    background: none;
                    cursor: pointer;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    gap: 2px;
                    flex: 1;
                    height: 100%;
                }
                .mpm-mobile-icon {
                    width: 38px;
                    height: 38px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #94a3b8;
                    transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1);
                }
                .mpm-mobile-icon.is-active {
                    color: #fff;
                    background: linear-gradient(135deg, rgba(212,175,55,0.22), rgba(212,175,55,0.1));
                    transform: translateY(-2px) scale(1.04);
                    box-shadow: 0 8px 18px -8px rgba(212,175,55,0.5);
                }
                .mpm-mobile-label {
                    font-size: 9px;
                    font-weight: 500;
                    color: #94a3b8;
                    transition: color 0.2s;
                }
                .mpm-mobile-label.is-active { color: #fff; font-weight: 600; }
                .mpm-mobile-dot {
                    position: absolute;
                    top: 4px;
                    width: 4px;
                    height: 4px;
                    border-radius: 50%;
                    background: #d4af37;
                }
                .mpm-mobile-badge {
                    position: absolute;
                    top: -2px;
                    right: -2px;
                    min-width: 14px;
                    height: 14px;
                    padding: 0 3px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #ef4444, #e11d48);
                    color: #fff;
                    font-size: 8px;
                    font-weight: 700;
                    border-radius: 999px;
                }
                .mpm-mobile-avatar {
                    width: 34px;
                    height: 34px;
                    border-radius: 11px;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: linear-gradient(135deg, #d4af37, #f59e0b);
                    border: 1px solid rgba(255,255,255,0.15);
                    box-shadow: 0 4px 12px -4px rgba(0,0,0,0.4);
                }
                .mpm-mobile-sheet {
                    display: flex;
                    align-items: center;
                    gap: 0.6rem;
                    width: 100%;
                    padding: 0.7rem 0.9rem;
                    border: none;
                    background: rgba(255,255,255,0.04);
                    border-radius: 0.7rem;
                    color: #e2e8f0;
                    font-size: 0.82rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: background 0.2s ease;
                }
                .mpm-mobile-sheet:hover { background: rgba(255,255,255,0.08); }
            `}</style>

            <div className="relative z-10 pb-20">
                <MembersNavBar
                    user={user}
                    activeTab={activeTab}
                    alertCount={pendingInvitationsCount}
                    onNavigate={handleTabChange}
                    onAlerts={() => {
                        handleTabChange("notifications");
                        handleNotificationToggle();
                    }}
                    onLogout={onLogout}
                    onProfile={() => handleTabChange("profile")}
                    onUpload={(url) => updateUser({ profile_photo: url })}
                />

                {/* Mobile Bottom Nav */}
                <nav
                    className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/5 backdrop-blur-2xl border-t border-white/10"
                    style={{
                        paddingBottom: "env(safe-area-inset-bottom, 0px)",
                    }}
                >
                    <div className="flex items-center justify-around h-16 px-1">
                        {[
                            { id: "home", icon: Icons.Home, label: "Home" },
                            { id: "zone", icon: Icons.MapPin, label: "Zone" },
                            { id: "homegroup", icon: Icons.Users, label: "Connect" },
                            { id: "prayer-center", icon: Icons.HandsPraying, label: "Prayer" },
                            { id: "events", icon: Icons.Calendar, label: "Events" },
                            { id: "partnership", icon: Icons.Heart, label: "Partner" },
                        ].map((item) => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.id;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => handleTabChange(item.id)}
                                    className="mpm-mobile-tab"
                                >
                                    <div
                                        className={
                                            "mpm-mobile-icon " +
                                            (isActive ? "is-active" : "")
                                        }
                                    >
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <span
                                        className={
                                            "mpm-mobile-label " +
                                            (isActive ? "is-active" : "")
                                        }
                                    >
                                        {item.label}
                                    </span>
                                    {isActive && <span className="mpm-mobile-dot" />}
                                </button>
                            );
                        })}

                        <button
                            onClick={() => {
                                handleTabChange("notifications");
                                handleNotificationToggle();
                            }}
                            className="mpm-mobile-tab"
                        >
                            <div className="mpm-mobile-icon relative">
                                <Icons.Bell className="w-5 h-5" />
                                {pendingInvitationsCount > 0 && (
                                    <span className="mpm-mobile-badge">
                                        {pendingInvitationsCount}
                                    </span>
                                )}
                            </div>
                            <span className="mpm-mobile-label">Alerts</span>
                        </button>

                        <button
                            onClick={() => setMobileProfileOpen((v) => !v)}
                            className="mpm-mobile-tab"
                        >
                            <div className="mpm-mobile-avatar">
                                {user?.profile_photo || user?.profile_picture ? (
                                    <img
                                        src={user.profile_photo || user.profile_picture}
                                        alt={user.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-white font-bold text-sm">
                                        {(user?.name || "M").charAt(0).toUpperCase()}
                                    </span>
                                )}
                            </div>
                            <span className="mpm-mobile-label">Profile</span>
                        </button>
                    </div>

                    {mobileProfileOpen && (
                        <div
                            className="absolute inset-x-0 bottom-16 bg-[#0d1a2e]/95 backdrop-blur-xl border-t border-white/10 p-3 space-y-1"
                            onClick={() => setMobileProfileOpen(false)}
                        >
                            <button
                                className="mpm-mobile-sheet"
                                onClick={() => { setMobileProfileOpen(false); setMobileUploadOpen(true); }}
                            >
                                <Icons.Users className="w-4 h-4 text-[#f0c66b]" />
                                Change profile picture
                            </button>
                            <button
                                className="mpm-mobile-sheet"
                                onClick={() => { setMobileProfileOpen(false); handleTabChange("profile"); }}
                            >
                                <Icons.User className="w-4 h-4 text-gray-300" />
                                View profile
                            </button>
                            <button
                                className="mpm-mobile-sheet text-rose-300"
                                onClick={() => { setMobileProfileOpen(false); onLogout(); }}
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                                </svg>
                                Sign out
                            </button>
                        </div>
                    )}
                </nav>

                {mobileUploadOpen && (
                    <ProfilePictureModal
                        user={user}
                        onClose={() => setMobileUploadOpen(false)}
                        onUpdate={(url) => { updateUser({ profile_photo: url }); setMobileUploadOpen(false); }}
                    />
                )}

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

                            {/* 3. DYNAMIC ONBOARDING & NEXT STEPS */}
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

                            {/* Recommended Home Group */}
                            <RecommendedHomeGroupCard onJoin={(groupId) => {
                                handleBrowseHomegroups();
                                setTimeout(() => setShowHomegroupSelector(true), 2000);
                            }} />

                            {/* Profile Completeness Nudge */}
                            <ProfileCompletenessNudge user={user} />

                            {/* 4. SPIRITUAL PROGRESS DASHBOARD */}
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
                             {/* 4. ENHANCED SPIRITUAL CALENDAR */}
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
                                    {upcomingEvents.length === 0 ? (
                                        <div className="text-center py-6 text-gray-500 text-xs">
                                            No upcoming events at this time.
                                        </div>
                                    ) : (
                                        upcomingEvents.map((event) => {
                                            const dateStr = event.starts_at
                                                ? new Date(event.starts_at).toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                    year: "numeric",
                                                })
                                                : "Date TBD";
                                            const location = event.venue_name || event.location || "Open to All";
                                            const isFeatured = event.is_featured || event.category === "International";

                                            return (
                                                <div
                                                    key={event.id}
                                                    className="gradient-border card-hover p-3 cursor-pointer"
                                                    onClick={() => handleTabChange("events")}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <span className={`text-[10px] px-2 py-0.5 rounded ${isFeatured ? "bg-[#d4af37]/10 text-[#d4af37]" : "bg-sky-500/20 text-sky-300"}`}>
                                                            {isFeatured ? "🔥 FEATURED" : "📅"}
                                                        </span>
                                                        <div className="flex-1">
                                                            <p className="text-xs font-bold text-white">{event.title}</p>
                                                            <p className="text-[10px] text-gray-400">
                                                                {dateStr} • {location}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            {/* 5. FOUNDATION & GROWTH CHECKLIST */}
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
                          <div className="tab-panel">
                              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0A192F] via-[#112240] to-[#1A365D] border border-white/10">
                                  <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#dfb15b]/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
                                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-sky-500/10 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />

                                  <div className="relative p-6 md:p-8 space-y-8">
                                      {/* Header */}
                                      <div>
                                          <p className="text-[10px] font-bold text-[#dfb15b] uppercase tracking-[0.2em] mb-1">Zone History</p>
                                          <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">Zone Timeline</h2>
                                      </div>

                                      {/* Current Zone Pastor */}
                                      <div>
                                          <div className="flex items-center gap-2 mb-4">
                                              <div className="w-1 h-5 bg-[#d4af37] rounded-full" />
                                              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.15em]">Current Zone Pastor</h3>
                                          </div>
                                          <div className="flex items-center gap-5">
                                              <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-[#dfb15b] to-amber-600 flex items-center justify-center shadow-xl shadow-[#dfb15b]/20 flex-shrink-0">
                                                  <span className="text-white font-bold text-2xl">
                                                      {(user && user.pastor && user.pastor.user ? user.pastor.user.name : (user && user.zone && user.zone.pastor_name ? user.zone.pastor_name : "P")).charAt(0)}
                                                  </span>
                                              </div>
                                              <div className="min-w-0 flex-1">
                                                  <h4 className="text-base font-bold text-white truncate">
                                                      {user && user.pastor && user.pastor.user ? user.pastor.user.name : (user && user.zone && user.zone.pastor_name ? user.zone.pastor_name : "Not Assigned")}
                                                  </h4>
                                                  <p className="text-xs text-gray-400 mt-0.5">
                                                      {user && user.pastor && user.pastor.title ? user.pastor.title : "Pastor"}
                                                  </p>
                                                  <div className="flex items-center gap-3 mt-2">
                                                      <span className="text-[10px] text-gray-500">Since {user && user.zone ? (user.zone.year_established || "—") : "—"}</span>
                                                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                                                          <span className="w-1 h-1 rounded-full bg-emerald-400" />
                                                          Current
                                                      </span>
                                                  </div>
                                              </div>
                                          </div>
                                      </div>

                                      {/* My Zone */}
                                      <div>
                                          <div className="flex items-center gap-2 mb-4">
                                              <div className="w-1 h-5 bg-[#d4af37] rounded-full" />
                                              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.15em]">My Zone</h3>
                                          </div>
                                          <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
                                              <div className="p-5 md:p-6">
                                                  <div className="flex items-center gap-4 mb-5">
                                                      <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-[#dfb15b] to-amber-600 flex items-center justify-center shadow-xl shadow-[#dfb15b]/20 flex-shrink-0">
                                                          <span className="text-white font-bold text-xl md:text-2xl tracking-tight">
                                                              {user && user.zone ? user.zone.name.charAt(0) : 'Z'}
                                                          </span>
                                                      </div>
                                                      <div>
                                                          <h3 className="text-lg md:text-xl font-bold text-white tracking-tight">
                                                              {user && user.zone ? user.zone.name : 'Not Assigned'}
                                                          </h3>
                                                      </div>
                                                  </div>

                                                  <div className="space-y-0">
                                                      <div className="flex items-center justify-between py-3 border-b border-white/5">
                                                          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Location</span>
                                                          <span className="text-sm font-semibold text-white text-right">{user && user.zone ? (user.zone.location || "—") : "—"}</span>
                                                      </div>
                                                      <div className="flex items-center justify-between py-3 border-b border-white/5">
                                                          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Established</span>
                                                          <span className="text-sm font-semibold text-white text-right">{user && user.zone ? (user.zone.year_established || "—") : "—"}</span>
                                                      </div>
                                                      <div className="flex items-center justify-between py-3 border-b border-white/5">
                                                          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Phone</span>
                                                          <span className="text-sm font-semibold text-white text-right">{user && user.zone ? (user.zone.phone || "—") : "—"}</span>
                                                      </div>
                                                      <div className="flex items-center justify-between py-3">
                                                          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Address</span>
                                                          <span className="text-sm font-semibold text-white text-right max-w-[60%]">{user && user.zone ? (user.zone.address || "—") : "—"}</span>
                                                      </div>
                                                  </div>
                                              </div>

                                              {/* Pastors & Leadership */}
                                              <div className="px-5 md:px-6 py-5 bg-white/[0.02] border-t border-white/5">
                                                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-[0.15em] mb-4">Pastors & Leadership</h4>
                                                  <div className="flex items-center gap-4">
                                                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#dfb15b] to-amber-600 flex items-center justify-center shadow-lg shadow-[#dfb15b]/20 flex-shrink-0">
                                                          <span className="text-white font-bold text-sm">
                                                              {(user && user.pastor && user.pastor.user ? user.pastor.user.name : (user && user.zone && user.zone.pastor_name ? user.zone.pastor_name : "P")).charAt(0)}
                                                          </span>
                                                      </div>
                                                      <div className="min-w-0">
                                                          <p className="text-sm font-bold text-white truncate">
                                                              {user && user.pastor && user.pastor.user ? user.pastor.user.name : (user && user.zone && user.zone.pastor_name ? user.zone.pastor_name : "Not Assigned")}
                                                          </p>
                                                          <p className="text-xs text-gray-400 mt-0.5">
                                                              {user && user.pastor && user.pastor.title ? user.pastor.title : "Pastor"}
                                                          </p>
                                                          <div className="flex items-center gap-3 mt-2">
                                                              <span className="text-[10px] text-gray-500">Since {user && user.zone ? (user.zone.year_established || "—") : "—"}</span>
                                                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                                                                  <span className="w-1 h-1 rounded-full bg-emerald-400" />
                                                                  Current
                                                              </span>
                                                          </div>
                                                      </div>
                                                  </div>
                                              </div>
                                          </div>
                                       </div>
                                   </div>
                               </div>
                           </div>
                       )}

{/* CONNECT TAB — Premium community hub */}
                      {activeTab === "homegroup" && (
                          <div className="tab-panel">
                              <header className="lux-rise mb-7">
                                  <p className="connect-eyebrow mb-2">Members · Community</p>
                                  <div className="flex items-end justify-between gap-4 flex-wrap">
                                      <div className="max-w-md">
                                          <h2 className="connect-title">Connect</h2>
                                          <p className="connect-subtitle mt-2.5">
                                              Your place within the family.
                                              Manage your homegroup and ministry,
                                              and respond to invitations.
                                          </p>
                                      </div>
                                      {(pendingInvitationsCount + pendingDeptCount) > 0 && (
                                          <span className="lux-chip bg-gold-500/10 text-[#dfb15b] ring-1 ring-gold-400/30">
                                              <span className="w-1.5 h-1.5 rounded-full bg-[#dfb15b] badge-pulse"></span>
                                              {pendingInvitationsCount + pendingDeptCount}{" "}
                                              {pendingInvitationsCount + pendingDeptCount === 1
                                                  ? "pending invitation"
                                                  : "pending invitations"}
                                          </span>
                                      )}
                                  </div>
                              </header>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-stretch">
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
                          </div>
                      )}

                    {/* EVENTS TAB */}
                    {activeTab === "events" && (
                        <div className="tab-panel">
                            <EventsTab />
                        </div>
                    )}

                    {/* ALERTS TAB — PREMIUM */}
                      {activeTab === "notifications" && (
                          <div className="tab-panel space-y-5">
                              {/* Header */}
                              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0A192F] via-[#112240] to-[#1A365D] border border-white/10 p-5 md:p-6">
                                  <div className="absolute top-0 right-0 w-56 h-56 bg-gradient-to-br from-[#dfb15b]/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
                                  <div className="relative flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                          <div className="lux-monogram w-11 h-11 rounded-2xl bg-gradient-to-br from-[#dfb15b]/25 to-amber-600/25 ring-1 ring-[#dfb15b]/30 text-[#dfb15b]">
                                              <Icons.Bell className="w-5 h-5" />
                                          </div>
                                          <div>
                                              <p className="lux-eyebrow">Updates</p>
                                              <h3 className="text-lg font-bold text-white tracking-tight font-serif">
                                                  Notifications
                                              </h3>
                                          </div>
                                      </div>
                                      <span className="lux-chip bg-[#dfb15b]/10 text-[#dfb15b] ring-1 ring-[#dfb15b]/25">
                                          <span className="w-1.5 h-1.5 rounded-full bg-[#dfb15b]" />
                                          {pendingInvitationsCount + pendingDeptCount} pending
                                      </span>
                                  </div>
                              </div>

                              {pendingInvitationsCount + pendingDeptCount === 0 ? (
                                  /* Empty state */
                                  <div className="lux-card lux-rise p-10 text-center">
                                      <div className="lux-monogram w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-500/12 ring-1 ring-emerald-500/20 text-emerald-300">
                                          <Icons.Check className="w-7 h-7" />
                                      </div>
                                      <h3 className="text-base font-bold text-white mb-1 font-serif tracking-tight">
                                          All Caught Up!
                                      </h3>
                                      <p className="text-[12px] text-gray-400 max-w-xs mx-auto leading-relaxed">
                                          You have no pending invitations or requests. We'll
                                          let you know the moment something needs your
                                          attention.
                                      </p>
                                  </div>
                              ) : (
                                  <div className="space-y-6">
                                      {/* Home Group Invitations */}
                                      {(invitationsData || []).filter(
                                          (inv) => inv.status === "pending",
                                      ).length > 0 && (
                                          <div className="space-y-3">
                                              <div className="flex items-center gap-2 px-1">
                                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                                                  <p className="lux-eyebrow text-rose-300/80">
                                                      Home Group Invitations
                                                  </p>
                                                  <div className="flex-1 h-px bg-gradient-to-r from-rose-400/20 to-transparent" />
                                              </div>
                                              {(invitationsData || [])
                                                  .filter((inv) => inv.status === "pending")
                                                  .map((inv) => (
                                                      <div
                                                          key={inv.id}
                                                          className="lux-card lux-rise p-4"
                                                      >
                                                          <div className="flex items-center gap-3.5">
                                                              <div className="lux-monogram w-11 h-11 rounded-2xl bg-rose-500/15 text-rose-300 ring-1 ring-rose-500/20 flex-shrink-0">
                                                                  <Icons.Users className="w-5 h-5" />
                                                              </div>
                                                              <div className="flex-1 min-w-0">
                                                                  <div className="flex items-center gap-2">
                                                                      <p className="text-[13px] font-semibold text-white truncate">
                                                                          {inv.home_group
                                                                              ? inv.home_group.name
                                                                              : "Homegroup Invitation"}
                                                                      </p>
                                                                      <span className="lux-chip bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/25 shrink-0">
                                                                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                                                          Pending
                                                                      </span>
                                                                  </div>
                                                                  <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">
                                                                      {inv.message
                                                                          ? inv.message
                                                                          : "You have been invited to join this homegroup."}
                                                                  </p>
                                                                  <p className="text-[10px] text-gray-500 mt-1.5">
                                                                      {inv.created_at
                                                                          ? new Date(
                                                                                inv.created_at,
                                                                            ).toLocaleDateString(
                                                                                undefined,
                                                                                {
                                                                                    day: "numeric",
                                                                                    month: "short",
                                                                                    year: "numeric",
                                                                                },
                                                                            )
                                                                          : ""}
                                                                  </p>
                                                              </div>
                                                          </div>
                                                      </div>
                                                  ))}
                                          </div>
                                      )}

                                      {/* Department Requests */}
                                      {(deptRequestsData || []).filter(
                                          (r) => r.status === "pending",
                                      ).length > 0 && (
                                          <div className="space-y-3">
                                              <div className="flex items-center gap-2 px-1">
                                                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                                                  <p className="lux-eyebrow text-purple-300/80">
                                                      Department Requests
                                                  </p>
                                                  <div className="flex-1 h-px bg-gradient-to-r from-purple-400/20 to-transparent" />
                                              </div>
                                              {(deptRequestsData || [])
                                                  .filter((r) => r.status === "pending")
                                                  .map((req) => (
                                                      <div
                                                          key={req.id}
                                                          className="lux-card lux-rise p-4"
                                                      >
                                                          <div className="flex items-center gap-3.5">
                                                              <div className="lux-monogram w-11 h-11 rounded-2xl bg-purple-500/15 text-purple-300 ring-1 ring-purple-500/20 flex-shrink-0">
                                                                  <Icons.BuildingOffice className="w-5 h-5" />
                                                              </div>
                                                              <div className="flex-1 min-w-0">
                                                                  <div className="flex items-center gap-2">
                                                                      <p className="text-[13px] font-semibold text-white truncate">
                                                                          {req.department
                                                                              ? req.department.name
                                                                              : "Department Request"}
                                                                      </p>
                                                                      <span className="lux-chip bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/25 shrink-0">
                                                                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                                                          Pending
                                                                      </span>
                                                                  </div>
                                                                  <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">
                                                                      Your request is pending
                                                                      approval from your pastor.
                                                                  </p>
                                                                  <p className="text-[10px] text-gray-500 mt-1.5">
                                                                      {req.created_at
                                                                          ? new Date(
                                                                                req.created_at,
                                                                            ).toLocaleDateString(
                                                                                undefined,
                                                                                {
                                                                                    day: "numeric",
                                                                                    month: "short",
                                                                                    year: "numeric",
                                                                                },
                                                                            )
                                                                          : ""}
                                                                  </p>
                                                              </div>
                                                          </div>
                                                      </div>
                                                  ))}
                                          </div>
                                      )}
                                  </div>
                              )}
                          </div>
                      )}

                      {/* PARTNERSHIP TAB */}
                      {activeTab === "partnership" && (
                           <div className="tab-panel space-y-4">
                               <MembersPartnershipPage />
                           </div>
                      )}

                          {/* PROFILE TAB */}
                          {activeTab === "profile" && (
                              <div className="tab-panel space-y-6">
                                  {/* Profile Header */}
                                  <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0A192F] via-[#112240] to-[#1A365D] border border-white/10 p-6 md:p-8">
                                      <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-[#dfb15b]/10 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
                                      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-amber-500/10 to-transparent rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
                                      <div className="relative flex flex-col md:flex-row md:items-center gap-5">
                                          <div className="flex-shrink-0">
                                              <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-gradient-to-br from-[#dfb15b] to-amber-600 flex items-center justify-center text-white font-bold text-3xl shadow-2xl shadow-[#dfb15b]/20 border-2 border-white/10">
                                                  {(profileForm.user.name || user?.name || "M").charAt(0)}
                                              </div>
                                          </div>
                                          <div className="flex-1 min-w-0">
                                              <p className="text-[10px] font-bold text-[#dfb15b] uppercase tracking-[0.2em] mb-1">Member Profile</p>
                                              <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-1">{profileForm.user.name || user?.name || "Member"}</h2>
                                              <p className="text-sm text-gray-400 font-light">{profileForm.user.email || user?.email}</p>
                                              <div className="flex flex-wrap items-center gap-3 mt-2">
                                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-gray-300 uppercase tracking-wider">
                                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                                      {user?.member?.status || "Active"}
                                                  </span>
                                                  <span className="text-[10px] text-gray-500 uppercase tracking-wider">
                                                      {user?.zone?.name || "No zone"} • {user?.zone?.region?.name || ""}
                                                  </span>
                                              </div>
                                          </div>
                                          <div className="flex-shrink-0 flex items-center gap-3">
                                              {profileSaved && (
                                                  <span className="text-xs text-emerald-400 font-medium">Saved</span>
                                              )}
                                              <button
                                                  onClick={() => {
                                                      if (profileForm.hasChanges) {
                                                          if (confirm("You have unsaved changes. Discard them?")) {
                                                              profileForm.reset({
                                                                  user: {
                                                                      name: user?.name || "",
                                                                      email: user?.email || "",
                                                                      phone: user?.phone || "",
                                                                      address_line_1: user?.address_line_1 || "",
                                                                      address_line_2: user?.address_line_2 || "",
                                                                      city: user?.city || "",
                                                                      province: user?.province || "",
                                                                      country: user?.country || "",
                                                                      postal_code: user?.postal_code || "",
                                                                  },
                                                                  member: {
                                                                      surname: user?.member?.surname || "",
                                                                      date_of_birth: user?.member?.date_of_birth || "",
                                                                      gender_id: user?.member?.gender_id || "",
                                                                      demography_id: user?.member?.demography_id || "",
                                                                  },
                                                              });
                                                          }
                                                      } else {
                                                          profileForm.reset({
                                                              user: {
                                                                  name: user?.name || "",
                                                                  email: user?.email || "",
                                                                  phone: user?.phone || "",
                                                                  address_line_1: user?.address_line_1 || "",
                                                                  address_line_2: user?.address_line_2 || "",
                                                                  city: user?.city || "",
                                                                  province: user?.province || "",
                                                                  country: user?.country || "",
                                                                  postal_code: user?.postal_code || "",
                                                              },
                                                              member: {
                                                                  surname: user?.member?.surname || "",
                                                                  date_of_birth: user?.member?.date_of_birth || "",
                                                                  gender_id: user?.member?.gender_id || "",
                                                                  demography_id: user?.member?.demography_id || "",
                                                              },
                                                          });
                                                      }
                                                  }}
                                                  className="btn bg-white/5 text-white hover:bg-white/10 border border-white/10 px-5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all"
                                              >
                                                  Cancel
                                              </button>
                                              <button
                                                  onClick={handleSaveProfile}
                                                  disabled={profileSaving || !profileForm.hasChanges}
                                                  className="btn bg-gradient-to-r from-[#d4af37] to-amber-600 text-white hover:from-[#d4af37] hover:to-amber-700 transition-all px-5 py-2.5 rounded-xl text-xs font-bold tracking-wide disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#d4af37]/10"
                                              >
                                                  {profileSaving ? "Saving..." : "Save Changes"}
                                              </button>
                                          </div>
                                      </div>
                                  </div>

                                  <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-6 md:p-8 space-y-8">
                                      <div className="flex items-center gap-3 mb-6">
                                          <div className="w-1 h-6 bg-[#d4af37] rounded-full" />
                                          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Profile Information</h3>
                                      </div>

                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                          <div>
                                              <label className="block text-[10px] font-semibold text-gray-400 mb-2 uppercase tracking-wider">Full Name</label>
                                              <input type="text" value={profileForm.user.name} onChange={(e) => profileForm.setUserField("name", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#d4af37]/50 focus:bg-white/10 transition-all" />
                                              {profileForm.getError("user.name") && <p className="text-red-400 text-[10px] mt-1">{profileForm.getError("user.name")}</p>}
                                          </div>
                                          <div>
                                              <label className="block text-[10px] font-semibold text-gray-400 mb-2 uppercase tracking-wider">Email</label>
                                              <input type="email" value={profileForm.user.email} onChange={(e) => profileForm.setUserField("email", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#d4af37]/50 focus:bg-white/10 transition-all" />
                                              {profileForm.getError("user.email") && <p className="text-red-400 text-[10px] mt-1">{profileForm.getError("user.email")}</p>}
                                          </div>
                                          <div>
                                              <label className="block text-[10px] font-semibold text-gray-400 mb-2 uppercase tracking-wider">Phone</label>
                                              <input type="tel" value={profileForm.user.phone} onChange={(e) => profileForm.setUserField("phone", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#d4af37]/50 focus:bg-white/10 transition-all" />
                                              {profileForm.getError("user.phone") && <p className="text-red-400 text-[10px] mt-1">{profileForm.getError("user.phone")}</p>}
                                          </div>
                                          <div>
                                              <label className="block text-[10px] font-semibold text-gray-400 mb-2 uppercase tracking-wider">Member Code</label>
                                              <input type="text" value={user?.member?.member_code || user?.unique_code || "—"} disabled className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-gray-500 cursor-not-allowed" />
                                          </div>
                                          <div>
                                              <label className="block text-[10px] font-semibold text-gray-400 mb-2 uppercase tracking-wider">Surname</label>
                                              <input type="text" value={profileForm.member.surname} onChange={(e) => profileForm.setMemberField("surname", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#d4af37]/50 focus:bg-white/10 transition-all" />
                                              {profileForm.getError("member.surname") && <p className="text-red-400 text-[10px] mt-1">{profileForm.getError("member.surname")}</p>}
                                          </div>
                                          <div>
                                              <label className="block text-[10px] font-semibold text-gray-400 mb-2 uppercase tracking-wider">Date of Birth</label>
                                              <input type="date" value={profileForm.member.date_of_birth} onChange={(e) => profileForm.setMemberField("date_of_birth", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#d4af37]/50 focus:bg-white/10 transition-all" />
                                              {profileForm.getError("member.date_of_birth") && <p className="text-red-400 text-[10px] mt-1">{profileForm.getError("member.date_of_birth")}</p>}
                                          </div>
                                      </div>

                                      <div className="pt-6 border-t border-white/5">
                                          <div className="flex items-center gap-3 mb-6">
                                              <div className="w-1 h-6 bg-[#d4af37] rounded-full" />
                                              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Address</h3>
                                          </div>
                                          <div className="space-y-6">
                                              <div>
                                                  <label className="block text-[10px] font-semibold text-gray-400 mb-2 uppercase tracking-wider">Address Line 1</label>
                                                  <input type="text" value={profileForm.user.address_line_1} onChange={(e) => profileForm.setUserField("address_line_1", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#d4af37]/50 focus:bg-white/10 transition-all" />
                                                  {profileForm.getError("user.address_line_1") && <p className="text-red-400 text-[10px] mt-1">{profileForm.getError("user.address_line_1")}</p>}
                                              </div>
                                              <div>
                                                  <label className="block text-[10px] font-semibold text-gray-400 mb-2 uppercase tracking-wider">Address Line 2</label>
                                                  <input type="text" value={profileForm.user.address_line_2} onChange={(e) => profileForm.setUserField("address_line_2", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#d4af37]/50 focus:bg-white/10 transition-all" />
                                                  {profileForm.getError("user.address_line_2") && <p className="text-red-400 text-[10px] mt-1">{profileForm.getError("user.address_line_2")}</p>}
                                              </div>
                                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                                  <div>
                                                      <label className="block text-[10px] font-semibold text-gray-400 mb-2 uppercase tracking-wider">City</label>
                                                      <input type="text" value={profileForm.user.city} onChange={(e) => profileForm.setUserField("city", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#d4af37]/50 focus:bg-white/10 transition-all" />
                                                      {profileForm.getError("user.city") && <p className="text-red-400 text-[10px] mt-1">{profileForm.getError("user.city")}</p>}
                                                  </div>
                                                  <div>
                                                      <label className="block text-[10px] font-semibold text-gray-400 mb-2 uppercase tracking-wider">Province</label>
                                                      <input type="text" value={profileForm.user.province} onChange={(e) => profileForm.setUserField("province", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#d4af37]/50 focus:bg-white/10 transition-all" />
                                                      {profileForm.getError("user.province") && <p className="text-red-400 text-[10px] mt-1">{profileForm.getError("user.province")}</p>}
                                                  </div>
                                                  <div>
                                                      <label className="block text-[10px] font-semibold text-gray-400 mb-2 uppercase tracking-wider">Country</label>
                                                      <input type="text" value={profileForm.user.country} onChange={(e) => profileForm.setUserField("country", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#d4af37]/50 focus:bg-white/10 transition-all" />
                                                      {profileForm.getError("user.country") && <p className="text-red-400 text-[10px] mt-1">{profileForm.getError("user.country")}</p>}
                                                  </div>
                                                  <div>
                                                      <label className="block text-[10px] font-semibold text-gray-400 mb-2 uppercase tracking-wider">Postal Code</label>
                                                      <input type="text" value={profileForm.user.postal_code} onChange={(e) => profileForm.setUserField("postal_code", e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#d4af37]/50 focus:bg-white/10 transition-all" />
                                                      {profileForm.getError("user.postal_code") && <p className="text-red-400 text-[10px] mt-1">{profileForm.getError("user.postal_code")}</p>}
                                                  </div>
                                              </div>
                                          </div>
                                      </div>

                                      <div className="pt-6 border-t border-white/5">
                                          <div className="flex items-center gap-3 mb-6">
                                              <div className="w-1 h-6 bg-[#d4af37] rounded-full" />
                                              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Church Affiliation</h3>
                                          </div>
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                              <div>
                                                  <label className="block text-[10px] font-semibold text-gray-400 mb-2 uppercase tracking-wider">Zone</label>
                                                  <input type="text" value={user?.zone?.name || "—"} disabled className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-gray-500 cursor-not-allowed" />
                                              </div>
                                              <div>
                                                  <label className="block text-[10px] font-semibold text-gray-400 mb-2 uppercase tracking-wider">Region</label>
                                                  <input type="text" value={user?.zone?.region?.name || "—"} disabled className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-gray-500 cursor-not-allowed" />
                                              </div>
                                              <div>
                                                  <label className="block text-[10px] font-semibold text-gray-400 mb-2 uppercase tracking-wider">Pastor</label>
                                                  <input type="text" value={user?.pastor?.user?.name || user?.zone?.pastor_name || "—"} disabled className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-gray-500 cursor-not-allowed" />
                                              </div>
                                              <div>
                                                  <label className="block text-[10px] font-semibold text-gray-400 mb-2 uppercase tracking-wider">Home Group</label>
                                                  <input type="text" value={user?.home_group?.name || "—"} disabled className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-gray-500 cursor-not-allowed" />
                                              </div>
                                              <div>
                                                  <label className="block text-[10px] font-semibold text-gray-400 mb-2 uppercase tracking-wider">Department</label>
                                                  <input type="text" value={user?.department?.name || "—"} disabled className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-gray-500 cursor-not-allowed" />
                                              </div>
                                              <div>
                                                  <label className="block text-[10px] font-semibold text-gray-400 mb-2 uppercase tracking-wider">Membership Date</label>
                                                  <input type="text" value={user?.member?.membership_date ? new Date(user.member.membership_date).toLocaleDateString() : "—"} disabled className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-gray-500 cursor-not-allowed" />
                                              </div>
                                          </div>
                                      </div>
                                  </div>

                                  {/* Membership Card */}
                                  <MembershipCard user={user} />

                                   {/* Spiritual Journey */}
                                 <SpiritualJourney milestones={user?.spiritual_milestones || []} />
                             </div>
                         )}

                       {/* PRAYER CENTER TAB */}
                       {activeTab === "prayer-center" && (
                           <PrayerCenter />
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
                     title={user?.department ? "My Department" : "Departments"}
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

              {/* Location Entry Modal */}
              {showLocationEntry && (
                  <LocationEntry
                      onComplete={(saved) => {
                          setShowLocationEntry(false);
                          if (saved) {
                              updateUser({
                                  location_captured: true,
                                  address_line_1: saved.address_line_1,
                                  city: saved.city,
                                  country: saved.country,
                                  latitude: saved.latitude,
                                  longitude: saved.longitude,
                              });
                          }
                      }}
                  />
              )}

                {/* Pastor 360 Member View */}
                {selectedMemberFor360 && (
                    <Member360View
                        memberId={selectedMemberFor360}
                        onClose={() => setSelectedMemberFor360(null)}
                    />
                )}

                {/* Leader Promotion Consent Modal */}
                {leaderPromotion && (
                    <LeaderPromotionConsent
                        user={user}
                        onLogout={onLogout}
                    />
                )}
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

