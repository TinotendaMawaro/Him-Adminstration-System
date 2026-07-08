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

const statusColors = {
    pending: "bg-amber-500/20 text-amber-300",
    approved: "bg-emerald-500/20 text-emerald-300",
    flagged: "bg-red-500/20 text-red-300",
    in_progress: "bg-sky-500/20 text-sky-300",
    resolved: "bg-emerald-500/20 text-emerald-300",
    testimony_approved: "bg-purple-500/20 text-purple-300",
};

const priorityColors = {
    low: "bg-gray-500/20 text-gray-300",
    normal: "bg-sky-500/20 text-sky-300",
    high: "bg-amber-500/20 text-amber-300",
    urgent: "bg-red-500/20 text-red-300",
};

const categoryIcons = {
    prayer_request: Icons.Heart,
    counseling_request: Icons.ChatBubbleLeftRight,
    testimony: Icons.Sun,
};

export default function MessageHistory({ messages, categories, isPastor, onSelectMessage, onStatusUpdate }) {
    if (!messages.length) {
        return (
            <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/5 flex items-center justify-center">
                    <Icons.HandRaised className="w-8 h-8 text-gray-500" />
                </div>
                <h3 className="text-lg font-bold text-white mb-1">No messages yet</h3>
                <p className="text-sm text-gray-400">
                    {isPastor ? "No prayer center messages to display." : "Submit your first prayer request, counseling request, or testimony."}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3 tab-fade">
            {messages.map((msg) => {
                const cat = categories.find((c) => c.id === msg.category?.id) || msg.category;
                const CatIcon = categoryIcons[cat?.name] || Icons.Heart;
                const hasUnread = msg.unread_replies > 0;

                return (
                    <div
                        key={msg.id}
                        onClick={() => onSelectMessage(msg)}
                        className="prayer-card p-4 cursor-pointer"
                    >
                        <div className="flex items-start gap-3">
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{ backgroundColor: (cat?.color || "#D4AF37") + "20" }}
                            >
                                <CatIcon className="w-5 h-5" style={{ color: cat?.color || "#D4AF37" }} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <h3 className="text-sm font-bold text-white truncate">{msg.subject}</h3>
                                    <span className={`status-badge ${statusColors[msg.status] || "bg-gray-500/20 text-gray-300"}`}>
                                        {msg.status_label}
                                    </span>
                                    <span className={`priority-badge ${priorityColors[msg.priority] || "bg-gray-500/20 text-gray-300"}`}>
                                        {msg.priority_label}
                                    </span>
                                    {hasUnread && (
                                        <span className="w-2 h-2 rounded-full bg-[#D4AF37] badge-pulse" />
                                    )}
                                </div>
                                <p className="text-xs text-gray-400 line-clamp-2 mb-2">{msg.message}</p>
                                <div className="flex items-center gap-3 text-[10px] text-gray-500">
                                    <span>{msg.user?.name || "Unknown"}</span>
                                    <span className="w-1 h-1 rounded-full bg-gray-600" />
                                    <span>{msg.created_at}</span>
                                    {msg.reply_count > 0 && (
                                        <>
                                            <span className="w-1 h-1 rounded-full bg-gray-600" />
                                            <span>{msg.reply_count} replies</span>
                                        </>
                                    )}
                                    {hasUnread && (
                                        <>
                                            <span className="w-1 h-1 rounded-full bg-gray-600" />
                                            <span className="text-[#D4AF37] font-semibold">{msg.unread_replies} unread</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
