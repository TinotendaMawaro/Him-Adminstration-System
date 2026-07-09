import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
    Clock: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
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
    ChartBar: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.5V3a1.5 1.5 0 013 0v9.75m6-2.25V9a1.5 1.5 0 013 0v4.5m6-2.25V5.25a1.5 1.5 0 013 0v7.5M3 21h18M5.25 21h.008v.008H5.25V21zm4.5 0h.008v.008H9.75V21zm4.5 0h.008v.008h-.008V21zm4.5 0h.008v.008H18.75V21z" />
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
        queryKey: ["prayer-center-messages", filterStatus, filterCategory],
        queryFn: async () => {
            const params = {};
            if (filterStatus !== "all") params.status = filterStatus;
            if (filterCategory !== "all") params.category_id = filterCategory;
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

    return (
        <div className="min-h-screen relative">
            <style>{`
                .prayer-card { background: rgba(255,255,255,0.05); border-radius: 14px; backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.1); transition: all 0.3s ease; }
                .prayer-card:hover { transform: translateY(-2px); box-shadow: 0 12px 24px -8px rgba(0,0,0,0.3), 0 0 0 1px rgba(212,175,55,0.2); }
                .prayer-glass { background: rgba(255,255,255,0.7); backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.2); }
                .prayer-input { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 10px 14px; color: #fff; font-size: 14px; width: 100%; transition: all 0.2s; }
                .prayer-input:focus { outline: none; border-color: #D4AF37; box-shadow: 0 0 0 3px rgba(212,175,55,0.15); }
                .prayer-input::placeholder { color: rgba(255,255,255,0.3); }
                .prayer-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; padding: 8px 18px; border-radius: 10px; font-size: 13px; font-weight: 600; transition: all 0.2s; cursor: pointer; border: none; }
                .prayer-btn-gold { background: linear-gradient(135deg, #D4AF37, #f59e0b); color: #fff; }
                .prayer-btn-gold:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(212,175,55,0.4); }
                .prayer-btn-ghost { background: rgba(255,255,255,0.05); color: #e5e7eb; border: 1px solid rgba(255,255,255,0.1); }
                .prayer-btn-ghost:hover { background: rgba(255,255,255,0.1); }
                .status-badge { padding: 3px 10px; border-radius: 999px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
                .priority-badge { padding: 2px 8px; border-radius: 999px; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
                .category-dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
                .tab-fade { animation: tabFadeIn 0.3s ease-out; }
                @keyframes tabFadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
                .success-toast { animation: successIn 0.3s ease-out; }
                @keyframes successIn { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>

            <div className="max-w-7xl mx-auto px-4 py-6">
                {/* SUCCESS TOAST */}
                {successMessage && (
                    <div className="success-toast mb-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-3">
                        <svg className="w-5 h-5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-9" />
                        </svg>
                        <p className="text-sm text-emerald-300 font-medium">{successMessage}</p>
                    </div>
                )}

                {/* HEADER */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Prayer Center</h1>
                        <p className="text-sm text-gray-400 mt-1">
                            {isPastor ? "Manage prayer requests, counseling, and testimonies" : "Share your prayer requests, seek counsel, or share testimonies"}
                        </p>
                    </div>
                    {!isPastor && memberTab === "new-message" && (
                        <button
                            onClick={() => setMemberTab("my-messages")}
                            className="prayer-btn prayer-btn-ghost"
                        >
                            Back to My Messages
                        </button>
                    )}
                    {!isPastor && memberTab === "my-messages" && (
                        <button
                            onClick={() => setMemberTab("new-message")}
                            className="prayer-btn prayer-btn-gold"
                        >
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
                    <div className="flex items-center gap-1 mb-6 bg-white/5 p-1 rounded-xl w-fit">
                        <button
                            onClick={() => setMemberTab("my-messages")}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                                memberTab === "my-messages"
                                    ? "bg-[#D4AF37] text-white shadow-lg"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                            }`}
                        >
                            My Messages
                        </button>
                        <button
                            onClick={() => setMemberTab("new-message")}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                                memberTab === "new-message"
                                    ? "bg-[#D4AF37] text-white shadow-lg"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                            }`}
                        >
                            New Message
                        </button>
                    </div>
                )}

                {/* MEMBER: NEW MESSAGE FORM */}
                {!isPastor && memberTab === "new-message" && (
                    <div className="tab-fade">
                        <div className="bg-[#0A192F] border border-white/10 rounded-2xl shadow-2xl p-6">
                            <h2 className="text-xl font-bold text-white mb-6">New Message</h2>
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
                        {/* FILTERS */}
                        <div className="flex flex-wrap items-center gap-3 mb-6">
                            <div className="flex items-center gap-2">
                                <label className="text-xs text-gray-400 font-medium">Status:</label>
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

                        <MessageHistory
                            messages={messages}
                            categories={categories}
                            isPastor={isPastor}
                            onSelectMessage={setSelectedMessage}
                            onStatusUpdate={handleStatusUpdate}
                        />
                    </div>
                )}

                {/* PASTOR VIEW */}
                {isPastor && (
                    <>
                        {/* PASTOR STATS */}
                        {statsData && (
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
                                {[
                                    { label: "Total", value: statsData.total_messages, color: "bg-sky-500" },
                                    { label: "Pending", value: statsData.pending, color: "bg-amber-500" },
                                    { label: "Flagged", value: statsData.flagged, color: "bg-red-500" },
                                    { label: "In Progress", value: statsData.in_progress, color: "bg-blue-500" },
                                    { label: "Resolved", value: statsData.resolved, color: "bg-emerald-500" },
                                ].map((stat) => (
                                    <div key={stat.label} className="prayer-card p-4">
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className={`w-2 h-2 rounded-full ${stat.color}`} />
                                            <span className="text-xs text-gray-400 font-medium">{stat.label}</span>
                                        </div>
                                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* ERROR BANNERS */}
                        {messagesError && (
                            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                                <p className="text-red-400 text-sm">
                                    Failed to load messages: {messagesError.message || 'Unknown error'}
                                </p>
                                <button
                                    onClick={() => refetch()}
                                    className="mt-2 text-xs text-red-300 hover:text-red-200 underline"
                                >
                                    Retry
                                </button>
                            </div>
                        )}
                        {statsError && (
                            <div className="mb-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                                <p className="text-amber-300 text-sm">
                                    Failed to load stats: {statsError.message || 'Unknown error'}
                                </p>
                            </div>
                        )}
                        {notificationsError && (
                            <div className="mb-4 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                                <p className="text-amber-300 text-sm">
                                    Failed to load notifications: {notificationsError.message || 'Unknown error'}
                                </p>
                            </div>
                        )}

                        {/* FILTERS */}
                        <div className="flex flex-wrap items-center gap-3 mb-6">
                            <div className="flex items-center gap-2">
                                <label className="text-xs text-gray-400 font-medium">Status:</label>
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
                                <label className="text-xs text-gray-400 font-medium">Category:</label>
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
                        </div>

                        {/* MESSAGES LIST */}
                        <MessageHistory
                            messages={messages}
                            categories={categories}
                            isPastor={isPastor}
                            onSelectMessage={setSelectedMessage}
                            onStatusUpdate={handleStatusUpdate}
                        />
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
                    />
                )}
            </div>
        </div>
    );
}
