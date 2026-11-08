import { useEffect, useRef, useState } from "react";
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, BellRing, CalendarClock, Clapperboard, ExternalLink, Eye, Heart, MessageCircle, Play, Plus, Radio, Share2, Video, Volume2, Loader2, Calendar } from "lucide-react";
import { Avatar, Btn, ConfirmSheet, Empty, ErrorState, InView, ScrollTabs, Segmented, Sheet, Skel, TopBar, Verified, cx, toast, IconBtn, Chip } from "./ui.jsx";
import { Scroller } from "./Feed.jsx";
import { VideoEmbed, CommentsSheet, sharePost } from "./Post.jsx";
import { Brand } from "./Home.jsx";
import { channels, community, errorMessage, formatWhen, compact, haptic, watch } from "./lib.js";
import { useNav } from "./nav.jsx";
import { useUser } from "../context/UserContext.jsx";

const SUBTABS = [{ value: "teachings", label: "Teachings", icon: Video }, { value: "shorts", label: "Shorts", icon: Clapperboard }, { value: "live", label: "Live", icon: Radio }];

export default function Watch({ boot }) {
    const [tab, setTab] = useState(boot?.live_now > 0 ? "live" : "teachings");
    const nav = useNav();
    const full = tab === "shorts";
    return (
        <div className="flex flex-col h-full" style={full ? { background: "#000" } : undefined}>
            <div className={cx("px-4 hm-safe-top shrink-0 z-20", full ? "absolute inset-x-0 top-0" : "hm-glass")} style={{ borderBottom: full ? "none" : "1px solid var(--line)", background: full ? "linear-gradient(to bottom, rgba(0,0,0,.6), transparent)" : undefined }}>
                <div className="flex items-center justify-between" style={{ minHeight: 56 }}>
                    {full ? <div className="font-extrabold text-xl text-white">Shorts</div> : <Brand />}
                    {full && <div className="flex gap-1">{SUBTABS.map((s) => <button key={s.value} onClick={() => setTab(s.value)} className="px-3 h-8 rounded-full text-[13px] font-bold" style={{ background: tab === s.value ? "#fff" : "rgba(255,255,255,.18)", color: tab === s.value ? "#000" : "#fff" }}>{s.label}</button>)}</div>}
                </div>
                {!full && <div className="pb-3"><Segmented value={tab} onChange={setTab} options={SUBTABS} /></div>}
            </div>
            {tab === "teachings" && <Teachings />}
            {tab === "live" && <Live />}
            {tab === "shorts" && <Shorts />}
        </div>
    );
}

// ── Teachings: the Apostle's official library ───────────────────────────────────────────────────

function TeachingPlayer({ item, onClose }) {
    useEffect(() => { watch.viewTeaching(item.id); }, [item.id]);
    return (
        <Sheet open onClose={onClose} title={item.title} full>
            <div className="space-y-4 pb-8">
                <VideoEmbed media={{ embed: item.embed, thumb: item.thumb }} autoPlay />
                <div>
                    <div className="flex items-center gap-2 text-sm font-bold" style={{ color: "var(--gold)" }}><Verified size={15} />{item.speaker}</div>
                    <h2 className="font-extrabold text-[21px] leading-snug mt-1">{item.title}</h2>
                    <div className="text-xs mt-1 flex gap-3" style={{ color: "var(--mut)" }}>{item.series && <span>{item.series}</span>}<span className="flex items-center gap-1"><Eye size={13} />{compact(item.views)} views</span></div>
                </div>
                {item.description && <p className="text-[15px] leading-relaxed whitespace-pre-wrap" style={{ color: "var(--mut)" }}>{item.description}</p>}
                <div className="flex gap-2"><Btn variant="soft" size="sm" icon={Share2} onClick={() => navigator.share?.({ title: item.title, url: item.url }).catch(() => {}) ?? navigator.clipboard?.writeText(item.url)}>Share</Btn><a href={item.url} target="_blank" rel="noopener noreferrer"><Btn variant="soft" size="sm" icon={ExternalLink}>Open on YouTube</Btn></a></div>
            </div>
        </Sheet>
    );
}

