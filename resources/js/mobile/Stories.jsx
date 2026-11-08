import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Image as ImageIcon, Link2, Plus, Trash2, Type, X, Film, Loader2 } from "lucide-react";
import { Avatar, Btn, Chip, Sheet, Skel, toast, cx } from "./ui.jsx";
import { community, compressImage, errorMessage, haptic, timeAgo, storageUrl } from "./lib.js";
import { useNav } from "./nav.jsx";
import { useUser } from "../context/UserContext.jsx";

const BACKGROUNDS = ["#1e3a5f", "#7c3aed", "#be123c", "#047857", "#b45309", "#0f172a"];
const ytId = (u = "") => (u.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|live\/|embed\/))([A-Za-z0-9_-]{11})/i) || [])[1];

// ── The row of rings at the top of Home ─────────────────────────────────────────────────────────

export function StoryBar() {
    const nav = useNav();
    const { user } = useUser();
    const [viewer, setViewer] = useState(null);
    const [adding, setAdding] = useState(false);
    const { data, isLoading } = useQuery({ queryKey: ["stories"], queryFn: community.stories, staleTime: 30_000, refetchInterval: 120_000 });
    const rings = data?.data || [];
    const mine = rings.find((r) => r.mine);
    const others = rings.filter((r) => !r.mine);
    const me = { id: user?.id, name: user?.name, avatar: storageUrl(user?.profile_photo) };

    return (
        <>
            <div className="flex gap-3.5 overflow-x-auto hm-hide-scroll px-4 py-3">
                <button className="flex flex-col items-center gap-1.5 w-[68px] shrink-0" onClick={() => (mine ? setViewer(rings.indexOf(mine)) : setAdding(true))}>
                    <div className="relative">
                        <Avatar user={me} size={62} ring={mine ? (mine.all_seen ? "seen" : "new") : undefined} />
                        <span onClick={(e) => { e.stopPropagation(); setAdding(true); }} className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full flex items-center justify-center border-2" style={{ background: "var(--accent)", borderColor: "var(--bg)", color: "#fff" }}><Plus size={14} strokeWidth={3} /></span>
                    </div>
                    <span className="text-[11.5px] font-semibold truncate w-full text-center">Your story</span>
                </button>
                {isLoading && Array.from({ length: 4 }).map((_, i) => <div key={i} className="flex flex-col items-center gap-1.5 w-[68px] shrink-0"><Skel w={62} h={62} r={31} /><Skel w={44} h={10} /></div>)}
                {others.map((r) => (
                    <button key={r.user.id} className="flex flex-col items-center gap-1.5 w-[68px] shrink-0" onClick={() => setViewer(rings.indexOf(r))}>
                        <Avatar user={r.user} size={62} ring={r.all_seen ? "seen" : "new"} />
                        <span className="text-[11.5px] font-semibold truncate w-full text-center" style={{ opacity: r.all_seen ? 0.6 : 1 }}>{r.user.name.split(" ")[0]}</span>
                    </button>
                ))}
            </div>
            {viewer !== null && <StoryViewer rings={rings} start={viewer} onClose={() => setViewer(null)} onOpenProfile={(id) => { setViewer(null); nav.push("profile", { id }); }} />}
            <StoryComposer open={adding} onClose={() => setAdding(false)} />
        </>
    );
}

// ── Full-screen viewer ──────────────────────────────────────────────────────────────────────────

