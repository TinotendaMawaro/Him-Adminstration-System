import React, { useEffect, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../../lib/api.js";
import Pagination from "../Pagination.jsx";

const PER_PAGE = 8;

/**
 * The pastor's inbox: conversations with people in the zone, and the announcements / notices sent through departments.
 * A message notification from the bell lands here, on the conversation it is about.
 */
export default function InboxPage({ openContactId = null }) {
    const queryClient = useQueryClient();
    const [view, setView] = useState("conversations"); // conversations | announcements
    const [contactId, setContactId] = useState(openContactId);
    const [listPage, setListPage] = useState(1);

    const { data: convos = [], isLoading } = useQuery({
        queryKey: ["inbox-conversations"],
        queryFn: async () => (await api.get("/messages/conversations")).data.conversations || [],
        refetchInterval: 20000,
    });

    // A message notification points at someone: open that conversation, or the announcements when it was a broadcast.
    useEffect(() => {
        if (!openContactId || isLoading) return;
        if (convos.some((c) => c.id === openContactId)) { setView("conversations"); setContactId(openContactId); }
        else { setView("announcements"); }
    }, [openContactId, isLoading]);

    const changed = () => {
        queryClient.invalidateQueries({ queryKey: ["inbox-conversations"] });
        window.dispatchEvent(new Event("him:notifications-changed"));
    };

    const pages = Math.max(1, Math.ceil(convos.length / PER_PAGE));
    const shown = convos.slice((listPage - 1) * PER_PAGE, listPage * PER_PAGE);
    const active = convos.find((c) => c.id === contactId) || (contactId ? { id: contactId, name: "New message" } : null);

    return (
        <div className="space-y-4">
            <div className="inline-flex rounded-xl bg-gray-100 p-1" role="tablist">
                {[["conversations", "Conversations"], ["announcements", "Announcements"]].map(([id, label]) => (
                    <button key={id} role="tab" aria-selected={view === id} onClick={() => setView(id)}
                        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${view === id ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
                        {label}
                    </button>
                ))}
            </div>

            {view === "announcements" ? (
                <Announcements onRead={changed} />
            ) : (
                <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
                    <div className={`${contactId ? "hidden lg:block" : ""} space-y-3`}>
                        <NewMessage onPick={(id) => setContactId(id)} />
                        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
                            {isLoading ? (
                                <p className="p-6 text-center text-sm text-gray-400">Loading…</p>
                            ) : convos.length === 0 ? (
                                <p className="p-6 text-center text-sm text-gray-500">No conversations yet. Start one above.</p>
                            ) : (
                                <ul className="divide-y divide-gray-100">
                                    {shown.map((c) => (
                                        <li key={c.id}>
                                            <button onClick={() => setContactId(c.id)} className={`flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 ${contactId === c.id ? "bg-sky-50/60" : ""}`}>
                                                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${c.color} text-sm font-bold text-white`}>{c.avatar}</span>
                                                <span className="min-w-0 flex-1">
                                                    <span className="flex items-center justify-between gap-2">
                                                        <span className="truncate text-sm font-semibold text-gray-900">{c.name}</span>
                                                        <span className="shrink-0 text-[11px] text-gray-400">{c.lastMessageTime}</span>
                                                    </span>
                                                    <span className="flex items-center justify-between gap-2">
                                                        <span className="truncate text-xs text-gray-500">{c.lastMessage}</span>
                                                        {c.unread > 0 && <span className="shrink-0 rounded-full bg-rose-500 px-1.5 text-[11px] font-bold text-white">{c.unread}</span>}
                                                    </span>
                                                </span>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <Pagination currentPage={listPage} totalPages={pages} totalItems={convos.length} itemsPerPage={PER_PAGE} onPageChange={setListPage} />
                    </div>

                    <div className={`${contactId ? "" : "hidden lg:flex"} min-h-[420px] flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white`}>
                        {active ? (
                            <Thread key={active.id} contact={active} onBack={() => setContactId(null)} onChanged={changed} />
                        ) : (
                            <div className="m-auto p-8 text-center text-sm text-gray-400">Choose a conversation to read it.</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function Thread({ contact, onBack, onChanged }) {
    const [text, setText] = useState("");
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");
    const bottom = useRef(null);

    const { data: messages = [], refetch, isLoading } = useQuery({
        queryKey: ["inbox-thread", contact.id],
        queryFn: async () => {
            const rows = (await api.get(`/messages/conversation/${contact.id}`)).data.messages || [];
            onChanged(); // opening a thread marks it read
            return rows;
        },
        refetchInterval: 10000,
    });

    useEffect(() => { bottom.current?.scrollIntoView({ block: "end" }); }, [messages.length]);

    const send = async (e) => {
        e.preventDefault();
        const content = text.trim();
        if (!content || sending) return;
        setSending(true);
        setError("");
        try {
            await api.post("/messages/direct", { receiver_id: contact.id, content });
            setText("");
            await refetch();
            onChanged();
        } catch (err) {
            setError(err.response?.data?.message || "Message not sent. Please try again.");
        } finally {
            setSending(false);
        }
    };

    return (
        <>
            <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3">
                <button onClick={onBack} className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 lg:hidden" aria-label="Back to conversations">←</button>
                <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-gray-900">{contact.name}</p>
                    {contact.role && <p className="text-xs text-gray-400">{contact.role}</p>}
                </div>
            </div>
            <div className="flex-1 space-y-2 overflow-y-auto px-4 py-4" style={{ maxHeight: 420 }}>
                {isLoading ? <p className="text-center text-sm text-gray-400">Loading…</p>
                    : messages.length === 0 ? <p className="text-center text-sm text-gray-400">Say hello 👋</p>
                    : messages.map((m) => (
                        <div key={m.id} className={`flex ${m.isOwn ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm ${m.isOwn ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"}`}>
                                <p className="whitespace-pre-line break-words">{m.content}</p>
                                <p className={`mt-1 text-[10px] ${m.isOwn ? "text-gray-400" : "text-gray-400"}`}>{m.time}</p>
                            </div>
                        </div>
                    ))}
                <div ref={bottom} />
            </div>
            <form onSubmit={send} className="border-t border-gray-100 p-3">
                {error && <p className="mb-2 text-xs text-rose-600">{error}</p>}
                <div className="flex gap-2">
                    <input value={text} onChange={(e) => setText(e.target.value)} maxLength={2000} placeholder="Write a message…"
                        className="min-w-0 flex-1 rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/20" />
                    <button disabled={sending || !text.trim()} className="rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40">{sending ? "…" : "Send"}</button>
                </div>
            </form>
        </>
    );
}

/** Start a conversation with someone in your zone. */
function NewMessage({ onPick }) {
    const [term, setTerm] = useState("");
    const [results, setResults] = useState([]);

    useEffect(() => {
        if (term.trim().length < 2) { setResults([]); return undefined; }
        let cancelled = false;
        const t = setTimeout(async () => {
            try {
                const { data } = await api.get("/members", { params: { search: term.trim(), per_page: 6 } });
                if (!cancelled) setResults((data?.data || []).filter((m) => m.user_id ?? m.user?.id));
            } catch { if (!cancelled) setResults([]); }
        }, 300);
        return () => { cancelled = true; clearTimeout(t); };
    }, [term]);

    return (
        <div className="relative">
            <input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="New message — search a member in your zone"
                className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm focus:border-gold-400 focus:outline-none focus:ring-2 focus:ring-gold-400/20" />
            {results.length > 0 && (
                <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg">
                    {results.map((m) => (
                        <li key={m.id}>
                            <button onClick={() => { onPick(m.user_id ?? m.user?.id); setTerm(""); setResults([]); }} className="w-full px-3.5 py-2.5 text-left text-sm hover:bg-gray-50">
                                {[m.name, m.surname].filter(Boolean).join(" ")}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

function Announcements({ onRead }) {
    const [page, setPage] = useState(1);
    const { data = [], isLoading } = useQuery({
        queryKey: ["inbox-announcements"],
        queryFn: async () => {
            const rows = (await api.get("/messages/announcements")).data.announcements || [];
            onRead();
            return rows;
        },
    });

    const pages = Math.max(1, Math.ceil(data.length / PER_PAGE));
    const shown = data.slice((page - 1) * PER_PAGE, page * PER_PAGE);

    return (
        <div className="space-y-3">
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
                {isLoading ? <p className="p-6 text-center text-sm text-gray-400">Loading…</p>
                    : data.length === 0 ? <p className="p-8 text-center text-sm text-gray-500">No announcements or notices yet.</p>
                    : (
                        <ul className="divide-y divide-gray-100">
                            {shown.map((a) => (
                                <li key={a.id} className="px-4 py-3.5 sm:px-5">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">{a.type === "notice" ? "Notice" : "Announcement"}{a.department ? ` · ${a.department}` : ""}</p>
                                    <p className="mt-1 whitespace-pre-line break-words text-sm text-gray-800">{a.content}</p>
                                    <p className="mt-1 text-xs text-gray-400">{a.senderName ? `${a.senderName} · ` : ""}{new Date(a.created_at).toLocaleString()}</p>
                                </li>
                            ))}
                        </ul>
                    )}
            </div>
            <Pagination currentPage={page} totalPages={pages} totalItems={data.length} itemsPerPage={PER_PAGE} onPageChange={setPage} />
        </div>
    );
}
