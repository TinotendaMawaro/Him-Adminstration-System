import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Calendar, CalendarPlus, Check, Clock, ExternalLink, Flag, Globe, Lock, LogOut, MapPin, MessageSquare, MoreHorizontal, Pencil, Plus, Radio, Search, Send, Shield, Target, Trash2, UserCheck, UserMinus, Users, Video, X, ChevronRight, Newspaper, Info } from "lucide-react";
import { Avatar, Btn, ActionSheet, ConfirmSheet, Empty, ErrorState, IconBtn, Chip, ScrollTabs, Segmented, Sheet, Skel, TopBar, Verified, toast, cx, Spinner } from "./ui.jsx";
import { FeedList, Scroller } from "./Feed.jsx";
import Composer from "./Composer.jsx";
import { Brand, ChannelRow, PersonRow } from "./Home.jsx";
import { ReportSheet } from "./Post.jsx";
import { channels, community, errorMessage, formatWhen, haptic, timeAgo, watch } from "./lib.js";
import { useNav } from "./nav.jsx";
import { useUser } from "../context/UserContext.jsx";

const CATS = ["Prayer", "Bible study", "Youth", "Women", "Men", "Business", "Marriage & family", "Music & worship", "Outreach", "Zone", "Education", "Health", "General"];

// ── The Channels tab ────────────────────────────────────────────────────────────────────────────

function CreateChannel({ open, onClose }) {
    const nav = useNav();
    const qc = useQueryClient();
    const [f, setF] = useState({ name: "", description: "", category: "General", is_private: false });
    const [busy, setBusy] = useState(false);
    const submit = async () => {
        setBusy(true);
        try { const r = await channels.create(f); toast.success("Channel created"); qc.invalidateQueries({ queryKey: ["channels"] }); qc.invalidateQueries({ queryKey: ["my-channels"] }); onClose(); setF({ name: "", description: "", category: "General", is_private: false }); nav.push("channel", { id: r.data.id }); }
        catch (e) { toast.error(errorMessage(e)); } finally { setBusy(false); }
    };
    return (
        <Sheet open={open} onClose={onClose} title="Create a channel" footer={<Btn block loading={busy} disabled={f.name.trim().length < 3} onClick={submit}>Create channel</Btn>}>
            <div className="space-y-4 pb-2">
                <p className="text-sm" style={{ color: "var(--mut)" }}>A channel is a space for people who share a calling: talk together, set goals, schedule meetings and go live.</p>
                <div><label className="hm-label">Name</label><input className="hm-input" maxLength={60} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="e.g. Harare North Prayer Warriors" /></div>
                <div><label className="hm-label">What is it for?</label><textarea className="hm-input" rows={3} maxLength={500} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></div>
                <div><label className="hm-label">Category</label><select className="hm-input" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>{CATS.map((c) => <option key={c}>{c}</option>)}</select></div>
                <button onClick={() => setF({ ...f, is_private: !f.is_private })} className="w-full flex items-center gap-3 p-3.5 rounded-2xl text-left" style={{ border: "1.5px solid var(--line)", background: "var(--surface2)" }}>
                    {f.is_private ? <Lock size={22} /> : <Globe size={22} />}<div className="flex-1"><div className="font-bold">{f.is_private ? "Private channel" : "Public channel"}</div><div className="text-xs" style={{ color: "var(--mut)" }}>{f.is_private ? "People must ask to join and you approve them." : "Anyone in the community can find and join it."}</div></div>
                    <span className="w-12 h-7 rounded-full p-0.5 transition-colors" style={{ background: f.is_private ? "var(--accent)" : "var(--line)" }}><span className="block w-6 h-6 rounded-full bg-white transition-transform" style={{ transform: f.is_private ? "translateX(20px)" : "none" }} /></span>
                </button>
            </div>
        </Sheet>
    );
}

