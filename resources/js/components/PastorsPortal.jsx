import React, {
    useState,
    useEffect,
    useMemo,
    useRef,
    useCallback,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import api from "../lib/api.js";
import { useCurrentUser, useUser } from "../context/UserContext";

import DataTable, { SelectionBar, useSelection } from "./ui/DataTable.jsx";

import ZoneTab from "./dashboard/ZoneTab.jsx";
import MembersTab from "./dashboard/MembersTab.jsx";
import HomeGroupsTab from "./dashboard/HomegroupsTab.jsx";
import DepartmentsTab from "./dashboard/DepartmentsTab.jsx";
import EventsPanel from "./events/EventsPanel.jsx";
import PastorsSidebar from "./PastorsSidebar.jsx";
import WeeklyReportForm from "./reports/WeeklyReportForm.jsx";
import ReportsHistory from "./reports/ReportsHistory.jsx";
import NotificationBell from "./notifications/NotificationBell.jsx";
import ProfileSection from "./dashboard/sections/ProfileSection.jsx";
import DashboardStats from "./dashboard/DashboardStats.jsx";
import PastorMembershipCard from "./PastorMembershipCard.jsx";
import PrayerCenter from "./prayer-center/PrayerCenter.jsx";

// ============================================================================
// PREMIUM FLOATING PARTICLES BACKGROUND COMPONENT
// ============================================================================

const FloatingParticles = () => {
    const containerRef = useRef(null);
    const [offset, setOffset] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            const { innerWidth, innerHeight } = window;
            const x = (e.clientX - innerWidth / 2) / 80;
            const y = (e.clientY - innerHeight / 2) / 80;
            setOffset({ x, y });
        };

        if (typeof window !== "undefined") {
            window.addEventListener("mousemove", handleMouseMove);
            return () =>
                window.removeEventListener("mousemove", handleMouseMove);
        }
    }, []);

    const particles = useMemo(() => {
        return Array.from({ length: 20 }).map((_, i) => ({
            id: i,
            size: 3 + Math.random() * 6,
            left: Math.random() * 100,
            top: Math.random() * 100,
            duration: 18 + Math.random() * 15,
            delay: Math.random() * 12,
            opacity: 0.15 + Math.random() * 0.25,
            color: Math.random() > 0.5 ? "gold" : "sky",
        }));
    }, []);

    const keyframesStyle = `
    @keyframes floatUp {
      0% { transform: translateY(100vh) translateX(0px); opacity: 0; }
      10% { opacity: var(--particle-opacity); }
      90% { opacity: var(--particle-opacity); }
      100% { transform: translateY(-100px) translateX(30px); opacity: 0; }
    }
    @keyframes gentlePulse {
      0%, 100% { transform: scale(1); opacity: var(--particle-opacity); }
      50% { transform: scale(1.3); opacity: calc(var(--particle-opacity) * 0.6); }
    }
  `;

    return (
        <>
            <style>{keyframesStyle}</style>
            <div
                ref={containerRef}
                className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
                style={{
                    transform: `translate(${offset.x}px, ${offset.y}px)`,
                    transition: "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)",
                    background:
                        "linear-gradient(135deg, #ffffff 0%, #f0f9ff 25%, #fffbeb 50%, #f0f9ff 75%, #ffffff 100%)",
                }}
            >
                {particles.map((particle) => (
                    <div
                        key={particle.id}
                        className="absolute rounded-full"
                        style={{
                            width: particle.size,
                            height: particle.size,
                            left: `${particle.left}%`,
                            top: `${particle.top}%`,
                            backgroundColor:
                                particle.color === "gold"
                                    ? `rgba(212, 175, 55, ${particle.opacity})`
                                    : `rgba(14, 165, 233, ${particle.opacity})`,
                            boxShadow:
                                particle.color === "gold"
                                    ? `0 0 ${particle.size * 3}px rgba(212, 175, 55, ${particle.opacity * 0.8})`
                                    : `0 0 ${particle.size * 3}px rgba(14, 165, 233, ${particle.opacity * 0.8})`,
                            animation: `floatUp ${particle.duration}s linear infinite, gentlePulse ${particle.duration * 0.6}s ease-in-out infinite`,
                            animationDelay: `${particle.delay}s, ${particle.delay}s`,
                            "--particle-opacity": particle.opacity,
                        }}
                    />
                ))}
                <div
                    className="absolute rounded-full"
                    style={{
                        width: "500px",
                        height: "500px",
                        left: "-100px",
                        top: "20%",
                        background:
                            "radial-gradient(circle, rgba(212, 175, 55, 0.08) 0%, transparent 70%)",
                        filter: "blur(60px)",
                        animation: "gentlePulse 10s ease-in-out infinite",
                    }}
                />
                <div
                    className="absolute rounded-full"
                    style={{
                        width: "600px",
                        height: "600px",
                        right: "-150px",
                        bottom: "10%",
                        background:
                            "radial-gradient(circle, rgba(14, 165, 233, 0.06) 0%, transparent 70%)",
                        filter: "blur(80px)",
                        animation:
                            "gentlePulse 14s ease-in-out infinite reverse",
                    }}
                />
                <div
                    className="absolute rounded-full"
                    style={{
                        width: "400px",
                        height: "400px",
                        left: "50%",
                        top: "50%",
                        transform: "translate(-50%, -50%)",
                        background:
                            "radial-gradient(circle, rgba(255, 251, 240, 0.3) 0%, transparent 70%)",
                        filter: "blur(50px)",
                    }}
                />
            </div>
        </>
    );
};

