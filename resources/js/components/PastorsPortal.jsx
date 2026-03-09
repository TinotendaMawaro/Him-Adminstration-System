import React, { useState, useEffect, useMemo, useRef } from "react";

import ZoneTab from "./dashboard/ZoneTab.jsx";
import MembersTab from "./dashboard/MembersTab.jsx";
import HomeGroupsTab from "./dashboard/HomegroupsTab.jsx";
import DepartmentsTab from "./dashboard/DepartmentsTab.jsx";
import PastorsSidebar from "./PastorsSidebar.jsx";
import WeeklyReportForm from "./reports/WeeklyReportForm.jsx";
import ReportsHistory from "./reports/ReportsHistory.jsx";
import NotificationBell from "./notifications/NotificationBell.jsx";
import ProfileSection from "./dashboard/sections/ProfileSection.jsx";

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

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
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
                                {user?.zone?.name || user?.zoneName || "IOC"}{" "}
                                Zone Pastor
                            </p>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gold-400"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gold-400"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Phone
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gold-400"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Location
                                </label>
                                <input
                                    type="text"
                                    name="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    placeholder="Enter your location"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gold-400"
                                />
                            </div>
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
    { id: "achievements", label: "Achievements", icon: Icons.Achievements },
    { id: "reports", label: "Reports", icon: Icons.DocumentChart },
    { id: "zone", label: "My Zone", icon: Icons.MapPin },
];