function Teachings() {
    const [series, setSeries] = useState("");
    const [playing, setPlaying] = useState(null);
    const { data, isLoading, isError, error, refetch } = useQuery({ queryKey: ["teachings", series], queryFn: () => watch.teachings(series || undefined), staleTime: 60_000 });
    const d = data?.data;
    const qc = useQueryClient();

    return (
        <Scroller tab="watch" onRefresh={() => qc.invalidateQueries({ queryKey: ["teachings"] })}>
            {isLoading && <div className="p-4 space-y-3"><Skel h={210} r={22} /><Skel h={80} /><Skel h={80} /></div>}
            {isError && <ErrorState error={error} onRetry={refetch} />}
            {d && (
                <div className="pb-8">
                    {d.featured && !series && (
                        <button onClick={() => setPlaying(d.featured)} className="relative block mx-4 mt-4 rounded-[26px] overflow-hidden text-left w-[calc(100%-32px)]" style={{ aspectRatio: "16/10", boxShadow: "var(--shadow)" }}>
                            <img src={d.featured.thumb} alt="" className="absolute inset-0 w-full h-full object-cover" />
                            <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(8,16,32,.92), rgba(8,16,32,.1) 65%)" }} />
                            <div className="absolute top-3.5 left-3.5 hm-badge hm-badge-gold" style={{ background: "var(--gold)", color: "#1c1503", height: 24 }}>FEATURED</div>
                            <div className="absolute inset-0 flex items-center justify-center"><div className="w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-md" style={{ background: "rgba(255,255,255,.22)", border: "1.5px solid rgba(255,255,255,.5)" }}><Play size={28} fill="#fff" color="#fff" style={{ marginLeft: 3 }} /></div></div>
                            <div className="absolute bottom-0 inset-x-0 p-4 text-white"><div className="text-[12px] font-bold flex items-center gap-1.5" style={{ color: "var(--gold2)" }}><Verified size={13} />{d.featured.speaker}</div><div className="font-extrabold text-[19px] leading-tight mt-0.5">{d.featured.title}</div></div>
                        </button>
                    )}
                    {d.series.length > 0 && <div className="mt-3"><ScrollTabs value={series} onChange={setSeries} tabs={[{ value: "", label: "All" }, ...d.series.map((s) => ({ value: s, label: s }))]} /></div>}
                    <div className="px-4 mt-1 space-y-3">
                        {d.items.length === 0 && <Empty icon={Video} title="No teachings yet" text="New messages from Apostle Tavonga Vutabwashe will appear here." />}
                        {d.items.map((t) => (
                            <button key={t.id} onClick={() => setPlaying(t)} className="w-full flex gap-3 text-left hm-card p-2.5">
                                <div className="relative w-[132px] shrink-0 rounded-xl overflow-hidden" style={{ aspectRatio: "16/10" }}><img src={t.thumb} alt="" loading="lazy" className="w-full h-full object-cover" /><div className="absolute inset-0 flex items-center justify-center"><div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,.5)" }}><Play size={14} fill="#fff" color="#fff" style={{ marginLeft: 2 }} /></div></div></div>
                                <div className="flex-1 min-w-0 py-0.5"><div className="font-bold text-[14.5px] leading-snug line-clamp-2">{t.title}</div><div className="text-xs mt-1" style={{ color: "var(--mut)" }}>{t.speaker}</div><div className="text-[11.5px] mt-1 flex gap-2" style={{ color: "var(--mut)" }}>{t.series && <span className="hm-badge" style={{ background: "var(--surface2)" }}>{t.series}</span>}<span className="flex items-center gap-1"><Eye size={12} />{compact(t.views)}</span></div></div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
            {playing && <TeachingPlayer item={playing} onClose={() => setPlaying(null)} />}
        </Scroller>
    );
}

// ── Live ────────────────────────────────────────────────────────────────────────────────────────

function useCountdown(iso) {
    const [now, setNow] = useState(Date.now());
    useEffect(() => { const id = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(id); }, []);
    const ms = new Date(iso).getTime() - now;
    if (ms <= 0) return null;
    const s = Math.floor(ms / 1000), d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60);
    return d > 0 ? `${d}d ${h}h` : h > 0 ? `${h}h ${m}m` : `${m}m ${s % 60}s`;
}

function LiveCard({ s, onChange, onWatch }) {
    const cd = useCountdown(s.scheduled_at);
    const [busy, setBusy] = useState(false);
    const remind = async () => {
        setBusy(true); haptic(10);
        try { const r = await watch.remind(s.id); toast.success(r.reminded ? "We'll remind you when it starts" : "Reminder removed"); onChange(); } catch (e) { toast.error(errorMessage(e)); } finally { setBusy(false); }
    };
    const live = s.status === "live";
    return (
        <div className="hm-card overflow-hidden">
            <button onClick={() => (live ? onWatch(s) : null)} className="relative block w-full" style={{ aspectRatio: "16/9" }}>
                <img src={s.thumb} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(8,16,32,.85), rgba(8,16,32,.15))" }} />
                <div className="absolute top-3 left-3 flex gap-2">{live ? <span className="hm-badge hm-badge-live" style={{ height: 24 }}>● LIVE NOW</span> : <span className="hm-badge" style={{ background: "rgba(255,255,255,.9)", color: "#0b1b30", height: 24 }}>UPCOMING</span>}{s.official && <span className="hm-badge hm-badge-gold" style={{ background: "var(--gold)", color: "#1c1503", height: 24 }}>OFFICIAL</span>}</div>
                {live ? <div className="absolute inset-0 flex items-center justify-center"><div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "#e11d48", boxShadow: "0 0 0 10px rgba(225,29,72,.25)" }}><Play size={28} fill="#fff" color="#fff" style={{ marginLeft: 3 }} /></div></div>
                    : cd && <div className="absolute inset-0 flex flex-col items-center justify-center text-white"><div className="text-[11px] font-bold tracking-widest opacity-80">STARTS IN</div><div className="text-3xl font-extrabold tabular-nums">{cd}</div></div>}
            </button>
            <div className="p-3.5">
                <div className="font-extrabold text-[16px] leading-snug">{s.title}</div>
                <div className="text-[12.5px] mt-1 flex items-center gap-1.5 flex-wrap" style={{ color: "var(--mut)" }}><Calendar size={13} />{formatWhen(s.scheduled_at)}{s.channel && <> · {s.channel.name}</>}{s.host && <> · {s.host.name}</>}</div>
                <div className="flex gap-2 mt-3">
                    {live ? <Btn size="sm" icon={Play} onClick={() => onWatch(s)} className="flex-1">Watch live</Btn>
                        : <Btn size="sm" variant={s.reminded ? "soft" : "primary"} icon={s.reminded ? BellRing : Bell} loading={busy} onClick={remind} className="flex-1">{s.reminded ? "Reminder set" : "Remind me"}</Btn>}
                    <Btn size="sm" variant="soft" icon={Share2} onClick={() => navigator.share?.({ title: s.title, url: s.url }).catch(() => {}) ?? navigator.clipboard?.writeText(s.url)} aria-label="Share" />
                </div>
            </div>
        </div>
    );
}