// ============================================================================
// PREMIUM ICONS
// ============================================================================

const Icons = {
    Dashboard: ({ className }) => (
        <svg
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
            />
        </svg>
    ),
    Users: ({ className }) => (
        <svg
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
            />
        </svg>
    ),
    HomeGroup: ({ className }) => (
        <svg
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
            />
        </svg>
    ),
    BuildingOffice: ({ className }) => (
        <svg
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z"
            />
        </svg>
    ),
    Achievements: ({ className }) => (
        <svg
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
            />
        </svg>
    ),
    HandCoins: ({ className }) => (
        <svg
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125"
            />
        </svg>
    ),
    DocumentChart: ({ className }) => (
        <svg
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
            />
        </svg>
    ),
    MapPin: ({ className }) => (
        <svg
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
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
    Bell: ({ className }) => (
        <svg
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
            />
        </svg>
    ),
    Plus: ({ className }) => (
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
                d="M12 4.5v15m7.5-7.5h-15"
            />
        </svg>
    ),
    MagnifyingGlass: ({ className }) => (
        <svg
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
        </svg>
    ),
    EllipsisHorizontal: ({ className }) => (
        <svg
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
            />
        </svg>
    ),
    UserCircle: ({ className }) => (
        <svg
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
            />
        </svg>
    ),
    ArrowRightOnRectangle: ({ className }) => (
        <svg
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
            />
        </svg>
    ),
    Calendar: ({ className }) => (
        <svg
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
            />
        </svg>
    ),
    ArrowTrendingUp: ({ className }) => (
        <svg
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
            />
        </svg>
    ),
    Gift: ({ className }) => (
        <svg
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m0-9v3.75"
            />
        </svg>
    ),
    HomeAltar: ({ className }) => (
        <svg
            className={className}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
            />
        </svg>
    ),
};

// ============================================================================
// PROFILE DRAWER COMPONENT
// ============================================================================

const ProfileDrawer = ({ user, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || "",
        address: user?.address || "",
        location: user?.location || "",
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        setIsSaving(true);
        setTimeout(() => {
            onSave({ ...user, ...formData });
            setIsSaving(false);
        }, 1000);
    };

    return (
        <>
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                onClick={onClose}
            />
            <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 animate-slideIn">
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between p-6 border-b border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-900">
                            Profile
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl hover:bg-gray-100"
                        >
                            <svg
                                className="w-6 h-6 text-gray-500"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        <div className="flex flex-col items-center">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-xl mb-4">
                                <span className="text-white font-bold text-4xl">
                                    {formData.name?.charAt(0) || "C"}
                                </span>
                            </div>
                            <p className="text-lg font-semibold">
                                {formData.name}
                            </p>
                            <p className="text-sm text-gray-500">
                                {user?.zone?.name || "—"} Zone Pastor
                            </p>
                        </div>
                        <div className="space-y-4">
                            {[
                                {
                                    label: "Full Name",
                                    name: "name",
                                    type: "text",
                                },
                                {
                                    label: "Email",
                                    name: "email",
                                    type: "email",
                                },
                                { label: "Phone", name: "phone", type: "tel" },
                                {
                                    label: "Location",
                                    name: "location",
                                    type: "text",
                                },
                            ].map(({ label, name, type }) => (
                                <div key={name}>
                                    <label className="block text-sm font-medium mb-1">
                                        {label}
                                    </label>
                                    <input
                                        type={type}
                                        name={name}
                                        value={formData[name]}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gold-400"
                                    />
                                </div>
                            ))}
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Address
                                </label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gold-400"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="p-6 border-t space-y-3">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="w-full py-3 bg-gradient-to-r from-gold-400 to-gold-500 text-white font-semibold rounded-xl hover:from-gold-500 disabled:opacity-50"
                        >
                            {isSaving ? "Saving..." : "Save Changes"}
                        </button>
                        <button
                            onClick={onClose}
                            className="w-full py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
            <style>{`@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } } .animate-slideIn { animation: slideIn 0.3s ease-out; }`}</style>
        </>
    );
};

const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: Icons.Dashboard },
    { id: "profile", label: "My Profile", icon: Icons.UserCircle },
    { id: "members", label: "Members", icon: Icons.Users },
    { id: "homegroups", label: "Home Groups", icon: Icons.HomeGroup },
    { id: "departments", label: "Departments", icon: Icons.BuildingOffice },
    { id: "partnership", label: "Partnership", icon: Icons.HandCoins },
    { id: "reports", label: "Reports", icon: Icons.DocumentChart },
    { id: "zone", label: "My Zone", icon: Icons.MapPin },
];

// ============================================================================
// STAT CARD
// ============================================================================