// ============================================================================
// PREMIUM STAT CARD - Frosted Glass with Glow Border on Hover
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
        className="group relative overflow-hidden rounded-2xl transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1"
        style={{ animationDelay: `${delay}ms` }}
    >
        {/* Glow Border Effect on Hover */}
        <div
            className={`absolute -inset-0.5 bg-gradient-to-r ${color} rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500`}
        ></div>

        {/* Card Content - Frosted Glass */}
        <div className="relative bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-transparent"></div>
            <div className="relative p-6">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <p className="text-gray-500 text-sm font-medium mb-1">
                            {title}
                        </p>
                        <p className="text-3xl font-bold text-gray-900 tracking-tight">
                            {value}
                        </p>
                        {subtitle && (
                            <p className="text-gray-400 text-xs mt-1">
                                {subtitle}
                            </p>
                        )}
                        {trend && (
                            <div
                                className={`flex items-center gap-1 mt-2 text-sm ${trend > 0 ? "text-emerald-600" : "text-rose-600"}`}
                            >
                                <span className={trend > 0 ? "↑" : "↓"}>
                                    {Math.abs(trend)}%
                                </span>
                                <span className="text-gray-400">
                                    vs last week
                                </span>
                            </div>
                        )}
                    </div>
                    <div
                        className={`p-3 rounded-xl bg-gradient-to-br ${color} shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                        <Icon className="w-6 h-6 text-white" />
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
        className="group flex items-center gap-4 p-4 rounded-2xl hover:bg-white/60 transition-all duration-300 cursor-pointer"
        style={{ animationDelay: `${delay}ms` }}
    >
        <div
            className={`p-2.5 rounded-xl bg-gradient-to-br ${color} shadow-sm group-hover:scale-110 transition-transform duration-300`}
        >
            <Icon className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">{title}</p>
            <p className="text-gray-500 text-sm truncate">{description}</p>
        </div>
        <div className="text-gray-400 text-xs whitespace-nowrap">{time}</div>
    </div>
);

const TableRow = ({ children, className = "" }) => (
    <tr
        className={`border-b border-gray-100 last:border-0 hover:bg-white/60 transition-colors duration-200 ${className}`}
    >
        {children}
    </tr>
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
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
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
// PREMIUM HEADER - Frosted Glass with Subtle Glow
// ============================================================================

const Header = ({
    title,
    user,
    notifications = 2,
    onLogout,
    onOpenProfile,
    onNavigate,
}) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);

    return (
        <header className="relative flex items-center justify-between px-8 py-5 border-b border-gray-100/50 bg-white/40 backdrop-blur-xl">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-400/30 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-sky-400/20 to-transparent"></div>
            <div className="flex items-center gap-4 ml-12">
                {/* Back Button - Hidden on Dashboard */}
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
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 capitalize tracking-tight">
                        {title}
                    </h2>
                    <p className="text-gray-500 text-sm mt-0.5">
                        Welcome back, {user?.name || "Chipo Vutabwashe"}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <NotificationBell userId={user?.id} />
                {/* Dropdown for Profile and Logout */}
                <div className="relative">
                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="flex items-center gap-3 pl-4 border-l border-gray-200 hover:bg-white/50 rounded-xl p-1 transition-all duration-300"
                    >
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg shadow-gold-500/20">
                            <span className="text-white font-semibold">
                                {user?.name?.charAt(0) || "C"}
                            </span>
                        </div>
                        <div className="hidden md:block pr-2">
                            <p className="text-gray-900 text-sm font-semibold">
                                {user?.name || "Chipo Vutabwashe"}
                            </p>
                            <p className="text-gray-500 text-xs">Zone Pastor</p>
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
                    {/* Dropdown Menu */}
                    {dropdownOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-[9999] animate-fadeIn">
                            <div className="px-4 py-3 border-b border-gray-100">
                                <p className="text-sm font-semibold text-gray-900">
                                    {user?.name || "Chipo Vutabwashe"}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {user?.zone?.name ||
                                        user?.zoneName ||
                                        "IOC"}
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
// PREMIUM DASHBOARD CONTENT - 3 Stat Cards
// ============================================================================

const DashboardContent = ({ user, onNavigate }) => {
    const stats = { members: 245, homeGroups: 12, departments: 8 };
    const activities = [
        {
            icon: Icons.Users,
            title: "New Member Registered",
            description: "Sarah Johnson joined North A Home Group",
            time: "2h ago",
            color: "from-sky-400 to-sky-600",
        },
        {
            icon: Icons.DocumentChart,
            title: "Weekly Report Submitted",
            description: "Week 9 statistics have been recorded",
            time: "5h ago",
            color: "from-emerald-400 to-emerald-600",
        },
        {
            icon: Icons.BuildingOffice,
            title: "New HOD Appointed",
            description: "John Doe as Youth Department Head",
            time: "1d ago",
            color: "from-purple-400 to-purple-600",
        },
        {
            icon: Icons.Achievements,
            title: "Wedding Scheduled",
            description: "March 15, 2026 at Main Sanctuary",
            time: "2d ago",
            color: "from-pink-400 to-pink-600",
        },
    ];

    return (
        <div className="p-8 space-y-8">
            {/* Welcome Banner */}
            <div className="relative overflow-hidden rounded-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-gold-400/10 via-sky-400/10 to-gold-400/10"></div>
                <div className="absolute -right-16 -top-16 w-64 h-64 bg-gold-400/20 rounded-full blur-3xl"></div>
                <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-sky-400/20 rounded-full blur-3xl"></div>
                <div className="relative p-8 backdrop-blur-xl bg-white/50 border border-white/50 rounded-2xl shadow-xl">
                    <div className="flex items-center justify-between">
                        <div>
                            {/* Get Africa time (UTC+2) with Sun/Moon */}
                            {(() => {
                                const now = new Date();
                                const africaOffset = 2; // UTC+2 for Africa/Johannesburg
                                const utcTime =
                                    now.getTime() +
                                    now.getTimezoneOffset() * 60000;
                                const africaTime = new Date(
                                    utcTime + 3600000 * africaOffset,
                                );
                                const hour = africaTime.getHours();
                                const isDay = hour >= 6 && hour < 18;
                                const greeting =
                                    hour < 12
                                        ? "Morning"
                                        : hour < 18
                                          ? "Afternoon"
                                          : "Evening";
                                return (
                                    <>
                                        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                                            <span
                                                className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${isDay ? "bg-gradient-to-br from-amber-300 to-orange-400 shadow-lg shadow-amber-400/50" : "bg-gradient-to-br from-slate-700 to-slate-900 shadow-lg shadow-slate-500/50"} ${isDay ? "animate-pulse" : ""}`}
                                                style={{
                                                    animation: isDay
                                                        ? "sunGlow 3s ease-in-out infinite"
                                                        : "moonGlow 4s ease-in-out infinite",
                                                }}
                                            >
                                                {isDay ? (
                                                    <svg
                                                        className="w-6 h-6 text-white"
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                ) : (
                                                    <svg
                                                        className="w-6 h-6 text-white"
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                    >
                                                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                                                    </svg>
                                                )}
                                            </span>
                                            Good {greeting}!
                                        </h1>
                                        <p className="text-gray-600 text-lg">
                                            Here's what's happening in your zone
                                            today.
                                        </p>
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                </div>
                <style>{`
                    @keyframes sunGlow {
                        0%, 100% { box-shadow: 0 0 20px rgba(251, 191, 36, 0.5); }
                        50% { box-shadow: 0 0 35px rgba(251, 191, 36, 0.8), 0 0 60px rgba(249, 115, 22, 0.4); }
                    }
                    @keyframes moonGlow {
                        0%, 100% { box-shadow: 0 0 15px rgba(148, 163, 184, 0.4); }
                        50% { box-shadow: 0 0 25px rgba(148, 163, 184, 0.6), 0 0 40px rgba(100, 116, 139, 0.3); }
                    }
                `}</style>
            </div>

            {/* Stats Grid - 3 Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Total Members"
                    value={stats.members}
                    subtitle="Across all home groups"
                    icon={Icons.Users}
                    color="from-sky-400 to-sky-600"
                    trend={5}
                    delay={0}
                />
                <StatCard
                    title="Total Home Groups"
                    value={stats.homeGroups}
                    subtitle="Active groups"
                    icon={Icons.HomeGroup}
                    color="from-emerald-400 to-emerald-600"
                    trend={12}
                    delay={50}
                />
                <StatCard
                    title="Total Departments"
                    value={stats.departments}
                    subtitle="With appointed HODs"
                    icon={Icons.BuildingOffice}
                    color="from-purple-400 to-purple-600"
                    delay={100}
                />
            </div>

            {/* Quick Actions */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 px-2">
                    Quick Actions
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <QuickAction
                        icon={Icons.Plus}
                        label="Register Member"
                        description="Add new member to zone"
                        color="from-sky-400 to-sky-600"
                        onClick={() => onNavigate("members")}
                        delay={200}
                    />
                    <QuickAction
                        icon={Icons.DocumentChart}
                        label="Submit Report"
                        description="Weekly statistics"
                        color="from-emerald-400 to-emerald-600"
                        onClick={() => onNavigate("reports")}
                        delay={250}
                    />
                    <QuickAction
                        icon={Icons.BuildingOffice}
                        label="Appoint HOD"
                        description="Assign department head"
                        color="from-purple-400 to-purple-600"
                        onClick={() => onNavigate("departments")}
                        delay={300}
                    />
                    <QuickAction
                        icon={Icons.Achievements}
                        label="Record Achievement"
                        description="Log church milestone"
                        color="from-gold-400 to-gold-600"
                        onClick={() => onNavigate("achievements")}
                        delay={350}
                    />
                </div>
            </div>

            {/* Activity & Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <div className="relative overflow-hidden rounded-2xl bg-white/60 backdrop-blur-xl border border-white/50 shadow-xl">
                        <div className="px-6 py-5 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Recent Activity
                                </h3>
                                <button className="text-gold-600 hover:text-gold-700 text-sm font-medium transition-colors">
                                    View All →
                                </button>
                            </div>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {activities.map((activity, idx) => (
                                <ActivityItem
                                    key={idx}
                                    {...activity}
                                    delay={400 + idx * 50}
                                />
                            ))}
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-1">
                    <div className="relative overflow-hidden rounded-2xl bg-white/60 backdrop-blur-xl border border-white/50 shadow-xl h-full">
                        <div className="px-6 py-5 border-b border-gray-100">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    Recent Achievements
                                </h3>
                                <span className="bg-gold-100 text-gold-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                                    3
                                </span>
                            </div>
                        </div>
                        <div className="p-4 space-y-3">
                            {[
                                {
                                    title: "Youth Service Milestone",
                                    department: "Youth Dept",
                                    date: "March 10",
                                    status: "approved",
                                },
                                {
                                    title: "100% Attendance Goal",
                                    department: "Prayer Team",
                                    date: "March 5",
                                    status: "approved",
                                },
                                {
                                    title: "New Converts Milestone",
                                    department: "Evangelism",
                                    date: "Feb 28",
                                    status: "pending",
                                },
                            ].map((achievement, idx) => (
                                <div
                                    key={idx}
                                    className="p-4 rounded-2xl bg-white/60 hover:bg-white transition-colors duration-200 cursor-pointer group"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="font-semibold text-gray-900">
                                            {achievement.title}
                                        </p>
                                        <Badge
                                            variant={
                                                achievement.status ===
                                                "approved"
                                                    ? "success"
                                                    : "warning"
                                            }
                                        >
                                            {achievement.status}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-500 text-sm">
                                        <div className="flex items-center gap-1">
                                            <Icons.BuildingOffice className="w-4 h-4" />
                                            <span>
                                                {achievement.department}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// ADDITIONAL PAGES (Simplified for brevity)
// ============================================================================

const MembersPage = () => (
    <div className="p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">
                    Zone Members
                </h2>
                <p className="text-gray-500 mt-1">
                    Manage your zone's member directory
                </p>
            </div>
            <Button icon={Icons.Plus}>Register New Member</Button>
        </div>
        <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl p-4">
            <Input
                icon={Icons.MagnifyingGlass}
                placeholder="Search members..."
                value=""
                onChange={() => {}}
            />
        </div>
        <div className="bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl overflow-hidden">
            <table className="w-full">
                <thead className="bg-white/60 border-b border-gray-100">
                    <tr>
                        <th className="text-left px-6 py-4 text-gray-500 font-semibold text-sm">
                            Member
                        </th>
                        <th className="text-left px-6 py-4 text-gray-500 font-semibold text-sm">
                            Contact
                        </th>
                        <th className="text-left px-6 py-4 text-gray-500 font-semibold text-sm">
                            Home Group
                        </th>
                        <th className="text-left px-6 py-4 text-gray-500 font-semibold text-sm">
                            Status
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {[
                        {
                            name: "John Doe",
                            email: "john@example.com",
                            phone: "0771234567",
                            homeGroup: "North A",
                            status: "active",
                        },
                        {
                            name: "Jane Smith",
                            email: "jane@example.com",
                            phone: "0772345678",
                            homeGroup: "North B",
                            status: "active",
                        },
                    ].map((member) => (
                        <TableRow key={member.id}>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center">
                                        <span className="text-white font-semibold">
                                            {member.name.charAt(0)}
                                        </span>
                                    </div>
                                    <span className="font-medium text-gray-900">
                                        {member.name}
                                    </span>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-gray-600">
                                {member.email}
                            </td>
                            <td className="px-6 py-4 text-gray-600">
                                {member.homeGroup}
                            </td>
                            <td className="px-6 py-4">
                                <Badge
                                    variant={
                                        member.status === "active"
                                            ? "success"
                                            : "default"
                                    }
                                >
                                    {member.status}
                                </Badge>
                            </td>
                        </TableRow>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

const HomeGroupsPage = () => (
    <div className="p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">
                    Home Groups
                </h2>
                <p className="text-gray-500 mt-1">
                    Manage your zone's home groups
                </p>
            </div>
            <Button icon={Icons.Plus}>Create Home Group</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
                {
                    id: 1,
                    name: "North A",
                    leader: "John Doe",
                    members: 25,
                    meetings: "Sunday 2PM",
                    status: "active",
                },
                {
                    id: 2,
                    name: "North B",
                    leader: "Jane Smith",
                    members: 20,
                    meetings: "Wednesday 6PM",
                    status: "active",
                },
                {
                    id: 3,
                    name: "Central",
                    leader: "Mike Johnson",
                    members: 30,
                    meetings: "Friday 7PM",
                    status: "active",
                },
            ].map((group) => (
                <div
                    key={group.id}
                    className="group relative bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden"
                >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-gold-400/20 to-sky-400/20 rounded-2xl opacity-0 group-hover:opacity-100 blur-lg transition-all duration-300"></div>
                    <div className="relative p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">
                                    {group.name}
                                </h3>
                                <Badge
                                    variant={
                                        group.status === "active"
                                            ? "success"
                                            : "default"
                                    }
                                    className="mt-2"
                                >
                                    {group.status}
                                </Badge>
                            </div>
                        </div>
                        <div className="space-y-2 text-gray-600 text-sm">
                            <p>Leader: {group.leader}</p>
                            <p>{group.members} members</p>
                            <p>{group.meetings}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const DepartmentsPage = () => (
    <div className="p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">
                    Departments & HODs
                </h2>
                <p className="text-gray-500 mt-1">
                    Manage departments and their heads
                </p>
            </div>
            <Button icon={Icons.Plus}>Add Department</Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
                {
                    id: 1,
                    name: "Youth",
                    hod: "John Doe",
                    members: 45,
                    email: "youth@him.org",
                    color: "from-sky-400 to-sky-600",
                },
                {
                    id: 2,
                    name: "Worship",
                    hod: "Jane Smith",
                    members: 30,
                    email: "worship@him.org",
                    color: "from-purple-400 to-purple-600",
                },
            ].map((dept) => (
                <div
                    key={dept.id}
                    className="group relative bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden"
                >
                    <div className={`h-1 bg-gradient-to-r ${dept.color}`}></div>
                    <div className="relative p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">
                                    {dept.name}
                                </h3>
                                <p className="text-gray-400 text-sm">
                                    {dept.email}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 mb-4 p-3 rounded-2xl bg-white/60">
                            <div
                                className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${dept.color} flex items-center justify-center shadow-lg`}
                            >
                                <span className="text-white font-bold text-lg">
                                    {dept.hod.charAt(0)}
                                </span>
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900">
                                    {dept.hod}
                                </p>
                                <p className="text-gray-500 text-sm">
                                    Head of Department
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <span className="text-gray-500 text-sm">
                                {dept.members} members
                            </span>
                            <button className="text-gold-600 hover:text-gold-700 text-sm font-medium">
                                View Members →
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const AchievementsPage = () => (
    <div className="p-8 space-y-6">
        <div>
            <h2 className="text-2xl font-bold text-gray-900">Achievements</h2>
            <p className="text-gray-500 mt-1">
                Recognize and track church milestones
            </p>
        </div>
    </div>
);

const ReportsPage = ({ user, onBack }) => {
    const [view, setView] = useState('history'); // 'form' or 'history'
    
    const handleBack = () => {
        if (view === 'form') {
            setView('history');
        } else if (onBack) {
            onBack();
        }
    };
    
    if (view === 'form') {
        return (
            <WeeklyReportForm 
                user={user} 
                onBack={handleBack}
                onSuccess={() => setView('history')}
            />
        );
    }
    
    return (
        <ReportsHistory 
            user={user} 
            onBack={handleBack}
            onNewReport={() => setView('form')}
        />
    );
};

const ZoneInfoPage = ({ user }) => (
    <div className="p-8 space-y-6">
        <div>
            <h2 className="text-2xl font-bold text-gray-900">
                Zone Information
            </h2>
            <p className="text-gray-500 mt-1">
                View details about your assigned zone
            </p>
        </div>
        <div className="relative overflow-hidden rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-gold-400/20 to-sky-400/20"></div>
            <div className="relative bg-white/60 backdrop-blur-xl rounded-2xl border border-white/50 shadow-xl p-8">
                <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg shadow-gold-500/30">
                        <Icons.MapPin className="w-10 h-10 text-white" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900">
                            {user?.zone || "North Zone"}
                        </h3>
                        <p className="text-gray-500 mt-1">
                            Zonal Pastor: {user?.name || "Pastor John"}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

// ============================================================================
// MAIN PASTORS PORTAL COMPONENT
// ============================================================================

export default function PastorsPortal({ user: initialUser, onLogout }) {
    const [activeItem, setActiveItem] = useState("dashboard");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showProfileDrawer, setShowProfileDrawer] = useState(false);
    const [user, setUser] = useState(initialUser);
    const [isMobile, setIsMobile] = useState(false);
    const [isTablet, setIsTablet] = useState(false);

    // Detect screen size for responsive design
    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            setIsMobile(width < 768);
            setIsTablet(width >= 768 && width < 1024);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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
                        onUpdate={(updatedUser) => {
                            setUser(updatedUser);
                        }}
                    />
                );
            case "members":
                return <MembersTab />;
            case "homegroups":
                return <HomeGroupsTab />;
            case "departments":
                return <DepartmentsTab />;
            case "achievements":
                return <AchievementsPage />;
            case "reports":
                return <ReportsPage user={user} onBack={() => setActiveItem("dashboard")} />;
            case "zone":
                return <ZoneTab user={user} />;
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
            departments: "Departments",
            achievements: "Achievements",
            reports: "Reports",
            zone: "My Zone",
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
            <div className={`pl-0 lg:pl-64 flex flex-col min-h-screen w-full ${isMobile ? 'pb-20' : ''}`}>
                <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-30">
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
                        <div className="flex-1">
                            {/* <h1 className="text-lg font-bold text-gray-900">
                                HIM
                            </h1> */}
                            <p className="text-xs text-gray-500">
                                Pastoral Portal
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 rounded-xl hover:bg-gray-100 transition-colors relative">
                            <Icons.Bell className="w-5 h-5 text-gray-600" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
                        </button>
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-lg">
                            <span className="text-white font-semibold text-sm">
                                {user?.name?.charAt(0) || "P"}
                            </span>
                        </div>
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
                    <div className="flex-1 overflow-y-auto bg-white/60 backdrop-blur-2xl m-2 lg:m-4 rounded-2xl shadow-2xl border border-white/50">
                        <main className="flex-1 p-4 lg:p-6">
                            {getPageContent()}
                        </main>
                    </div>
                </div>
            </div>
            {/* Profile Drawer */}
            {showProfileDrawer && (
                <ProfileDrawer
                    user={user}
                    onClose={() => setShowProfileDrawer(false)}
                    onSave={(updatedUser) => {
                        setUser(updatedUser);
                        setShowProfileDrawer(false);
                    }}
                />
            )}
        </div>
    );
}
