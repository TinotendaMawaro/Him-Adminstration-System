import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Bookmark, CheckCheck, Flag, Heart, Link2, MessageCircle, MoreHorizontal, Pin, Play, Repeat2, Send, Share2, Trash2, UserX, Hash, Users, Megaphone, CornerDownRight } from "lucide-react";
import { Avatar, Verified, Linkify, Sheet, ActionSheet, ConfirmSheet, Btn, toast, cx, Spinner, Empty } from "./ui.jsx";
import { community, errorMessage, timeAgo, compact, haptic, storageUrl } from "./lib.js";
import { useNav } from "./nav.jsx";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useUser } from "../context/UserContext.jsx";

// ── Media ───────────────────────────────────────────────────────────────────────────────────────

/** A video is only a thumbnail until tapped: no iframe is loaded (and nothing is tracked) until the person presses play. */
export function VideoEmbed({ media, autoPlay, tall, className }) {
    const [on, setOn] = useState(!!autoPlay);
    useEffect(() => setOn(!!autoPlay), [autoPlay]);
    const src = media.embed + (media.embed.includes("?") ? "&" : "?") + "autoplay=1";
    return (
        <div className={cx("relative overflow-hidden bg-black", className)} style={{ aspectRatio: tall ? "9 / 16" : "16 / 9", borderRadius: tall ? 0 : 16 }}>
            {on ? (
                <iframe src={src} title="Video" className="absolute inset-0 w-full h-full border-0" allow="accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen loading="lazy" referrerPolicy="strict-origin-when-cross-origin" />
            ) : (
                <button className="absolute inset-0 w-full h-full" onClick={() => { haptic(10); setOn(true); }} aria-label="Play video">
                    {media.thumb ? <img src={media.thumb} alt="" className="w-full h-full object-cover" loading="lazy" /> : <div className="w-full h-full" style={{ background: "linear-gradient(135deg,#0f2744,#1e3a5f)" }} />}
                    <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,.45), transparent 55%)" }} />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center backdrop-blur-md" style={{ background: "rgba(255,255,255,.22)", border: "1.5px solid rgba(255,255,255,.5)" }}><Play size={28} fill="#fff" color="#fff" style={{ marginLeft: 3 }} /></div>
                    </div>
                </button>
            )}
        </div>
    );
}

function Lightbox({ images, index, onClose }) {
    const [i, setI] = useState(index);
    return (
        <Sheet open onClose={onClose} full title={`${i + 1} / ${images.length}`}>
            <div className="h-full flex items-center justify-center" onClick={() => images.length > 1 && setI((i + 1) % images.length)}>
                <img src={images[i].url} alt="" className="max-w-full max-h-full object-contain rounded-xl" />
            </div>
        </Sheet>
    );
}

function ImageGrid({ images, onDoubleTap }) {
    const [open, setOpen] = useState(null);
    const last = useRef(0);
    const tap = (i) => {
        const now = Date.now();
        if (now - last.current < 280) { onDoubleTap?.(); last.current = 0; return; }
        last.current = now;
        setTimeout(() => last.current && Date.now() - last.current >= 280 && (setOpen(i), (last.current = 0)), 300);
    };
    const n = images.length;
    const cell = (im, i, style) => <button key={i} onClick={() => tap(i)} className="relative overflow-hidden" style={style}><img src={im.url} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover" /></button>;
    return (
        <>
            <div className="overflow-hidden" style={{ borderRadius: 16, display: "grid", gap: 3, gridTemplateColumns: n === 1 ? "1fr" : "1fr 1fr", aspectRatio: n === 1 ? "4 / 3" : "1 / 1" }}>
                {n === 1 && cell(images[0], 0, { minHeight: 0 })}
                {n === 2 && images.map((im, i) => cell(im, i, {}))}
                {n === 3 && <>{cell(images[0], 0, { gridRow: "1 / 3" })}{cell(images[1], 1, {})}{cell(images[2], 2, {})}</>}
                {n >= 4 && images.slice(0, 4).map((im, i) => cell(im, i, {}))}
            </div>
            {open !== null && <Lightbox images={images} index={open} onClose={() => setOpen(null)} />}
        </>
    );
}

