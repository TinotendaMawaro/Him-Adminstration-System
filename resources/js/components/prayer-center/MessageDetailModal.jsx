import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/api";

const Icons = {
    XMark: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
    Send: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0121.485 12 59.768 59.768 0 013.27 20.875L5.999 12z" />
        </svg>
    ),
    Check: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-9" />
        </svg>
    ),
    ChatBubble: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12c0-4.97 4.03-9 9-9s9 4.03 9 9-4.03 9-9 9c-1.44 0-2.79-.38-3.96-1.04L2.25 21V12z" />
        </svg>
    ),
    User: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
        </svg>
    ),
    Clock: ({ className }) => (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
};

export default function MessageDetailModal({ message, isPastor, onClose, onReply, onStatusUpdate }) {
    const queryClient = useQueryClient();
    const [replyText, setReplyText] = useState("");
    const [replyType, setReplyType] = useState("pastor_reply");
    const [localMessage, setLocalMessage] = useState(message);

    const { data: fullMessage, refetch } = useQuery({
        queryKey: ["prayer-center-message", message.id],
        queryFn: async () => {
            const res = await api.get(`/prayer-center/messages/${message.id}`);
            if (!res.data.success) throw new Error();
            return res.data.data;
        },
        enabled: !!message.id,
    });

    useEffect(() => {
        if (fullMessage) setLocalMessage(fullMessage);
    }, [fullMessage]);

    const replyMutation = useMutation({
        mutationFn: async (data) => {
            const res = await api.post(`/prayer-center/messages/${message.id}/reply`, data);
            if (!res.data.success) throw new Error(res.data.message || "Failed to send reply");
            return res.data;
        },
        onSuccess: () => {
            setReplyText("");
            refetch();
            onReply?.();
        },
    });

    const statusMutation = useMutation({
        mutationFn: async (status) => {
            const res = await api.post(`/prayer-center/messages/${message.id}/status`, { status });
            if (!res.data.success) throw new Error();
            return res.data;
        },
        onSuccess: () => {
            refetch();
            onStatusUpdate?.(message.id, localMessage.status);
        },
    });

    const handleReply = (e) => {
        e.preventDefault();
        if (!replyText.trim()) return;
        replyMutation.mutate({
            reply: replyText.trim(),
            type: replyType,
            is_internal: replyType === "system_note",
        });
    };

    const cat = localMessage?.category;
    const replies = localMessage?.replies || [];

    const statusColors = {
        pending: "bg-amber-500/20 text-amber-300",
        approved: "bg-emerald-500/20 text-emerald-300",
        flagged: "bg-red-500/20 text-red-300",
        in_progress: "bg-sky-500/20 text-sky-300",
        resolved: "bg-emerald-500/20 text-emerald-300",
        testimony_approved: "bg-purple-500/20 text-purple-300",
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-[#0A192F] border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* HEADER */}
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <h2 className="text-lg font-bold text-white truncate">{localMessage?.subject}</h2>
                                <span className={`status-badge ${statusColors[localMessage?.status] || "bg-gray-500/20 text-gray-300"}`}>
                                    {localMessage?.status_label}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                                <span className="flex items-center gap-1">
                                    <Icons.User className="w-3 h-3" />
                                    {localMessage?.user?.name}
                                </span>
                                <span className="w-1 h-1 rounded-full bg-gray-600" />
                                <span className="flex items-center gap-1">
                                    <Icons.Clock className="w-3 h-3" />
                                    {localMessage?.created_at}
                                </span>
                                <span className="w-1 h-1 rounded-full bg-gray-600" />
                                <span>{cat?.label}</span>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 flex-shrink-0"
                        >
                            <Icons.XMark className="w-5 h-5" />
                        </button>
                    </div>

                    {/* PASTOR CONTROLS */}
                    {isPastor && (
                        <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-white/5">
                            <label className="text-xs text-gray-400">Status:</label>
                            <select
                                value={localMessage?.status || "pending"}
                                onChange={(e) => {
                                    setLocalMessage({ ...localMessage, status: e.target.value });
                                    statusMutation.mutate(e.target.value);
                                }}
                                className="prayer-input text-xs py-1 w-auto"
                            >
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="flagged">Flagged</option>
                                <option value="in_progress">In Progress</option>
                                <option value="resolved">Resolved</option>
                                <option value="testimony_approved">Approved for Sharing</option>
                            </select>
                            {localMessage?.moderation_notes && (
                                <div className="ml-auto p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                                    <p className="text-[10px] text-amber-300 font-mono">{localMessage.moderation_notes}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* MESSAGE CONTENT */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="prayer-glass rounded-xl p-5 mb-6">
                        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">{localMessage?.message}</p>
                    </div>

                    {/* REPLIES */}
                    {replies.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                <Icons.ChatBubble className="w-4 h-4 text-[#D4AF37]" />
                                Replies ({replies.length})
                            </h3>
                            {replies.map((reply) => (
                                <div
                                    key={reply.id}
                                    className={`p-4 rounded-xl ${
                                        reply.is_internal
                                            ? "bg-amber-500/5 border border-amber-500/20 ml-8"
                                            : reply.user_id === message.user_id
                                            ? "bg-sky-500/5 border border-sky-500/20 mr-8"
                                            : "bg-white/5 border border-white/10 ml-8"
                                    }`}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#D4AF37] to-amber-600 flex items-center justify-center">
                                            <span className="text-white text-[10px] font-bold">
                                                {(reply.user?.name || "U").charAt(0)}
                                            </span>
                                        </div>
                                        <span className="text-xs font-semibold text-white">{reply.user?.name}</span>
                                        <span className="text-[10px] text-gray-500">
                                            {reply.type_label} • {reply.created_at}
                                        </span>
                                        {reply.is_internal && (
                                            <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                                                Internal
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-300 leading-relaxed">{reply.reply}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* REPLY FORM */}
                <div className="p-6 border-t border-white/10">
                    {isPastor && (
                        <div className="flex gap-2 mb-3">
                            {["pastor_reply", "member_followup", "system_note"].map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setReplyType(type)}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold transition-all border ${
                                        replyType === type
                                            ? type === "system_note"
                                                ? "bg-amber-500/20 border-amber-500/50 text-amber-300"
                                                : "bg-[#D4AF37]/20 border-[#D4AF37]/50 text-[#D4AF37]"
                                            : "bg-white/5 border-white/10 text-gray-400 hover:border-white/20"
                                    }`}
                                >
                                    {type === "pastor_reply" ? "Reply to Member" :
                                     type === "member_followup" ? "Follow-up" : "Internal Note"}
                                </button>
                            ))}
                        </div>
                    )}
                    <form onSubmit={handleReply} className="flex gap-3">
                        <textarea
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder={isPastor ? "Type your reply..." : "Add a follow-up message..."}
                            rows={2}
                            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all resize-none"
                        />
                        <button
                            type="submit"
                            disabled={replyMutation.isPending || !replyText.trim()}
                            className="prayer-btn prayer-btn-gold self-end"
                        >
                            {replyMutation.isPending ? (
                                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <circle cx="12" cy="12" r="10" strokeWidth="2" strokeDasharray="32" strokeLinecap="round" />
                                </svg>
                            ) : (
                                <Icons.Send className="w-5 h-5" />
                            )}
                        </button>
                    </form>
                    {replyMutation.isError && (
                        <p className="text-red-400 text-xs mt-2">{replyMutation.error?.message || "Failed to send reply."}</p>
                    )}
                </div>
            </div>
        </div>
    );
}