export default function Channels() {
    const nav = useNav();
    const qc = useQueryClient();
    const [scope, setScope] = useState("mine");
    const [q, setQ] = useState("");
    const [cat, setCat] = useState("");
    const [creating, setCreating] = useState(false);
    const { data, isLoading, isError, error, refetch } = useQuery({ queryKey: ["channels", scope, q, cat], queryFn: () => channels.list({ scope, q: q || undefined, category: cat || undefined }), staleTime: 30_000 });
    const list = data?.data || [];

    return (
        <div className="flex flex-col h-full">
            <div className="px-4 hm-safe-top hm-glass shrink-0" style={{ borderBottom: "1px solid var(--line)" }}>
                <div className="flex items-center justify-between" style={{ minHeight: 56 }}><Brand /><IconBtn icon={Plus} label="Create channel" onClick={() => setCreating(true)} /></div>
                <div className="pb-3"><Segmented value={scope} onChange={setScope} options={[{ value: "mine", label: "My channels", icon: Users }, { value: "discover", label: "Discover", icon: Search }]} /></div>
            </div>
            <Scroller tab="channels" onRefresh={() => qc.invalidateQueries({ queryKey: ["channels"] })}>
                {scope === "discover" && (
                    <div className="px-4 pt-3"><input className="hm-input" placeholder="Search channels" value={q} onChange={(e) => setQ(e.target.value)} />
                        <div className="-mx-4 mt-2"><ScrollTabs value={cat} onChange={setCat} tabs={[{ value: "", label: "All" }, ...CATS.map((c) => ({ value: c, label: c }))]} /></div></div>
                )}
                <div className="px-4 pb-8 pt-2">
                    {isLoading && <div className="space-y-3 pt-2">{[0, 1, 2, 3].map((i) => <Skel key={i} h={64} r={16} />)}</div>}
                    {isError && <ErrorState error={error} onRetry={refetch} />}
                    {!isLoading && list.length === 0 && (scope === "mine"
                        ? <Empty icon={Users} title="You haven't joined any channels" text="Find a community that shares your calling, or start your own." action={<div className="flex gap-2"><Btn size="sm" variant="soft" onClick={() => setScope("discover")}>Discover</Btn><Btn size="sm" onClick={() => setCreating(true)}>Create one</Btn></div>} />
                        : <Empty icon={Search} title="No channels found" text="Try a different search or create the first one." />)}
                    <div className="divide-y" style={{ "--tw-divide-opacity": 1 }}>{list.map((c) => <div key={c.id} style={{ borderColor: "var(--line)" }}><ChannelRow channel={c} onClick={() => nav.push("channel", { id: c.id })} /></div>)}</div>
                </div>
            </Scroller>
            <CreateChannel open={creating} onClose={() => setCreating(false)} />
        </div>
    );
}

// ── Chat ────────────────────────────────────────────────────────────────────────────────────────