function Poll({ post, poll, onChange }) {
    const [busy, setBusy] = useState(false);
    const voted = poll.my_vote !== null && poll.my_vote !== undefined;
    const showResults = voted || poll.closed;
    const vote = async (i) => {
        if (busy || voted || poll.closed) return;
        setBusy(true); haptic(12);
        try { const r = await community.vote(post.id, i); onChange(r.poll); } catch (e) { toast.error(errorMessage(e)); } finally { setBusy(false); }
    };
    return (
        <div className="space-y-2 mt-1">
            {poll.options.map((o, i) => (
                <button key={i} onClick={() => vote(i)} disabled={showResults} className="relative w-full h-11 rounded-xl overflow-hidden text-left px-3.5 font-semibold text-[14.5px]" style={{ border: `1.5px solid ${poll.my_vote === i ? "var(--accent)" : "var(--line)"}`, background: "var(--surface2)" }}>
                    {showResults && <span className="absolute inset-y-0 left-0 transition-all duration-700" style={{ width: `${o.percent}%`, background: poll.my_vote === i ? "color-mix(in srgb, var(--accent) 24%, transparent)" : "color-mix(in srgb, var(--mut) 14%, transparent)" }} />}
                    <span className="relative flex items-center justify-between h-full"><span className="flex items-center gap-2">{poll.my_vote === i && <CheckCheck size={16} style={{ color: "var(--accent)" }} />}{o.label}</span>{showResults && <span style={{ color: "var(--mut)" }}>{o.percent}%</span>}</span>
                </button>
            ))}
            <div className="text-xs pl-1" style={{ color: "var(--mut)" }}>{compact(poll.total)} vote{poll.total === 1 ? "" : "s"} · {poll.closed ? "Final results" : "Poll open"}</div>
        </div>
    );
}

// ── Comments ────────────────────────────────────────────────────────────────────────────────────

export function CommentsSheet({ post, open, onClose, onCount }) {
    const nav = useNav();
    const { user } = useUser();
    const qc = useQueryClient();
    const [text, setText] = useState("");
    const [replyTo, setReplyTo] = useState(null);
    const [sending, setSending] = useState(false);
    const { data, isLoading, refetch } = useQuery({ queryKey: ["comments", post.id], queryFn: () => community.comments(post.id), enabled: open, staleTime: 15_000 });
    const inputRef = useRef(null);

    const send = async () => {
        const body = text.trim();
        if (!body || sending) return;
        setSending(true);
        try {
            await community.addComment(post.id, body, replyTo?.id);
            setText(""); setReplyTo(null);
            await refetch();
            onCount?.((data?.total ?? post.comments) + 1);
            haptic(12);
        } catch (e) { toast.error(errorMessage(e)); } finally { setSending(false); }
    };
    const like = async (c) => { haptic(8); try { await community.likeComment(c.id); refetch(); } catch (e) { toast.error(errorMessage(e)); } };
    const remove = async (c) => { try { await community.deleteComment(c.id); await refetch(); qc.invalidateQueries({ queryKey: ["comments", post.id] }); } catch (e) { toast.error(errorMessage(e)); } };

    const Row = ({ c, reply }) => (
        <div className={cx("flex gap-3 py-2.5", reply && "pl-10")}>
            <Avatar user={c.author} size={reply ? 30 : 36} onClick={() => { onClose(); nav.push("profile", { id: c.author.id }); }} />
            <div className="flex-1 min-w-0">
                <div className="rounded-2xl px-3.5 py-2.5" style={{ background: "var(--surface2)" }}>
                    <div className="flex items-center gap-1.5 text-[13.5px] font-bold">{c.author.name}{c.author.verified && <Verified size={13} />}{c.author.badge && <span className="hm-badge hm-badge-gold">{c.author.badge}</span>}</div>
                    <div className="hm-prose text-[14.5px]"><Linkify text={c.body} /></div>
                </div>
                <div className="flex items-center gap-4 mt-1 pl-2 text-xs font-semibold" style={{ color: "var(--mut)" }}>
                    <span>{timeAgo(c.created_at)}</span>
                    <button onClick={() => { setReplyTo(c); inputRef.current?.focus(); }}>Reply</button>
                    {(c.mine) && <button onClick={() => remove(c)}>Delete</button>}
                </div>
            </div>
            <button onClick={() => like(c)} className="flex flex-col items-center pt-2 w-9 text-[11px] font-bold" style={{ color: c.liked ? "#e11d48" : "var(--mut)" }}><Heart size={16} fill={c.liked ? "#e11d48" : "none"} />{c.likes > 0 && c.likes}</button>
        </div>
    );

    return (
        <Sheet open={open} onClose={onClose} title={`Comments${data?.total ? ` · ${data.total}` : ""}`}
            footer={
                <div>
                    {replyTo && <div className="flex items-center justify-between text-xs mb-2 px-1" style={{ color: "var(--mut)" }}><span className="flex items-center gap-1"><CornerDownRight size={13} /> Replying to <b>{replyTo.author.name}</b></span><button onClick={() => setReplyTo(null)}>Cancel</button></div>}
                    <div className="flex items-end gap-2">
                        <Avatar user={user && { id: user.id, name: user.name, avatar: storageUrl(user.profile_photo) }} size={36} />
                        <textarea ref={inputRef} rows={1} value={text} maxLength={800} onChange={(e) => setText(e.target.value)} placeholder="Add a comment…" className="hm-input flex-1" style={{ minHeight: 44, maxHeight: 110 }} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }} />
                        <Btn size="sm" icon={Send} loading={sending} disabled={!text.trim()} onClick={send} aria-label="Send" />
                    </div>
                </div>
            }>
            <div style={{ minHeight: 280 }}>
                {isLoading ? <Spinner /> : !data?.data?.length ? <Empty icon={MessageCircle} title="No comments yet" text="Be the first to encourage someone." /> : data.data.map((c) => (
                    <div key={c.id}><Row c={c} />{c.replies.map((r) => <Row key={r.id} c={r} reply />)}</div>
                ))}
            </div>
        </Sheet>
    );
}

