import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BarChart3, Bell, Film, Image as ImageIcon, MapPin, Pencil, Radio, Search, Sparkles, Users, UserPlus, Hash } from "lucide-react";
import { Avatar, Btn, Empty, IconBtn, Segmented, TopBar, cx, toast, Verified, PostSkeleton, ErrorState } from "./ui.jsx";
import { FeedList, Scroller } from "./Feed.jsx";
import { StoryBar } from "./Stories.jsx";
import Composer from "./Composer.jsx";
import { PostCard } from "./Post.jsx";
import { community, errorMessage, compact, storageUrl } from "./lib.js";
import { useNav } from "./nav.jsx";
import { useUser } from "../context/UserContext.jsx";

const FEED_TABS = [{ value: "for_you", label: "For you", icon: Sparkles }, { value: "following", label: "Following", icon: Users }, { value: "zone", label: "My zone", icon: MapPin }];

export function Brand() {
    return (
        <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center overflow-hidden" style={{ boxShadow: "var(--shadow-sm)", border: "1px solid var(--line)" }}><img src="/images/logo.jpeg" alt="" className="w-full h-full object-contain p-0.5" /></div>
            <div className="leading-none"><div className="font-extrabold text-[19px] tracking-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Heartfelt</div><div className="text-[9.5px] font-bold tracking-[0.18em]" style={{ color: "var(--gold)" }}>COMMUNITY</div></div>
        </div>
    );
}

export default function Home({ boot }) {
    const nav = useNav();
    const { user } = useUser();
    const qc = useQueryClient();
    const [tab, setTab] = useState("for_you");
    const [compose, setCompose] = useState(null);
    const me = { id: user?.id, name: user?.name, avatar: storageUrl(user?.profile_photo) };
    const refresh = () => Promise.all([qc.invalidateQueries({ queryKey: ["feed"] }), qc.invalidateQueries({ queryKey: ["stories"] })]);

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center justify-between px-4 hm-safe-top hm-glass shrink-0" style={{ minHeight: 60, borderBottom: "1px solid var(--line)" }}>
                <Brand />
                <div className="flex">
                    <IconBtn icon={Search} label="Search" onClick={() => nav.push("explore")} />
                    <IconBtn icon={Bell} label="Notifications" badge={boot?.unread_notifications} onClick={() => nav.push("notifications")} />
                </div>
            </div>

            <Scroller tab="home" onRefresh={refresh}>
                {boot?.live_now > 0 && (
                    <button onClick={() => { nav.setTab("watch"); }} className="mx-3 mt-3 w-[calc(100%-24px)] rounded-2xl p-3.5 flex items-center gap-3 text-left text-white" style={{ background: "linear-gradient(135deg,#be123c,#e11d48)", boxShadow: "0 8px 22px rgba(225,29,72,.35)" }}>
                        <span className="hm-badge hm-badge-live" style={{ background: "#fff", color: "#be123c" }}>● LIVE</span><span className="font-bold flex-1">{boot.live_now} live now · tap to watch</span><Radio size={20} />
                    </button>
                )}

                <StoryBar />

                <div className="mx-3 hm-card p-3.5">
                    <button className="flex items-center gap-3 w-full text-left" onClick={() => setCompose("text")}>
                        <Avatar user={me} size={42} />
                        <div className="flex-1 h-11 rounded-2xl px-4 flex items-center text-[15px]" style={{ background: "var(--surface2)", color: "var(--mut)", border: "1px solid var(--line)" }}>What's on your heart, {user?.name?.split(" ")[0]}?</div>
                    </button>
                    <div className="flex gap-2 mt-3">
                        {[["photo", "Photo", ImageIcon, "#12a150"], ["video", "Video", Film, "#e11d48"], ["poll", "Poll", BarChart3, "#2f6bff"]].map(([k, l, I, c]) => (
                            <button key={k} onClick={() => setCompose(k)} className="flex-1 h-10 rounded-xl flex items-center justify-center gap-2 text-[13.5px] font-bold" style={{ background: "var(--surface2)" }}><I size={18} style={{ color: c }} />{l}</button>
                        ))}
                    </div>
                </div>

                <div className="px-3 pt-3"><Segmented value={tab} onChange={setTab} options={FEED_TABS} /></div>

                <FeedList
                    queryKey={["feed", tab]}
                    fetcher={(page) => community.feed({ tab, page })}
                    empty={
                        tab === "following" ? <Empty icon={UserPlus} title="Your following feed is empty" text="Follow people to see their posts here." action={<Btn size="sm" onClick={() => nav.push("explore")}>Find people</Btn>} />
                        : tab === "zone" ? <Empty icon={MapPin} title="No posts from your zone yet" text="Be the first to share something with your zone family." action={<Btn size="sm" onClick={() => setCompose("text")}>Write a post</Btn>} />
                        : <Empty icon={Sparkles} title="Welcome to the community" text="Share a thought, a testimony or a prayer request." action={<Btn size="sm" onClick={() => setCompose("text")}>Create the first post</Btn>} />
                    }
                />
            </Scroller>

            <button onClick={() => setCompose("text")} aria-label="New post" className="absolute z-30 w-14 h-14 rounded-[20px] flex items-center justify-center text-white"
                style={{ right: 18, bottom: "calc(var(--tabbar) + 18px + env(safe-area-inset-bottom))", background: "linear-gradient(135deg,#d8b658,#b8923a)", boxShadow: "0 10px 26px rgba(184,146,58,.5)" }}><Pencil size={24} color="#1c1503" /></button>

            <Composer open={!!compose} initialKind={compose || "text"} key={compose || "closed"} onClose={() => setCompose(null)} onPosted={(post) => {
                // Your own post goes straight to the top of the feed you are looking at (ranking would otherwise bury a brand-new post).
                qc.setQueryData(["feed", tab], (d) => d && post && !post.channel ? { ...d, pages: d.pages.map((pg, i) => (i === 0 ? { ...pg, items: [post, ...pg.items.filter((p) => p.id !== post.id)] } : pg)) } : d);
                qc.invalidateQueries({ queryKey: ["feed", "user"] });
            }} />
        </div>
    );
}