function Chat({ channel }) {
    const [msgs, setMsgs] = useState([]);
    const [text, setText] = useState("");
    const [loaded, setLoaded] = useState(false);
    const [sending, setSending] = useState(false);
    const box = useRef(null);
    const last = useRef(0);
    const stick = useRef(true);
    const canTalk = channel.my_status === "active";

    const merge = useCallback((rows) => {
        if (!rows.length) return;
        setMsgs((cur) => { const seen = new Set(cur.map((m) => m.id)); return [...cur, ...rows.filter((r) => !seen.has(r.id))]; });
        last.current = Math.max(last.current, ...rows.map((r) => r.id));
    }, []);

    useEffect(() => {
        let dead = false;
        const poll = async () => {
            try { const r = await channels.messages(channel.id, last.current || undefined); if (!dead) { merge(r.data); setLoaded(true); } } catch { if (!dead) setLoaded(true); }
        };
        poll();
        const id = setInterval(() => !document.hidden && poll(), 3500);
        return () => { dead = true; clearInterval(id); };
    }, [channel.id, merge]);

    useEffect(() => { if (stick.current) box.current?.scrollTo({ top: box.current.scrollHeight }); }, [msgs.length]);
    const onScroll = () => { const el = box.current; stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 90; };

    const send = async () => {
        const body = text.trim(); if (!body || sending) return;
        setSending(true); setText(""); stick.current = true;
        try { const r = await channels.say(channel.id, body); merge([r.data]); haptic(8); } catch (e) { setText(body); toast.error(errorMessage(e)); } finally { setSending(false); }
    };

    return (
        <div className="flex flex-col h-full">
            <div ref={box} onScroll={onScroll} className="flex-1 overflow-y-auto hm-hide-scroll px-3 py-3 space-y-1.5">
                {!loaded && <Spinner />}
                {loaded && msgs.length === 0 && <Empty icon={MessageSquare} title="Start the conversation" text="Say hello to your channel." />}
                {msgs.map((m, i) => {
                    const prev = msgs[i - 1]; const first = !prev || prev.author.id !== m.author.id || new Date(m.created_at) - new Date(prev.created_at) > 5 * 60_000;
                    return (
                        <div key={m.id} className={cx("flex gap-2", m.mine && "flex-row-reverse")}>
                            <div className="w-8 shrink-0">{!m.mine && first && <Avatar user={m.author} size={32} />}</div>
                            <div className={cx("max-w-[78%]", m.mine && "items-end flex flex-col")}>
                                {first && !m.mine && <div className="text-[11.5px] font-bold ml-1 mb-0.5" style={{ color: "var(--mut)" }}>{m.author.name}{m.author.badge ? ` · ${m.author.badge}` : ""}</div>}
                                <div className="px-3.5 py-2 text-[15px] leading-snug whitespace-pre-wrap break-words" style={m.mine ? { background: "linear-gradient(135deg,#1e3a5f,#2f6bff)", color: "#fff", borderRadius: "20px 20px 6px 20px" } : { background: "var(--surface)", border: "1px solid var(--line)", borderRadius: "20px 20px 20px 6px" }}>{m.body}</div>
                                {first && <div className="text-[10.5px] mt-0.5 mx-1" style={{ color: "var(--mut)" }}>{timeAgo(m.created_at)}</div>}
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="p-3 shrink-0 hm-safe-bottom" style={{ borderTop: "1px solid var(--line)", background: "var(--surface)" }}>
                {canTalk ? (
                    <div className="flex items-end gap-2"><textarea rows={1} className="hm-input flex-1" style={{ minHeight: 46, maxHeight: 110 }} maxLength={1000} placeholder="Message…" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} /><Btn icon={Send} loading={sending} disabled={!text.trim()} onClick={send} aria-label="Send" style={{ width: 46, padding: 0, height: 46 }} /></div>
                ) : <div className="text-center text-sm py-2" style={{ color: "var(--mut)" }}>Join this channel to chat.</div>}
            </div>
        </div>
    );
}

// ── Goals ───────────────────────────────────────────────────────────────────────────────────────

function GoalSheet({ goal, channel, onClose, onChange }) {
    const { user } = useUser();
    const steward = goal.creator?.id === user?.id || channel.can_moderate;
    const [progress, setProgress] = useState(goal.progress);
    const [note, setNote] = useState("");
    const [busy, setBusy] = useState(false);
    const { data, refetch } = useQuery({ queryKey: ["goal", goal.id], queryFn: async () => (await channels.goals(channel.id)).data.find((g) => g.id === goal.id) });
    const save = async (extra = {}) => {
        setBusy(true);
        try { await channels.updateGoal(goal.id, { progress: steward ? progress : undefined, note: note.trim() || undefined, ...extra }); setNote(""); toast.success("Goal updated"); onChange(); refetch(); }
        catch (e) { toast.error(errorMessage(e)); } finally { setBusy(false); }
    };
    return (
        <Sheet open onClose={onClose} title="Goal" footer={
            <div className="space-y-2">
                <div className="flex gap-2"><input className="hm-input" placeholder={steward ? "Add a progress note" : "Encourage the team"} value={note} maxLength={280} onChange={(e) => setNote(e.target.value)} /><Btn loading={busy} onClick={() => save()} disabled={!note.trim() && progress === goal.progress}>Save</Btn></div>
                {steward && goal.status === "open" && <Btn block variant="soft" icon={Check} onClick={() => save({ status: "achieved" })}>Mark as achieved</Btn>}
            </div>}>
            <div className="space-y-4 pb-3">
                <div><h3 className="font-extrabold text-xl leading-snug">{goal.title}</h3>{goal.description && <p className="mt-1 text-[15px]" style={{ color: "var(--mut)" }}>{goal.description}</p>}</div>
                <div className="flex gap-4 text-xs font-semibold" style={{ color: "var(--mut)" }}>{goal.target_date && <span className="flex items-center gap-1"><Calendar size={13} />Target {goal.target_date}</span>}<span>by {goal.creator?.name}</span></div>
                <div><div className="flex justify-between text-sm font-bold mb-1.5"><span>Progress</span><span>{steward ? progress : goal.progress}%</span></div><div className="hm-progress"><span style={{ width: `${steward ? progress : goal.progress}%` }} /></div>
                    {steward && goal.status === "open" && <input type="range" min="0" max="100" step="5" value={progress} onChange={(e) => setProgress(+e.target.value)} className="w-full mt-3" />}</div>
                <div><h4 className="hm-label">Updates</h4>{(data?.updates || []).length === 0 ? <p className="text-sm" style={{ color: "var(--mut)" }}>No updates yet.</p> : <div className="space-y-2">{data.updates.slice().reverse().map((u) => <div key={u.id} className="rounded-2xl p-3 text-sm" style={{ background: "var(--surface2)" }}><div className="flex justify-between font-bold text-[13px]"><span>{u.by}</span><span style={{ color: "var(--mut)" }}>{u.progress}% · {timeAgo(u.at)}</span></div>{u.note && <div className="mt-0.5">{u.note}</div>}</div>)}</div>}</div>
            </div>
        </Sheet>
    );
}

function Goals({ channel }) {
    const [open, setOpen] = useState(null);
    const [adding, setAdding] = useState(false);
    const [f, setF] = useState({ title: "", description: "", target_date: "" });
    const [busy, setBusy] = useState(false);
    const { data, isLoading, isError, error, refetch } = useQuery({ queryKey: ["goals", channel.id], queryFn: () => channels.goals(channel.id) });
    const goals = data?.data || [];
    const member = channel.my_status === "active";
    const add = async () => {
        setBusy(true);
        try { await channels.createGoal(channel.id, { ...f, target_date: f.target_date || undefined }); toast.success("Goal added"); setAdding(false); setF({ title: "", description: "", target_date: "" }); refetch(); } catch (e) { toast.error(errorMessage(e)); } finally { setBusy(false); }
    };
    return (
        <div className="px-4 py-3 space-y-3 pb-10">
            {member && <Btn block icon={Plus} variant="soft" onClick={() => setAdding(true)}>Set a goal</Btn>}
            {isLoading && <Skel h={100} r={18} />}
            {isError && <ErrorState error={error} onRetry={refetch} />}
            {!isLoading && goals.length === 0 && <Empty icon={Target} title="No goals yet" text="Set a goal the whole channel can work towards, like reading the Bible in 90 days." />}
            {goals.map((g) => (
                <button key={g.id} onClick={() => setOpen(g)} className="hm-card p-4 w-full text-left">
                    <div className="flex items-start gap-3"><div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0" style={{ background: g.status === "achieved" ? "color-mix(in srgb, var(--ok) 15%, transparent)" : "var(--surface2)", color: g.status === "achieved" ? "var(--ok)" : "var(--accent)" }}>{g.status === "achieved" ? <Check size={20} /> : <Target size={20} />}</div>
                        <div className="flex-1 min-w-0"><div className="font-bold text-[15.5px] leading-snug">{g.title}</div><div className="text-xs mt-0.5 flex gap-2" style={{ color: g.overdue ? "var(--danger)" : "var(--mut)" }}>{g.status === "achieved" ? <span style={{ color: "var(--ok)" }}>Achieved 🎉</span> : g.target_date ? <span>Target {g.target_date}{g.overdue ? " · overdue" : ""}</span> : <span>No deadline</span>}</div></div><span className="font-extrabold text-lg">{g.progress}%</span></div>
                    <div className="hm-progress mt-3"><span style={{ width: `${g.progress}%` }} /></div>
                </button>
            ))}
            {open && <GoalSheet goal={open} channel={channel} onClose={() => setOpen(null)} onChange={refetch} />}
            <Sheet open={adding} onClose={() => setAdding(false)} title="Set a goal" footer={<Btn block loading={busy} disabled={f.title.trim().length < 3} onClick={add}>Add goal</Btn>}>
                <div className="space-y-4 pb-2"><div><label className="hm-label">Goal</label><input className="hm-input" maxLength={140} placeholder="Pray together every morning for 30 days" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></div>
                    <div><label className="hm-label">Details (optional)</label><textarea className="hm-input" rows={3} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></div>
                    <div><label className="hm-label">Target date (optional)</label><input type="date" className="hm-input" min={new Date().toISOString().slice(0, 10)} value={f.target_date} onChange={(e) => setF({ ...f, target_date: e.target.value })} /></div></div>
            </Sheet>
        </div>
    );
}

// ── Meetings ────────────────────────────────────────────────────────────────────────────────────

function downloadIcs(m, channelName) {
    const fmt = (d) => new Date(d).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
    const end = m.ends_at || new Date(new Date(m.starts_at).getTime() + 3600_000).toISOString();
    const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Heartfelt//Community//EN", "BEGIN:VEVENT", `UID:meeting-${m.id}@heartfelt`, `DTSTAMP:${fmt(new Date())}`, `DTSTART:${fmt(m.starts_at)}`, `DTEND:${fmt(end)}`,
        `SUMMARY:${m.title.replace(/[\n,;]/g, " ")}`, `DESCRIPTION:${(m.description || channelName || "").replace(/\n/g, "\\n")}${m.link_url ? "\\n" + m.link_url : ""}`, m.location ? `LOCATION:${m.location}` : "", "END:VEVENT", "END:VCALENDAR"].filter(Boolean).join("\r\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" })); a.download = "meeting.ics"; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function Meetings({ channel }) {
    const { user } = useUser();
    const [adding, setAdding] = useState(false);
    const [f, setF] = useState({ title: "", description: "", starts_at: "", mode: "online", link_url: "", location: "" });
    const [busy, setBusy] = useState(false);
    const [cancelling, setCancelling] = useState(null);
    const { data, isLoading, isError, error, refetch } = useQuery({ queryKey: ["meetings", channel.id], queryFn: () => channels.meetings(channel.id) });
    const list = (data?.data || []).filter((m) => m.status !== "cancelled");
    const member = channel.my_status === "active";
    const upcoming = list.filter((m) => !m.past); const past = list.filter((m) => m.past).reverse();

    const add = async () => {
        setBusy(true);
        try { await channels.createMeeting(channel.id, { ...f, starts_at: new Date(f.starts_at).toISOString(), link_url: f.mode === "online" ? f.link_url || undefined : undefined, location: f.mode === "in_person" ? f.location || undefined : undefined }); toast.success("Meeting scheduled. Members were notified."); setAdding(false); setF({ title: "", description: "", starts_at: "", mode: "online", link_url: "", location: "" }); refetch(); }
        catch (e) { toast.error(errorMessage(e)); } finally { setBusy(false); }
    };
    const rsvp = async (m, status) => { haptic(10); try { await channels.rsvp(m.id, status); refetch(); } catch (e) { toast.error(errorMessage(e)); } };
    const cancel = async () => { try { await channels.cancelMeeting(cancelling.id); toast.success("Meeting cancelled"); setCancelling(null); refetch(); } catch (e) { toast.error(errorMessage(e)); } };

    const Card = ({ m, old }) => {
        const d = new Date(m.starts_at);
        return (
            <div className="hm-card p-4" style={old ? { opacity: 0.65 } : undefined}>
                <div className="flex gap-3.5">
                    <div className="w-14 shrink-0 rounded-2xl text-center py-2" style={{ background: "linear-gradient(160deg,#1e3a5f,#2f6bff)", color: "#fff" }}><div className="text-[11px] font-bold uppercase opacity-80">{d.toLocaleString(undefined, { month: "short" })}</div><div className="text-2xl font-extrabold leading-none">{d.getDate()}</div></div>
                    <div className="flex-1 min-w-0"><div className="font-bold text-[16px] leading-snug">{m.title}</div><div className="text-[12.5px] mt-1 flex items-center gap-1.5 flex-wrap" style={{ color: "var(--mut)" }}><Clock size={13} />{d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}<span>·</span>{m.mode === "online" ? <><Video size={13} />Online</> : <><MapPin size={13} />{m.location || "In person"}</>}<span>·</span>{m.going} going</div>
                        {m.description && <p className="text-sm mt-1.5" style={{ color: "var(--mut)" }}>{m.description}</p>}</div>
                </div>
                {!old && (
                    <div className="mt-3 space-y-2">
                        {member && <div className="flex gap-2">{[["going", "Going"], ["maybe", "Maybe"], ["declined", "Can't"]].map(([v, l]) => <button key={v} onClick={() => rsvp(m, v)} className="flex-1 h-10 rounded-xl font-bold text-[13.5px]" style={m.my_rsvp === v ? { background: v === "going" ? "var(--ok)" : v === "maybe" ? "var(--gold)" : "var(--mut)", color: "#fff" } : { background: "var(--surface2)", color: "var(--mut)" }}>{l}</button>)}</div>}
                        <div className="flex gap-2 flex-wrap">
                            {m.link_url && <a href={m.link_url} target="_blank" rel="noopener noreferrer" className="flex-1"><Btn size="sm" block icon={ExternalLink}>Join meeting</Btn></a>}
                            <Btn size="sm" variant="soft" icon={CalendarPlus} onClick={() => downloadIcs(m, channel.name)}>Add to calendar</Btn>
                            {(m.creator?.id === user?.id || channel.can_moderate) && <Btn size="sm" variant="danger" icon={Trash2} onClick={() => setCancelling(m)} aria-label="Cancel meeting" />}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="px-4 py-3 space-y-3 pb-10">
            {member && <Btn block icon={Plus} variant="soft" onClick={() => setAdding(true)}>Schedule a meeting</Btn>}
            {isLoading && <Skel h={120} r={18} />}
            {isError && <ErrorState error={error} onRetry={refetch} />}
            {!isLoading && list.length === 0 && <Empty icon={Calendar} title="No meetings scheduled" text="Plan a prayer call, a study session or a get-together." />}
            {upcoming.map((m) => <Card key={m.id} m={m} />)}
            {past.length > 0 && <><h4 className="hm-label pt-2">Past</h4>{past.slice(0, 5).map((m) => <Card key={m.id} m={m} old />)}</>}
            <Sheet open={adding} onClose={() => setAdding(false)} title="Schedule a meeting" footer={<Btn block loading={busy} disabled={f.title.trim().length < 3 || !f.starts_at} onClick={add}>Schedule</Btn>}>
                <div className="space-y-4 pb-2">
                    <div><label className="hm-label">Title</label><input className="hm-input" maxLength={140} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="Weekly prayer call" /></div>
                    <div><label className="hm-label">When</label><input type="datetime-local" className="hm-input" value={f.starts_at} onChange={(e) => setF({ ...f, starts_at: e.target.value })} /></div>
                    <Segmented value={f.mode} onChange={(mode) => setF({ ...f, mode })} options={[{ value: "online", label: "Online", icon: Video }, { value: "in_person", label: "In person", icon: MapPin }]} />
                    {f.mode === "online" ? <div><label className="hm-label">Meeting link (https)</label><input className="hm-input" inputMode="url" placeholder="https://meet.google.com/…" value={f.link_url} onChange={(e) => setF({ ...f, link_url: e.target.value })} /></div>
                        : <div><label className="hm-label">Where</label><input className="hm-input" value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} placeholder="Address or venue" /></div>}
                    <div><label className="hm-label">Agenda (optional)</label><textarea className="hm-input" rows={3} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></div>
                </div>
            </Sheet>
            <ConfirmSheet open={!!cancelling} onClose={() => setCancelling(null)} title="Cancel this meeting?" text="Everyone in the channel will be notified." confirm="Cancel meeting" danger onConfirm={cancel} />
        </div>
    );
}

// ── Members ─────────────────────────────────────────────────────────────────────────────────────

function Members({ channel, onChanged }) {
    const { user } = useUser();
    const [target, setTarget] = useState(null);
    const active = useQuery({ queryKey: ["members", channel.id, "active"], queryFn: () => channels.members(channel.id, "active") });
    const pending = useQuery({ queryKey: ["members", channel.id, "pending"], queryFn: () => channels.members(channel.id, "pending"), enabled: channel.can_moderate });
    const isOwner = channel.my_role === "owner" || user?.role === "master";
    const act = async (m, action) => { try { await channels.decide(channel.id, m.id, action); toast.success("Done"); active.refetch(); pending.refetch(); onChanged?.(); } catch (e) { toast.error(errorMessage(e)); } };

    return (
        <div className="px-4 py-3 pb-10">
            {pending.data?.data?.length > 0 && (
                <section className="mb-4"><h4 className="hm-label">Requests to join</h4>
                    {pending.data.data.map((m) => <PersonRow key={m.id} person={m} right={<div className="flex gap-2"><Btn size="sm" icon={Check} onClick={() => act(m, "approve")} aria-label="Approve" /><Btn size="sm" variant="soft" icon={X} onClick={() => act(m, "reject")} aria-label="Reject" /></div>} />)}</section>
            )}
            <h4 className="hm-label">{active.data?.data?.length ?? 0} members</h4>
            {active.isLoading && <Spinner />}
            {active.data?.data?.map((m) => (
                <PersonRow key={m.id} person={m} right={
                    <div className="flex items-center gap-2">{m.role !== "member" && <span className="hm-badge hm-badge-gold">{m.role === "owner" ? "Owner" : "Mod"}</span>}
                        {channel.can_moderate && m.role !== "owner" && m.id !== user?.id && <button className="hm-icon-btn" onClick={() => setTarget(m)} aria-label="Manage"><MoreHorizontal size={20} /></button>}</div>} />
            ))}
            <ActionSheet open={!!target} onClose={() => setTarget(null)} title={target?.name} actions={target ? [
                isOwner && (target.role === "moderator" ? { label: "Make regular member", icon: UserMinus, onClick: () => act(target, "member") } : { label: "Make moderator", icon: Shield, onClick: () => act(target, "moderator") }),
                { label: "Remove from channel", icon: UserMinus, danger: true, onClick: () => act(target, "remove") },
                { label: "Ban from channel", icon: Flag, danger: true, onClick: () => act(target, "ban") },
            ] : []} />
        </div>
    );
}

// ── Channel Live ────────────────────────────────────────────────────────────────────────────────

function ChannelLive({ channel }) {
    const nav = useNav();
    const { data, isLoading } = useQuery({ queryKey: ["live"], queryFn: watch.live, staleTime: 15_000 });
    const mine = ["live_now", "upcoming", "ended"].flatMap((k) => (data?.data?.[k] || []).filter((s) => s.channel?.id === channel.id));
    return (
        <div className="px-4 py-3 space-y-3 pb-10">
            {channel.can_moderate && <Btn block variant="gold" icon={Radio} onClick={() => nav.setTab("watch")}>Schedule a live video in Watch</Btn>}
            {isLoading && <Skel h={100} r={18} />}
            {!isLoading && mine.length === 0 && <Empty icon={Radio} title="No live sessions" text={channel.can_moderate ? "Schedule a YouTube live for this channel from the Watch tab." : "When a moderator schedules a live video, it will appear here."} />}
            {mine.map((s) => <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" className="hm-card p-3 flex items-center gap-3"><img src={s.thumb} alt="" className="w-24 rounded-xl" style={{ aspectRatio: "16/10", objectFit: "cover" }} /><div className="flex-1 min-w-0"><div className="font-bold text-sm">{s.title}</div><div className="text-xs mt-0.5" style={{ color: s.status === "live" ? "var(--danger)" : "var(--mut)" }}>{s.status === "live" ? "● Live now" : formatWhen(s.scheduled_at)}</div></div><ChevronRight size={18} style={{ color: "var(--mut)" }} /></a>)}
        </div>
    );
}

// ── The channel page ────────────────────────────────────────────────────────────────────────────

export function ChannelScreen({ id }) {
    const nav = useNav();
    const qc = useQueryClient();
    const { user } = useUser();
    const [tab, setTab] = useState("chat");
    const [menu, setMenu] = useState(false);
    const [report, setReport] = useState(false);
    const [compose, setCompose] = useState(false);
    const [confirm, setConfirm] = useState(null);
    const [busy, setBusy] = useState(false);
    const { data, isLoading, isError, error, refetch } = useQuery({ queryKey: ["channel", id], queryFn: () => channels.show(id) });
    const c = data?.data;
    const reload = () => { refetch(); qc.invalidateQueries({ queryKey: ["channels"] }); qc.invalidateQueries({ queryKey: ["my-channels"] }); };

    const join = async () => { setBusy(true); haptic(12); try { const r = await channels.join(id); toast.success(r.message); reload(); } catch (e) { toast.error(errorMessage(e)); } finally { setBusy(false); } };
    const leave = async () => { setBusy(true); try { await channels.leave(id); toast.success("You left the channel"); setConfirm(null); reload(); } catch (e) { toast.error(errorMessage(e)); } finally { setBusy(false); } };
    const remove = async () => { setBusy(true); try { await channels.remove(id); toast.success("Channel deleted"); qc.invalidateQueries({ queryKey: ["channels"] }); nav.pop(); } catch (e) { toast.error(errorMessage(e)); } finally { setBusy(false); } };

    if (isLoading) return <div className="flex flex-col h-full"><TopBar back title="" /><div className="p-4 space-y-3"><Skel h={140} r={24} /><Skel h={24} w="60%" /><Skel h={60} /></div></div>;
    if (isError) return <div className="flex flex-col h-full"><TopBar back title="Channel" /><ErrorState error={error} onRetry={refetch} /></div>;

    const member = c.my_status === "active";
    const locked = c.private && !member;
    const tabs = [{ value: "chat", label: "Chat", icon: MessageSquare }, { value: "posts", label: "Posts", icon: Newspaper }, { value: "goals", label: "Goals", icon: Target }, { value: "meetings", label: "Meetings", icon: Calendar }, { value: "live", label: "Live", icon: Radio }, { value: "members", label: "People", icon: Users }];

    return (
        <div className="flex flex-col h-full">
            <div className="relative shrink-0" style={{ background: c.cover ? `url(${c.cover}) center/cover` : "linear-gradient(135deg,#0f2744,#2f6bff)" }}>
                <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,.35), rgba(0,0,0,.6))" }} />
                <div className="relative hm-safe-top px-3 pt-2 text-white">
                    <div className="flex items-center"><IconBtn icon={ChevronRight} label="Back" onClick={nav.pop} className="rotate-180" /><div className="flex-1" /><IconBtn icon={MoreHorizontal} label="Menu" onClick={() => setMenu(true)} /></div>
                    <div className="flex items-end gap-3.5 pb-4 pt-3">
                        <div className="w-[72px] h-[72px] rounded-[22px] flex items-center justify-center text-3xl font-extrabold overflow-hidden shrink-0" style={{ background: "rgba(255,255,255,.18)", border: "2px solid rgba(255,255,255,.5)", backdropFilter: "blur(8px)" }}>{c.avatar ? <img src={c.avatar} alt="" className="w-full h-full object-cover" /> : c.name[0]}</div>
                        <div className="flex-1 min-w-0"><div className="font-extrabold text-[22px] leading-tight flex items-center gap-1.5">{c.name}{c.official && <Verified size={18} />}</div><div className="text-[13px] opacity-90 flex items-center gap-2 mt-0.5">{c.private ? <><Lock size={13} />Private</> : <><Globe size={13} />Public</>}<span>·</span>{c.members} member{c.members === 1 ? "" : "s"}{c.category && <><span>·</span>{c.category}</>}</div></div>
                    </div>
                </div>
            </div>
            <div className="px-4 py-3 shrink-0 flex items-center gap-3" style={{ borderBottom: "1px solid var(--line)", background: "var(--surface)" }}>
                <div className="flex-1 text-[13.5px] line-clamp-2" style={{ color: "var(--mut)" }}>{c.description || "No description yet."}</div>
                {member ? <Btn size="sm" variant="soft" icon={Check} disabled>Joined</Btn> : c.my_status === "pending" ? <Btn size="sm" variant="soft" disabled>Requested</Btn> : c.my_status === "banned" ? null : <Btn size="sm" loading={busy} onClick={join}>{c.private ? "Request to join" : "Join"}</Btn>}
            </div>

            {locked ? <Empty icon={Lock} title="This channel is private" text="Request to join and the owner will review it." /> : (
                <>
                    <div className="shrink-0" style={{ background: "var(--surface)", borderBottom: "1px solid var(--line)" }}><ScrollTabs tabs={tabs} value={tab} onChange={setTab} /></div>
                    <div className="flex-1 min-h-0 relative">
                        {tab === "chat" && <Chat channel={c} />}
                        {tab === "posts" && (<Scroller tab="channel"><div>{member && <div className="px-3 pt-3"><Btn block variant="soft" icon={Pencil} onClick={() => setCompose(true)}>Post to {c.name}</Btn></div>}<FeedList queryKey={["feed", "channel", c.id]} fetcher={(page) => channels.posts(c.id, page)} empty={<Empty icon={Newspaper} title="No posts yet" text="Share a thought, a prayer topic or a testimony with the channel." />} /></div></Scroller>)}
                        {tab === "goals" && <div className="hm-scroll h-full"><Goals channel={c} /></div>}
                        {tab === "meetings" && <div className="hm-scroll h-full"><Meetings channel={c} /></div>}
                        {tab === "live" && <div className="hm-scroll h-full"><ChannelLive channel={c} /></div>}
                        {tab === "members" && <div className="hm-scroll h-full"><Members channel={c} onChanged={reload} /></div>}
                    </div>
                </>
            )}

            <Composer open={compose} onClose={() => setCompose(false)} channelId={c.id} onPosted={() => qc.invalidateQueries({ queryKey: ["feed", "channel", c.id] })} />
            <ReportSheet open={report} onClose={() => setReport(false)} type="channel" id={c.id} />
            <ActionSheet open={menu} onClose={() => setMenu(false)} title={c.name} actions={[
                { label: "Share channel", icon: ExternalLink, onClick: () => { const url = `${window.location.origin}/?channel=${c.id}`; navigator.share ? navigator.share({ title: c.name, url }).catch(() => {}) : (navigator.clipboard?.writeText(url), toast.success("Link copied")); } },
                member && c.my_role !== "owner" && { label: "Leave channel", icon: LogOut, danger: true, onClick: () => setConfirm("leave") },
                (c.my_role === "owner" || user?.role === "master") && { label: "Delete channel", icon: Trash2, danger: true, onClick: () => setConfirm("delete") },
                c.my_role !== "owner" && { label: "Report channel", icon: Flag, danger: true, onClick: () => setReport(true) },
            ]} />
            <ConfirmSheet open={confirm === "leave"} onClose={() => setConfirm(null)} title="Leave this channel?" confirm="Leave" danger loading={busy} onConfirm={leave} />
            <ConfirmSheet open={confirm === "delete"} onClose={() => setConfirm(null)} title="Delete this channel?" text="All its chat, goals and meetings will be removed for everyone." confirm="Delete" danger loading={busy} onConfirm={remove} />
        </div>
    );
}