// ── Report sheet ────────────────────────────────────────────────────────────────────────────────

const REASONS = [["spam", "Spam"], ["abuse", "Abusive or hateful"], ["harassment", "Harassment or bullying"], ["inappropriate", "Inappropriate content"], ["false_info", "False information"], ["scam", "Scam or fraud"], ["other", "Something else"]];
export function ReportSheet({ open, onClose, type, id }) {
    const [reason, setReason] = useState("spam");
    const [busy, setBusy] = useState(false);
    const submit = async () => {
        setBusy(true);
        try { const r = await community.report(type, id, reason); toast.success(r.message || "Reported. Thank you."); onClose(); } catch (e) { toast.error(errorMessage(e)); } finally { setBusy(false); }
    };
    return (
        <Sheet open={open} onClose={onClose} title="Report" footer={<Btn block loading={busy} onClick={submit}>Send report</Btn>}>
            <p className="text-sm mb-3" style={{ color: "var(--mut)" }}>Why are you reporting this? Our team reviews every report, and the person is never told who reported them.</p>
            <div className="space-y-1.5">{REASONS.map(([v, l]) => <button key={v} onClick={() => setReason(v)} className="w-full h-12 rounded-2xl px-4 text-left font-semibold flex items-center justify-between" style={{ border: `1.5px solid ${reason === v ? "var(--accent)" : "var(--line)"}`, background: reason === v ? "color-mix(in srgb, var(--accent) 8%, transparent)" : "transparent" }}>{l}{reason === v && <CheckCheck size={18} style={{ color: "var(--accent)" }} />}</button>)}</div>
        </Sheet>
    );
}

// ── The card ────────────────────────────────────────────────────────────────────────────────────

export function shareLink(post) {
    return `${window.location.origin}/?post=${post.id}`;
}

export async function sharePost(post) {
    const url = shareLink(post);
    try {
        if (navigator.share) { await navigator.share({ title: `${post.author?.name} on Heartfelt`, text: (post.body || "").slice(0, 120), url }); return; }
        await navigator.clipboard.writeText(url);
        toast.success("Link copied");
    } catch { /* cancelled */ }
}