function StoryViewer({ rings, start, onClose, onOpenProfile }) {
    const nav = useNav();
    const qc = useQueryClient();
    const [ri, setRi] = useState(start);
    const [si, setSi] = useState(() => Math.max(0, rings[start].stories.findIndex((s) => !s.seen)));
    const [progress, setProgress] = useState(0);
    const [paused, setPaused] = useState(false);
    const [confirm, setConfirm] = useState(false);
    const raf = useRef(0);
    const t0 = useRef(0);
    const ring = rings[ri];
    const story = ring?.stories[si];
    const DURATION = story?.kind === "video" ? 15000 : 5500;

    const next = useCallback(() => {
        if (si < ring.stories.length - 1) { setSi(si + 1); }
        else if (ri < rings.length - 1) { setRi(ri + 1); setSi(0); }
        else onClose();
    }, [si, ri, ring, rings.length, onClose]);
    const prev = () => { if (si > 0) setSi(si - 1); else if (ri > 0) { setRi(ri - 1); setSi(0); } else setProgress(0); };

    useEffect(() => { if (story && !story.seen) { community.viewStory(story.id); } }, [story?.id]);   // eslint-disable-line react-hooks/exhaustive-deps
    useEffect(() => { setProgress(0); t0.current = performance.now(); }, [ri, si]);
    useEffect(() => {
        if (paused || confirm) return;
        let last = performance.now();
        const tick = (now) => {
            const dt = now - last; last = now;
            t0.current += 0;                                  // keep the closure simple: advance by elapsed time
            setProgress((p) => {
                const n = p + dt / DURATION;
                if (n >= 1) { cancelAnimationFrame(raf.current); setTimeout(next, 0); return 1; }
                return n;
            });
            raf.current = requestAnimationFrame(tick);
        };
        raf.current = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf.current);
    }, [paused, confirm, ri, si, DURATION, next]);
    useEffect(() => () => qc.invalidateQueries({ queryKey: ["stories"] }), [qc]);

    if (!story || !nav.frameRef.current) return null;
    const vid = story.kind === "video" ? ytId(story.media_url) : null;

    const remove = async () => {
        try { await community.deleteStory(story.id); toast.success("Story deleted"); qc.invalidateQueries({ queryKey: ["stories"] }); onClose(); } catch (e) { toast.error(errorMessage(e)); }
    };

    return createPortal(
        <div className="absolute inset-0 z-[80] flex flex-col" style={{ background: "#000", color: "#fff", animation: "hm-fade .2s ease" }}>
            <div className="absolute inset-0" style={{ background: story.kind === "text" ? `linear-gradient(160deg, ${story.background}, #000 140%)` : "#000" }}>
                {story.kind === "image" && <img src={story.media_url} alt="" className="w-full h-full object-contain" />}
                {vid && <iframe title="story" src={`https://www.youtube-nocookie.com/embed/${vid}?autoplay=1&mute=1&controls=0&playsinline=1&rel=0`} className="w-full h-full border-0" allow="autoplay; encrypted-media" />}
                {story.kind === "text" && <div className="w-full h-full flex items-center justify-center px-8 text-center text-[28px] font-extrabold leading-snug" style={{ textWrap: "balance" }}>{story.caption}</div>}
            </div>
            <div className="absolute inset-x-0 top-0 h-32 pointer-events-none" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,.55), transparent)" }} />
            {story.kind !== "text" && story.caption && <div className="absolute inset-x-0 bottom-0 p-6 pb-10 text-[17px] font-semibold" style={{ background: "linear-gradient(to top, rgba(0,0,0,.7), transparent)" }}>{story.caption}</div>}

            <div className="relative z-10 hm-safe-top px-3 pt-3">
                <div className="flex gap-1.5">{ring.stories.map((s, i) => <div key={s.id} className="h-[3px] flex-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,.3)" }}><div className="h-full bg-white" style={{ width: i < si ? "100%" : i === si ? `${progress * 100}%` : "0%" }} /></div>)}</div>
                <div className="flex items-center gap-3 mt-3">
                    <button onClick={() => onOpenProfile(ring.user.id)} className="flex items-center gap-3 flex-1 min-w-0 text-left"><Avatar user={ring.user} size={38} /><div className="min-w-0"><div className="font-bold text-[15px] truncate">{ring.user.name}</div><div className="text-xs opacity-80">{timeAgo(story.created_at)}</div></div></button>
                    {ring.mine && <span className="flex items-center gap-1 text-xs font-bold opacity-90"><Eye size={15} />{story.views}</span>}
                    {ring.mine && <button className="hm-icon-btn" onClick={() => setConfirm(true)} aria-label="Delete story"><Trash2 size={20} /></button>}
                    <button className="hm-icon-btn" onClick={onClose} aria-label="Close"><X size={24} /></button>
                </div>
            </div>

            <div className="absolute inset-0 z-[5] flex" style={{ top: 120, bottom: 80 }}
                onPointerDown={() => setPaused(true)} onPointerUp={() => setPaused(false)} onPointerLeave={() => setPaused(false)}>
                <div className="w-1/3 h-full" onClick={prev} />
                <div className="w-2/3 h-full" onClick={next} />
            </div>

            {confirm && (
                <div className="absolute inset-0 z-20 flex items-end" style={{ background: "rgba(0,0,0,.6)" }} onClick={() => setConfirm(false)}>
                    <div className="w-full rounded-t-3xl p-5 space-y-3" style={{ background: "var(--surface)", color: "var(--ink)" }} onClick={(e) => e.stopPropagation()}>
                        <div className="font-extrabold text-lg">Delete this story?</div>
                        <div className="flex gap-3"><Btn variant="soft" block onClick={() => setConfirm(false)}>Cancel</Btn><Btn variant="danger" block onClick={remove}>Delete</Btn></div>
                    </div>
                </div>
            )}
        </div>,
        nav.frameRef.current,
    );
}

