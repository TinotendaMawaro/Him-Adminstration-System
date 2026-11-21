import React, { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Pagination from "../Pagination.jsx";
import { useUser } from "../../context/UserContext";
import api from "../../lib/api";
import SubmitMessageForm from "./SubmitMessageForm";
import MessageHistory from "./MessageHistory";
import MessageDetailModal from "./MessageDetailModal";

const Icons = {
    HandRaised: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v7.5A2.25 2.25 0 008.25 13.5h2.25m0-9V3.75A2.25 2.25 0 0112 6v1.5m0-1.5h2.25A2.25 2.25 0 0117 7.5v7.5a2.25 2.25 0 002.25 2.25h2.25" />
        </svg>
    ),
    ChatBubbleLeftRight: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.824-.174M3.75 17.25h3m-3 3h3m-3 3h3M3.75 6.75h16.5a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18v-9A2.25 2.25 0 013.75 6.75z" />
        </svg>
    ),
    Sun: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
        </svg>
    ),
    Plus: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
    ),
    XMark: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
    Bell: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
    ),
    Check: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-9" />
        </svg>
    ),
    ExclamationTriangle: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
    ),
    MagnifyingGlass: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
    ),
    Funnel: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044c0 .62-.384 1.18-1.003 1.433l-2.465.896c-.36.13-.76.13-1.12 0l-2.465-.896a1.125 1.125 0 00-1.003-.433H9.75a1.125 1.125 0 00-1.003.433l-2.465.896c-.36.13-.76.13-1.12 0L2.003 7.25A1.125 1.125 0 001 6.817v-1.044c0-.54.384-1.006.917-1.096C6.545 3.232 9.245 3 12 3z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 9.75h13.5l-1.5 9.75H6.75L5.25 9.75z" />
        </svg>
    ),
};

export { Icons };

