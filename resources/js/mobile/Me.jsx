import { useState } from "react";
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Bookmark, CalendarDays, CheckCheck, ChevronRight, CreditCard, Edit3, Flag, Globe, HandHeart, IdCard, LayoutDashboard, LogOut, MapPin, Moon, Receipt, Search, ShieldCheck, Store, Sun, UserX, Users, Heart, ShoppingBag, MessageCircle, Megaphone, Info, Ticket, ExternalLink, Camera, HeartHandshake, KeyRound, ShieldAlert } from "lucide-react";
import { Avatar, Btn, ActionSheet, ConfirmSheet, Empty, ErrorState, Group, IconBtn, Row, Segmented, Sheet, Skel, TopBar, Verified, toast, cx, useDark, Spinner } from "./ui.jsx";
import { FeedList, Scroller } from "./Feed.jsx";
import { PersonRow } from "./Home.jsx";
import { ReportSheet } from "./Post.jsx";
import IdCardPanel from "../components/IdCardPanel.jsx";
import EventsPanel from "../components/events/EventsPanel.jsx";
import api from "../lib/api.js";
import { community, errorMessage, formatWhen, compact, haptic, market, money, timeAgo } from "./lib.js";
import { useNav } from "./nav.jsx";
import { useUser } from "../context/UserContext.jsx";

// ── Me tab ──────────────────────────────────────────────────────────────────────────────────────