const StatCard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    color,
    trend,
    delay = 0,
}) => (
    <div
        className="group relative overflow-hidden rounded-xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5"
        style={{ animationDelay: `${delay}ms` }}
    >
        <div
            className={`absolute -inset-0.5 bg-gradient-to-r ${color} rounded-xl opacity-0 group-hover:opacity-100 blur-lg transition-all duration-300`}
        ></div>
        <div className="relative bg-white/80 backdrop-blur-sm rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
            <div className="relative p-4">
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 truncate">
                            {title}
                        </p>
                        <p className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                            {value}
                        </p>
                        {subtitle && (
                            <p className="text-gray-400 text-[10px] sm:text-xs mt-0.5 truncate">
                                {subtitle}
                            </p>
                        )}
                        {trend && (
                            <div
                                className={`flex items-center gap-1 mt-1.5 text-xs ${trend > 0 ? "text-emerald-600" : "text-rose-600"}`}
                            >
                                <span className="font-medium">
                                    {trend > 0 ? "+" : ""}
                                    {trend}%
                                </span>
                                <span className="text-gray-400">
                                    vs last week
                                </span>
                            </div>
                        )}
                    </div>
                    <div
                        className={`p-2 rounded-lg bg-gradient-to-br ${color} shadow-md group-hover:scale-105 transition-transform duration-300 shrink-0`}
                    >
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const QuickAction = ({
    icon: Icon,
    label,
    description,
    color,
    onClick,
    delay = 0,
}) => (
    <button
        onClick={onClick}
        className="group relative overflow-hidden rounded-2xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
        style={{ animationDelay: `${delay}ms` }}
    >
        <div
            className={`absolute -inset-0.5 bg-gradient-to-r ${color} rounded-2xl opacity-0 group-hover:opacity-25 blur-lg transition-all duration-300`}
        ></div>
        <div className="relative bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl hover:shadow-2xl p-5 transition-all duration-300">
            <div className="flex items-center gap-4">
                <div
                    className={`p-3 rounded-xl bg-gradient-to-br ${color} shadow-md group-hover:scale-110 transition-transform duration-300`}
                >
                    <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                    <p className="font-semibold text-gray-900">{label}</p>
                    <p className="text-gray-400 text-xs">{description}</p>
                </div>
            </div>
        </div>
    </button>
);

const ActivityItem = ({
    icon: Icon,
    title,
    description,
    time,
    color,
    delay = 0,
}) => (
    <div
        className="group flex items-center gap-3 p-3 rounded-lg hover:bg-white/60 transition-all duration-200 cursor-pointer"
        style={{ animationDelay: `${delay}ms` }}
    >
        <div
            className={`p-2 rounded-md bg-gradient-to-br ${color} shadow-sm group-hover:scale-105 transition-transform duration-200`}
        >
            <Icon className="w-3.5 h-3.5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 text-xs truncate">
                {title}
            </p>
            <p className="text-gray-500 text-[10px] truncate">{description}</p>
        </div>
        <div className="text-gray-400 text-[9px] whitespace-nowrap">{time}</div>
    </div>
);

const Badge = ({ children, variant = "default", className = "" }) => {
    const variants = {
        default: "bg-gray-100 text-gray-600",
        success: "bg-emerald-100 text-emerald-700",
        warning: "bg-amber-100 text-amber-700",
        info: "bg-sky-100 text-sky-700",
        gold: "bg-gold-100 text-gold-700",
    };
    return (
        <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-medium ${variants[variant]} ${className}`}
        >
            {children}
        </span>
    );
};

const Input = ({ icon: Icon, placeholder, value, onChange, type = "text" }) => (
    <div className="relative">
        {Icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Icon className="w-5 h-5" />
            </div>
        )}
        <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className={`w-full bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/60 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold-400/20 focus:border-gold-400 transition-all duration-300 ${Icon ? "pl-12" : "px-4"} py-3`}
        />
    </div>
);

const Button = ({
    children,
    variant = "primary",
    icon: Icon,
    className = "",
    onClick,
    ...props
}) => {
    const variants = {
        primary:
            "bg-gradient-to-r from-gold-400 to-gold-500 text-white hover:from-gold-500 hover:to-gold-600 shadow-lg hover:shadow-xl",
        secondary:
            "bg-white/80 text-gray-700 border border-gray-200/60 hover:bg-white hover:border-gray-300 shadow-lg hover:shadow-xl",
        ghost: "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
    };
    return (
        <button
            onClick={onClick}
            className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] ${variants[variant]} ${className}`}
            {...props}
        >
            {Icon && <Icon className="w-5 h-5" />}
            {children}
        </button>
    );
};

// ============================================================================
// HEADER
// ============================================================================

