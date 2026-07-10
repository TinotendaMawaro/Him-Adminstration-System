import React from "react";

const Icons = {
    HandRaised: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v7.5A2.25 2.25 0 008.25 13.5h2.25m0-9V3.75A2.25 2.25 0 0112 6v1.5m0-1.5h2.25A2.25 2.25 0 0117 7.5v7.5a2.25 2.25 0 002.25 2.25h2.25" />
        </svg>
    ),
    Heart: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
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
};

const statusConfig = {
    pending:            { label: "Pending",             className: "bg-amber-100 text-amber-800 border border-amber-200" },
    approved:           { label: "Approved",            className: "bg-emerald-100 text-emerald-800 border border-emerald-200" },
    flagged:            { label: "Flagged",             className: "bg-red-100 text-red-800 border border-red-200" },
    in_progress:        { label: "In Progress",         className: "bg-sky-100 text-sky-800 border border-sky-200" },
    resolved:           { label: "Resolved",            className: "bg-emerald-100 text-emerald-800 border border-emerald-200" },
    testimony_approved: { label: "Approved for Sharing",className: "bg-purple-100 text-purple-800 border border-purple-200" },
};

const priorityConfig = {
    low:    { label: "Low",      className: "bg-gray-100 text-gray-800 border border-gray-200" },
    normal: { label: "Normal",   className: "bg-sky-100 text-sky-800 border border-sky-200" },
    high:   { label: "High",     className: "bg-amber-100 text-amber-800 border border-amber-200" },
    urgent: { label: "Urgent",   className: "bg-red-100 text-red-800 border border-red-200" },
};

const categoryIcons = {
    prayer_request: Icons.Heart,
    counseling_request: Icons.ChatBubbleLeftRight,
    testimony: Icons.Sun,
};

function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
}

export default function MessageHistory({ messages, categories, isPastor, onSelectMessage, onStatusUpdate }) {
    if (!messages.length) {
        return (
            <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
                    <Icons.HandRaised className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">No messages yet</h3>
                <p className="text-sm text-gray-600">
                    {isPastor ? "No prayer center messages to display." : "Submit your first prayer request, counseling request, or testimony."}
                </p>
            </div>
        );
    }

    return (
        <div className="tab-fade space-y-3">
            {messages.map((msg) => {
                const cat = categories.find((c) => c.id === msg.category?.id) || msg.category;
                const CatIcon = categoryIcons[cat?.name] || Icons.Heart;
                const status = statusConfig[msg.status] || statusConfig.pending;
                const priority = priorityConfig[msg.priority] || priorityConfig.normal;
                const hasUnread = msg.unread_replies > 0;

                return (
                    <div
                        key={msg.id}
                        onClick={() => onSelectMessage(msg)}
                        className="message-card cursor-pointer"
                    >
                        {/* Mobile Layout */}
                        <div className="md:hidden">
                            <div className="flex items-start gap-3 mb-3">
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                    style={{ backgroundColor: (cat?.color || "#D4AF37") + "20" }}
                                >
                                    <CatIcon className="w-5 h-5" style={{ color: cat?.color || "#D4AF37" }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <h3 className="text-sm font-bold text-gray-900 truncate">{msg.subject}</h3>
                                        <span className={`status-badge ${status.className}`}>
                                            {status.label}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-gray-500">
                                        <span className="font-medium text-gray-700">{msg.user?.name || "Unknown"}</span>
                                        <span className="w-1 h-1 rounded-full bg-gray-300" />
                                        <span>{formatTimeAgo(msg.created_at)}</span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-xs text-gray-600 line-clamp-2 mb-3">{msg.message}</p>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold ${priority.className}`}>
                                        {priority.label}
                                    </span>
                                    <span className="text-[10px] text-gray-500">{cat?.label}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {msg.reply_count > 0 && (
                                        <span className="text-[10px] text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                                            {msg.reply_count} replies
                                        </span>
                                    )}
                                    {hasUnread && (
                                        <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-2 py-1 rounded-md">
                                            {msg.unread_replies} unread
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Desktop Layout */}
                        <div className="hidden md:flex md:items-center gap-4">
                            {/* Category Icon */}
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                                style={{ backgroundColor: (cat?.color || "#D4AF37") + "20" }}
                            >
                                <CatIcon className="w-5 h-5" style={{ color: cat?.color || "#D4AF37" }} />
                            </div>

                            {/* Status + Priority + Category */}
                            <div className="w-48 shrink-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className={`status-badge ${status.className}`}>
                                        {status.label}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`priority-badge ${priority.className}`}>
                                        {priority.label}
                                    </span>
                                    <span className="text-[10px] text-gray-500">{cat?.label}</span>
                                </div>
                            </div>

                            {/* Subject + Requester */}
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-bold text-gray-900 truncate mb-1">{msg.subject}</h3>
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[#D4AF37] to-amber-600 flex items-center justify-center shrink-0">
                                        <span className="text-white text-[8px] font-bold">
                                            {(msg.user?.name || "U").charAt(0)}
                                        </span>
                                    </div>
                                    <span className="text-xs text-gray-700 font-medium truncate">{msg.user?.name || "Unknown"}</span>
                                    {hasUnread && (
                                        <span className="text-[10px] text-amber-700 font-semibold ml-auto">
                                            {msg.unread_replies} unread
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Timestamp */}
                            <div className="w-28 shrink-0 text-right">
                                <p className="text-xs text-gray-700 font-medium">{formatTimeAgo(msg.created_at)}</p>
                                <p className="text-[10px] text-gray-500">{new Date(msg.created_at).toLocaleDateString()}</p>
                            </div>

                            {/* Actions */}
                            <div className="w-24 shrink-0 flex items-center justify-end gap-2">
                                {msg.reply_count > 0 && (
                                    <span className="text-[10px] text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                                        {msg.reply_count} replies
                                    </span>
                                )}
                                <button
                                    onClick={(e) => { e.stopPropagation(); onSelectMessage(msg); }}
                                    className="text-[10px] font-semibold text-[#D4AF37] hover:text-amber-700 transition-colors"
                                >
                                    View
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
