// ============================================================================
// HOD PORTAL - Homegroup Leader Workspace
// Inherits Members Portal features + leader management + zonal pastor communication
// ============================================================================

import React, { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useUser } from "../context/UserContext";
import api from "../lib/api";
import { Icons } from "./MembersPortal";
import HomeGroupSelector from "./HomeGroupSelector.jsx";
import RecommendedHomeGroupCard from "./dashboard/RecommendedHomeGroupCard.jsx";
import ProfileCompletenessNudge from "./dashboard/sections/ProfileCompletenessNudge.jsx";
import EventsTab, { FALLBACK_EVENTS } from "./dashboard/EventsTab.jsx";
import HODActivitiesPage from "./dashboard/hod/HODActivities";
import HODAchievementsPage from "./dashboard/hod/HODAchievements";
import DepartmentReportsPage from "./dashboard/hod/DepartmentReports";
import DepartmentProfilePage from "./dashboard/hod/DepartmentProfile";
import IdCardPanel from "./IdCardPanel.jsx";
import DepartmentMembersPage from "./dashboard/hod/DepartmentMembers";
import DepartmentWorkspace from "./dashboard/hod/DepartmentWorkspace";

// ============================================================================
// SHARED SECTIONS (inlined to avoid circular deps)
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
                        <button onClick={onViewHomegroup} className="lux-link">
                            View all <span aria-hidden="true">→</span>
                        </button>
                    </div>
                    <div className="lux-divider mb-5"></div>
                    <div className="flex items-center gap-4">
                        <div className="lux-monogram w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-emerald-600/25 ring-1 ring-emerald-400/25 text-emerald-200">
                            <Icons.Users className="w-7 h-7" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-base font-semibold text-white truncate tracking-tight">{hg.name}</p>
                            <span className="lux-chip mt-2 bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/25">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                Active membership
                            </span>
                        </div>
                    </div>
                    {!isLeader && (
                        <button onClick={() => onRequestLeave("homegroup")} className="lux-btn mt-auto w-full py-2.5 text-xs text-rose-300 bg-white/5 ring-1 ring-rose-500/25 hover:bg-rose-500/10 hover:ring-rose-500/40">
                            Request to leave group
                        </button>
                    )}
                    {isLeader && (
                        <p className="mt-6 text-[11px] text-gray-500 leading-relaxed text-center">
                            You lead this group. Contact your pastor to transfer leadership before leaving.
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
                <h3 className="text-lg font-semibold text-white mb-2 font-serif tracking-tight">Find your people</h3>
                <p className="text-[13px] text-gray-400 mb-5 max-w-xs mx-auto leading-relaxed">
                    Join a homegroup to connect with fellow members, grow spiritually, and belong to a community that cares.
                </p>
                <button onClick={onBrowseHomegroups || onViewHomegroup} disabled={homegroupLoading} className="lux-btn mt-auto w-full py-3 text-sm bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-900/30 hover:from-emerald-400 hover:to-emerald-500 disabled:opacity-70">
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
                        <button onClick={onViewDepartments} className="lux-link">
                            View all <span aria-hidden="true">→</span>
                        </button>
                    </div>
                    <div className="lux-divider mb-5"></div>
                    <div className="flex items-center gap-4">
                        <div className="lux-monogram w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-400/20 to-purple-600/25 ring-1 ring-purple-400/25 text-purple-200">
                            <Icons.BuildingOffice className="w-7 h-7" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-base font-semibold text-white truncate tracking-tight">{dept.name}</p>
                            <span className="lux-chip mt-2 bg-purple-500/10 text-purple-300 ring-1 ring-purple-500/25">
                                <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                                Active ministry
                            </span>
                        </div>
                    </div>
                    {!isHod && (
                        <button onClick={() => onRequestLeave("department")} className="lux-btn mt-auto w-full py-2.5 text-xs text-rose-300 bg-white/5 ring-1 ring-rose-500/25 hover:bg-rose-500/10 hover:ring-rose-500/40">
                            Request to leave department
                        </button>
                    )}
                    {isHod && (
                        <p className="mt-6 text-[11px] text-gray-500 leading-relaxed text-center">
                            You head this department. Contact your pastor to transfer leadership before leaving.
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
                <h3 className="text-lg font-semibold text-white mb-2 font-serif tracking-tight">Discover your calling</h3>
                <p className="text-[13px] text-gray-400 mb-5 max-w-xs mx-auto leading-relaxed">
                    Serve alongside other members and use your gifts to make a difference in the house.
                </p>
                <div className="rounded-2xl bg-purple-500/10 ring-1 ring-purple-500/15 p-3.5 mb-5 text-left">
                    <div className="flex items-center gap-2 mb-1">
                        <Icons.Star className="w-3.5 h-3.5 text-purple-300" />
                        <p className="text-[11px] font-semibold text-purple-200 uppercase tracking-wide">Suggested ministry</p>
                    </div>
                    <p className="text-sm font-semibold text-white">Media & ICT</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">4 open positions · Training available</p>
                </div>
                <button onClick={onViewDepartments} className="lux-btn mt-auto w-full py-3 text-sm bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg shadow-purple-900/30 hover:from-purple-400 hover:to-purple-500">
                    Browse departments
                </button>
            </div>
        </div>
    );
};

// ============================================================================
// DEPARTMENT PARTNERSHIP PAGE (inline - no separate file)
// ============================================================================

const DepartmentPartnershipPage = ({ user }) => {
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        setLoading(true);
        setError("");
        api.get("/pastors/partners")
            .then(res => {
                if (res.data.success) setPartners(res.data.data || []);
                else setError(res.data.message || "Failed to load partners");
            })
            .catch(() => setError("Unable to load partners"))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="p-6 space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Partnership</h2>
                <p className="text-gray-500 text-sm mt-1">Partnership insights for {user?.department?.name || "your department"}</p>
            </div>

            {error && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}

            {loading ? (
                <div className="text-center py-8 text-gray-500">Loading partnership data...</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-lg p-6">
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Partners</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{partners.length}</p>
                    </div>
                    <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-lg p-6">
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Active Partners</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">{partners.filter(p => p.status === "active").length}</p>
                    </div>
                    <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50 shadow-lg p-6">
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Pledge</p>
                        <p className="text-3xl font-bold text-gray-900 mt-2">${partners.reduce((sum, p) => sum + (parseFloat(p.pledge_amount) || 0), 0).toLocaleString()}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

// ============================================================================
// MAIN HOD PORTAL COMPONENT
// ============================================================================
// HOME TAB DASHBOARD
// ============================================================================

const HODHomeTab = ({ user, onLogout }) => {
    const { data: homeEventsData } = useQuery({
        queryKey: ["home-upcoming-events"],
        queryFn: async () => {
            const res = await api.get("/events?upcoming=true");
            if (!res.data.success) throw new Error();
            return res.data.data || [];
        },
        staleTime: 30000,
    });

    const upcomingEvents = (homeEventsData && homeEventsData.length > 0 ? homeEventsData : FALLBACK_EVENTS)
        .filter((e) => !e.is_past)
        .sort((a, b) => new Date(a.starts_at) - new Date(b.starts_at))
        .slice(0, 4);

    return (
        <div className="space-y-4">
            <div className="gradient-border card-hover p-5">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-white">
                            Good Evening{user?.name ? `, ${user.name.split(" ")[0]}` : ""}{" "}
                            <span className="text-[#d4af37]">👋</span>
                        </h2>
                        <p className="text-sm text-gray-300 mt-1">
                            Welcome to Heartfelt International Ministries
                        </p>
                    </div>
                    <div className="text-right">
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                            HOMEGROUP LEADER <Icons.ShieldCheck className="w-3 h-3" />
                        </span>
                        <span className="block text-xs text-gray-400 mt-1">VERIFIED</span>
                        {user?.zone?.name && (
                            <p className="text-xs text-gray-400 mt-2">
                                You lead the {user.home_group?.name || "homegroup"} in the {user.zone.name} zone.
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="gradient-border p-3">
                    <p className="text-[10px] text-gray-400 font-medium uppercase">Membership Code</p>
                    <p className="text-sm font-bold text-white font-mono">{user?.unique_code || user?.member?.member_code || "xxxxx"}</p>
                </div>
                <div className="gradient-border p-3">
                    <p className="text-[10px] text-gray-400 font-medium uppercase">Zone</p>
                    <p className="text-sm font-bold text-white">{user?.zone?.name || "xxx"}</p>
                </div>
                <div className="gradient-border p-3">
                    <p className="text-[10px] text-gray-400 font-medium uppercase">Region</p>
                    <p className="text-sm font-bold text-white">{user?.zone?.region?.name || "xxx"}</p>
                </div>
                <div className="gradient-border p-3">
                    <p className="text-[10px] text-gray-400 font-medium uppercase">Pastor</p>
                    <p className="text-sm font-bold text-white truncate">{user?.pastor?.user?.name || user?.zone?.pastor_name || "xxx"}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <HomegroupSection
                    user={user}
                    onViewHomegroup={() => {}}
                    onRequestLeave={() => {}}
                    homegroupLoading={false}
                    onBrowseHomegroups={() => {}}
                />
                <DepartmentsSection
                    user={user}
                    onViewDepartments={() => {}}
                    onRequestLeave={() => {}}
                />
            </div>

            <ProfileCompletenessNudge user={user} />

            <div className="gradient-border p-4">
                <h3 className="text-xs font-bold text-white mb-3 flex items-center gap-2">
                    <Icons.ChartBar className="w-4 h-4 text-[#d4af37]" />
                    Spiritual Progress
                </h3>
                <div className="grid grid-cols-4 gap-3">
                    <div className="text-center">
                        <p className="text-lg font-bold text-white">{upcomingEvents.length}</p>
                        <p className="text-[9px] text-gray-400">Upcoming Events</p>
                    </div>
                    <div className="text-center">
                        <p className="text-lg font-bold text-white">Leader</p>
                        <p className="text-[9px] text-gray-400">Role</p>
                    </div>
                    <div className="text-center">
                        <p className="text-lg font-bold text-white">{user?.department ? "1" : "0"} <span className="text-[10px]">/1</span></p>
                        <p className="text-[9px] text-gray-400">Departments</p>
                    </div>
                    <div className="text-center">
                        <p className="text-lg font-bold text-purple-400">Active</p>
                        <p className="text-[9px] text-gray-400">Status</p>
                    </div>
                </div>
            </div>

            <div>
                <div className="flex items-center justify-between mb-2.5">
                    <h3 className="text-xs font-bold text-white">Upcoming Events</h3>
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
                        { id: 1, text: "Review your homegroup member list" },
                        { id: 2, text: "Connect with your Zonal Pastor" },
                        { id: 3, text: "Submit weekly homegroup report" },
                        { id: 4, text: "Complete your digital profile" },
                    ].map((item) => (
                        <label key={item.id} className="flex items-center gap-2 text-[10px]">
                            <input type="checkbox" className="w-3 h-3 rounded border-gray-600 bg-white/10" />
                            <span className="text-gray-300">{item.text}</span>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// MY HOMEGROUP TAB - Member Management
// ============================================================================

const HODMyHomegroupTab = ({ user }) => {
    const [homeGroup, setHomeGroup] = useState(null);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchHomeGroup = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const res = await api.get("/home-group/my");
            if (res.data.success && res.data.member) {
                setHomeGroup(res.data.member.home_group || null);
                if (res.data.member.home_group?.id) {
                    const membersRes = await api.get(`/home-group/${res.data.member.home_group.id}/members`);
                    if (membersRes.data.success) {
                        setMembers(membersRes.data.members || []);
                    }
                }
            }
        } catch (err) {
            setError("Failed to load homegroup data.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchHomeGroup();
    }, [fetchHomeGroup]);

    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="w-10 h-10 border-4 border-gray-700 border-t-[#d4af37] rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-sm text-gray-400">Loading your homegroup...</p>
            </div>
        );
    }

    if (error) {
        return <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">{error}</div>;
    }

    if (!homeGroup) {
        return (
            <div className="text-center py-12">
                <Icons.Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-sm text-gray-400">No homegroup assigned.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="gradient-border card-hover p-5">
                <div className="flex items-center gap-4">
                    <div className="lux-monogram w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-emerald-600/25 ring-1 ring-emerald-400/25 text-emerald-200">
                        <Icons.Users className="w-7 h-7" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">{homeGroup.name}</h3>
                        <p className="text-sm text-gray-400">{homeGroup.location || "No location set"}</p>
                        <p className="text-xs text-gray-500 mt-1">
                            {members.length} member{members.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-white/5">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Members</h3>
                </div>
                <div className="divide-y divide-white/5">
                    {members.map((member) => (
                        <div key={member.id} className="p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400/20 to-sky-600/25 ring-1 ring-sky-400/25 text-sky-200 flex items-center justify-center">
                                <span className="text-sm font-bold">
                                    {(member.name || "U").charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-white truncate">{member.name}</p>
                                <p className="text-xs text-gray-500">{member.email}</p>
                            </div>
                            <span className="text-[10px] px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/25">
                                {member.role === "leader" ? "Leader" : "Member"}
                            </span>
                        </div>
                    ))}
                    {members.length === 0 && (
                        <div className="p-8 text-center text-gray-500 text-sm">
                            No members found in this homegroup.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ============================================================================
// MESSAGES TAB - Zonal Pastor Communication
// ============================================================================

const HODMessagesTab = ({ user }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [sending, setSending] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchMessages = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get("/messages");
            if (res.data.success) {
                setMessages(res.data.messages || []);
            }
        } catch (err) {
            console.error("Failed to load messages", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setSending(true);
        try {
            const res = await api.post("/messages", {
                recipient_id: user?.zone?.pastor_id,
                content: newMessage,
            });
            if (res.data.success) {
                setMessages((prev) => [...prev, res.data.message]);
                setNewMessage("");
            }
        } catch (err) {
            console.error("Failed to send message", err);
        } finally {
            setSending(false);
        }
    };

    const zonalPastor = user?.zone?.pastors?.find((p) => (p.unique_code || "").endsWith("P01")) || user?.pastor?.user;

    return (
        <div className="space-y-6">
            <div className="gradient-border card-hover p-5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d4af37]/20 to-amber-600/25 ring-1 ring-[#d4af37]/30 text-[#d4af37] flex items-center justify-center">
                        <Icons.ChatBubble className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white">Zonal Pastor Communication</h3>
                        <p className="text-xs text-gray-400">
                            Direct line to {zonalPastor?.name || "your Zonal Pastor"}
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <div className="h-96 overflow-y-auto p-4 space-y-3">
                    {loading ? (
                        <div className="text-center py-8 text-gray-500 text-sm">Loading messages...</div>
                    ) : messages.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 text-sm">
                            No messages yet. Start a conversation with your Zonal Pastor.
                        </div>
                    ) : (
                        messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.sender_id === user?.id ? "justify-end" : "justify-start"}`}
                            >
                                <div
                                    className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                                        msg.sender_id === user?.id
                                            ? "bg-[#d4af37]/20 text-white"
                                            : "bg-white/10 text-gray-200"
                                    }`}
                                >
                                    <p className="text-xs">{msg.content}</p>
                                    <p className="text-[10px] text-gray-500 mt-1">
                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                <form onSubmit={handleSend} className="p-4 border-t border-white/5">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Message your Zonal Pastor..."
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-[#d4af37]/50"
                        />
                        <button
                            type="submit"
                            disabled={sending || !newMessage.trim()}
                            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-amber-600 text-white text-xs font-bold disabled:opacity-50"
                        >
                            {sending ? "Sending..." : "Send"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ============================================================================
// HOD LAYOUT
// ============================================================================

const HODLayout = ({ user, activeTab, setActivePage, onLogout, children }) => {
    const menuItems = [
        { id: "home", label: "Home", Icon: Icons.Home },
        { id: "my-homegroup", label: "My Homegroup", Icon: Icons.Users },
        { id: "messages", label: "Messages", Icon: Icons.ChatBubble },
        { id: "workspace", label: "Workspace", Icon: Icons.BuildingOffice },
        { id: "members", label: "Members", Icon: Icons.Users },
        { id: "partnership", label: "Partnership", Icon: Icons.Heart },
        { id: "activities", label: "Activities", Icon: Icons.Calendar },
        { id: "achievements", label: "Achievements", Icon: Icons.ChartBar },
        { id: "reports", label: "Reports", Icon: Icons.DocumentText },
        { id: "profile", label: "Profile", Icon: Icons.User },
    ];

    return (
        <div className="min-h-screen relative bg-[#0A192F]">
            <FloatingParticlesWrapper />

            <style>{`
                .gradient-border { position: relative; background: rgba(255,255,255,0.05); border-radius: 14px; backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.1); }
                .gradient-border::before { content: ''; position: absolute; inset: -1px; border-radius: 15px; background: linear-gradient(135deg, #dfb15b, #0ea5e9, #dfb15b); background-size: 200% 200%; animation: gradient-shift 4s ease infinite; z-index: -1; opacity: 0; transition: opacity 0.4s ease; }
                .gradient-border:hover::before { opacity: 0.3; }
                .card-hover { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
                .card-hover:hover { transform: translateY(-2px); box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(212, 175, 55, 0.2); }
                .lux-eyebrow { font-size: 0.625rem; letter-spacing: 0.16em; text-transform: uppercase; color: #9ca3af; font-weight: 600; }
                .lux-chip { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 999px; font-size: 0.6875rem; font-weight: 600; letter-spacing: 0.01em; line-height: 1; }
                .lux-monogram { display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
                .lux-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; font-weight: 600; border-radius: 12px; transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; border: none; }
                .lux-divider { height: 1px; background: linear-gradient(90deg, transparent, rgba(255,255,255,0.12), transparent); }
                .lux-card { position: relative; display: flex; flex-direction: column; background: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.025)); border: 1px solid rgba(255,255,255,0.09); border-radius: 22px; backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); overflow: hidden; transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.4s ease, border-color 0.4s ease; }
                .lux-card::before { content: ''; position: absolute; inset: 0; border-radius: inherit; padding: 1px; background: linear-gradient(135deg, rgba(212,175,55,0.55), rgba(212,175,55,0) 38%, rgba(255,255,255,0.06)); -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite: xor; mask-composite: exclude; opacity: 0; transition: opacity 0.45s ease; pointer-events: none; }
                .lux-card:hover { transform: translateY(-3px); border-color: rgba(212,175,55,0.18); box-shadow: 0 24px 48px -20px rgba(0,0,0,0.55), 0 0 0 1px rgba(212,175,55,0.12); }
                .lux-card:hover::before { opacity: 1; }
                @keyframes lux-rise { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
                .lux-rise { animation: lux-rise 0.6s cubic-bezier(0.22, 1, 0.36, 1) both; }
                @keyframes floatUp { 0% { transform: translateY(100vh) translateX(0px); opacity: 0; } 10% { opacity: var(--particle-opacity); } 90% { opacity: var(--particle-opacity); } 100% { transform: translateY(-100px) translateX(30px); opacity: 0; } }
                @keyframes gradient-shift { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
                @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 0 0 rgba(212, 175, 55, 0); } 50% { box-shadow: 0 0 20px 4px rgba(212, 175, 55, 0.15); } }
                .mpm-mobile-tab { position: relative; border: none; background: none; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; flex: 1; height: 100%; }
                .mpm-mobile-icon { width: 38px; height: 38px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #94a3b8; transition: all 0.3s cubic-bezier(0.22, 1, 0.36, 1); }
                .mpm-mobile-icon.is-active { color: #fff; background: linear-gradient(135deg, rgba(212,175,55,0.22), rgba(212,175,55,0.1)); transform: translateY(-2px) scale(1.04); box-shadow: 0 8px 18px -8px rgba(212,175,55,0.5); }
                .mpm-mobile-label { font-size: 9px; font-weight: 500; color: #94a3b8; transition: color 0.2s; }
                .mpm-mobile-label.is-active { color: #fff; font-weight: 600; }
                .mpm-mobile-dot { position: absolute; top: 4px; width: 4px; height: 4px; border-radius: 50%; background: #d4af37; }
                .mpm-mobile-badge { position: absolute; top: -2px; right: -2px; min-width: 14px; height: 14px; padding: 0 3px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #ef4444, #e11d48); color: #fff; font-size: 8px; font-weight: 700; border-radius: 999px; }
                .mpm-mobile-avatar { width: 34px; height: 34px; border-radius: 11px; overflow: hidden; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #d4af37, #f59e0b); border: 1px solid rgba(255,255,255,0.15); box-shadow: 0 4px 12px -4px rgba(0,0,0,0.4); }
                .mpm-mobile-sheet { display: flex; align-items: center; gap: 0.6rem; width: 100%; padding: 0.7rem 0.9rem; border: none; background: rgba(255,255,255,0.04); border-radius: 0.7rem; color: #e2e8f0; font-size: 0.82rem; font-weight: 500; cursor: pointer; transition: background 0.2s ease; }
                .mpm-mobile-sheet:hover { background: rgba(255,255,255,0.08); }
            `}</style>

            {/* Desktop Top Nav */}
            <header className="sticky top-0 z-40 bg-white/5 backdrop-blur-2xl border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-14">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#d4af37] to-amber-600 flex items-center justify-center">
                                <Icons.Star className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">HOD Portal</p>
                                <p className="text-sm font-semibold text-white">{user?.home_group?.name || "Homegroup Leader"}</p>
                            </div>
                        </div>

                        <nav className="hidden lg:flex items-center gap-1">
                            {menuItems.map((item) => {
                                const Icon = item.Icon;
                                const isActive = activeTab === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => setActivePage(item.id)}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                                            isActive
                                                ? "bg-white/10 text-white"
                                                : "text-gray-400 hover:text-white hover:bg-white/5"
                                        }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {item.label}
                                    </button>
                                );
                            })}
                        </nav>

                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#d4af37] to-amber-600 flex items-center justify-center">
                                <span className="text-white font-bold text-xs">
                                    {(user?.name || "H").charAt(0)}
                                </span>
                            </div>
                            <button
                                onClick={onLogout}
                                className="text-xs text-gray-400 hover:text-red-400 transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Bottom Nav */}
            <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/5 backdrop-blur-2xl border-t border-white/10">
                <div className="flex items-center justify-around h-16 px-1">
                    {menuItems.slice(0, 6).map((item) => {
                        const Icon = item.Icon;
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActivePage(item.id)}
                                className="mpm-mobile-tab"
                            >
                                <div className={"mpm-mobile-icon " + (isActive ? "is-active" : "")}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <span className={"mpm-mobile-label " + (isActive ? "is-active" : "")}>
                                    {item.label}
                                </span>
                                {isActive && <span className="mpm-mobile-dot" />}
                            </button>
                        );
                    })}
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-4 pb-24 lg:pb-8">
                {children}
            </main>
        </div>
    );
};

const FloatingParticlesWrapper = () => {
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

    const particles = Array.from({ length: 15 }).map((_, i) => ({
        id: i,
        size: 3 + Math.random() * 5,
        left: Math.random() * 100,
        top: Math.random() * 100,
        duration: 18 + Math.random() * 15,
        delay: Math.random() * 12,
        opacity: 0.1 + Math.random() * 0.2,
        color: Math.random() > 0.5 ? "gold" : "sky",
    }));

    return (
        <div
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
// MAIN HOD PORTAL COMPONENT
// ============================================================================

export default function HODPortal({ user: initialUser, onLogout }) {
    const [activeTab, setActiveTab] = useState("home");
    const [user, setUser] = useState(initialUser);
    const [showHomegroupSelector, setShowHomegroupSelector] = useState(false);

    const renderPage = () => {
        switch (activeTab) {
            case "home":
                return <HODHomeTab user={user} onLogout={onLogout} />;
            case "my-homegroup":
                return <HODMyHomegroupTab user={user} />;
            case "messages":
                return <HODMessagesTab user={user} />;
            case "workspace":
                return <DepartmentWorkspace user={user} onNavigate={setActiveTab} />;
            case "members":
                return <DepartmentMembersPage onNavigate={setActiveTab} />;
            case "partnership":
                return <DepartmentPartnershipPage user={user} />;
            case "activities":
                return <HODActivitiesPage />;
            case "achievements":
                return <HODAchievementsPage />;
            case "reports":
                return <DepartmentReportsPage user={user} />;
            case "profile":
                return (
                    <>
                        <DepartmentProfilePage user={user} onUpdate={setUser} />
                        <div className="mt-6"><IdCardPanel /></div>
                    </>
                );
            default:
                return <HODHomeTab user={user} onLogout={onLogout} />;
        }
    };

    return (
        <HODLayout
            user={user}
            activeTab={activeTab}
            setActivePage={setActiveTab}
            onLogout={onLogout}
        >
            {renderPage()}
        </HODLayout>
    );
}