// ── Create a story ──────────────────────────────────────────────────────────────────────────────

function StoryComposer({ open, onClose }) {
    const qc = useQueryClient();
    const [kind, setKind] = useState("image");
    const [url, setUrl] = useState("");
    const [caption, setCaption] = useState("");
    const [bg, setBg] = useState(BACKGROUNDS[0]);
    const [busy, setBusy] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileRef = useRef(null);

    const upload = async (file) => {
        if (!file) return;
        setUploading(true);
        try { const r = await community.uploadImage(await compressImage(file, 1440)); setUrl(r.url); } catch (e) { toast.error(errorMessage(e, "That photo couldn't be uploaded.")); } finally { setUploading(false); }
    };
    const ok = kind === "text" ? caption.trim() : kind === "image" ? url : ytId(url);
    const submit = async () => {
        setBusy(true);
        try { await community.createStory({ kind, media_url: kind === "text" ? undefined : url, caption: caption.trim() || undefined, background: bg }); toast.success("Story shared for 24 hours"); setUrl(""); setCaption(""); qc.invalidateQueries({ queryKey: ["stories"] }); onClose(); }
        catch (e) { toast.error(errorMessage(e)); } finally { setBusy(false); }
    };

    return (
        <Sheet open={open} onClose={onClose} title="Add to your story" footer={<Btn block loading={busy} disabled={!ok || uploading} onClick={submit}>Share story</Btn>}>
            <div className="flex gap-2 pb-3">{[["image", "Photo", ImageIcon], ["video", "Video", Film], ["text", "Text", Type]].map(([v, l, I]) => <Chip key={v} on={kind === v} icon={I} onClick={() => setKind(v)}>{l}</Chip>)}</div>
            {kind === "image" && (
                <div className="space-y-3">
                    <button onClick={() => fileRef.current?.click()} className="w-full rounded-3xl overflow-hidden flex items-center justify-center" style={{ aspectRatio: "9/12", maxHeight: 340, border: "2px dashed var(--line)", background: "var(--surface2)", color: "var(--mut)" }}>
                        {url ? <img src={url} alt="" className="w-full h-full object-cover" /> : uploading ? <Loader2 className="animate-spin" /> : <div className="text-center font-bold"><ImageIcon className="mx-auto mb-2" size={34} />Choose a photo</div>}
                    </button>
                    <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => upload(e.target.files?.[0])} />
                </div>
            )}
            {kind === "video" && <div><label className="hm-label">YouTube link</label><div className="relative"><Link2 size={18} className="absolute left-3.5 top-3.5" style={{ color: "var(--mut)" }} /><input className="hm-input" style={{ paddingLeft: 40 }} placeholder="https://youtu.be/…" value={url} onChange={(e) => setUrl(e.target.value)} inputMode="url" /></div></div>}
            {kind === "text" && (
                <div className="rounded-3xl flex items-center justify-center px-6 text-center text-white font-extrabold text-2xl" style={{ aspectRatio: "9/10", maxHeight: 300, background: `linear-gradient(160deg, ${bg}, #000 140%)` }}>{caption || "Type something…"}</div>
            )}
            {kind === "text" && <div className="flex gap-2.5 mt-3">{BACKGROUNDS.map((c) => <button key={c} onClick={() => setBg(c)} className="w-9 h-9 rounded-full" style={{ background: c, outline: bg === c ? "3px solid var(--accent)" : "none", outlineOffset: 2 }} aria-label="Background" />)}</div>}
            <div className="mt-4"><label className="hm-label">{kind === "text" ? "Your words" : "Caption (optional)"}</label><textarea className="hm-input" rows={2} maxLength={220} value={caption} onChange={(e) => setCaption(e.target.value)} /></div>
        </Sheet>
    );
}