export default function Me({ boot, onLogout }) {
    const nav = useNav();
    const { user } = useUser();
    const { dark, toggle } = useDark();
    const [confirm, setConfirm] = useState(false);
    const [confirmAll, setConfirmAll] = useState(false);
    const sendResetLink = async () => {
        try { await api.post("/forgot-password", { email: user?.email }); toast.success("Check your email for the password link"); } catch (e) { toast.error(errorMessage(e)); }
    };
    const signOutEverywhere = async () => {
        try { await api.post("/logout-all"); } catch { /* the token may already be gone */ }
        onLogout({ shouldLogoutApi: false });
    };
    const me = boot?.me;
    const qc = useQueryClient();
    const member = user?.member;

    return (
        <Scroller tab="me" onRefresh={() => qc.invalidateQueries({ queryKey: ["bootstrap"] })}>
            <div className="relative px-5 pb-7 hm-safe-top" style={{ background: "linear-gradient(160deg,#0f2744 0%,#1e3a5f 55%,#2f6bff 130%)", color: "#fff", borderRadius: "0 0 34px 34px" }}>
                <div className="flex justify-end pt-3"><IconBtn icon={dark ? Sun : Moon} label="Toggle dark mode" onClick={toggle} /></div>
                <button onClick={() => nav.push("profile", { id: user.id })} className="flex items-center gap-4 text-left w-full">
                    <div className="p-[3px] rounded-full" style={{ background: "conic-gradient(from 210deg,#c9a84c,#f2dc9a,#fff,#c9a84c)" }}><Avatar user={me || { id: user?.id, name: user?.name }} size={76} /></div>
                    <div className="min-w-0 flex-1"><div className="font-extrabold text-[22px] leading-tight flex items-center gap-1.5 truncate">{user?.name}{me?.verified && <Verified size={18} />}</div>
                        <div className="text-[13.5px] opacity-85">@{me?.handle}</div>
                        <div className="flex flex-wrap gap-2 mt-2">{me?.badge && <span className="hm-badge" style={{ background: "var(--gold)", color: "#1c1503", height: 22 }}>{me.badge}</span>}{(me?.zone || user?.zone?.name) && <span className="hm-badge" style={{ background: "rgba(255,255,255,.16)", color: "#fff", height: 22 }}><MapPin size={11} className="mr-1" />{me?.zone || user.zone.name}</span>}</div></div>
                </button>
                <div className="grid grid-cols-3 mt-5 rounded-2xl py-3" style={{ background: "rgba(255,255,255,.11)", backdropFilter: "blur(6px)" }}>
                    {[["Posts", me?.posts], ["Followers", me?.followers], ["Following", me?.following]].map(([l, v]) => <div key={l} className="text-center"><div className="font-extrabold text-xl">{compact(v || 0)}</div><div className="text-[11.5px] opacity-80 font-semibold">{l}</div></div>)}
                </div>
            </div>

            <Group title="Community">
                <Row icon={Users} label="My profile & posts" onClick={() => nav.push("profile", { id: user.id })} />
                <Row icon={Bookmark} label="Saved posts" color="#c9a84c" onClick={() => nav.push("saved")} />
                <Row icon={Bell} label="Notifications" color="#e11d48" hint={boot?.unread_notifications ? `${boot.unread_notifications} new` : undefined} onClick={() => nav.push("notifications")} />
                <Row icon={Search} label="Find people & channels" color="#7c3aed" onClick={() => nav.push("explore")} />
            </Group>
            <Group title="Marketplace">
                <Row icon={Receipt} label="My orders & quotes" color="#12a150" onClick={() => nav.push("orders", { as: "buyer" })} />
                {boot?.can_sell ? <Row icon={Store} label="My shop" hint="Listings, orders and quote requests" color="#b45309" onClick={() => nav.push("shop")} />
                    : <Row icon={ShieldCheck} label="Become a partner to sell" hint="Only active partners can open a shop" color="#b45309" onClick={() => nav.push("partnership")} />}
            </Group>
            <Group title="Church life">
                <Row icon={HeartHandshake} label="Partnership" color="#b45309" hint={boot?.partnership ? ({ none: "Not a partner yet", pending: "Waiting for payment", active: "Active partner", expiring: "Renews soon", expired: "Expired: renew to unlock" })[boot.partnership.status] : undefined} onClick={() => nav.push("partnership")} />
                <Row icon={CalendarDays} label="Events & conferences" color="#0e7490" onClick={() => nav.push("events")} />
                <Row icon={HandHeart} label="Give online" hint="Tithes, offerings, seeds and partnership" color="#12a150" onClick={() => window.dispatchEvent(new CustomEvent("him:give"))} />
                <Row icon={IdCard} label="My ID card" hint="Download or print, with a scannable QR" color="#2f6bff" onClick={() => nav.push("idcard")} />
                <Row icon={LayoutDashboard} label="My church" hint="Zone, home group, department, prayer and details" color="#667791" onClick={() => nav.push("church")} />
            </Group>
            <Group title="Security">
                <Row icon={KeyRound} label="Change password" hint="We email you a secure link" color="#0e7490" onClick={sendResetLink} />
                <Row icon={ShieldAlert} label="Sign out of all devices" hint="Use this if you lost your phone" color="#e11d48" onClick={() => setConfirmAll(true)} />
            </Group>
            <Group title="Account">
                <Row icon={Edit3} label="Edit community profile" onClick={() => nav.push("edit-profile")} />
                <Row icon={dark ? Sun : Moon} label={dark ? "Light mode" : "Dark mode"} color="#667791" onClick={toggle} right={<span className="w-12 h-7 rounded-full p-0.5" style={{ background: dark ? "var(--accent)" : "var(--line)" }}><span className="block w-6 h-6 rounded-full bg-white transition-transform" style={{ transform: dark ? "translateX(20px)" : "none" }} /></span>} />
                <Row icon={LogOut} label="Sign out" danger onClick={() => setConfirm(true)} right={<span />} />
            </Group>
            <p className="text-center text-xs py-6" style={{ color: "var(--mut)" }}>Heartfelt International Ministries · Community</p>
            <ConfirmSheet open={confirmAll} onClose={() => setConfirmAll(false)} title="Sign out everywhere?" text="Every phone and browser signed in to your account will be signed out, including this one." confirm="Sign out everywhere" danger onConfirm={signOutEverywhere} />
            <ConfirmSheet open={confirm} onClose={() => setConfirm(false)} title="Sign out?" text="Do you want to sign out of Heartfelt? You will need to sign in again to use the app." confirm="Yes, sign out" cancel="No, stay" danger onConfirm={onLogout} />
        </Scroller>
    );
}

// ── Profile (mine and everyone else's) ──────────────────────────────────────────────────────────

function PeopleSheet({ id, type, onClose }) {
    const { data, isLoading } = useQuery({ queryKey: ["people", id, type], queryFn: () => community.people(id, type) });
    return (
        <Sheet open onClose={onClose} title={type === "following" ? "Following" : "Followers"}>
            {isLoading ? <Spinner /> : !data?.data?.length ? <Empty icon={Users} title="No one yet" /> : data.data.map((p) => <PersonRow key={p.id} person={p} />)}
        </Sheet>
    );
}