function ScheduleLive({ open, onClose, onDone }) {
    const { user } = useUser();
    const [f, setF] = useState({ title: "", url: "", scheduled_at: "", description: "", channel_id: "", is_official: false });
    const [busy, setBusy] = useState(false);
    const { data } = useQuery({ queryKey: ["my-channels"], queryFn: () => channels.list({ scope: "mine" }), enabled: open, staleTime: 60_000 });
    const mod = (data?.data || []).filter((c) => c.can_moderate && c.my_status === "active");
    const isMaster = user?.role === "master";
    const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
    const submit = async () => {
        setBusy(true);
        try { await watch.schedule({ ...f, channel_id: f.channel_id || undefined, scheduled_at: new Date(f.scheduled_at).toISOString(), is_official: isMaster && !f.channel_id }); toast.success("Live session scheduled"); onDone(); onClose(); setF({ title: "", url: "", scheduled_at: "", description: "", channel_id: "", is_official: false }); }
        catch (e) { toast.error(errorMessage(e)); } finally { setBusy(false); }
    };
    return (
        <Sheet open={open} onClose={onClose} title="Schedule a live video" footer={<Btn block loading={busy} disabled={!f.title || !f.url || !f.scheduled_at || (!f.channel_id && !isMaster)} onClick={submit}>Schedule</Btn>}>
            <div className="space-y-4 pb-2">
                <p className="text-sm" style={{ color: "var(--mut)" }}>Start your YouTube live stream (or premiere) first, paste its link here, and choose when it begins. Members get a reminder and watch right inside the app.</p>
                <div><label className="hm-label">Title</label><input className="hm-input" value={f.title} onChange={set("title")} maxLength={160} placeholder="Sunday prayer night" /></div>
                <div><label className="hm-label">YouTube live / premiere link</label><input className="hm-input" value={f.url} onChange={set("url")} inputMode="url" placeholder="https://youtube.com/live/…" /></div>
                <div><label className="hm-label">Starts</label><input type="datetime-local" className="hm-input" value={f.scheduled_at} onChange={set("scheduled_at")} /></div>
                <div><label className="hm-label">Channel</label>
                    <select className="hm-input" value={f.channel_id} onChange={set("channel_id")}>{isMaster && <option value="">Official (all members)</option>}{!isMaster && <option value="">Choose a channel…</option>}{mod.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
                    {!isMaster && mod.length === 0 && <p className="text-xs mt-1.5" style={{ color: "var(--mut)" }}>You can go live in channels you own or moderate. Create a channel first.</p>}</div>
                <div><label className="hm-label">About (optional)</label><textarea className="hm-input" rows={2} value={f.description} onChange={set("description")} maxLength={500} /></div>
            </div>
        </Sheet>
    );
}

function Live() {
    const [watching, setWatching] = useState(null);
    const [adding, setAdding] = useState(false);
    const qc = useQueryClient();
    const { data, isLoading, isError, error, refetch } = useQuery({ queryKey: ["live"], queryFn: watch.live, staleTime: 15_000, refetchInterval: 30_000 });
    const d = data?.data;
    const reload = () => { refetch(); qc.invalidateQueries({ queryKey: ["bootstrap"] }); };
    const empty = d && !d.live_now.length && !d.upcoming.length && !d.ended.length;

    return (
        <Scroller tab="watch" onRefresh={reload}>
            <div className="px-4 py-3 space-y-4 pb-8">
                <Btn block icon={Plus} variant="gold" onClick={() => setAdding(true)}>Schedule a live video</Btn>
                {isLoading && <><Skel h={230} r={22} /><Skel h={230} r={22} /></>}
                {isError && <ErrorState error={error} onRetry={refetch} />}
                {d?.live_now.length > 0 && <section className="space-y-3"><h3 className="hm-label flex items-center gap-1.5" style={{ color: "var(--danger)" }}><span className="w-2 h-2 rounded-full bg-[var(--danger)] animate-pulse" />Live now</h3>{d.live_now.map((s) => <LiveCard key={s.id} s={s} onChange={reload} onWatch={setWatching} />)}</section>}
                {d?.upcoming.length > 0 && <section className="space-y-3"><h3 className="hm-label">Coming up</h3>{d.upcoming.map((s) => <LiveCard key={s.id} s={s} onChange={reload} onWatch={setWatching} />)}</section>}
                {d?.ended.length > 0 && <section className="space-y-3"><h3 className="hm-label">Recently ended</h3>{d.ended.map((s) => <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" className="hm-card p-3 flex items-center gap-3"><img src={s.thumb} alt="" className="w-24 rounded-xl" style={{ aspectRatio: "16/10", objectFit: "cover" }} /><div className="flex-1 min-w-0"><div className="font-bold text-sm truncate">{s.title}</div><div className="text-xs" style={{ color: "var(--mut)" }}>Ended · watch the replay</div></div><ExternalLink size={16} style={{ color: "var(--mut)" }} /></a>)}</section>}
                {empty && <Empty icon={Radio} title="Nothing live right now" text="Scheduled live services and channel sessions will appear here, with a reminder before they start." />}
            </div>
            {watching && (
                <Sheet open onClose={() => setWatching(null)} full title={watching.title}>
                    <div className="space-y-3 pb-8"><VideoEmbed media={{ embed: watching.embed, thumb: watching.thumb }} autoPlay /><div className="text-sm" style={{ color: "var(--mut)" }}>{watching.description}</div></div>
                </Sheet>
            )}
            <ScheduleLive open={adding} onClose={() => setAdding(false)} onDone={reload} />
        </Scroller>
    );
}

// ── Shorts (vertical, snap-scrolling) ───────────────────────────────────────────────────────────

function Reel({ post, active }) {
    const nav = useNav();
    const [liked, setLiked] = useState(post.liked);
    const [likes, setLikes] = useState(post.likes);
    const [comments, setComments] = useState(false);
    const video = post.media.find((m) => m.type === "video");
    useEffect(() => { if (active) community.view(post.id); }, [active, post.id]);
    const like = async () => {
        haptic(12); setLiked(!liked); setLikes(likes + (liked ? -1 : 1));
        try { const r = await community.like(post.id); setLiked(r.liked); setLikes(r.likes); } catch (e) { setLiked(liked); setLikes(likes); toast.error(errorMessage(e)); }
    };
    return (
        <div className="hm-reel">
            {active && video ? <iframe title="Short" src={`${video.embed}&autoplay=1&controls=0&loop=1&playlist=${video.video_id}`} className="absolute inset-0 w-full h-full border-0" allow="autoplay; encrypted-media; picture-in-picture" /> : video?.thumb && <img src={video.thumb} alt="" className="absolute inset-0 w-full h-full object-cover" />}
            <div className="absolute inset-x-0 bottom-0 h-72 pointer-events-none" style={{ background: "linear-gradient(to top, rgba(0,0,0,.8), transparent)" }} />
            <div className="absolute left-4 right-20 bottom-6 text-white z-10">
                <button className="flex items-center gap-2.5 mb-2" onClick={() => nav.push("profile", { id: post.author.id })}><Avatar user={post.author} size={38} /><span className="font-extrabold flex items-center gap-1">{post.author.name}{post.author.verified && <Verified size={14} />}</span></button>
                {post.body && <p className="text-[14.5px] leading-snug line-clamp-3">{post.body}</p>}
            </div>
            <div className="absolute right-3 bottom-8 z-10 flex flex-col items-center gap-5 text-white">
                <button onClick={like} className="flex flex-col items-center gap-1 text-xs font-bold"><span className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,.16)", backdropFilter: "blur(8px)" }}><Heart size={26} fill={liked ? "#fb3b5c" : "none"} color={liked ? "#fb3b5c" : "#fff"} className={liked ? "hm-heart-pop" : ""} /></span>{compact(likes)}</button>
                <button onClick={() => setComments(true)} className="flex flex-col items-center gap-1 text-xs font-bold"><span className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,.16)", backdropFilter: "blur(8px)" }}><MessageCircle size={25} /></span>{compact(post.comments)}</button>
                <button onClick={() => sharePost(post)} className="flex flex-col items-center gap-1 text-xs font-bold"><span className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,.16)", backdropFilter: "blur(8px)" }}><Share2 size={23} /></span>Share</button>
            </div>
            <CommentsSheet post={post} open={comments} onClose={() => setComments(false)} />
        </div>
    );
}

function Shorts() {
    const nav = useNav();
    const [active, setActive] = useState(0);
    const root = useRef(null);
    const q = useInfiniteQuery({ queryKey: ["shorts"], initialPageParam: 1, queryFn: ({ pageParam }) => community.shorts(pageParam), getNextPageParam: (l) => l?.next_page ?? undefined, staleTime: 60_000 });
    const items = q.data?.pages.flatMap((p) => p.items).filter((p) => p.media.some((m) => m.type === "video")) ?? [];

    useEffect(() => {
        const el = root.current; if (!el) return;
        const io = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && e.intersectionRatio > 0.6 && setActive(Number(e.target.dataset.i))), { root: el, threshold: [0.6] });
        el.querySelectorAll("[data-i]").forEach((n) => io.observe(n));
        return () => io.disconnect();
    }, [items.length]);
    useEffect(() => { if (active >= items.length - 3 && q.hasNextPage && !q.isFetchingNextPage) q.fetchNextPage(); }, [active]);   // eslint-disable-line react-hooks/exhaustive-deps

    if (q.isLoading) return <div className="flex-1 flex items-center justify-center text-white"><Loader2 className="animate-spin" /></div>;
    if (!items.length) return <div className="flex-1 flex items-center justify-center" style={{ background: "var(--bg)" }}><Empty icon={Clapperboard} title="No shorts yet" text="Share a YouTube Short from the post button and it shows up here." action={<Btn size="sm" onClick={() => nav.setTab("home")}>Go to Home</Btn>} /></div>;
    return (
        <div ref={root} className="hm-reels flex-1 overflow-y-auto hm-hide-scroll">
            {items.map((p, i) => <div key={p.id} data-i={i} style={{ height: "100%" }}><Reel post={p} active={i === active} /></div>)}
        </div>
    );
}