export default function PrayerCenter() {
    const { user } = useUser();
    const queryClient = useQueryClient();
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterCategory, setFilterCategory] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const isPastor = user?.role === "pastor";
    const [memberTab, setMemberTab] = useState("my-messages");

    const { data: categoriesData } = useQuery({
        queryKey: ["prayer-center-categories"],
        queryFn: async () => {
            const res = await api.get("/prayer-center/categories");
            if (!res.data.success) throw new Error();
            return res.data.data;
        },
    });

    const { data: messagesData, refetch, error: messagesError, isLoading: messagesLoading } = useQuery({
        queryKey: ["prayer-center-messages", filterStatus, filterCategory, searchQuery],
        queryFn: async () => {
            const params = {};
            if (filterStatus !== "all") params.status = filterStatus;
            if (filterCategory !== "all") params.category_id = filterCategory;
            if (searchQuery.trim()) params.search = searchQuery.trim();
            const res = await api.get("/prayer-center/messages", { params });
            if (!res.data.success) throw new Error(res.data.message || "Failed to load messages");
            return res.data.data;
        },
    });

    const { data: notificationsData, error: notificationsError } = useQuery({
        queryKey: ["prayer-center-notifications"],
        queryFn: async () => {
            const res = await api.get("/prayer-center/notifications");
            if (!res.data.success) throw new Error(res.data.message || "Failed to load notifications");
            return res.data.data;
        },
        enabled: isPastor,
    });

    const { data: statsData, error: statsError } = useQuery({
        queryKey: ["prayer-center-stats"],
        queryFn: async () => {
            const res = await api.get("/prayer-center/stats");
            if (!res.data.success) throw new Error(res.data.message || "Failed to load stats");
            return res.data.data;
        },
        enabled: isPastor,
    });

    const messages = messagesData || [];
    const PAGE_SIZE = 10;
    const [page, setPage] = useState(1);
    useEffect(() => { setPage(1); }, [filterStatus, filterCategory, searchQuery]);
    const pageCount = Math.max(1, Math.ceil(messages.length / PAGE_SIZE));
    const pagedMessages = messages.slice((Math.min(page, pageCount) - 1) * PAGE_SIZE, Math.min(page, pageCount) * PAGE_SIZE);
    const pager = <Pagination currentPage={Math.min(page, pageCount)} totalPages={pageCount} totalItems={messages.length} itemsPerPage={PAGE_SIZE} onPageChange={setPage} className="mt-4" />;
    const categories = categoriesData || [];
    const unreadCount = messages.filter((m) => m.unread_replies > 0).length;

    const handleMessageSubmit = () => {
        refetch();
        setMemberTab("my-messages");
        setSuccessMessage("Your message has been submitted successfully. Your pastor will respond within 24-48 hours.");
        setTimeout(() => setSuccessMessage(""), 5000);
    };

    const handleReplySent = () => {
        setSuccessMessage("Reply sent successfully.");
        setTimeout(() => setSuccessMessage(""), 4000);
    };

    const handleStatusUpdate = async (messageId, status) => {
        await api.post(`/prayer-center/messages/${messageId}/status`, { status });
        refetch();
        setSuccessMessage("Status updated successfully.");
        setTimeout(() => setSuccessMessage(""), 4000);
    };

    const statsItems = statsData ? [
        { label: "New", value: statsData.pending, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", icon: "✨" },
        { label: "Total", value: statsData.total_messages, color: "text-sky-600", bg: "bg-sky-50", border: "border-sky-200", icon: "📊" },
        { label: "Pending", value: statsData.pending, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", icon: "⏳" },
        { label: "Flagged", value: statsData.flagged, color: "text-red-600", bg: "bg-red-50", border: "border-red-200", icon: "🚩" },
        { label: "In Progress", value: statsData.in_progress, color: "text-sky-600", bg: "bg-sky-50", border: "border-sky-200", icon: "🔄" },
        { label: "Resolved", value: statsData.resolved, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", icon: "✅" },
    ] : [];

    return (
        <div className="min-h-screen bg-gray-50">
            <style>{`
                .prayer-card { 
                    background: #fff; 
                    border-radius: 16px; 
                    border: 1px solid #E5E7EB; 
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
                    box-shadow: 0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1);
                }
                .prayer-card:hover { 
                    transform: translateY(-2px); 
                    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1), 0 0 0 1px rgba(212,175,55,0.3);
                }
                .prayer-glass { 
                    background: rgba(255,255,255,0.9); 
                    backdrop-filter: blur(20px); 
                    border: 1px solid rgba(0,0,0,0.08); 
                    box-shadow: 0 1px 3px 0 rgba(0,0,0,0.1);
                }
                .prayer-input { 
                    background: #fff; 
                    border: 1px solid #D1D5DB; 
                    border-radius: 10px; 
                    padding: 10px 14px; 
                    color: #111827; 
                    font-size: 14px; 
                    width: 100%; 
                    transition: all 0.2s ease;
                }
                .prayer-input:focus { 
                    outline: none; 
                    border-color: #D4AF37; 
                    box-shadow: 0 0 0 3px rgba(212,175,55,0.15);
                }
                .prayer-input::placeholder { color: #9CA3AF; }
                .prayer-btn { 
                    display: inline-flex; 
                    align-items: center; 
                    justify-content: center; 
                    gap: 6px; 
                    padding: 10px 20px; 
                    border-radius: 10px; 
                    font-size: 13px; 
                    font-weight: 600; 
                    transition: all 0.2s ease; 
                    cursor: pointer; 
                    border: none;
                }
                .prayer-btn-gold { 
                    background: linear-gradient(135deg, #D4AF37 0%, #f59e0b 100%); 
                    color: #fff; 
                }
                .prayer-btn-gold:hover { 
                    transform: translateY(-1px); 
                    box-shadow: 0 4px 12px rgba(212,175,55,0.4);
                }
                .prayer-btn-ghost { 
                    background: #fff; 
                    color: #374151; 
                    border: 1px solid #D1D5DB;
                }
                .prayer-btn-ghost:hover { 
                    background: #F9FAFB;
                }
                .status-badge { 
                    padding: 4px 12px; 
                    border-radius: 999px; 
                    font-size: 11px; 
                    font-weight: 700; 
                    text-transform: uppercase; 
                    letter-spacing: 0.05em;
                }
                .priority-badge { 
                    padding: 3px 10px; 
                    border-radius: 999px; 
                    font-size: 10px; 
                    font-weight: 700; 
                    text-transform: uppercase; 
                    letter-spacing: 0.05em;
                }
                .category-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
                .tab-fade { animation: tabFadeIn 0.3s ease-out; }
                @keyframes tabFadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
                .success-toast { animation: successIn 0.3s ease-out; }
                @keyframes successIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
                .stat-card { 
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
                    position: relative;
                    overflow: hidden;
                }
                .stat-card:hover { 
                    transform: translateY(-2px); 
                }
                .stat-card::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(135deg, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0) 100%);
                    pointer-events: none;
                }
                .filter-panel { 
                    background: #fff; 
                    border: 1px solid #E5E7EB; 
                    border-radius: 16px; 
                    padding: 20px; 
                    box-shadow: 0 1px 3px 0 rgba(0,0,0,0.1);
                }
                .message-row { 
                    transition: all 0.2s ease; 
                    border: 1px solid transparent;
                }
                .message-card-unread {
                    border-left: 4px solid #D4AF37;
                    background: #FFFBEB;
                }
                .message-card-unread:hover {
                    background: #FEF3C7;
                    border-color: #FDE68A;
                    border-left-color: #D4AF37;
                }
                .message-row:hover { 
                    background: #FFFBEB;
                    border-color: #FDE68A;
                }
                .message-card {
                    background: #fff;
                    border: 1px solid #E5E7EB;
                    border-radius: 14px;
                    padding: 16px;
                    transition: all 0.2s ease;
                }
                .message-card:hover {
                    background: #FFFBEB;
                    border-color: #FDE68A;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
                }
                .section-title {
                    font-size: 11px;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.08em;
                    color: #6B7280;
                }
            `}</style>

            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* SUCCESS TOAST */}
                {successMessage && (
                    <div className="success-toast mb-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
                        <Icons.Check className="w-5 h-5 text-emerald-600 shrink-0" />
                        <p className="text-sm text-emerald-800 font-medium">{successMessage}</p>
                    </div>
                )}

                {/* HEADER */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Prayer Center</h1>
                        <p className="text-sm text-gray-600 mt-1">
                            {isPastor ? "Manage prayer requests, counseling, and testimonies" : "Share your prayer requests, seek counsel, or share testimonies"}
                        </p>
                    </div>
                    {!isPastor && memberTab === "new-message" && (
                        <button onClick={() => setMemberTab("my-messages")} className="prayer-btn prayer-btn-ghost">
                            Back to My Messages
                        </button>
                    )}
                    {!isPastor && memberTab === "my-messages" && (
                        <button onClick={() => setMemberTab("new-message")} className="prayer-btn prayer-btn-gold">
                            <Icons.Plus className="w-4 h-4" />
                            New Message
                        </button>
                    )}
                    {isPastor && (
                        <div className="flex items-center gap-3">
                            <div className="prayer-glass rounded-xl px-4 py-2 flex items-center gap-2">
                                <Icons.Bell className="w-4 h-4 text-[#D4AF37]" />
                                <span className="text-sm font-semibold text-gray-800">
                                    {notificationsData?.data?.filter((n) => !n.read)?.length || 0} new
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* MEMBER SUB-TABS */}
                {!isPastor && (
                    <div className="flex items-center gap-1 mb-6 bg-white p-1 rounded-xl w-fit border border-gray-200">
                        <button
                            onClick={() => setMemberTab("my-messages")}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                                memberTab === "my-messages"
                                    ? "bg-[#D4AF37] text-white shadow-sm"
                                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                            }`}
                        >
                            My Messages
                        </button>
                        <button
                            onClick={() => setMemberTab("new-message")}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                                memberTab === "new-message"
                                    ? "bg-[#D4AF37] text-white shadow-sm"
                                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                            }`}
                        >
                            New Message
                        </button>
                    </div>
                )}

                {/* MEMBER: NEW MESSAGE FORM */}
                {!isPastor && memberTab === "new-message" && (
                    <div className="tab-fade">
                        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">New Message</h2>
                            <SubmitMessageForm
                                categories={categories}
                                onSuccess={handleMessageSubmit}
                                onCancel={() => setMemberTab("my-messages")}
                            />
                        </div>
                    </div>
                )}

                {/* MEMBER: MY MESSAGES */}
                {!isPastor && memberTab === "my-messages" && (
                    <div className="tab-fade">
                        <div className="filter-panel mb-6">
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <label className="text-xs text-gray-700 font-medium">Status:</label>
                                    <select
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                        className="prayer-input text-sm py-1.5 w-auto"
                                    >
                                        <option value="all">All</option>
                                        <option value="pending">Pending</option>
                                        <option value="approved">Approved</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="resolved">Resolved</option>
                                        <option value="testimony_approved">Approved for Sharing</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <MessageHistory
                            messages={pagedMessages}
                            categories={categories}
                            isPastor={isPastor}
                            currentUserId={user?.id}
                            onSelectMessage={setSelectedMessage}
                            onStatusUpdate={handleStatusUpdate}
                        />
                        {pager}
                    </div>
                )}

                {/* PASTOR VIEW */}
                {isPastor && (
                    <>
                        {/* STATS CARDS */}
                        {statsData && (
                            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
                                {statsItems.map((stat) => (
                                    <div key={stat.label} className={`stat-card prayer-card p-5 border-l-4 ${stat.border}`}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-lg">{stat.icon}</span>
                                            <span className={`text-xs font-bold ${stat.color} uppercase tracking-wider`}>{stat.label}</span>
                                        </div>
                                        <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* ERROR BANNERS */}
                        {messagesError && (
                            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                                <Icons.ExclamationTriangle className="w-5 h-5 text-red-600 shrink-0" />
                                <div>
                                    <p className="text-sm text-red-800 font-medium">Failed to load messages</p>
                                    <p className="text-xs text-red-600">{messagesError.message || 'Unknown error'}</p>
                                </div>
                                <button onClick={() => refetch()} className="ml-auto text-xs text-red-700 hover:text-red-800 underline">Retry</button>
                            </div>
                        )}
                        {statsError && (
                            <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
                                <Icons.ExclamationTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                                <div>
                                    <p className="text-sm text-amber-800 font-medium">Failed to load stats</p>
                                    <p className="text-xs text-amber-600">{statsError.message || 'Unknown error'}</p>
                                </div>
                            </div>
                        )}
                        {notificationsError && (
                            <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3">
                                <Icons.ExclamationTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                                <div>
                                    <p className="text-sm text-amber-800 font-medium">Failed to load notifications</p>
                                    <p className="text-xs text-amber-600">{notificationsError.message || 'Unknown error'}</p>
                                </div>
                            </div>
                        )}

                        {/* FILTERS */}
                        <div className="filter-panel mb-6">
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <Icons.Funnel className="w-4 h-4 text-gray-500" />
                                    <label className="text-xs text-gray-700 font-medium">Status:</label>
                                    <select
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                        className="prayer-input text-sm py-1.5 w-auto"
                                    >
                                        <option value="all">All</option>
                                        <option value="pending">Pending</option>
                                        <option value="approved">Approved</option>
                                        <option value="flagged">Flagged</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="resolved">Resolved</option>
                                        <option value="testimony_approved">Approved for Sharing</option>
                                    </select>
                                </div>
                                <div className="flex items-center gap-2">
                                    <label className="text-xs text-gray-700 font-medium">Category:</label>
                                    <select
                                        value={filterCategory}
                                        onChange={(e) => setFilterCategory(e.target.value)}
                                        className="prayer-input text-sm py-1.5 w-auto"
                                    >
                                        <option value="all">All Categories</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>{cat.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                                    <Icons.MagnifyingGlass className="w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by name or subject..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="prayer-input text-sm py-1.5"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* MESSAGES LIST */}
                        <MessageHistory
                            messages={pagedMessages}
                            categories={categories}
                            isPastor={isPastor}
                            currentUserId={user?.id}
                            onSelectMessage={setSelectedMessage}
                            onStatusUpdate={handleStatusUpdate}
                        />
                        {pager}
                    </>
                )}

                {/* MESSAGE DETAIL MODAL */}
                {selectedMessage && (
                    <MessageDetailModal
                        message={selectedMessage}
                        isPastor={isPastor}
                        onClose={() => setSelectedMessage(null)}
                        onReply={() => { refetch(); setSelectedMessage(null); handleReplySent(); }}
                        onStatusUpdate={handleStatusUpdate}
                        onView={refetch}
                    />
                )}
            </div>
        </div>
    );
}