export function ProfileScreen({ id }) {
    const nav = useNav();
    const { user } = useUser();
    const qc = useQueryClient();
    const [menu, setMenu] = useState(false);
    const [report, setReport] = useState(false);
    const [people, setPeople] = useState(null);
    const [follow, setFollow] = useState(null);
    const [tab, setTab] = useState("posts");
    const { data, isLoading, isError, error, refetch } = useQuery({ queryKey: ["profile", id], queryFn: () => community.profile(id) });
    const { data: listings } = useQuery({ queryKey: ["listings", id], queryFn: () => market.listings({ seller_id: id }), enabled: data?.data?.badge === "Partner" });
    const p = data?.data;

    if (isLoading) return <div className="flex flex-col h-full"><TopBar back title="" /><div className="p-4 space-y-3"><Skel h={90} r={45} w={90} /><Skel h={24} w="50%" /><Skel h={60} /></div></div>;
    if (isError) return <div className="flex flex-col h-full"><TopBar back title="Profile" /><ErrorState error={error} onRetry={refetch} /></div>;

    const following = follow ?? p.following_them;
    const toggleFollow = async () => { haptic(12); setFollow(!following); try { const r = await community.follow(p.id); setFollow(r.following); qc.invalidateQueries({ queryKey: ["feed"] }); refetch(); } catch (e) { setFollow(following); toast.error(errorMessage(e)); } };

    return (
        <div className="flex flex-col h-full">
            <TopBar back title={p.name} right={!p.is_me && <IconBtn icon={Flag} label="More" onClick={() => setMenu(true)} />} />
            <Scroller tab="profile">
                <div className="px-5 pt-5 pb-4">
                    <div className="flex items-start gap-4"><Avatar user={p} size={84} />
                        <div className="flex-1 min-w-0"><div className="font-extrabold text-[22px] leading-tight flex items-center gap-1.5">{p.name}{p.verified && <Verified size={18} />}</div><div className="text-sm" style={{ color: "var(--mut)" }}>@{p.handle}</div>
                            <div className="flex flex-wrap gap-2 mt-2">{p.badge && <span className="hm-badge hm-badge-gold" style={{ height: 22 }}>{p.badge}</span>}{p.zone && <span className="hm-badge" style={{ background: "var(--surface2)", color: "var(--mut)", height: 22 }}><MapPin size={11} className="mr-1" />{p.zone}</span>}</div></div></div>
                    {p.bio && <p className="mt-3 text-[15px] leading-relaxed">{p.bio}</p>}
                    {p.website && <a href={p.website} target="_blank" rel="noopener noreferrer nofollow" className="text-sm font-semibold flex items-center gap-1 mt-1" style={{ color: "var(--accent)" }}><Globe size={14} />{p.website.replace(/^https?:\/\//, "")}</a>}
                    <div className="flex gap-6 mt-4">{[["posts", p.posts, null], ["followers", p.followers, "followers"], ["following", p.following, "following"]].map(([l, v, t]) => <button key={l} onClick={() => t && setPeople(t)} className="text-left"><span className="font-extrabold text-lg">{compact(v)}</span> <span className="text-sm" style={{ color: "var(--mut)" }}>{l}</span></button>)}</div>
                    <div className="flex gap-3 mt-4">{p.is_me ? <><Btn block variant="soft" icon={Edit3} onClick={() => nav.push("edit-profile")}>Edit profile</Btn><Btn variant="soft" icon={IdCard} onClick={() => nav.push("idcard")} aria-label="ID card" /></> : <Btn block variant={following ? "soft" : "primary"} onClick={toggleFollow}>{following ? "Following" : "Follow"}</Btn>}</div>
                </div>
                {listings?.items?.length > 0 && <div className="px-4 pb-2"><Segmented value={tab} onChange={setTab} options={[{ value: "posts", label: "Posts" }, { value: "shop", label: `Shop · ${listings.items.length}` }]} /></div>}
                {tab === "posts" ? <FeedList queryKey={["feed", "user", p.id]} fetcher={(page) => community.feed({ user_id: p.id, page })} empty={<Empty icon={MessageCircle} title="No posts yet" text={p.is_me ? "Share your first thought with the community." : `${p.name.split(" ")[0]} hasn't posted yet.`} />} />
                    : <div className="grid grid-cols-2 gap-3 px-4 pb-8">{listings.items.map((l) => <button key={l.id} onClick={() => nav.push("listing", { id: l.id })} className="hm-card overflow-hidden text-left"><div style={{ aspectRatio: "1/1", background: "var(--surface2)" }}>{l.images?.[0] && <img src={l.images[0]} alt="" className="w-full h-full object-cover" />}</div><div className="p-2.5"><div className="font-extrabold text-sm">{l.price_type === "quote" ? "Ask for price" : money(l.price, l.currency)}</div><div className="text-[13px] line-clamp-1">{l.title}</div></div></button>)}</div>}
            </Scroller>
            {people && <PeopleSheet id={p.id} type={people} onClose={() => setPeople(null)} />}
            <ReportSheet open={report} onClose={() => setReport(false)} type="user" id={p.id} />
            <ActionSheet open={menu} onClose={() => setMenu(false)} title={p.name} actions={[
                { label: "Report", icon: Flag, danger: true, onClick: () => setReport(true) },
                { label: p.blocked ? "Unblock" : `Block ${p.name.split(" ")[0]}`, icon: UserX, danger: true, onClick: async () => { try { const r = await community.block(p.id); toast.success(r.blocked ? "Blocked" : "Unblocked"); qc.invalidateQueries({ queryKey: ["feed"] }); if (r.blocked) nav.pop(); else refetch(); } catch (e) { toast.error(errorMessage(e)); } } },
            ]} />
        </div>
    );
}

export function EditProfile() {
    const nav = useNav();
    const qc = useQueryClient();
    const { data } = useQuery({ queryKey: ["bootstrap"], queryFn: community.bootstrap });
    const me = data?.data?.me;
    const [f, setF] = useState(null);
    const [busy, setBusy] = useState(false);
    const form = f || (me ? { handle: me.handle, bio: me.bio || "", website: me.website || "" } : null);
    if (!form) return <div className="flex flex-col h-full"><TopBar back title="Edit profile" /><div className="p-4"><Skel h={200} r={18} /></div></div>;
    const save = async () => {
        setBusy(true);
        try { await community.updateMe({ handle: form.handle, bio: form.bio, website: form.website || null }); toast.success("Profile updated"); qc.invalidateQueries({ queryKey: ["bootstrap"] }); nav.pop(); } catch (e) { toast.error(errorMessage(e)); } finally { setBusy(false); }
    };
    return (
        <div className="flex flex-col h-full"><TopBar back title="Edit profile" />
            <div className="hm-scroll p-4 space-y-4">
                <div><label className="hm-label">Handle</label><div className="relative"><span className="absolute left-4 top-3 font-bold" style={{ color: "var(--mut)" }}>@</span><input className="hm-input" style={{ paddingLeft: 34 }} maxLength={30} value={form.handle} onChange={(e) => setF({ ...form, handle: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "") })} /></div><p className="text-xs mt-1.5 ml-1" style={{ color: "var(--mut)" }}>Letters and numbers only. This is how people mention you.</p></div>
                <div><label className="hm-label">Bio</label><textarea className="hm-input" rows={4} maxLength={280} value={form.bio} onChange={(e) => setF({ ...form, bio: e.target.value })} placeholder="Tell the community about you" /><div className="text-right text-xs mt-1" style={{ color: "var(--mut)" }}>{form.bio.length}/280</div></div>
                <div><label className="hm-label">Website (https)</label><input className="hm-input" inputMode="url" value={form.website} onChange={(e) => setF({ ...form, website: e.target.value })} placeholder="https://" /></div>
                <p className="text-xs rounded-xl p-3 flex gap-2" style={{ background: "var(--surface2)", color: "var(--mut)" }}><Info size={15} className="shrink-0 mt-0.5" />Your name, zone and member number come from your church record. To change those, speak to your pastor.</p>
            </div>
            <div className="p-3 hm-safe-bottom" style={{ borderTop: "1px solid var(--line)", background: "var(--surface)" }}><Btn block loading={busy} disabled={form.handle.length < 3} onClick={save}>Save</Btn></div>
        </div>
    );
}

export function SavedScreen() {
    return <div className="flex flex-col h-full"><TopBar back title="Saved posts" /><Scroller><FeedList queryKey={["feed", "saved"]} fetcher={(page) => community.bookmarks(page)} empty={<Empty icon={Bookmark} title="Nothing saved yet" text="Tap the bookmark on any post to keep it here." />} /></Scroller></div>;
}

// ── Events, ID card, partner info, classic portal ───────────────────────────────────────────────

export function EventsScreen() {
    return (
        <div className="flex flex-col h-full"><TopBar back title="Events & conferences" />
            <Scroller><div className="p-4 pb-10"><EventsPanel /></div></Scroller></div>
    );
}

export function IdCardScreen() {
    return <div className="flex flex-col h-full"><TopBar back title="My ID card" /><div className="hm-scroll p-3 pb-10"><IdCardPanel /></div></div>;
}