const Header = ({ title, user, onLogout, onOpenProfile, onNavigate }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);

    return (
        <header className="relative flex items-center justify-between gap-2 px-3 py-2.5 sm:px-6 lg:px-8 lg:py-5 border-b border-gray-100/50 bg-white/40 backdrop-blur-xl">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-400/30 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-400/20 to-transparent"></div>
            <div className="flex items-center gap-2 sm:gap-4 lg:ml-12 min-w-0">
                {title !== "Dashboard" && (
                    <button
                        onClick={() => onNavigate && onNavigate("dashboard")}
                        className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                        title="Back to Dashboard"
                    >
                        <svg
                            className="w-5 h-5 text-gray-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 19l-7-7m0 0l7-7m-7 7h18"
                            />
                        </svg>
                    </button>
                )}
                <div className="min-w-0">
                    <h2 className="text-lg sm:text-2xl font-bold text-gray-900 capitalize tracking-tight truncate">
                        {title}
                    </h2>
                    <p className="text-gray-500 text-xs sm:text-sm mt-0.5 truncate">
                        Welcome back, {user?.name || "Pastor"}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-4 shrink-0">
                <NotificationBell userId={user?.id} onNavigate={onNavigate} />
                <div className="relative">
                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="flex items-center gap-1.5 sm:gap-3 sm:pl-4 sm:border-l border-gray-200 hover:bg-white/50 rounded-xl p-1 transition-all duration-300"
                    >
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl overflow-hidden shadow-lg shadow-gold-500/20">
                            {user?.profile_photo ? (
                                <img
                                    src={user.profile_photo}
                                    alt={user.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
                                    <span className="text-white font-semibold">
                                        {user?.name?.charAt(0) || "P"}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="hidden md:block pr-2">
                            <p className="text-gray-900 text-sm font-semibold">
                                {user?.name || "Pastor"}
                            </p>
                            <p className="text-gray-500 text-xs">
                                {user?.zone?.name || "—"} Zone Pastor
                            </p>
                        </div>
                        <svg
                            className={`w-4 h-4 text-gray-500 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                            />
                        </svg>
                    </button>
                    {dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-[9999]">
                            <div className="px-4 py-3 border-b border-gray-100">
                                <p className="text-sm font-semibold text-gray-900">
                                    {user?.name || "Pastor"}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {user?.zone?.name || "—"} Zone
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setDropdownOpen(false);
                                    onOpenProfile && onOpenProfile();
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                <Icons.UserCircle className="w-5 h-5 text-sky-500" />
                                <span className="font-medium">Profile</span>
                            </button>
                            <button
                                onClick={() => {
                                    setDropdownOpen(false);
                                    onLogout();
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-rose-600 hover:bg-rose-50 transition-colors"
                            >
                                <Icons.ArrowRightOnRectangle className="w-5 h-5" />
                                <span className="font-medium">Logout</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

// ============================================================================
// DASHBOARD CONTENT
// ============================================================================

const DashboardContent = ({ user, onNavigate }) => {
    const queryClient = useQueryClient();

    // Function to manually refresh all dashboard data
    const refreshDashboard = () => {
        queryClient.invalidateQueries({ queryKey: ["pastor-zone-summary"] });
        queryClient.invalidateQueries({ queryKey: ["pastor-dashboard"] });
        queryClient.invalidateQueries({ queryKey: ["pastor-activities"] });
        queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] });
    };

    // Fetch zone summary with caching - refetches every 30 seconds and on window focus
    const {
        data: summaryData,
        isLoading: summaryLoading,
        error: summaryError,
        refetch: refetchSummary,
    } = useQuery({
        queryKey: ["pastor-zone-summary"],
        queryFn: async () => {
            const res = await api.get("/pastors/zone-summary");
            if (!res.data.success)
                throw new Error(res.data.message || "Failed");
            return res.data.data;
        },
        staleTime: 30000, // 30 seconds cache
        gcTime: 300000, // 5 minutes garbage collection
        refetchOnWindowFocus: true,
        retry: 1,
    });

    // Fetch comprehensive dashboard data
    const {
        data: dashboardData,
        isLoading: dashLoading,
        error: dashError,
    } = useQuery({
        queryKey: ["pastor-dashboard"],
        queryFn: async () => {
            const res = await api.get("/pastors/dashboard");
            if (!res.data.success)
                throw new Error(res.data.message || "Failed");
            return res.data.data;
        },
        staleTime: 30000,
        gcTime: 300000, // 5 minutes garbage collection
        refetchOnWindowFocus: true,
    });

    // Fetch recent activities
    const {
        data: activitiesData,
        isLoading: actsLoading,
        error: actsError,
    } = useQuery({
        queryKey: ["pastor-activities"],
        queryFn: async () => {
            const res = await api.get("/pastors/activities");
            if (!res.data.success)
                throw new Error(res.data.message || "Failed");
            return res.data.data;
        },
        staleTime: 15000, // 15 seconds for activities
        refetchOnWindowFocus: true,
    });

    // Derive state from queries
    const stats = summaryData
        ? {
              members: summaryData.total_members,
              homeGroups: summaryData.total_home_groups,
              departments: summaryData.total_departments,
              memberTrend: summaryData.member_trend,
              homeGroupTrend: summaryData.home_group_trend,
              departmentTrend: summaryData.department_trend,
          }
        : {
              members: 0,
              homeGroups: 0,
              departments: 0,
              memberTrend: 0,
              homeGroupTrend: 0,
              departmentTrend: 0,
          };

    const dashboard = dashboardData || null;
    const activities = activitiesData || [];

    // Loading state - true if ANY query is still loading
    const loading = summaryLoading || dashLoading || actsLoading;

    // Error state - combine all errors
    const error =
        summaryError?.message ||
        dashError?.message ||
        actsError?.message ||
        (summaryLoading && "Failed to load dashboard");

    // Transform API activities to UI format
    const activityIcons = {
        new_member: Icons.Users,
        weekly_report: Icons.DocumentChart,
        event: Icons.Calendar,
    };
    const activityColors = {
        new_member: "from-sky-400 to-sky-600",
        weekly_report: "from-emerald-400 to-emerald-600",
        event: "from-purple-400 to-purple-600",
    };

    const renderActivities =
        activities.length > 0
            ? activities.map((act) => ({
                  icon: activityIcons[act.type] || Icons.Achievements,
                  title: act.title,
                  description: act.description,
                  time: act.time,
                  color:
                      activityColors[act.type] || "from-gray-400 to-gray-600",
              }))
            : [];

    return (
        <div className="p-6 space-y-5">
            {/* Welcome Banner */}
            <div className="relative overflow-hidden rounded-xl">
                <div className="absolute inset-0 bg-gradient-to-r from-gold-400/8 via-sky-400/8 to-gold-400/8"></div>
                <div className="relative p-5 backdrop-blur-lg bg-white/50 border border-white/40 rounded-xl shadow-md">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-lg font-semibold text-gray-900 mb-1 flex items-center gap-2">
                                <span
                                    className={`inline-flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-amber-300 to-orange-400 shadow-sm`}
                                >
                                    <svg
                                        className="w-4 h-4 text-white"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </span>
                                Good Morning!
                            </h1>
                            <p className="text-gray-600 text-xs">
                                Zone overview for today.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

{/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {loading ? (
                    <>
                        <div className="relative overflow-hidden rounded-xl bg-white/60 backdrop-blur-lg border border-white/40 shadow-md p-4">
                            <div className="animate-pulse">
                                <div className="h-3 bg-gray-200 rounded w-3/4 mb-1.5"></div>
                                <div className="h-6 bg-gray-200 rounded w-1/2 mb-1"></div>
                                <div className="h-2 bg-gray-200 rounded w-1/4"></div>
                            </div>
                        </div>
                        <div className="relative overflow-hidden rounded-xl bg-white/60 backdrop-blur-lg border border-white/40 shadow-md p-4">
                            <div className="animate-pulse">
                                <div className="h-3 bg-gray-200 rounded w-3/4 mb-1.5"></div>
                                <div className="h-6 bg-gray-200 rounded w-1/2 mb-1"></div>
                                <div className="h-2 bg-gray-200 rounded w-1/4"></div>
                            </div>
                        </div>
                        <div className="relative overflow-hidden rounded-xl bg-white/60 backdrop-blur-lg border border-white/40 shadow-md p-4">
                            <div className="animate-pulse">
                                <div className="h-3 bg-gray-200 rounded w-3/4 mb-1.5"></div>
                                <div className="h-6 bg-gray-200 rounded w-1/2 mb-1"></div>
                                <div className="h-2 bg-gray-200 rounded w-1/4"></div>
                            </div>
                        </div>
                    </>
                ) : error ? (
                    <>
                        <div className="relative overflow-hidden rounded-xl bg-red-50 backdrop-blur-lg border border-red-200 shadow-md p-4">
                            <div className="text-red-600">
                                <h3 className="font-medium text-sm">
                                    Error Loading Stats
                                </h3>
                                <p className="text-xs mt-0.5">{error}</p>
                            </div>
                        </div>
                        <div className="relative overflow-hidden rounded-xl bg-red-50 backdrop-blur-lg border border-red-200 shadow-md p-4">
                            <div className="text-red-600">
                                <h3 className="font-medium text-sm">
                                    Error Loading Stats
                                </h3>
                                <p className="text-xs mt-0.5">{error}</p>
                            </div>
                        </div>
                        <div className="relative overflow-hidden rounded-xl bg-red-50 backdrop-blur-lg border border-red-200 shadow-md p-4">
                            <div className="text-red-600">
                                <h3 className="font-medium text-sm">
                                    Error Loading Stats
                                </h3>
                                <p className="text-xs mt-0.5">{error}</p>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="md:col-span-3">
                        <DashboardStats onNavigate={onNavigate} />
                    </div>
                )}
            </div>

            {/* Quick Access Panel */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <QuickAction
                    icon={Icons.Users}
                    label="Members"
                    description="View and manage zone members"
                    color="from-gold-400 to-gold-600"
                    onClick={() => onNavigate("members")}
                />
                <QuickAction
                    icon={Icons.DocumentChart}
                    label="Reports"
                    description="Submit weekly reports"
                    color="from-sky-400 to-sky-600"
                    onClick={() => onNavigate("reports")}
                />
                <QuickAction
                    icon={Icons.MapPin}
                    label="My Zone"
                    description="Zone overview and history"
                    color="from-emerald-400 to-emerald-600"
                    onClick={() => onNavigate("zone")}
                />
            </div>

            {/* Activity Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                    <div className="relative overflow-hidden rounded-xl bg-white/60 backdrop-blur-lg border border-white/40 shadow-md">
                        <div className="px-4 py-3 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-medium text-gray-900">
                                    Recent Activity
                                </h3>
                                <button
                                    onClick={() => onNavigate("members")}
                                    className="text-[10px] text-gold-600 hover:text-gold-700 font-medium transition-colors"
                                >
                                    View All →
                                </button>
                            </div>
                        </div>
                        <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto scrollbar-hide">
                            {(renderActivities.length > 0
                                ? renderActivities
                                : [
                                      {
                                          icon: Icons.Achievements,
                                          title: "No Recent Activity",
                                          description:
                                              "Activity will appear here",
                                          time: "",
                                          color: "from-gray-400 to-gray-600",
                                      },
                                  ]
                            ).map((activity, idx) => (
                                <ActivityItem
                                    key={idx}
                                    {...activity}
                                    delay={400 + idx * 50}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// PARTNERSHIP TAB: packages come from the database, payments go through the gateway, events use the shared events panel
// ============================================================================

const formatMoney = (amount) => new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(Number(amount || 0));
const openGateway = (detail) => window.dispatchEvent(new CustomEvent("him:give", { detail }));

const PartnershipPage = () => {
    const [activeView, setActiveView] = useState("packages");
    const { data: packages = [], isLoading, isError, refetch } = useQuery({
        queryKey: ["partnership-packages"],
        queryFn: async () => (await api.get("/partnership-packages")).data.data || [],
        staleTime: 300000,
    });

    const tabs = [
        { key: "packages", label: "Packages" },
        { key: "giving", label: "Give" },
        { key: "partners", label: "Partners" },
        { key: "events", label: "Events" },
    ];

    return (
        <div className="space-y-6">
            <nav className="flex flex-wrap gap-2" aria-label="Partnership sections" role="tablist">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        role="tab"
                        aria-selected={activeView === tab.key}
                        onClick={() => setActiveView(tab.key)}
                        className={`h-10 rounded-xl px-4 text-sm font-semibold transition ${activeView === tab.key ? "bg-gradient-to-r from-gold-400 to-gold-500 text-white shadow-md" : "border border-gray-200 bg-white/80 text-gray-600 hover:bg-white"}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>

            {activeView === "packages" && (
                <div>
                    <p className="mb-4 text-sm text-gray-500">Partnership packages set by head office. Choose one to give through the secure payment gateway.</p>
                    {isLoading && <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{[0, 1, 2].map((i) => <div key={i} className="h-48 animate-pulse rounded-2xl bg-gray-100" />)}</div>}
                    {isError && <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">Packages could not be loaded. <button className="font-semibold underline" onClick={() => refetch()}>Try again</button></div>}
                    {!isLoading && !isError && packages.length === 0 && <p className="rounded-xl bg-gray-50 p-6 text-center text-sm text-gray-500">No partnership packages have been published yet.</p>}
                    <div className="grid items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {packages.map((pkg) => (
                            <article key={pkg.id} className="flex h-full flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-900">{pkg.name}</h3>
                                <p className="mt-1 text-3xl font-extrabold text-gray-900">{formatMoney(pkg.monthly_amount)}<span className="text-sm font-medium text-gray-400"> /month</span></p>
                                {pkg.impact_description && <p className="mt-2 text-sm text-gray-500">{pkg.impact_description}</p>}
                                <ul className="mt-3 space-y-1.5 text-sm text-gray-600">
                                    {(Array.isArray(pkg.benefits) ? pkg.benefits : []).map((b) => <li key={b} className="flex gap-2"><span className="text-emerald-500">✓</span>{b}</li>)}
                                </ul>
                                <button onClick={() => openGateway({ type: "partnership", amount: pkg.monthly_amount })} className="mt-auto h-11 rounded-xl bg-gradient-to-r from-gold-400 to-gold-600 px-4 text-sm font-bold text-white shadow">Give {formatMoney(pkg.monthly_amount)}</button>
                            </article>
                        ))}
                    </div>
                </div>
            )}

            {activeView === "giving" && (
                <div className="grid gap-4 sm:grid-cols-3">
                    {[
                        { key: "tithe", label: "Tithe", desc: "10% of income" },
                        { key: "offering", label: "Offering", desc: "Freewill giving" },
                        { key: "family_altar", label: "Seed", desc: "Covenant giving" },
                    ].map((btn) => (
                        <button key={btn.key} onClick={() => openGateway({ type: btn.key })} className="rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm transition hover:shadow-md">
                            <h4 className="text-base font-bold text-gray-900">{btn.label}</h4>
                            <p className="mt-1 text-sm text-gray-500">{btn.desc}</p>
                            <span className="mt-4 inline-block rounded-lg bg-gray-900 px-4 py-2 text-xs font-bold text-white">Give securely</span>
                        </button>
                    ))}
                </div>
            )}

            {activeView === "partners" && <PartnersPage />}
            {activeView === "events" && <EventsPanel />}
        </div>
    );
};

const ReportsPage = ({ user, onBack }) => {
    const [view, setView] = useState("history");

    const handleBack = () => {
        if (view === "form") setView("history");
        else if (onBack) onBack();
    };

    if (view === "form") {
        return (
            <WeeklyReportForm
                user={user}
                onBack={handleBack}
                onSuccess={() => setView("history")}
            />
        );
    }
    return (
        <ReportsHistory
            user={user}
            onBack={handleBack}
            onNewReport={() => setView("form")}
        />
    );
};

const ZoneInfoPage = ({ user }) => (
    <div className="p-4 space-y-4">
        <div>
            <h2 className="text-lg font-semibold text-gray-900">
                Zone Information
            </h2>
            <p className="text-gray-500 text-xs mt-0.5">
                View details about your assigned zone
            </p>
        </div>
        <div className="relative overflow-hidden rounded-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-gold-400/15 to-sky-400/15"></div>
            <div className="relative bg-white/60 backdrop-blur-lg rounded-xl border border-white/40 shadow-md p-5">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-sm">
                        <Icons.MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            {user?.zone?.name || "—"}
                        </h3>
                        <p className="text-gray-500 text-xs">
                            Zonal Pastor: {user?.name || "—"}
                        </p>
                    </div>
                </div>
            </div>
        </div>
        
        {/* Pastor Membership Card */}
        <div>
            <h3 className="text-xs font-bold text-gray-900 mb-2">Pastor ID Card</h3>
            <PastorMembershipCard user={user} />
        </div>
    </div>
);

const PartnersPage = () => {
    const [tier, setTier] = useState("");
    const [status, setStatus] = useState("");
    const [search, setSearch] = useState("");
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const selection = useSelection(partners);

    useEffect(() => {
        setLoading(true);
        setError("");
        const params = new URLSearchParams();
        if (tier) params.set("tier", tier);
        if (status) params.set("status", status);
        if (search) params.set("search", search);
        const url = `pastors/partners?${params.toString()}`;
        api.get(url)
            .then((res) => {
                if (res.data.success) setPartners(res.data.data || []);
                else setError(res.data.message || "Failed to load partners");
            })
            .catch(() => setError("Unable to load partners"))
            .finally(() => setLoading(false));
    }, [tier, status, search]);

    return (
        <div className="p-4 space-y-4">
            <div>
                <h2 className="text-lg font-semibold text-gray-900">
                    Partners
                </h2>
                <p className="text-gray-500 text-xs mt-0.5">
                    Partners within your zone
                </p>
            </div>

            {error && (
                <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                    {error}
                </div>
            )}

            <div className="bg-white/70 backdrop-blur-lg rounded-xl border border-white/40 shadow-md p-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <select
                        value={tier}
                        onChange={(e) => setTier(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 bg-white/70 px-2.5 py-1.5 text-xs"
                    >
                        <option value="">All Tiers</option>
                        <option value="gold">Gold</option>
                        <option value="silver">Silver</option>
                        <option value="platinum">Platinum</option>
                        <option value="jubilee">Jubilee</option>
                        <option value="game_changer">Game Changer</option>
                        <option value="diamond">Diamond</option>
                        <option value="executive">Executive</option>
                        <option value="financial_apostle">
                            Financial Apostle
                        </option>
                    </select>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 bg-white/70 px-2.5 py-1.5 text-xs"
                    >
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="active">Active</option>
                        <option value="expired">Expired</option>
                        <option value="suspended">Suspended</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="inactive">Inactive</option>
                    </select>
                    <input
                        type="text"
                        placeholder="Search partner…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 bg-white/70 px-2.5 py-1.5 text-xs"
                    />
                </div>
            </div>

            <SelectionBar
                count={selection.chosen.length}
                noun="partner"
                onClear={selection.clear}
                actions={[{ label: "Copy numbers", onClick: () => navigator.clipboard?.writeText(selection.chosen.map((x) => x.partner_number).filter(Boolean).join(", ")) }]}
            />
            <DataTable
                columns={[
                    { key: "name", label: "Partner", primary: true, className: "font-semibold", render: (x) => <span data-history-user={x.user_id || undefined}>{x.full_name || x.name || "—"}</span> },
                    { key: "number", label: "Number", className: "font-mono text-xs", render: (x) => x.partner_number || "—" },
                    { key: "tier", label: "Tier", className: "capitalize", render: (x) => x.tier_label || x.tier || "—" },
                    { key: "status", label: "Status", className: "capitalize", render: (x) => x.status || "—" },
                    { key: "pledge", label: "Pledge", render: (x) => `$${x.pledge_amount || 0}` },
                ]}
                rows={partners}
                loading={loading}
                selection={selection}
                pageSize={15}
                noun="partner"
                empty="No partners found"
            />
        </div>
    );
};

// ============================================================================
// MAIN PASTORS PORTAL COMPONENT
// ============================================================================

export default function PastorsPortal({ onLogout }) {
    const user = useCurrentUser();
    const { updateUser } = useUser();
    const queryClient = useQueryClient();
    const [activeItem, setActiveItem] = useState("dashboard");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showProfileDrawer, setShowProfileDrawer] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            setIsMobile(width < 768);
        };
        if (typeof window !== "undefined") {
            handleResize();
            window.addEventListener("resize", handleResize);
            return () => window.removeEventListener("resize", handleResize);
        }
    }, []);

    // Prefetch all tab data on mount to ensure instant loading when navigating
    useEffect(() => {
        if (!user) return;

        // Prefetch members list
        queryClient
            .prefetchQuery({
                queryKey: ["pastor-members"],
                queryFn: async () => {
                    const res = await api.get("/members");
                    if (!res.data.success)
                        throw new Error(
                            res.data.message || "Failed to fetch members",
                        );
                    return res.data.data;
                },
            })
            .catch(() => {});

        // Prefetch home groups
        queryClient
            .prefetchQuery({
                queryKey: ["pastor-homegroups"],
                queryFn: async () => {
                    const res = await api.get("/pastors/home-groups");
                    if (!res.data.success)
                        throw new Error(res.data.message || "Failed");
                    return res.data.data;
                },
            })
            .catch(() => {});

        // Prefetch departments
        queryClient
            .prefetchQuery({
                queryKey: ["departments"],
                queryFn: async () => {
                    const res = await api.get("/departments");
                    if (!res.data.success)
                        throw new Error(res.data.message || "Failed");
                    return res.data.departments || [];
                },
            })
            .catch(() => {});

        // Prefetch reports history
        queryClient
            .prefetchQuery({
                queryKey: ["reports-history"],
                queryFn: async () => {
                    const res = await api.get("/reports/history");
                    if (!res.data.success)
                        throw new Error(res.data.message || "Failed");
                    return res.data.reports || [];
                },
            })
            .catch(() => {});

        // Prefetch dashboard metrics (raw data, component will enrich)
        queryClient
            .prefetchQuery({
                queryKey: ["dashboard-metrics"],
                queryFn: async () => {
                    const res = await api.get("/dashboard/metrics");
                    if (!res.data.success)
                        throw new Error(res.data.message || "Failed");
                    return res.data.data;
                },
            })
            .catch(() => {});

        queryClient
            .prefetchQuery({
                queryKey: ["pastor-dashboard"],
                queryFn: async () => {
                    const res = await api.get("/pastors/dashboard");
                    if (!res.data.success)
                        throw new Error(res.data.message || "Failed");
                    return res.data.data;
                },
            })
            .catch(() => {});

        queryClient
            .prefetchQuery({
                queryKey: ["pastor-activities"],
                queryFn: async () => {
                    const res = await api.get("/pastors/activities");
                    if (!res.data.success)
                        throw new Error(res.data.message || "Failed");
                    return res.data.data;
                },
            })
            .catch(() => {});

        // Prefetch zone summary and history for My Zone tab
        queryClient
            .prefetchQuery({
                queryKey: ["pastor-zone-summary"],
                queryFn: async () => {
                    const res = await api.get("/pastors/zone-summary");
                    if (!res.data.success)
                        throw new Error(res.data.message || "Failed");
                    return res.data.data;
                },
            })
            .catch(() => {});

        queryClient
            .prefetchQuery({
                queryKey: ["pastor-zone-history"],
                queryFn: async () => {
                    const res = await api.get("/pastors/zone-history");
                    if (!res.data.success)
                        throw new Error(res.data.message || "Failed");
                    return res.data.data;
                },
            })
            .catch(() => {});
    }, [user, queryClient]);

    const getPageContent = () => {
        switch (activeItem) {
            case "dashboard":
                return (
                    <DashboardContent user={user} onNavigate={setActiveItem} />
                );
            case "profile":
                return (
                    <ProfileSection
                        user={user}
                        onClose={() => setActiveItem("dashboard")}
                        onUpdate={(updatedUser) => updateUser(updatedUser)}
                    />
                );
            case "members":
                return <MembersTab />;
            case "homegroups":
                return <HomeGroupsTab />;
            case "prayer-center":
                return <PrayerCenter />;
            case "departments":
                return <DepartmentsTab />;
            case "events":
                return <EventsPanel />;
            case "partnership":
                return <PartnershipPage />;
            case "reports":
                return (
                    <ReportsPage
                        user={user}
                        onBack={() => setActiveItem("dashboard")}
                    />
                );
            case "zone":
                return <ZoneTab user={user} />;
            case "partners":
                return <PartnersPage />;
            case "idcard":
                return (
                    <div className="mx-auto max-w-3xl p-1 sm:p-4">
                        <h2 className="mb-1 text-xl font-bold text-gray-900">My ID card</h2>
                        <p className="mb-4 text-sm text-gray-500">Download or print your card. The QR code confirms it is genuine.</p>
                        <PastorMembershipCard user={user} />
                    </div>
                );
            case "more":
                return <DashboardContent user={user} onNavigate={setActiveItem} />;
            default:
                return (
                    <DashboardContent user={user} onNavigate={setActiveItem} />
                );
        }
    };

    const getPageTitle = () =>
        ({
            dashboard: "Dashboard",
            profile: "My Profile",
            members: "Members",
            homegroups: "Home Groups",
            "prayer-center": "Prayer Center",
            departments: "Departments",
            events: "Events",
            partnership: "Partnership",
            reports: "Reports",
            zone: "My Zone",
            partners: "Partners",
            idcard: "My ID Card",
        })[activeItem] || "Dashboard";

    return (
        <div className="relative min-h-screen pb-16 lg:pb-0">
            <FloatingParticles />
            <PastorsSidebar
                activeItem={activeItem}
                onItemClick={setActiveItem}
                user={user}
                onLogout={onLogout}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                isMobile={isMobile}
            />
            <div
                className={`pl-0 lg:pl-72 flex flex-col min-h-screen w-full min-w-0 ${isMobile ? "pb-20" : ""}`}
            >
                {/* Mobile top bar */}
                <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white/80 backdrop-blur-xl border-b border-gray-100 relative z-30">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                        aria-label="Open menu"
                    >
                        <svg
                            className="w-6 h-6 text-gray-700"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4 6h16M4 12h16M4 18h16"
                            />
                        </svg>
                    </button>
                    <div className="flex items-center gap-2">
                        <img
                            src="/images/favicon.ico"
                            alt="HIM Logo"
                            className="w-8 h-8 object-contain"
                        />
                        <p className="text-xs text-gray-500">Pastoral Portal</p>
                    </div>

                </div>

                <div className="flex flex-col flex-1 overflow-hidden">
                    <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl">
                        <Header
                            title={getPageTitle()}
                            user={user}
                            onLogout={onLogout}
                            onOpenProfile={() => setActiveItem("profile")}
                            onNavigate={setActiveItem}
                        />
                    </div>
                    <div className="flex-1 overflow-y-auto bg-white/80 m-2 sm:m-3 lg:m-4 rounded-2xl shadow-md border border-white/40">
                        <main className="flex-1 min-w-0 mx-auto w-full max-w-[1500px] p-3 sm:p-5 lg:p-6">
                            {getPageContent()}
                        </main>
                    </div>
                </div>
            </div>

            {/* Profile Drawer (legacy — kept for backward compat, currently unused) */}
            {showProfileDrawer && (
                <ProfileDrawer
                    user={user}
                    onClose={() => setShowProfileDrawer(false)}
                    onSave={(updatedUser) => {
                        updateUser(updatedUser);
                        setShowProfileDrawer(false);
                    }}
                />
            )}
        </div>
    );
}