export function PostCard({ post: initial, onRemove, compact: isCompact, onTag, detail }) {
    const nav = useNav();
    const { user } = useUser();
    const [p, setP] = useState(initial);
    const [comments, setComments] = useState(false);
    const [menu, setMenu] = useState(false);
    const [report, setReport] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [burst, setBurst] = useState(false);
    const [deleting, setDeleting] = useState(false);
    useEffect(() => setP(initial), [initial]);

    const orig = p.repost_of;
    const isPureRepost = !!orig && !p.body && !(p.media || []).length;
    const shown = isPureRepost ? orig : p;               // a plain repost shows the original post, with a "reposted" line
    const isMaster = user?.role === "master";
    const openProfile = (id) => nav.push("profile", { id });
    const openTag = onTag || ((t) => nav.push("hashtag", { tag: t }));

    const patch = (changes) => setP((s) => ({ ...s, ...changes }));
    const patchShown = (changes) => (isPureRepost ? setP((s) => ({ ...s, repost_of: { ...s.repost_of, ...changes } })) : patch(changes));

    const like = async () => {
        haptic(12);
        const target = shown;
        const next = !target.liked;
        patchShown({ liked: next, likes: Math.max(0, target.likes + (next ? 1 : -1)) });
        if (next) { setBurst(true); setTimeout(() => setBurst(false), 800); }
        try { const r = await community.like(target.id); patchShown({ liked: r.liked, likes: r.likes }); }
        catch (e) { patchShown({ liked: target.liked, likes: target.likes }); toast.error(errorMessage(e)); }
    };
    const save = async () => {
        haptic(8); const target = shown; patchShown({ saved: !target.saved });
        try { const r = await community.bookmark(target.id); patchShown({ saved: r.saved }); toast(r.saved ? "Saved to your bookmarks" : "Removed from bookmarks"); } catch (e) { patchShown({ saved: target.saved }); toast.error(errorMessage(e)); }
    };
    const repost = async () => {
        haptic(12); const target = shown;
        try { const r = await community.repost(target.id); patchShown({ reposted: r.reposted, reposts: r.reposts }); toast.success(r.reposted ? "Reposted to your followers" : "Repost removed"); } catch (e) { toast.error(errorMessage(e)); }
    };
    const remove = async () => {
        setDeleting(true);
        try { await community.deletePost(p.id); toast.success("Post deleted"); onRemove?.(p.id); if (detail) nav.pop(); } catch (e) { toast.error(errorMessage(e)); setDeleting(false); }
    };

    const video = (shown.media || []).find((m) => m.type === "video");
    const images = (shown.media || []).filter((m) => m.type === "image");
    const author = shown.author;

    return (
        <article className="hm-card overflow-hidden" style={{ animation: "hm-fade .3s ease" }}>
            {isPureRepost && (
                <div className="px-4 pt-3 -mb-1 flex items-center gap-2 text-xs font-bold" style={{ color: "var(--mut)" }}><Repeat2 size={14} /> {p.author?.id === user?.id ? "You" : p.author?.name} reposted</div>
            )}
            <div className="p-4 pb-3">
                <div className="flex items-start gap-3">
                    <Avatar user={author} size={44} onClick={() => openProfile(author.id)} />
                    <div className="flex-1 min-w-0" onClick={() => openProfile(author.id)}>
                        <div className="flex items-center gap-1.5 flex-wrap"><span className="font-extrabold text-[15.5px] truncate max-w-[55%]">{author.name}</span>{author.verified && <Verified />}{author.badge && <span className="hm-badge hm-badge-gold">{author.badge}</span>}</div>
                        <div className="text-[12.5px] flex items-center gap-1.5 flex-wrap" style={{ color: "var(--mut)" }}>@{author.handle} · {timeAgo(shown.created_at)}{author.zone && <> · {author.zone}</>}{shown.pinned && <span className="inline-flex items-center gap-0.5 font-bold" style={{ color: "var(--gold)" }}><Pin size={12} /> Pinned</span>}</div>
                    </div>
                    <button className="hm-icon-btn -mr-2 -mt-1" onClick={() => setMenu(true)} aria-label="More"><MoreHorizontal size={20} style={{ color: "var(--mut)" }} /></button>
                </div>

                {shown.kind === "announcement" && <div className="mt-3 inline-flex items-center gap-1.5 hm-badge hm-badge-gold" style={{ height: 24 }}><Megaphone size={13} /> Announcement</div>}
                {shown.channel && <button onClick={() => nav.push("channel", { id: shown.channel.id })} className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold px-2.5 h-6 rounded-full" style={{ background: "var(--surface2)", color: "var(--accent)" }}><Users size={12} /> {shown.channel.name}</button>}

                {shown.body && <div className="mt-2.5" onDoubleClick={like}><Linkify text={shown.body} onTag={openTag} onMention={() => {}} /></div>}
            </div>

            {(video || images.length > 0 || shown.poll) && (
                <div className="px-4 pb-3 relative" onDoubleClick={like}>
                    {video && <VideoEmbed media={video} />}
                    {!video && images.length > 0 && <ImageGrid images={images} onDoubleTap={like} />}
                    {shown.poll && <Poll post={shown} poll={shown.poll} onChange={(poll) => patchShown({ poll })} />}
                    {burst && <div className="hm-like-burst"><Heart size={84} fill="#fff" color="#fff" style={{ filter: "drop-shadow(0 4px 18px rgba(0,0,0,.4))" }} /></div>}
                </div>
            )}

            {!isCompact && (
                <div className="flex items-center justify-between px-2 pb-2">
                    <button onClick={like} aria-label={shown.liked ? "Unlike" : "Like"} aria-pressed={shown.liked} className="flex items-center gap-1.5 h-10 px-3 rounded-xl font-bold text-[13.5px]" style={{ color: shown.liked ? "#e11d48" : "var(--mut)" }}><Heart size={21} fill={shown.liked ? "#e11d48" : "none"} className={shown.liked ? "hm-heart-pop" : ""} />{shown.likes > 0 && compact(shown.likes)}</button>
                    <button onClick={() => setComments(true)} aria-label="Comments" className="flex items-center gap-1.5 h-10 px-3 rounded-xl font-bold text-[13.5px]" style={{ color: "var(--mut)" }}><MessageCircle size={21} />{shown.comments > 0 && compact(shown.comments)}</button>
                    <button onClick={repost} aria-label="Repost" aria-pressed={shown.reposted} className="flex items-center gap-1.5 h-10 px-3 rounded-xl font-bold text-[13.5px]" style={{ color: shown.reposted ? "var(--ok)" : "var(--mut)" }}><Repeat2 size={22} />{shown.reposts > 0 && compact(shown.reposts)}</button>
                    <button onClick={save} aria-label={shown.saved ? "Remove bookmark" : "Save"} aria-pressed={shown.saved} className="flex items-center h-10 px-3 rounded-xl" style={{ color: shown.saved ? "var(--gold)" : "var(--mut)" }}><Bookmark size={21} fill={shown.saved ? "var(--gold)" : "none"} /></button>
                    <button onClick={() => sharePost(shown)} aria-label="Share" className="flex items-center h-10 px-3 rounded-xl" style={{ color: "var(--mut)" }}><Share2 size={20} /></button>
                </div>
            )}

            <CommentsSheet post={shown} open={comments} onClose={() => setComments(false)} onCount={(n) => patchShown({ comments: n })} />
            <ReportSheet open={report} onClose={() => setReport(false)} type="post" id={shown.id} />
            <ConfirmSheet open={confirmDelete} onClose={() => setConfirmDelete(false)} title="Delete this post?" text="This can't be undone." confirm="Delete" danger loading={deleting} onConfirm={remove} />
            <ActionSheet open={menu} onClose={() => setMenu(false)} actions={[
                { label: "Share", icon: Share2, onClick: () => sharePost(shown) },
                { label: "Copy link", icon: Link2, onClick: () => { navigator.clipboard?.writeText(shareLink(shown)); toast.success("Link copied"); } },
                { label: shown.saved ? "Remove bookmark" : "Save", icon: Bookmark, onClick: save },
                isMaster && { label: shown.pinned ? "Unpin" : "Pin to top", icon: Pin, onClick: async () => { try { const r = await community.pin(shown.id); patchShown({ pinned: r.pinned }); toast.success(r.pinned ? "Pinned" : "Unpinned"); } catch (e) { toast.error(errorMessage(e)); } } },
                author.id !== user?.id && { label: "Report", icon: Flag, danger: true, onClick: () => setReport(true) },
                author.id !== user?.id && { label: `Block ${author.name.split(" ")[0]}`, icon: UserX, danger: true, onClick: async () => { try { await community.block(author.id); toast.success("Blocked. You won't see each other's posts."); onRemove?.(p.id); } catch (e) { toast.error(errorMessage(e)); } } },
                (p.mine || isMaster) && { label: "Delete", icon: Trash2, danger: true, onClick: () => setConfirmDelete(true) },
            ]} />
        </article>
    );
}