// ── Search & explore ────────────────────────────────────────────────────────────────────────────

export function PersonRow({ person, onFollow, right }) {
    const nav = useNav();
    const [following, setFollowing] = useState(false);
    const follow = async () => {
        try { const r = await community.follow(person.id); setFollowing(r.following); onFollow?.(r.following); } catch (e) { toast.error(errorMessage(e)); }
    };
    return (
        <div className="flex items-center gap-3 py-2.5">
            <Avatar user={person} size={46} onClick={() => nav.push("profile", { id: person.id })} />
            <button className="flex-1 min-w-0 text-left" onClick={() => nav.push("profile", { id: person.id })}>
                <div className="flex items-center gap-1.5 font-bold text-[15px]"><span className="truncate">{person.name}</span>{person.verified && <Verified size={14} />}</div>
                <div className="text-[12.5px] truncate" style={{ color: "var(--mut)" }}>@{person.handle}{person.zone ? ` · ${person.zone}` : ""}{person.badge ? ` · ${person.badge}` : ""}</div>
            </button>
            {right ?? <Btn size="sm" variant={following ? "soft" : "primary"} onClick={follow}>{following ? "Following" : "Follow"}</Btn>}
        </div>
    );
}

export function ChannelRow({ channel, onClick }) {
    return (
        <button onClick={onClick} className="w-full flex items-center gap-3 py-2.5 text-left">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-extrabold text-lg shrink-0 overflow-hidden" style={{ background: "linear-gradient(135deg,#1e3a5f,#2f6bff)" }}>{channel.avatar ? <img src={channel.avatar} alt="" className="w-full h-full object-cover" /> : channel.name[0]}</div>
            <div className="flex-1 min-w-0"><div className="font-bold text-[15px] flex items-center gap-1.5 truncate">{channel.name}{channel.official && <Verified size={14} />}{channel.private && <span className="hm-badge" style={{ background: "var(--surface2)", color: "var(--mut)" }}>Private</span>}</div><div className="text-[12.5px] truncate" style={{ color: "var(--mut)" }}>{compact(channel.members)} member{channel.members === 1 ? "" : "s"}{channel.category ? ` · ${channel.category}` : ""}</div></div>
        </button>
    );
}

export function Explore() {
    const nav = useNav();
    const [q, setQ] = useState("");
    const [term, setTerm] = useState("");
    const timer = useState({ t: 0 })[0];
    const onType = (v) => { setQ(v); clearTimeout(timer.t); timer.t = setTimeout(() => setTerm(v.trim()), 320); };
    const explore = useQuery({ queryKey: ["explore"], queryFn: community.explore, staleTime: 60_000 });
    const search = useQuery({ queryKey: ["search", term], queryFn: () => community.search(term), enabled: term.length >= 2 });
    const d = explore.data?.data;
    const r = search.data?.data;

    return (
        <div className="flex flex-col h-full">
            <TopBar back title="Search" />
            <div className="px-4 py-3"><div className="relative"><Search size={18} className="absolute left-3.5 top-3.5" style={{ color: "var(--mut)" }} /><input autoFocus className="hm-input" style={{ paddingLeft: 42 }} placeholder="People, #hashtags, channels" value={q} onChange={(e) => onType(e.target.value)} /></div></div>
            <div className="hm-scroll px-4 pb-8">
                {term.length >= 2 ? (
                    search.isLoading ? <PostSkeleton /> : (
                        <div className="space-y-5">
                            {r?.people?.length > 0 && <section><h3 className="hm-label">People</h3>{r.people.map((p) => <PersonRow key={p.id} person={p} />)}</section>}
                            {r?.tags?.length > 0 && <section><h3 className="hm-label">Hashtags</h3><div className="flex flex-wrap gap-2">{r.tags.map((t) => <button key={t} className="hm-chip" onClick={() => nav.push("hashtag", { tag: t })}><Hash size={14} />{t}</button>)}</div></section>}
                            {r?.channels?.length > 0 && <section><h3 className="hm-label">Channels</h3>{r.channels.map((c) => <ChannelRow key={c.id} channel={{ ...c, members: c.members_count, avatar: c.avatar_url }} onClick={() => nav.push("channel", { id: c.id })} />)}</section>}
                            {!r?.people?.length && !r?.tags?.length && !r?.channels?.length && <Empty icon={Search} title="No results" text={`Nothing matched "${term}".`} />}
                        </div>
                    )
                ) : explore.isLoading ? <PostSkeleton /> : explore.isError ? <ErrorState error={explore.error} onRetry={explore.refetch} /> : (
                    <div className="space-y-6">
                        {d?.trending?.length > 0 && <section><h3 className="hm-label">Trending this week</h3><div className="space-y-1">{d.trending.map((t, i) => <button key={t.tag} onClick={() => nav.push("hashtag", { tag: t.tag })} className="w-full flex items-center gap-3 py-2 text-left"><span className="w-7 text-center font-extrabold" style={{ color: "var(--gold)" }}>{i + 1}</span><div className="flex-1"><div className="font-bold">#{t.tag}</div><div className="text-xs" style={{ color: "var(--mut)" }}>{t.posts} post{t.posts === 1 ? "" : "s"}</div></div></button>)}</div></section>}
                        {d?.people?.length > 0 && <section><h3 className="hm-label">People you may know</h3>{d.people.map((p) => <PersonRow key={p.id} person={p} />)}</section>}
                        {d?.channels?.length > 0 && <section><h3 className="hm-label">Popular channels</h3>{d.channels.map((c) => <ChannelRow key={c.id} channel={c} onClick={() => nav.push("channel", { id: c.id })} />)}</section>}
                    </div>
                )}
            </div>
        </div>
    );
}

export function HashtagScreen({ tag }) {
    return (
        <div className="flex flex-col h-full"><TopBar back title={`#${tag}`} subtitle="Posts with this hashtag" />
            <Scroller><FeedList queryKey={["feed", "tag", tag]} fetcher={(page) => community.feed({ hashtag: tag, page })} empty={<Empty icon={Hash} title="No posts yet" text="Be the first to use this hashtag." />} /></Scroller></div>
    );
}

export function PostScreen({ id }) {
    const { data, isLoading, isError, error, refetch } = useQuery({ queryKey: ["post", id], queryFn: () => community.post(id) });
    return (
        <div className="flex flex-col h-full"><TopBar back title="Post" />
            <div className="hm-scroll p-3">{isLoading ? <PostSkeleton /> : isError ? <ErrorState error={error} onRetry={refetch} /> : <PostCard post={data.data} detail />}</div></div>
    );
}
